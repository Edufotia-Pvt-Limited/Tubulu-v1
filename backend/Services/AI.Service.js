const { GoogleGenerativeAI } = require("@google/generative-ai");
const { config } = require("../config");
const IntegrationService = require("./Integration.Service");
const { logger } = require("../Utils/Logger");

/**
 * AI Service handles the "Brain" of the WhatsApp Agent.
 * It uses Gemini to interpret user intent and call internal services.
 */
class AIService {
    constructor() {}

    /**
     * Main entry point for a chat message.
     * @param {string} userMessage - The text from WhatsApp
     * @param {string} userPhone - Sender's phone number
     */
    async processMessage(userMessage, userPhone) {
        try {
            // Retrieve Gemini API Key dynamically from SystemSetting
            let apiKey = config.GOOGLE_API_KEY;
            try {
                const { SystemSetting } = require("../Utils/Postgres");
                const dbSetting = await SystemSetting.findOne({ where: { key: 'GEMINI_API_KEY' } });
                if (dbSetting && dbSetting.value) {
                    apiKey = dbSetting.value;
                }
            } catch (dbErr) {
                console.error("Failed to fetch GEMINI_API_KEY from database in AIService:", dbErr.message);
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: `You are the Tubulu AI Concierge. Your goal is to help users buy items from local stores via WhatsApp.
                You have access to a database of local merchants (Food, Groceries, AI/ML, Automotive, etc.).
                
                Steps:
                1. If the user is looking for something, use the 'search_merchants' tool.
                2. If they select a store, use 'get_store_catalogue' to see what they sell.
                3. Once they choose items, confirm the order and tell them you'll generate a payment link.
                
                Be helpful, polite, and concise. This is a chat interface.`,
            });

            const chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error("AI Service LLM Error, using fallback:", error);
            
            // FALLBACK HEURISTIC: Simple intent parsing
            const msg = userMessage.toLowerCase();
            
            if (msg.includes("bakery") || msg.includes("bread") || msg.includes("cake")) {
                const results = await IntegrationService.getAllIntegrations({ search: "bakery" });
                if (results && results.length > 0) {
                    return `I found a great bakery for you: *${results[0].integrationName}*. They have delicious items! Would you like me to get their full menu for you?`;
                }
            }

            if (msg.includes("grocery") || msg.includes("milk") || msg.includes("sugar")) {
                const results = await IntegrationService.getAllIntegrations({ search: "grocery" });
                if (results && results.length > 0) {
                    return `I found *${results[0].integrationName}* nearby for your groceries. Should I list their available items?`;
                }
            }

            return "Hi! I'm the Tubulu AI Concierge. I can help you find and buy items from local stores. (Note: My advanced brain is currently offline due to an expired API key, but I can still help with basic searches like 'bakery' or 'grocery'!)";
        }
    }
}

module.exports = new AIService();
