const axios = require('axios');
const AIPort = require('./AIPort');

class AnthropicAdapter extends AIPort {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }

    async chat(systemPrompt, history, userMessage, options = {}) {
        const modelName = options.model || "claude-3-5-haiku-20241022";
        const temp = options.temperature !== undefined ? options.temperature : 0.7;

        const normalizedHistory = (history || []).map(item => ({
            role: item.role === 'assistant' || item.role === 'model' ? 'assistant' : 'user',
            content: item.content || item.message || ''
        })).filter(item => item.content);

        const messages = [
            ...normalizedHistory,
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: modelName,
                    system: systemPrompt,
                    messages: messages,
                    max_tokens: options.maxTokens || 1024,
                    temperature: temp
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    timeout: options.timeout || 30000
                }
            );

            if (response.data && response.data.content && response.data.content.length > 0) {
                return response.data.content[0].text.trim();
            }
            throw new Error('Invalid response structure from Anthropic API');
        } catch (error) {
            const errorMsg = error.response && error.response.data && error.response.data.error
                ? error.response.data.error.message
                : error.message;
            throw new Error(`Anthropic API Error: ${errorMsg}`);
        }
    }
}

module.exports = AnthropicAdapter;
