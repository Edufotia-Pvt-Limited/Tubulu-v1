const { Integration, Review, UserContact, User, SystemSetting, Order, MessageNote, ChatMessage, Product, ChatRoom, FriendRecommendation } = require("./Postgres");
const { logger } = require("./Logger");
const { Op } = require("sequelize");
const AIAdapterFactory = require("./AI/AIAdapterFactory");
const { config } = require("../config");
const axios = require("axios");
const RAGHelper = require("./RAGHelper");

const isStaging = process.env.DB_NAME === 'tubulu';

// Google AI setup removed (not used in Global AI RAG flow)

const STOP_WORDS = new Set([
    'i', 'want', 'need', 'to', 'buy', 'get', 'me', 'find', 'show', 'a', 'an', 'the',
    'with', 'for', 'near', 'you', 'please', 'is', 'are', 'am', 'some', 'any', 'looking',
    'how', 'many', 'hotel', 'hotels', 'restaurant', 'restaurants', 'store', 'stores',
    'shop', 'shops', 'food', 'grocery', 'groceries', 'buy', 'sell', 'location', 'here',
    'there', 'where', 'what', 'which', 'who', 'why', 'can', 'could', 'would', 'should',
    'about', 'info', 'information', 'details', 'menu', 'list', 'show', 'tell', 'give'
]);

function getQueryKeywords(query) {
    if (!query) return [];
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

function filterRelevantChunks(chunks, query) {
    if (!chunks || chunks.length === 0) return [];
    const keywords = getQueryKeywords(query);
    const MIN_SIMILARITY = 0.57;
    const KEYWORD_MIN_SIMILARITY = 0.40; // Lowered to capture local matching items/phrasings
    const MAX_DIST_KM = 50;

    return chunks.filter(chunk => {
        if (chunk.distKm == null || chunk.distKm > MAX_DIST_KM) return false;
        if ((chunk.content || '').length < 30) return false;

        const contentLower = (chunk.content || '').toLowerCase();
        const hasKeywordMatch = keywords.length > 0 && keywords.some(k => contentLower.includes(k));

        if (hasKeywordMatch) {
            return chunk.similarity >= KEYWORD_MIN_SIMILARITY;
        }
        return chunk.similarity >= MIN_SIMILARITY;
    });
}

async function getSarvamKey() {
    const setting = await SystemSetting.findOne({ where: { key: 'SARVAM_API_KEY' } });
    if (setting && setting.value) {
        return setting.value;
    }
    try {
        const { State, StateServiceConfig, ServiceProvider } = require("./Postgres");
        const karnatakaState = await State.findOne({ where: { name: 'Karnataka' } });
        if (karnatakaState) {
            const config = await StateServiceConfig.findOne({
                where: { stateId: karnatakaState.id },
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { isActive: true, serviceProvider: 'sarvam' }
                }]
            });
            if (config && config.config?.apiKey) {
                return config.config.apiKey;
            }
        }
    } catch (e) {
        console.error("Error retrieving Karnataka Sarvam key in GlobalAIHelper:", e.message);
    }
    return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 999999;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Generates an AI response for global discovery queries.
 */
