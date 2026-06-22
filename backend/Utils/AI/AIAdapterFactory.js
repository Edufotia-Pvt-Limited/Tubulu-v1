const GeminiAdapter = require("./GeminiAdapter");
const SarvamAdapter = require("./SarvamAdapter");
const OpenAIAdapter = require("./OpenAIAdapter");
const AnthropicAdapter = require("./AnthropicAdapter");
const GroqAdapter = require("./GroqAdapter");

class AIAdapterFactory {
    /**
     * Automatically detects the AI provider from the API key format/prefix.
     * @param {string} apiKey 
     * @returns {string|null} 'openai', 'anthropic', 'gemini', 'sarvam', 'groq', or null
     */
    static detectProvider(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') return null;
        
        const trimmed = apiKey.trim();
        
        if (trimmed.startsWith('sk-ant-')) {
            return 'anthropic';
        }
        if (trimmed.startsWith('gsk_')) {
            return 'groq';
        }
        if (trimmed.startsWith('sk-or-v1-')) {
            return 'openrouter';
        }
        if (trimmed.startsWith('sk-')) {
            return 'openai';
        }
        if (trimmed.startsWith('AIzaSy')) {
            return 'gemini';
        }
        
        // Match UUID pattern (often used by Sarvam)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(trimmed)) {
            return 'sarvam';
        }
        
        return null;
    }

    /**
     * Resolves the proper adapter for the given provider/key
     * Supports both:
     *   - getAdapter(apiKey) (auto-detect)
     *   - getAdapter(providerName, apiKey) (backward compatible, but key prefix overrides providerName)
     * @param {string} firstArg providerName or apiKey
     * @param {string} [secondArg] apiKey (if firstArg is providerName)
     * @returns {AIPort}
     */
    static getAdapter(firstArg, secondArg) {
        let providerName;
        let apiKey;

        if (secondArg) {
            // Signature: getAdapter(providerName, apiKey)
            providerName = firstArg;
            apiKey = secondArg;
            
            // Key format overrides providerName parameter if a prefix matches
            const detected = this.detectProvider(apiKey);
            if (detected) {
                providerName = detected;
            }
        } else {
            // Signature: getAdapter(apiKey)
            apiKey = firstArg;
            providerName = this.detectProvider(apiKey) || 'gemini'; // fallback to gemini
        }

        switch (providerName.toLowerCase()) {
            case 'gemini':
                return new GeminiAdapter(apiKey);
            case 'sarvam':
                return new SarvamAdapter(apiKey);
            case 'openai':
            case 'openrouter':
                return new OpenAIAdapter(apiKey);
            case 'anthropic':
                return new AnthropicAdapter(apiKey);
            case 'groq':
                return new GroqAdapter(apiKey);
            default:
                throw new Error(`Unsupported AI provider resolved: ${providerName}`);
        }
    }
}

module.exports = AIAdapterFactory;
