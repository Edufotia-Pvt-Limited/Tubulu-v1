const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIPort = require("./AIPort");

class GeminiAdapter extends AIPort {
    constructor(apiKey) {
        super();
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async chat(systemPrompt, history, userMessage, options = {}) {
        const modelName = options.model || "gemini-2.5-flash";
        const temp = options.temperature !== undefined ? options.temperature : 0.7;

        const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: temp }
        });

        // Translate generic history structure to Gemini structure
        const geminiHistory = (history || []).map(item => ({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.content || item.message || '' }]
        })).filter(item => item.parts[0].text);

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Got it! I am ready to assist." }] },
                ...geminiHistory
            ]
        });

        const result = await chat.sendMessage(userMessage);
        
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        if (result.response.usageMetadata) {
            usage = {
                promptTokens: result.response.usageMetadata.promptTokenCount || 0,
                completionTokens: result.response.usageMetadata.candidatesTokenCount || 0,
                totalTokens: result.response.usageMetadata.totalTokenCount || 0
            };
        }

        return {
            text: result.response.text().trim(),
            usage
        };
    }
}

module.exports = GeminiAdapter;
