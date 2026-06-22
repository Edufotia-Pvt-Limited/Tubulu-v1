const { Product, VendorAIConfig, Integration, SystemSetting } = require("./Postgres");
const AIAdapterFactory = require("./AI/AIAdapterFactory");
const { logger } = require("./Logger");
const { config } = require("../config");

const isStaging = process.env.DB_NAME === 'tubulu';

/**
 * Generates an AI response for a store chatbot using Gemini Flash.
 * Sarvam models are pure thinking models (cannot disable CoT) and
 * take 30+ seconds per response — not viable for real-time chat.
 */
async function generateVendorAIResponse(integrationId, userId, userMessage, chatHistory = []) {
    try {
        // 1. Fetch AI Config
        let aiConfig = await VendorAIConfig.findOne({ where: { integrationId, isActive: true } });
        if (!aiConfig) {
            aiConfig = await VendorAIConfig.findOne({ where: { integrationId } });
        }

        // 2. Fetch Store Name & StateId
        const integration = await Integration.findByPk(integrationId, {
            attributes: ['integrationName', 'stateId']
        });
        if (!integration) return null;

        const masterPrompt = aiConfig?.masterPrompt
            || `You are the official digital storefront assistant for ${integration.integrationName}. You work AT the store. Always use 'we', 'us', and 'our' when referring to the menu or restaurant. NEVER say 'Based on the product list' – act as if you naturally know our menu by heart. Be friendly, concise, and helpful.`;
        const faqList = aiConfig?.faqContext || [];

        // Natural Language Cart Intent Interception (e.g., "pack 6 eggs for me")
        const cartRegex = /(?:pack|add|buy|get|put|need)\s+(?:(a|an)|(\d+))\s+([\w\s\-]+?)(?:\s+for\s+me|\s+to\s+my\s+cart|\s+in\s+my\s+cart|\s+in\s+cart|\s+to\s+cart)?$/i;
        const match = userMessage.trim().match(cartRegex);
        if (match) {
            const rawQty = match[1] ? 1 : parseInt(match[2], 10);
            const queryName = match[3].trim().toLowerCase();
            
            // Find matched active product
            const allProducts = await Product.findAll({
                where: { integrationId, isActive: true, isDeleted: false },
                attributes: ['id', 'catalogueId', 'name', 'price']
            });

            const matchedProduct = allProducts.find(p => 
                p.name.toLowerCase() === queryName || 
                p.name.toLowerCase().includes(queryName) || 
                queryName.includes(p.name.toLowerCase())
            );

            if (matchedProduct) {
                try {
                    const { createCartForCustomizedProductService } = require("../Services/Cart.Service");
                    await createCartForCustomizedProductService(
                        userId,
                        integrationId,
                        matchedProduct.catalogueId,
                        matchedProduct.id,
                        rawQty
                    );
                    
                    return `I have successfully added ${rawQty} x **${matchedProduct.name}** (₹${matchedProduct.price}) to your cart! <br/><br/><a href="https://tubulu.app/product?productId=${matchedProduct.id}&catalogueId=${matchedProduct.catalogueId}"><b>View Product Detail</b></a> | <a href="https://tubulu.app/add-to-cart?productId=${matchedProduct.id}&catalogueId=${matchedProduct.catalogueId}&quantity=${rawQty}"><b>Add More</b></a>`;
                } catch (cartErr) {
                    console.error("Auto add to cart error:", cartErr.message);
                }
            }
        }

        // Fetch state-level keys and settings
        let stateSarvamKey = null;
        let stateGeminiKey = null;
        let stateGeminiBackupKey = null;
        let stateChatProvider = null;
        if (integration.stateId) {
            const { StateServiceConfig, ServiceProvider } = require("./Postgres");
            const configs = await StateServiceConfig.findAll({
                where: { stateId: integration.stateId },
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
                        stateGeminiBackupKey = cfg.config?.backupApiKey || null;
                    }
                }
            }
        }

        // 3. Fetch Products (compact, max 30)
        const products = await Product.findAll({
            where: { integrationId, isActive: true, isDeleted: false },
            attributes: ['id', 'catalogueId', 'name', 'price', 'category', 'quantity'],
            limit: 30
        });

        if (products.length === 0) {
            return "I'm sorry, no products are available in this store right now.";
        }

        // 4. Build compact catalogue
        const catalogue = products
            .map(p => `[ID: ${p.id}, CatalogueID: ${p.catalogueId}] ${p.name}: ₹${p.price}${p.category ? ` [${p.category}]` : ''}${(p.quantity < 1) ? ' (out of stock)' : ''}`)
            .join('\n');

        // 5. Build compact FAQ (max 5)
        const faq = faqList.slice(0, 5)
            .map(f => `Q: ${f.question}\nA: ${f.answer}`)
            .join('\n');

        // 6. System prompt
        const systemPrompt = [
            masterPrompt,
            `Store: ${integration.integrationName}`,
            `\nCRITICAL CONVERSATION RULES:`,
            `1. Keep your sentences extremely short, concise, and conversational. Do not write long paragraphs.`,
            `2. When mentioning products, just name them and their price, e.g., "We have Dosa for ₹75 and Filter Coffee for ₹30." Do not add any links or HTML.`,
            `\nPRODUCTS:\n${catalogue}`,
            faq ? `\nFAQ:\n${faq}` : ''
        ].filter(Boolean).join('\n');

        console.log(`🤖 [Store Chat] "${userMessage}" | ${integration.integrationName}`);

        // 7. Determine default text AI provider
        let provider = stateChatProvider ? stateChatProvider.toLowerCase() : 'gemini';
        if (!stateChatProvider) {
            try {
                const providerSetting = await SystemSetting.findOne({ where: { key: 'DEFAULT_TEXT_PROVIDER' } });
                if (providerSetting && providerSetting.value) {
                    provider = providerSetting.value.toLowerCase();
                }
            } catch (err) {
                console.error("Failed to fetch DEFAULT_TEXT_PROVIDER from database:", err.message);
            }
        }

        let reply = "";

        const trialProviders = [];
        if (provider === 'sarvam') {
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
                        const sarvamKeySetting = await SystemSetting.findOne({ where: { key: 'SARVAM_API_KEY' } });
                        apiKey = sarvamKeySetting ? sarvamKeySetting.value : null;
                    }
                    if (!apiKey) throw new Error("Sarvam API key not configured");
                    options = { temperature: 0.2, maxTokens: 2048, timeout: 50000 };
                    console.log(`🤖 [Store Chat] Routing to Sarvam AI`);
                } else if (p === 'gemini') {
                    apiKey = stateGeminiKey;
                    if (!apiKey) throw new Error("Primary Gemini API key not configured in state AI settings");
                    options = { temperature: 0.7 };
                    console.log(`🤖 [Store Chat] Routing to Gemini 2.5 Flash (Primary)`);
                }

                if (apiKey) {
                    const adapter = AIAdapterFactory.getAdapter(p, apiKey);
                    const chatHistorySlice = chatHistory.slice(-6);
                    
                    let aiResponse = await adapter.chat(systemPrompt, chatHistorySlice, userMessage, options);
                    let usage = null;
                    if (typeof aiResponse === 'string') {
                        reply = aiResponse;
                    } else if (aiResponse && aiResponse.text) {
                        reply = aiResponse.text;
                        usage = aiResponse.usage;
                    }

                    if (reply) {
                        console.log(`✅ [Store Chat] ${p.toUpperCase()} answered: "${reply.substring(0, 80)}..."`);
                        
                        if (usage) {
                            try {
                                const AITokenLog = require('../Models/AITokenLog.pg.js');
                                const MerchantWallet = require('../Models/MerchantWallet.pg.js');
                                
                                await AITokenLog.create({
                                    integrationId: merchantObj ? merchantObj.id : null,
                                    featureName: 'Merchant Auto Reply',
                                    stateId: merchantObj ? merchantObj.stateId : null,
                                    cityId: merchantObj ? merchantObj.cityId : null,
                                    promptTokens: usage.promptTokens || 0,
                                    completionTokens: usage.completionTokens || 0,
                                    totalTokens: usage.totalTokens || 0
                                });

                                if (merchantObj) {
                                    const wallet = await MerchantWallet.findOne({ where: { integrationId: merchantObj.id } });
                                    if (wallet) {
                                        wallet.tokenBalance -= (usage.totalTokens || 0);
                                        await wallet.save();
                                    }
                                }
                            } catch (logErr) {
                                console.error('Failed to log AI tokens for Merchant:', logErr.message);
                            }
                        }

                        break;
                    }
                }
            } catch (err) {
                console.error(`❌ [Store Chat] Provider ${p} failed:`, err.message);
                
                // Fallback to Gemini Backup Key if primary failed
                if (p === 'gemini' && stateGeminiBackupKey) {
                    try {
                        console.log(`🤖 [Store Chat] Attempting Gemini Backup Key...`);
                        const adapter = AIAdapterFactory.getAdapter(p, stateGeminiBackupKey);
                        const chatHistorySlice = chatHistory.slice(-6);
                        
                        let aiResponse = await adapter.chat(systemPrompt, chatHistorySlice, userMessage, options);
                        let usage = null;
                        if (typeof aiResponse === 'string') {
                            reply = aiResponse;
                        } else if (aiResponse && aiResponse.text) {
                            reply = aiResponse.text;
                            usage = aiResponse.usage;
                        }

                        if (reply) {
                            console.log(`✅ [Store Chat] GEMINI (BACKUP) answered: "${reply.substring(0, 80)}..."`);
                            
                            if (usage) {
                                try {
                                    const AITokenLog = require('../Models/AITokenLog.pg.js');
                                    const MerchantWallet = require('../Models/MerchantWallet.pg.js');
                                    
                                    await AITokenLog.create({
                                        integrationId: merchantObj ? merchantObj.id : null,
                                        featureName: 'Merchant Auto Reply (Backup)',
                                        stateId: merchantObj ? merchantObj.stateId : null,
                                        cityId: merchantObj ? merchantObj.cityId : null,
                                        promptTokens: usage.promptTokens || 0,
                                        completionTokens: usage.completionTokens || 0,
                                        totalTokens: usage.totalTokens || 0
                                    });

                                    if (merchantObj) {
                                        const wallet = await MerchantWallet.findOne({ where: { integrationId: merchantObj.id } });
                                        if (wallet) {
                                            wallet.tokenBalance -= (usage.totalTokens || 0);
                                            await wallet.save();
                                        }
                                    }
                                } catch (logErr) {
                                    console.error('Failed to log AI tokens for Merchant Backup:', logErr.message);
                                }
                            }

                            break;
                        }
                    } catch (backupErr) {
                        console.error(`❌ [Store Chat] Gemini Backup Key also failed:`, backupErr.message);
                    }
                }
            }
        }

        if (reply) {
            return reply;
        }

        return "I'm processing your request. Please try again.";

    } catch (error) {
        logger.error("Store AI Response Failed:", error.message);
        console.error("❌ Store AI Error:", error.message);
        return "I'm currently looking into your request. Could you please hold on a moment?";
    }
}

module.exports = {
    generateVendorAIResponse
};
