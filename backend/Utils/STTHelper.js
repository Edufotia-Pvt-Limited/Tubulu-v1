const { Integration, StateServiceConfig, ServiceProvider, SystemSetting, State } = require("./Postgres");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const FormData = require("form-data");

/**
 * Transcribes an audio file buffer using either state-configured Sarvam AI STT
 * or falling back to Google Gemini Flash Speech-to-Text.
 * 
 * @param {Buffer} fileBuffer - Audio file content buffer
 * @param {string} mimeType - The mime type of the audio (e.g. 'audio/wav', 'audio/mpeg')
 * @param {string} integrationId - The store/business integration ID
 * @returns {Promise<string>} Transcribed text content
 */
async function transcribeAudio(fileBuffer, mimeType, integrationId) {
    try {
        console.log(`[STT] Transcribing audio for integration: ${integrationId}, Mime: ${mimeType}`);

        // 1. Resolve state-level configuration & API keys
        const integration = integrationId ? await Integration.findByPk(integrationId, {
            attributes: ['stateId']
        }) : null;

        let stateSarvamKey = null;
        let stateGeminiKey = null;
        let activeSpeechProvider = null;

        if (integration && integration.stateId) {
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
                        activeSpeechProvider = cfg.provider.serviceProvider; // e.g. 'sarvam'
                    } else if (cfg.provider.serviceType === 'LLM') {
                        stateGeminiKey = cfg.config?.apiKey || null;
                    }
                }
            }
        }

        // Fallback: Dynamically check Karnataka's StateServiceConfig if no active Sarvam key is found
        if (!stateSarvamKey || activeSpeechProvider !== 'sarvam') {
            const karnatakaState = await State.findOne({ where: { name: 'Karnataka' } });
            if (karnatakaState) {
                const karnatakaConfigs = await StateServiceConfig.findAll({
                    where: { stateId: karnatakaState.id },
                    include: [{
                        model: ServiceProvider,
                        as: 'provider',
                        where: { isActive: true, serviceProvider: 'sarvam' }
                    }]
                });
                for (const cfg of karnatakaConfigs) {
                    if (cfg.provider && cfg.config?.apiKey) {
                        stateSarvamKey = cfg.config.apiKey;
                        activeSpeechProvider = 'sarvam';
                        console.log(`[STT] Using Karnataka State dynamic Sarvam key for STT.`);
                    }
                }
            }
        }

        // 2. Route to appropriate STT provider based on configuration
        if (activeSpeechProvider === 'sarvam' && stateSarvamKey) {
            console.log(`[STT] Routing to Sarvam Speech-to-Text`);
            const form = new FormData();
            form.append('file', fileBuffer, {
                filename: 'speech_audio.wav',
                contentType: mimeType
            });
            form.append('model', 'saaras:v3');

            const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
                headers: {
                    ...form.getHeaders(),
                    'api-subscription-key': stateSarvamKey
                },
                timeout: 30000
            });

            if (response.data && response.data.transcript) {
                console.log(`[STT] Sarvam transcription success: "${response.data.transcript}"`);
                return response.data.transcript.trim();
            } else {
                throw new Error("Invalid response from Sarvam STT API");
            }
        } else {
            // Fallback to Gemini STT
            console.log(`[STT] Routing to Gemini Speech-to-Text`);
            
            // Resolve Gemini Key
            let geminiKey = stateGeminiKey;
            if (!geminiKey) {
                const globalKeySetting = await SystemSetting.findOne({
                    where: { key: 'GEMINI_API_KEY' }
                });
                geminiKey = globalKeySetting ? globalKeySetting.value : null;
            }

            if (!geminiKey) {
                throw new Error("No Gemini API key available for Speech-to-Text transcription");
            }

            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent([
                {
                    inlineData: {
                        data: fileBuffer.toString("base64"),
                        mimeType: mimeType
                    }
                },
                "Please transcribe this audio exactly. Output ONLY the transcribed text. Do not add any conversational filler, notes, or translations."
            ]);

            const transcription = result.response.text().trim();
            console.log(`[STT] Gemini transcription success: "${transcription}"`);
            return transcription;
        }
    } catch (err) {
        console.error("❌ [STT Error] Transcription failed:", err.message);
        throw err;
    }
}

module.exports = {
    transcribeAudio
};
