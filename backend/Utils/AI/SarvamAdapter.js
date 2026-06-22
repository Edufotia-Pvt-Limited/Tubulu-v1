const axios = require("axios");
const AIPort = require("./AIPort");

class SarvamAdapter extends AIPort {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }

    async chat(systemPrompt, history, userMessage, options = {}) {
        const modelName = options.model || "sarvam-30b";
        const temp = options.temperature !== undefined ? options.temperature : 0.2;
        const maxTokens = options.maxTokens || 2048;

        const formattedHistory = (history || []).map(item => ({
            role: item.role === 'assistant' || item.role === 'model' ? 'assistant' : 'user',
            content: item.content || item.message || ''
        })).filter(item => item.content);

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                ...formattedHistory,
                { role: 'user', content: userMessage }
            ],
            temperature: temp,
            max_tokens: maxTokens
        }, {
            headers: { 
                'Authorization': `Bearer ${this.apiKey}`, 
                'Content-Type': 'application/json' 
            },
            timeout: options.timeout || 50000
        });

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content || !content.trim()) {
            throw new Error("Empty response content from Sarvam AI");
        }

        // Strip Chain-of-Thought thinking tags
        return content.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim();
    }
}

module.exports = SarvamAdapter;