async function generateGlobalAIResponse(userId, userMessage, chatHistory = [], coords = null) {
    try {
        let userLat = coords && coords.latitude ? parseFloat(coords.latitude) : 12.3237008;
        let userLng = coords && coords.longitude ? parseFloat(coords.longitude) : 76.6022778;

        // Fallback for emulators/tests outside India coverage area
        if (userLat < 6 || userLat > 38 || userLng < 68 || userLng > 98) {
            console.log(`📡 Coordinates (${userLat}, ${userLng}) are outside India. Defaulting to Mysore (12.3237008, 76.6022778) for testing.`);
            userLat = 12.3237008;
            userLng = 76.6022778;
        }

        // 1. Fetch All Merchants (Basic info for discovery)
        const merchants = await Integration.findAll({
            where: { isActive: true },
            attributes: ['id', 'integrationName', 'description', 'addressLine', 'city', 'state', 'stateId', 'latitude', 'longitude', 'category', 'verticalType'],
            limit: 50
        });

        // Calculate distances
        merchants.forEach(m => {
            m.distance = calculateDistance(userLat, userLng, m.latitude ? Number(m.latitude) : null, m.longitude ? Number(m.longitude) : null);
        });

        // Sort merchants by distance
        merchants.sort((a, b) => a.distance - b.distance);

        // Find matching friend recommendations matching query keywords within 15km
        const keywords = getQueryKeywords(userMessage);
        const msgLower = (userMessage || '').toLowerCase();
        const isGeneralDiscovery = msgLower.includes("recommend") || 
                                   msgLower.includes("recommed") || 
                                   msgLower.includes("suggest") || 
                                   msgLower.includes("friend") || 
                                   msgLower.includes("vibe") || 
                                   msgLower.includes("concierge");

        const matchingFriendReviews = [];
        if ((keywords.length > 0 || isGeneralDiscovery) && userId) {
            try {
                const contacts = await UserContact.findAll({ where: { userId } });
                if (contacts.length > 0) {
                    const phoneNumbers = [];
                    contacts.forEach(c => {
                        const clean = c.contactPhoneNumber.replace(/[^0-9]/g, '');
                        const last10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
                        if (last10) {
                            phoneNumbers.push(last10);
                            phoneNumbers.push(`+91${last10}`);
                            phoneNumbers.push(`91${last10}`);
                        }
                    });
                    const friends = await User.findAll({ where: { phoneNumber: { [Op.in]: phoneNumbers } } });
                    const friendIds = friends.map(f => f.id).filter(id => id !== userId);
                    if (friendIds.length > 0) {
                        // 1. Fetch from FriendRecommendations
                        const reviews = await FriendRecommendation.findAll({
                            where: { userId: { [Op.in]: friendIds } },
                            include: [{
                                model: Integration,
                                as: 'integration',
                                attributes: ['id', 'integrationName', 'description', 'latitude', 'longitude', 'category', 'verticalType', 'isActive']
                            }]
                        });
                        for (const r of reviews) {
                            const m = r.integration;
                            if (!m || !m.isActive) continue;
                            const dist = calculateDistance(userLat, userLng, m.latitude ? Number(m.latitude) : null, m.longitude ? Number(m.longitude) : null);
                            if (dist > 50) continue;

                            const mName = (m.integrationName || '').toLowerCase();
                            const mDesc = (m.description || '').toLowerCase();
                            const rText = (r.reviewText || '').toLowerCase();
                            const mCat = (m.category || '').toLowerCase();
                            const mVert = (m.verticalType || '').toLowerCase();

                            const hasMatch = isGeneralDiscovery || keywords.some(k =>
                                mName.includes(k) ||
                                mDesc.includes(k) ||
                                rText.includes(k) ||
                                mCat.includes(k) ||
                                mVert.includes(k)
                            );

                            if (hasMatch) {
                                const friend = friends.find(f => f.id === r.userId);
                                const contactRel = contacts.find(c => {
                                    if (!friend) return false;
                                    const cPhone = c.contactPhoneNumber.replace(/[^0-9]/g, '');
                                    const fPhone = friend.phoneNumber.replace(/[^0-9]/g, '');
                                    const c10 = cPhone.substring(Math.max(0, cPhone.length - 10));
                                    const f10 = fPhone.substring(Math.max(0, fPhone.length - 10));
                                    return c10 === f10;
                                });
                                const displayName = (friend ? `${friend.firstName || ''} ${friend.lastName || ''}`.trim() : null) ||
                                                    contactRel?.contactName ||
                                                    friend?.phoneNumber ||
                                                    "Your friend";
                                matchingFriendReviews.push({
                                    storeId: m.id,
                                    storeName: m.integrationName,
                                    distance: dist,
                                    friendName: displayName,
                                    friendPhone: friend?.phoneNumber || '',
                                    rating: r.rating,
                                    reviewText: r.reviewText
                                });
                            }
                        }

                        // Only pulling reviews - no sticky notes
                    }
                }
            } catch (err) {
                console.error("Error matching friend reviews/orders:", err.message);
            }
        }

        let priorityFriendRecs = "";
        if (matchingFriendReviews.length > 0) {
            priorityFriendRecs = "\nMATCHING FRIEND RECOMMENDATIONS (HIGHEST PRIORITY):\n";
            matchingFriendReviews.forEach(r => {
                const distStr = r.distance < 1 
                    ? `${(r.distance * 1000).toFixed(0)}m away` 
                    : `${r.distance.toFixed(1)}km away`;
                priorityFriendRecs += `- Your friend ${r.friendName} (${r.friendPhone}) highly recommends [${r.storeName}](store:${r.storeId}) (${distStr}). Rating: ${r.rating}/5 stars. Review: "${r.reviewText}"\n`;
            });
            priorityFriendRecs += `\nINSTRUCTION: The user is specifically asking for items related to these recommended stores. You MUST recommend these store(s) first in your chat response, mention that their friend recommended it, and use the exact format [Store Name](store:UUID) so they can click it. This is a strict requirement.\n`;
        }

        // 2. Fetch Customer Context (Strictly limited to this customer only)
        let customerContext = "";
        let customerName = "Customer";
        if (userId) {
            const customer = await User.findByPk(userId);
            if (customer) {
                customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || "Customer";
                customerContext += `ACTIVE CUSTOMER PROFILE (Private details for ${customerName} only):\n- Name: ${customerName}\n- Phone: ${customer.phoneNumber || 'N/A'}\n- Email: ${customer.email || 'N/A'}\n`;
            }

            // Fetch all orders for this customer strictly
            const orders = await Order.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                include: [{ model: Integration, attributes: ['integrationName'] }]
            });

            if (orders.length > 0) {
                const overallCost = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
                customerContext += `- Overall Spend (Total Cost of All Orders): ₹${overallCost.toFixed(2)}\n`;
                customerContext += `\nCUSTOMER ORDER DETAILS (Strictly private to ${customerName}):\n`;
                orders.forEach((o, index) => {
                    const storeName = o.Integration ? o.Integration.integrationName : "our partner merchant";
                    const itemsList = (o.orderItems || []).map(item => `${item.productName || item.name || 'Item'} (Qty: ${item.quantity || 1})`).join(", ");
                    let orderStr = `- Order ID: ${o.id} (Short: ${o.id.substring(0, 8)}...) | Store: ${storeName} | Items: [${itemsList}] | Total Price: ₹${o.totalPrice} | Status: ${o.status} | Payment: ${o.paymentStatus} | Date: ${o.createdAt.toLocaleDateString()}`;
                    if (o.personalNote) {
                        orderStr += ` | Note/Sticky Note: "${o.personalNote}"`;
                    }
                    customerContext += orderStr + `\n`;
                });
            } else {
                customerContext += `- Overall Spend (Total Cost of All Orders): ₹0.00\n`;
                customerContext += `\nCUSTOMER ORDER DETAILS:\nNo orders have been placed yet.\n`;
            }

            // Fetch private sticky notes for this customer strictly
            try {
                const stickyNotes = await MessageNote.findAll({
                    where: { userId },
                    order: [['createdAt', 'DESC']],
                    limit: 15,
                    include: [{
                        model: ChatMessage,
                        as: 'chatMessage',
                        required: false
                    }]
                });
                if (stickyNotes.length > 0) {
                    customerContext += `\nCUSTOMER STICKY NOTES:\n`;
                    stickyNotes.forEach((n, index) => {
                        let noteString = `- Sticky Note #${index + 1}: "${n.noteMessage}" (Created on: ${n.createdAt.toLocaleDateString()})`;
                        if (n.chatMessage) {
                            noteString += ` | Linked Chat Message: "${n.chatMessage.content}"`;
                            if (n.chatMessage.metadata && typeof n.chatMessage.metadata === 'object') {
                                noteString += ` (Metadata: ${JSON.stringify(n.chatMessage.metadata)})`;
                            }
                        }
                        customerContext += noteString + `\n`;
                    });
                } else {
                    customerContext += `\nCUSTOMER STICKY NOTES:\nNo sticky notes have been created yet.\n`;
                }
            } catch (noteErr) {
                console.error("Failed to load customer sticky notes context:", noteErr.message);
            }
        }

        // 3. Fetch Social Context (RAG)
        let socialContext = "";
        try {
            if (userId) {
                const contacts = await UserContact.findAll({ where: { userId } });
                if (contacts.length > 0) {
                    const phoneNumbers = [];
                    contacts.forEach(c => {
                        const clean = c.contactPhoneNumber.replace(/[^0-9]/g, '');
                        const last10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
                        if (last10) {
                            phoneNumbers.push(last10);
                            phoneNumbers.push(`+91${last10}`);
                            phoneNumbers.push(`91${last10}`);
                        }
                    });
                    const friends = await User.findAll({ where: { phoneNumber: { [Op.in]: phoneNumbers } } });
                    const friendIds = friends.map(f => f.id).filter(id => id !== userId);

                    if (friendIds.length > 0) {
                        const reviews = await FriendRecommendation.findAll({
                            where: { userId: { [Op.in]: friendIds } },
                            include: [{ model: Integration, as: 'integration', attributes: ['integrationName'] }]
                        });

                        if (reviews.length > 0) {
                            socialContext = "\nSOCIAL CONTEXT (Recommendations from friends):\n";
                            for (const r of reviews) {
                                const friend = friends.find(f => f.id === r.userId);
                                
                                // Look up what name the current user saved this contact as in their contacts list
                                const contactRel = contacts.find(c => {
                                    if (!friend) return false;
                                    const cPhone = c.contactPhoneNumber.replace(/[^0-9]/g, '');
                                    const fPhone = friend.phoneNumber.replace(/[^0-9]/g, '');
                                    const c10 = cPhone.substring(Math.max(0, cPhone.length - 10));
                                    const f10 = fPhone.substring(Math.max(0, fPhone.length - 10));
                                    return c10 === f10;
                                });
                                const displayName = (friend ? `${friend.firstName || ''} ${friend.lastName || ''}`.trim() : null) || 
                                                    contactRel?.contactName || 
                                                    friend?.phoneNumber || 
                                                    "Your friend";
                                                    
                                const phoneSuffix = friend ? ` (${friend.phoneNumber})` : "";
                                const storeName = r.integration ? r.integration.integrationName : "a store";
                                socialContext += `- ${displayName}${phoneSuffix} highly recommends "${storeName}" (${r.rating}/5 stars). They said: "${r.reviewText}"\n`;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Global RAG failed:", e.message);
        }

        // 4. Construct System Prompt — RAG-powered context
        let merchantContext = '';
        let ragUsed = false;
        let ragChunks = []; // hoisted so the Sarvam catch block can also use them

        try {
            // Attempt RAG semantic retrieval
            const rawChunks = await RAGHelper.retrieveRelevantChunks(userMessage, userLat, userLng, 40);
            ragChunks = filterRelevantChunks(rawChunks, userMessage);
            if (ragChunks && ragChunks.length > 0) {
                merchantContext = `RELEVANT PRODUCTS & STORES FOR THIS QUERY (semantically matched, sorted by relevance + proximity):\n\n${RAGHelper.formatChunksForPrompt(ragChunks)}`;
                ragUsed = true;
                console.log(`✅ RAG: Retrieved and filtered ${ragChunks.length} relevant chunks for: "${userMessage}"`);
            } else {
                merchantContext = "No stores or products matching your query were found nearby (within 50km).";
                ragUsed = true;
                console.log(`✅ RAG: No matching chunks found nearby for: "${userMessage}"`);
            }
        } catch (ragErr) {
            console.warn('⚠️ RAG retrieval failed, falling back to full store list:', ragErr.message);
        }

        // Fallback: if RAG has no data yet (e.g. indexer hasn't run), use full store list
        if (!ragUsed) {
            let fallbackContext = "AVAILABLE STORES ON TUBULU (Sorted by distance from user, nearest first):\n";
            for (const m of merchants) {
                const loc = [m.addressLine, m.city, m.state].filter(Boolean).join(', ');
                const products = await Product.findAll({
                    where: { integrationId: m.id, isActive: true, isDeleted: false },
                    attributes: ['name']
                });
                const productNames = products.map(p => p.name).join(', ');
                const distStr = m.distance < 999999 ? ` (${(m.distance * 1000).toFixed(0)}m away)` : "";
                fallbackContext += `- ${m.integrationName} (ID: ${m.id}): ${m.description || 'A local store'}. Location: ${loc || 'N/A'}${distStr}. Products in stock: ${productNames || 'None'}\n`;
            }
            merchantContext = fallbackContext;
        }

        const systemPrompt = `
You are the Tubulu Vibe, a helpful shopping, local discovery, and social recommendation assistant for the Tubulu platform.
Your goal is to help users discover the best stores, services, products, and track their personal orders.

${priorityFriendRecs}

STORES DIRECTORY:
${merchantContext}

${customerContext}

Social reviews from friends:
${socialContext}

INSTRUCTIONS:
1. Be professional, friendly, and direct. Identify yourself as Tubulu Vibe.
2. STRICT GUARDRAIL: You only have access to details for this particular customer (${customerName}). Never discuss or expose any order details, profile details, or personal data belonging to any other user. 
3. ORDER TRACKING & SPEND INQUIRIES: If the customer asks about their overall cost (spend), total price of all orders, or details of any particular order, refer strictly to the CUSTOMER ORDER DETAILS section. Be extremely accurate, calculate sums if requested, and share order IDs as needed.
4. STICKY NOTES / CUSTOM LABELS & MAPPINGS: If the customer asks about custom labels, reminders, or specific items linked to sticky notes (e.g. "son's phone", "daughter's gift"), look up their CUSTOMER STICKY NOTES section and the "Note/Sticky Note" field in their CUSTOMER ORDER DETAILS section to find which order or product has that description. Then, cross-reference that order/product to answer queries like when it was bought, the price, the store, or its status.
5. If a user asks for an item or recommendation, prioritize stores mentioned in the MATCHING FRIEND RECOMMENDATIONS. Explicitly mention the friend's name, their phone number, and their exact review text. BUT, you MUST ALSO share 1-2 other nearby stores from the STORES DIRECTORY as alternatives. If there are no friend recommendations available, simply suggest 2-3 nearby shops from the STORES DIRECTORY.
6. STABILIZE AND KEEP IT SHORT: Keep your replies concise, direct, and conversational. Do not write long essays, but ensure you give the user good options.
7. When recommending or mentioning a store, you MUST format it as a clickable markdown link using its name and its exact UUID from the context, exactly like this: [Store Name](store:UUID). Do not add comments or explanations inside the link parenthesis.
8. COMPLETE SENTENCES: Always write complete, well-formed, grammatically correct sentences. Never truncate or cut off mid-sentence.
9. DISTINGUISH GROCERY VS FOOD: If the user asks to buy raw items like "eggs", "milk", "butter", prioritize stores in the GROCERY category. If the user asks for a recipe, cooked dish, or prepared food (e.g., egg roll, egg curry, scrambled eggs), recommend restaurants or food joints in the FOOD/FB category.
10. NEAREST FIRST: When recommending stores, always mention the closest one first. Distance information is included in the context as "Xm away" or "X.Xkm away".
11. STRICT SEARCH GUARDRAIL: If the STORES DIRECTORY section states that no matching stores or products were found, you MUST respond by stating clearly and directly that you could not find the requested item or any store selling it near the user. Do not suggest or recommend unrelated items or alternative foods (e.g., do not suggest dosa if the user asked for biryani, or vice-versa).
`.trim();

        // Resolve stateId for global-chat keys lookup
        let stateId = null;
        if (userId) {
            const customer = await User.findByPk(userId);
            if (customer) {
                stateId = customer.scopedStateId;
                if (!stateId && customer.state) {
                    const { State } = require("./Postgres");
                    const matchedState = await State.findOne({
                        where: { name: { [Op.iLike]: `%${customer.state}%` } }
                    });
                    if (matchedState) {
                        stateId = matchedState.id;
                    }
                }
            }
        }
        if (!stateId && merchants.length > 0) {
            const merchantWithState = merchants.find(m => m.stateId);
            if (merchantWithState) {
                stateId = merchantWithState.stateId;
            }
        }

        let stateSarvamKey = null;
        let stateGeminiKey = null;
        let stateChatProvider = null;
        if (stateId) {
            const { StateServiceConfig, ServiceProvider } = require("./Postgres");
            const configs = await StateServiceConfig.findAll({
                where: { stateId },
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { isActive: true }
                }]
            });
            for (const cfg of configs) {
                if (cfg.provider) {
                    if (cfg.provider.serviceType === 'STT_TTS') {
                        stateSarvamKey = cfg.config?.apiKey || null;
                    } else if (cfg.provider.serviceType === 'LLM') {
                        stateChatProvider = cfg.provider.serviceProvider;
                        stateGeminiKey = cfg.config?.apiKey || null;
                    }
                }
            }
        }

        // 5. Call LLM — Sarvam (backup) → RAG chunks (last resort)
        let text = "";

        // ── Helper: call Sarvam AI removed in favor of adapter pattern ──────────

        // ── Helper: RAG chunk direct response ─────────────────────────────────
        const ragChunkResponse = () => {
            const item = userMessage.replace(/^(i want|i need|get me|find me|show me|looking for)\s*/i, '').trim();
            const notFoundMsg = `Sorry, I couldn't find any store near you with "${item}". Try a different search or explore nearby stores on Tubulu!`;

            if (!ragChunks || ragChunks.length === 0) return null;
            const msgLower = (userMessage || '').toLowerCase();

            // Detect intent
            const FOOD_WORDS = ['recipe', 'curry', 'biryani', 'dish', 'cooked', 'roll',
                'sandwich', 'burger', 'restaurant', 'meal', 'thali', 'dosa', 'idli',
                'vada', 'bath', 'kesari', 'halwa', 'paratha', 'roti', 'masala', 'coffee'];
            const GROCERY_WORDS = ['buy', 'purchase', 'get me', 'need', 'want to buy',
                'eggs', 'milk', 'butter', 'rice', 'dal', 'flour', 'sugar', 'oil',
                'vegetables', 'fruits', 'grocery', 'groceries'];

            const isFoodQuery     = FOOD_WORDS.some(w => msgLower.includes(w));
            const isGroceryQuery  = !isFoodQuery && GROCERY_WORDS.some(w => msgLower.includes(w));
            const isEggQuery      = msgLower.includes('egg') && !isFoodQuery;

            // Score and collect stores (deduplicated, already filtered in parent function)
            const seenIds = new Set();
            const allStores = [];
            for (const chunk of ragChunks) {
                const id   = chunk.metadata?.integrationId;
                const name = chunk.metadata?.integrationName;
                const cat  = (chunk.metadata?.category || '').toLowerCase();
                const nameLower = (name || '').toLowerCase();
                if (!id || !name || seenIds.has(id)) continue;
                seenIds.add(id);

                const distStr = chunk.distKm != null
                    ? (chunk.distKm < 1
                        ? `${(chunk.distKm * 1000).toFixed(0)}m away`
                        : `${chunk.distKm.toFixed(1)}km away`)
                    : null;

                const isGrocery = cat.includes('grocery') || cat.includes('supermarket');
                const isFood    = cat.includes('food') || cat.includes('fb') || cat.includes('cafe') || cat.includes('restaurant');
                const isPureVeg = nameLower.includes('pure veg');

                allStores.push({ id, name, distStr, isGrocery, isFood, isPureVeg, similarity: chunk.similarity });
            }

            // No confident matches nearby — tell the user honestly
            if (allStores.length === 0) {
                return null;
            }

            // Filter by detected intent
            let filtered = allStores;
            if (isFoodQuery) {
                // Food query: prefer food stores, skip pure-veg for egg queries
                const foodStores = allStores.filter(s =>
                    !s.isGrocery && (s.isFood || s.similarity > 0.7) && !(isEggQuery && s.isPureVeg)
                );
                // Show food stores if any found, even if just 1
                // Only fall back to all stores if NO food stores matched at all
                filtered = foodStores.length > 0 ? foodStores : allStores;
            } else if (isGroceryQuery) {
                // Grocery query: prefer grocery stores
                const grocStores = allStores.filter(s => s.isGrocery);
                filtered = grocStores.length >= 1 ? grocStores : allStores;
            }

            if (filtered.length === 0) filtered = allStores;

            const top3 = filtered.slice(0, 3);
            if (top3.length === 0) return null;

            const links = top3.map(s =>
                `[${s.name}](store:${s.id})${s.distStr ? ` (${s.distStr})` : ''}`
            ).join(', ');

            if (isFoodQuery) {
                return `For ${userMessage}, I recommend ${links}. Tap any store to see their full menu!`;
            } else {
                return `For your shopping needs, the nearest stores are ${links}. Tap to browse their catalogue!`;
            }
        };

        // Determine text AI provider
        let provider = stateChatProvider ? stateChatProvider.toLowerCase() : 'gemini';
        if (!stateChatProvider) {
            try {
                const providerSetting = await SystemSetting.findOne({ where: { key: 'DEFAULT_TEXT_PROVIDER' } });
                if (providerSetting && providerSetting.value) {
                    provider = providerSetting.value.toLowerCase();
                }
            } catch (err) {
                console.error("Failed to fetch DEFAULT_TEXT_PROVIDER from database in GlobalAIHelper:", err.message);
            }
        }

        // Determine trial order based on configured provider to support robust fallbacks
        const trialProviders = [];
        if (provider === 'sarvam') {
            trialProviders.push('sarvam', 'gemini');
        } else {
            // Default/fallback is gemini
            trialProviders.push('gemini', 'sarvam');
        }

        for (const p of trialProviders) {
            try {
                let apiKey = null;
                let options = {};

                if (p === 'sarvam') {
                    apiKey = stateSarvamKey;
                    if (!apiKey) {
                        apiKey = await getSarvamKey();
                    }
                    if (!apiKey) throw new Error('No Sarvam API key');
                    options = { temperature: 0.2, maxTokens: 2048, timeout: 50000 };
                    console.log(`🤖 [Global Chat] Routing to Sarvam AI`);
                } else if (p === 'gemini') {
                    apiKey = stateGeminiKey;
                    if (!apiKey) {
                        try {
                            const dbSetting = await SystemSetting.findOne({ where: { key: 'GEMINI_API_KEY' } });
                            if (dbSetting && dbSetting.value) {
                                apiKey = dbSetting.value;
                            }
                        } catch (dbErr) {
                            console.error("Failed to fetch GEMINI_API_KEY from database in GlobalAIHelper:", dbErr.message);
                        }
                    }
                    if (!apiKey) {
                        apiKey = config.GOOGLE_API_KEY;
                    }
                    options = { temperature: 0.2, model: "gemini-2.5-flash" };
                    console.log(`🤖 [Global Chat] Routing to Gemini 2.5 Flash`);
                }

                if (apiKey) {
                    const adapter = AIAdapterFactory.getAdapter(p, apiKey);
                    const chatHistorySlice = (chatHistory || []).slice(-6);
                    
                    let aiResponse = await adapter.chat(systemPrompt, chatHistorySlice, userMessage, options);
                    let usage = null;
                    
                    if (typeof aiResponse === 'string') {
                        text = aiResponse;
                    } else if (aiResponse && aiResponse.text) {
                        text = aiResponse.text;
                        usage = aiResponse.usage;
                    }

                    if (text) {
                        if (p === 'gemini') {
                            text = text.replace(/\*/g, '');
                        }
                        console.log(`✅ ${p.toUpperCase()} answered Global Chat: "${text.substring(0, 80)}..."`);
                        
                        // Log token usage for Tubulu Vibe (Global Chat)
                        if (usage) {
                            try {
                                const AITokenLog = require('../Models/AITokenLog.pg.js');
                                await AITokenLog.create({
                                    userId: customerObj ? customerObj.id : null,
                                    featureName: 'Tubulu Vibe',
                                    stateId: customerObj ? customerObj.scopedStateId : null,
                                    cityId: customerObj ? customerObj.scopedCityId : null,
                                    promptTokens: usage.promptTokens || 0,
                                    completionTokens: usage.completionTokens || 0,
                                    totalTokens: usage.totalTokens || 0
                                });
                            } catch (logErr) {
                                console.error('Failed to log AI tokens for Global Chat:', logErr.message);
                            }
                        }

                        break;
                    }
                }
            } catch (err) {
                console.error(`❌ [Global Chat] Provider ${p} failed:`, err.message);
            }
        }

        if (!text) {
            if (matchingFriendReviews.length > 0) {
                const topRecs = matchingFriendReviews.slice(0, 2);
                const recsText = topRecs.map(r => {
                    const distStr = r.distance < 1 
                        ? `${(r.distance * 1000).toFixed(0)}m` 
                        : `${r.distance.toFixed(1)}km`;
                    return `[${r.storeName}](store:${r.storeId}) (${distStr} away) which is highly recommended by your friend ${r.friendName} with a ${r.rating}/5 rating: "${r.reviewText}"`;
                }).join(" and ");
                text = `I found friend recommendation(s) for you! You should check out ${recsText}.`;
            }
        }

        if (!text) {
            text = ragChunkResponse() || '';
            if (text) console.log(`✅ RAG chunk fallback answered: "${userMessage}"`);
        }

        if (!text) {
            // ── LAST RESORT: keyword rule engine ──────────────────────────────
            const msgLower = (userMessage || '').toLowerCase().trim();


            // 1. Handle Greetings / Conversational Status Checks
            if (msgLower.includes("online") || msgLower.includes("are you up") || msgLower.includes("status")) {

                text = "Hi there! 👋 Yes, I am Tubulu Vibe, your personal AI Concierge. I am fully online, active, and ready to help you find awesome spots recommended by your friends! What city or category are you exploring today?";
            } else if (msgLower === "hi" || msgLower === "hello" || msgLower === "hey" || msgLower.startsWith("hi ") || msgLower.startsWith("hello ")) {
                text = "Hey there! 😊 Tubulu Vibe here! How can I assist you today? Let me know if you'd like to search for great food, shopping, or local spots recommended by your friends!";
            } else if (msgLower.includes("who is suresh") || msgLower.includes("suresh")) {
                text = "Suresh is one of your trusted contacts on Tubulu! He recently checked in and left a highly positive recommendation for Anand Bakery Indiranagar.";
            }
            // 2. Handle Recommendations / Food / Dynamic Location Discoveries
            else if (
                msgLower.includes("recommend") || 
                msgLower.includes("food") || 
                msgLower.includes("eat") || 
                msgLower.includes("bakery") || 
                msgLower.includes("spot") || 
                msgLower.includes("place") || 
                msgLower.includes("restaurant") ||
                msgLower.includes("delhi") ||
                msgLower.includes("bangalore") || 
                msgLower.includes("bengaluru") ||
                msgLower.includes("suggest") ||
                msgLower.includes("buy") ||
                msgLower.includes("store") ||
                msgLower.includes("shop") ||
                msgLower.includes("egg") ||
                msgLower.includes("grocery") ||
                msgLower.includes("groceries") ||
                msgLower.includes("supermarket")
            ) {
                // Extract target city dynamically
                let targetCity = null;
                const activeIntegrations = await Integration.findAll({
                    where: { isActive: true },
                    attributes: ['id', 'integrationName', 'city']
                });
                const citiesInDb = [...new Set(activeIntegrations.map(i => i.city).filter(Boolean))];
                
                // Match exact city mention
                for (const city of citiesInDb) {
                    if (msgLower.includes(city.toLowerCase())) {
                        targetCity = city;
                        break;
                    }
                }

                // Explicit manual fallback for primary demonstration cities
                if (!targetCity) {
                    if (msgLower.includes("delhi")) targetCity = "Delhi";
                    else if (msgLower.includes("mumbai")) targetCity = "Mumbai";
                    else if (msgLower.includes("bangalore") || msgLower.includes("bengaluru")) targetCity = "Bangalore";
                }

                if (targetCity) {
                    if (socialContext) {
                        const contacts = await UserContact.findAll({ where: { userId } });
                        const phoneNumbers = contacts.map(c => c.contactPhoneNumber);
                        const friends = await User.findAll({ where: { phoneNumber: { [Op.in]: phoneNumbers } } });
                        const friendIds = friends.map(f => f.id).filter(id => id !== userId);

                        const latestReview = await FriendRecommendation.findOne({
                            where: { userId: { [Op.in]: friendIds } },
                            order: [['createdAt', 'DESC']],
                            include: [{ 
                                model: Integration, 
                                as: 'integration', 
                                where: { city: { [Op.iLike]: targetCity } },
                                attributes: ['id', 'integrationName', 'city'] 
                            }]
                        });

                        if (latestReview) {
                            const friend = friends.find(f => f.id === latestReview.userId);
                            const contactRel = contacts.find(c => friend && c.contactPhoneNumber === friend.phoneNumber);
                            const displayName = (friend ? `${friend.firstName || ''} ${friend.lastName || ''}`.trim() : null) || 
                                                contactRel?.contactName || 
                                                friend?.phoneNumber || 
                                                "Your friend";
                                                
                            const phoneSuffix = friend ? ` (${friend.phoneNumber})` : "";
                            const storeLink = latestReview.integration ? `[${latestReview.integration.integrationName}](store:${latestReview.integration.id})` : "a store";
                            
                            text = `Welcome to ${targetCity}! ☕🍰\n\nYour friend **${displayName}${phoneSuffix}** recently visited ${storeLink} in ${targetCity} and highly recommended it, giving it a ${latestReview.rating}/5 rating! They said:\n"${latestReview.reviewText}"\n\nYou should definitely try it out!`;
                        }
                    }

                    // Dynamic fallback: show local directories if no friends' reviews are in this city
                    if (!text) {
                        const cityMerchants = await Integration.findAll({
                            where: { city: { [Op.iLike]: targetCity }, isActive: true },
                            limit: 3
                        });

                        if (cityMerchants.length > 0) {
                            const merchantNames = cityMerchants.map(m => `[${m.integrationName}](store:${m.id})`).join(", ");
                            text = `I see you are looking for food spots in **${targetCity}**! 📍\n\nNone of your friends have left reviews in ${targetCity} yet. However, we have some excellent local stores there that you can explore: ${merchantNames}!`;
                        } else {
                            text = `I see you are looking for spots in **${targetCity}**! 📍\n\nNone of your friends have left reviews there yet, and we are currently onboarding new merchants in ${targetCity}. Please check back soon as we expand!`;
                        }
                    }
                }
                
                if (!text) {
                    let searchItem = null;
                    if (msgLower.includes("egg")) searchItem = "egg";
                    else if (msgLower.includes("milk")) searchItem = "milk";
                    else if (msgLower.includes("bread")) searchItem = "bread";
                    else if (msgLower.includes("cheese")) searchItem = "cheese";
                    else if (msgLower.includes("coffee")) searchItem = "coffee";
                    else if (msgLower.includes("butter")) searchItem = "butter";

                    let matchedStores = [];
                    let isRecipeOrDish = false;

                    if (searchItem) {
                        const excludePatterns = [];
                        if (searchItem === "egg") {
                            isRecipeOrDish = msgLower.includes("recipe") || 
                                             msgLower.includes("dish") || 
                                             msgLower.includes("cooked") || 
                                             msgLower.includes("prepare") || 
                                             msgLower.includes("eat") ||
                                             msgLower.includes("sandwich") ||
                                             msgLower.includes("roll") ||
                                             msgLower.includes("burger") ||
                                             msgLower.includes("curry") ||
                                             msgLower.includes("biryani");

                            excludePatterns.push({ [Op.notILike]: '%eggless%' });
                            excludePatterns.push({ [Op.notILike]: '%reggiano%' });

                            if (!isRecipeOrDish) {
                                // Raw eggs only: exclude cooked items
                                excludePatterns.push({ [Op.notILike]: '%biryani%' });
                                excludePatterns.push({ [Op.notILike]: '%curry%' });
                                excludePatterns.push({ [Op.notILike]: '%rice%' });
                                excludePatterns.push({ [Op.notILike]: '%sandwich%' });
                                excludePatterns.push({ [Op.notILike]: '%roll%' });
                                excludePatterns.push({ [Op.notILike]: '%fried%' });
                                excludePatterns.push({ [Op.notILike]: '%noodle%' });
                                excludePatterns.push({ [Op.notILike]: '%burger%' });
                                excludePatterns.push({ [Op.notILike]: '%mayo%' });
                            }
                        }
                        
                        const matchingProducts = await Product.findAll({
                            where: {
                                name: {
                                    [Op.and]: [
                                        { [Op.iLike]: `%${searchItem}%` },
                                        ...excludePatterns
                                    ]
                                }
                            },
                            include: [Integration]
                        });
                        
                        const uniqueMap = {};
                        matchingProducts.forEach(p => {
                            if (p.Integration && p.Integration.isActive) {
                                const categoryLower = (p.Integration.category || '').toLowerCase();
                                const isGroceryStore = categoryLower === "grocery" || p.Integration.verticalType === "GROCERY";

                                if (searchItem === "egg") {
                                    if (isRecipeOrDish) {
                                        // For recipe/dishes, only recommend food places (like FB or restaurants)
                                        if (!isGroceryStore) {
                                            uniqueMap[p.Integration.id] = p.Integration;
                                        }
                                    } else {
                                        // For raw eggs, only recommend grocery stores
                                        if (isGroceryStore) {
                                            uniqueMap[p.Integration.id] = p.Integration;
                                        }
                                    }
                                } else if (searchItem === "coffee") {
                                    // For coffee, prioritize FB / Cafe / Restaurant stores
                                    if (!isGroceryStore) {
                                        uniqueMap[p.Integration.id] = p.Integration;
                                    }
                                } else {
                                    uniqueMap[p.Integration.id] = p.Integration;
                                }
                            }
                        });
                        matchedStores = Object.values(uniqueMap);
                        if (searchItem === "coffee" && matchedStores.length === 0) {
                            matchingProducts.forEach(p => {
                                if (p.Integration && p.Integration.isActive) {
                                    uniqueMap[p.Integration.id] = p.Integration;
                                }
                            });
                            matchedStores = Object.values(uniqueMap);
                        }
                    }

                    if (matchedStores.length > 0) {
                        // Calculate distance and sort matchedStores
                        matchedStores.forEach(m => {
                            m.distance = calculateDistance(userLat, userLng, m.latitude ? Number(m.latitude) : null, m.longitude ? Number(m.longitude) : null);
                        });
                        matchedStores.sort((a, b) => a.distance - b.distance);

                        const storeLinks = matchedStores.map(m => {
                            const distStr = m.distance < 999999 ? ` (${m.distance < 1 ? (m.distance * 1000).toFixed(0) + 'm' : m.distance.toFixed(1) + 'km'} away)` : "";
                            return `[${m.integrationName}](store:${m.id})${distStr}`;
                        }).join(" or ");

                        if (searchItem === "egg" && isRecipeOrDish) {
                            text = `For egg recipes and dishes, I recommend checking out ${storeLinks}. Let me know if you want to see their menu!`;
                        } else {
                            text = `For ${searchItem}s, I recommend ${storeLinks} – they are closest to you and stock fresh products.`;
                        }
                    } else if (activeIntegrations.length > 0) {
                        // Find nearest stores matching category 'Grocery' / 'GROCERY'
                        const groceryStores = activeIntegrations.filter(i => {
                            const cat = (i.category || '').toLowerCase();
                            const vert = (i.verticalType || '').toLowerCase();
                            return cat.includes('grocery') || vert.includes('grocery');
                        });

                        // Calculate distance and sort groceryStores
                        groceryStores.forEach(m => {
                            m.distance = calculateDistance(userLat, userLng, m.latitude ? Number(m.latitude) : null, m.longitude ? Number(m.longitude) : null);
                        });
                        groceryStores.sort((a, b) => a.distance - b.distance);

                        const selectedStores = groceryStores.length > 0 ? groceryStores.slice(0, 3) : activeIntegrations.slice(0, 2);
                        
                        // Calculate distances for selected fallback stores if not done already
                        selectedStores.forEach(m => {
                            if (m.distance === undefined) {
                                m.distance = calculateDistance(userLat, userLng, m.latitude ? Number(m.latitude) : null, m.longitude ? Number(m.longitude) : null);
                            }
                        });

                        const storeLinks = selectedStores.map(m => {
                            const distStr = m.distance < 999999 ? ` (${m.distance < 1 ? (m.distance * 1000).toFixed(0) + 'm' : m.distance.toFixed(1) + 'km'} away)` : "";
                            return `[${m.integrationName}](store:${m.id})${distStr}`;
                        }).join(" or ");

                        if (msgLower.includes("egg")) {
                            text = `For eggs, I recommend checking out ${storeLinks} – they are closest to you and stock fresh dairy products.`;
                        } else {
                            text = `For your shopping needs, I recommend checking out ${storeLinks}. Let me know if you need help finding anything specific!`;
                        }
                    } else {
                        text = "Welcome! I can help you search for great food, shopping, or local spots recommended by your friends. Please specify the city or spot you'd like to discover!";
                    }
                }
            }
        }

        if (!text) {
            const item = userMessage.replace(/^(i want|i need|get me|find me|show me|looking for)\s*/i, '').trim();
            text = `Sorry, I couldn't find any store near you with "${item}". Try a different search or explore nearby stores on Tubulu!`;
        }

        // ── POST-PROCESS: Fix raw store:UUID that AI returned without a label ──
        // Build a quick id→name lookup from the merchants array
        const merchantMap = {};
        merchants.forEach(m => { merchantMap[m.id] = m.integrationName; });

        // Also incorporate ragChunk store names for better coverage
        if (ragChunks && ragChunks.length > 0) {
            ragChunks.forEach(chunk => {
                const id   = chunk.metadata?.integrationId;
                const name = chunk.metadata?.integrationName;
                if (id && name) merchantMap[id] = name;
            });
        }

        // Replace bare `store:UUID` (not already inside a markdown link) with [Name](store:UUID)
        // Pattern: match store:UUID that is NOT preceded by `](` (i.e. already inside a link)
        const UUID_RE = /(?<!\]\()store:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
        text = text.replace(UUID_RE, (match, id) => {
            const name = merchantMap[id];
            return name ? `[${name}](store:${id})` : match;
        });

        // Extract mentioned store cards from the final text for structured UI rendering
        const LINK_RE = /\[([^\]]+)\]\(store:([0-9a-f-]{36})\)/gi;
        const storeCards = [];
        const seenCardIds = new Set();
        let m2;
        while ((m2 = LINK_RE.exec(text)) !== null) {
            const [, name, id] = m2;
            if (!seenCardIds.has(id)) {
                seenCardIds.add(id);
                const merchant = merchants.find(mc => mc.id === id);
                storeCards.push({
                    id,
                    name,
                    category:    merchant?.category    || merchant?.verticalType || null,
                    city:        merchant?.city        || null,
                    addressLine: merchant?.addressLine || null,
                });
            }
        }

        return { reply: text, storeCards };

    } catch (error) {
        console.error("❌ [GlobalAIHelper Error Details]:", error);
        logger.error("Global AI Failed:", error.message);
        return { reply: "I'm currently busy helping other users. Please try again in a moment!", storeCards: [] };
    }
}

module.exports = { generateGlobalAIResponse };

