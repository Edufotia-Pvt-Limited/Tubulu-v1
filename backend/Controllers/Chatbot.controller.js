const AIAdapterFactory = require("../Utils/AI/AIAdapterFactory");
const { config } = require("../config");
const { logger } = require("../Utils/Logger");
const ErrorBody = require("../Utils/ErrorBody");
const { Integration, AICategoryPlaybook, Product, Order, SystemSetting, VendorAIConfig, State } = require('../Utils/Postgres');
const axios = require("axios");

const redis = require("../Utils/Redis");

// Initialize Google AI in handlers dynamically

async function getSarvamKey() {
    const setting = await SystemSetting.findOne({ where: { key: 'SARVAM_API_KEY' } });
    if (setting && setting.value) {
        return setting.value;
    }
    try {
        const karnatakaState = await State.findOne({ where: { name: 'Karnataka' } });
        if (karnatakaState) {
            const { StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
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
        console.error("Error retrieving Karnataka Sarvam key in ChatbotController:", e.message);
    }
    return null;
}

async function processAiChat(req, res, next) {
    try {
        const { message, history } = req.body;
        const rawIntegrationId = req.body.integrationId;
        const isValidUUID = (uuid) => typeof uuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
        const integrationId = (rawIntegrationId && isValidUUID(rawIntegrationId)) ? rawIntegrationId : null;

        if (!message) {
            return next(new ErrorBody(400, "Message is required"));
        }

        let systemInstruction = "You are a helpful AI assistant for Tubulu.";
        let temperature = 0.2;
        let maxTokens = 300;
        
        // 1. Check Redis Cache for Business Context
        if (integrationId) {
            const cacheKey = `integration:context:${integrationId}`;
            let cachedContext = await redis.get(cacheKey);

            if (cachedContext) {
                try {
                    const parsed = JSON.parse(cachedContext);
                    systemInstruction = parsed.systemInstruction;
                    temperature = parsed.temperature !== undefined ? Number(parsed.temperature) : 0.2;
                    maxTokens = parsed.maxTokens !== undefined ? Number(parsed.maxTokens) : 300;
                } catch (e) {
                    systemInstruction = cachedContext;
                }
            } else {
                // Fetch from DB if not in cache
                const business = await Integration.findByPk(integrationId);
                if (business) {
                    // Fetch products strictly for this particular store only
                    const products = await Product.findAll({
                        where: { integrationId, isActive: true, isDeleted: false },
                        attributes: ['name', 'price', 'description', 'quantity', 'category'],
                        limit: 30
                    });

                    const productList = products
                        .map(p => `- ${p.name}: ₹${p.price} [Category: ${p.category}] [Stock: ${p.quantity}]${p.description ? ` (${p.description})` : ''}`)
                        .join("\n");

                    // Fetch all orders placed strictly at this particular store only
                    const orders = await Order.findAll({
                        where: { integrationId },
                        order: [['createdAt', 'DESC']]
                    });

                    let orderContext = "";
                    if (orders.length > 0) {
                        orderContext = orders.map((o, idx) => {
                            const itemsList = (o.orderItems || []).map(i => `${i.productName || i.name || 'Item'} (Qty: ${i.quantity || 1})`).join(", ");
                            return `- Order ID: ${o.id.substring(0, 8)}... | Items: [${itemsList}] | Total Price: ₹${o.totalPrice} | Status: ${o.status} | Payment: ${o.paymentStatus} | Date: ${o.createdAt.toLocaleDateString()}`;
                        }).join("\n");
                    } else {
                        orderContext = "No orders have been placed at this store yet.";
                    }
                    
                    // Fetch category-level playbook if configured
                    const playbook = await AICategoryPlaybook.findOne({
                        where: { categoryKey: business.verticalType || 'FB' }
                    });

                    // Fetch vendor-specific AI config
                    const aiConfig = await VendorAIConfig.findOne({
                        where: { integrationId }
                    });

                    temperature = (playbook && playbook.actionConfig?.temperature !== undefined)
                        ? Number(playbook.actionConfig.temperature)
                        : 0.2;
                    maxTokens = (playbook && playbook.actionConfig?.maxTokens !== undefined)
                        ? Number(playbook.actionConfig.maxTokens)
                        : 300;

                    if (aiConfig) {
                        temperature = aiConfig.temperature !== undefined ? Number(aiConfig.temperature) : temperature;
                    }

                    let playbookInstructions = playbook 
                        ? playbook.masterPrompt 
                        : `You are Tubulu Pulse, the professional AI Assistant for "${business.integrationName}".`;

                    if (aiConfig && aiConfig.masterPrompt) {
                        playbookInstructions = aiConfig.masterPrompt;
                    }

                    if (playbook && playbook.actionConfig?.voiceOptimized) {
                        playbookInstructions += `
\n[STRICT VOICE FORMATTING RULES]:
- Speak briefly. Keep all answers under 25 words (max 2 sentences).
- Do NOT use markdown symbols, bullet points, asterisks, or hashes. Output raw spoken text.
`;
                    }

                    let faqSection = "";
                    if (aiConfig && Array.isArray(aiConfig.faqContext) && aiConfig.faqContext.length > 0) {
                        faqSection = "\nKNOWLEDGE BASE / FREQUENTLY ASKED QUESTIONS (FAQ):\n" + 
                            aiConfig.faqContext.map((f, i) => `FAQ #${i+1}:\nQuestion: ${f.question}\nAnswer: ${f.answer}`).join("\n\n") + "\n";
                    }

                    let scopingInstruction = "";
                    if (aiConfig && aiConfig.catalogScoped) {
                        scopingInstruction = "\nCATALOGUE SCOPING RULE: You are strictly scoped to the ACTIVE PRODUCT/SERVICE CATALOG. If the user asks about products, prices, or options not present in the catalog or FAQ, politely inform them you cannot answer that and offer to help with items in the catalog.\n";
                    }

                    const businessContext = `
${playbookInstructions}

${scopingInstruction}

STORE PROFILE:
- Business Name: ${business.integrationName}
- Location: ${business.city}, ${business.state}, ${business.country}
- Contact Details: ${business.phoneNumber || business.email}

ACTIVE PRODUCT/SERVICE CATALOG:
${productList || "No catalog offerings listed currently."}

${faqSection}

RECENT STORE ORDERS:
${orderContext}

CORE CHATBOT GUIDELINES:
- You are Tubulu Pulse. Identify yourself as Tubulu Pulse.
- STRICT SECURITY: You only have access to information particular to "${business.integrationName}". Under no circumstances talk about other merchants, products, or leak data from outside this specific store.
- STABILIZE REPLY AND KEEP IT SHORT: Keep your responses extremely direct, stable, and under 2-3 sentences. Never provide long winded or verbose answers. This reduces token costs and increases performance.
- Responses must be in plain text, no markdown format.
`;
                    systemInstruction = businessContext;
                    // Cache compiled context and parameters as JSON
                    const cachePayload = JSON.stringify({
                        systemInstruction,
                        temperature,
                        maxTokens
                    });
                    await redis.setex(cacheKey, 3600, cachePayload);
                }
            }
        }

        // 2. Fetch state-level keys and provider settings
        let stateSarvamKey = null;
        let stateGeminiKey = null;
        let stateChatProvider = null;
        if (integrationId) {
            const intg = await Integration.findByPk(integrationId, { attributes: ['stateId'] });
            if (intg && intg.stateId) {
                const { StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
                const configs = await StateServiceConfig.findAll({
                    where: { stateId: intg.stateId },
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
        }

        // 3. Prepare Sarvam AI or fallback
        let text = "";
        
        const trialProviders = [];
        if (stateChatProvider === 'sarvam') {
            trialProviders.push('sarvam', 'gemini');
        } else {
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
                    if (!apiKey) throw new Error("No active Sarvam API Key found in settings.");
                    options = { temperature, maxTokens, timeout: 25000 };
                    console.log(`🤖 [Chatbot] Routing to Sarvam AI (Tubulu Pulse)`);
                } else if (p === 'gemini') {
                    apiKey = stateGeminiKey;
                    if (!apiKey) {
                        try {
                            const dbSetting = await SystemSetting.findOne({ where: { key: 'GEMINI_API_KEY' } });
                            if (dbSetting && dbSetting.value) {
                                apiKey = dbSetting.value;
                            }
                        } catch (dbErr) {
                            console.error("Failed to fetch GEMINI_API_KEY from database in Chatbot controller:", dbErr.message);
                        }
                    }
                    if (!apiKey) {
                        apiKey = config.GOOGLE_API_KEY;
                    }
                    options = { temperature, maxTokens, model: "gemini-2.5-flash" };
                    console.log(`🤖 [Chatbot] Routing to Gemini 2.5 Flash`);
                }

                if (apiKey) {
                    const adapter = AIAdapterFactory.getAdapter(p, apiKey);
                    const formattedHistory = (history || []).map(item => ({
                        role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
                        content: item.content || item.message || ''
                    }));
                    let aiResponse = await adapter.chat(systemInstruction, formattedHistory, message, options);
                    let usage = null;
                    if (typeof aiResponse === 'string') {
                        text = aiResponse;
                    } else if (aiResponse && aiResponse.text) {
                        text = aiResponse.text;
                        usage = aiResponse.usage;
                    }
                    if (text) {
                        break;
                    }
                }
            } catch (err) {
                console.warn(`⚠️ Chatbot provider ${p} failed:`, err.message);
            }
        }

        if (!text) {
            throw new Error("All chatbot providers failed to respond");
        }

        res.status(200).json({
            success: true,
            data: {
                reply: text,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error("Chatbot Hardening Error: " + error.message);
        next(new ErrorBody(500, "I am having trouble connecting right now. Please try again."));
    }
}

module.exports = {
    processAiChat
};
