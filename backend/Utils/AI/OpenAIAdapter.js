const axios = require('axios');
const AIPort = require('./AIPort');

class OpenAIAdapter extends AIPort {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }

    async chat(systemPrompt, history, userMessage, options = {}) {
        const modelName = options.model || "gpt-4o-mini";
        const temp = options.temperature !== undefined ? options.temperature : 0.7;

        const normalizedHistory = (history || []).map(item => ({
            role: item.role === 'assistant' || item.role === 'model' ? 'assistant' : 'user',
            content: item.content || item.message || ''
        })).filter(item => item.content);

        const messages = [
            { role: 'system', content: systemPrompt },
            ...normalizedHistory,
            { role: 'user', content: userMessage }
        ];

        try {
            const baseURL = this.apiKey.startsWith('sk-or-v1-') 
                ? 'https://openrouter.ai/api/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';

            const response = await axios.post(
                baseURL,
                {
                    model: modelName,
                    messages: messages,
                    temperature: temp
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: options.timeout || 30000
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content.trim();
            }
            throw new Error('Invalid response structure from OpenAI API');
        } catch (error) {
            const errorMsg = error.response && error.response.data && error.response.data.error
                ? error.response.data.error.message
                : error.message;
            throw new Error(`OpenAI API Error: ${errorMsg}`);
        }
    }
}

module.exports = OpenAIAdapter;
