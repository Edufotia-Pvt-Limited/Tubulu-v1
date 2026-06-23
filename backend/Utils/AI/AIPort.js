class AIPort {
    /**
     * Send a message to the AI provider with system prompt and history.
     * @param {string} systemPrompt The baseline context instruction
     * @param {Array<{role: string, content: string}>} history Generic chat history array
     * @param {string} userMessage The current user message
     * @param {Object} [options] Optional parameters (e.g. temperature, maxTokens, model)
     * @returns {Promise<string>} The response message from the AI model
     */
    async chat(systemPrompt, history, userMessage, options = {}) {
        throw new Error("Method 'chat()' must be implemented");
    }
}

module.exports = AIPort;
