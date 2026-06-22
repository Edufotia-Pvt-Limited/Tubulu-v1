const GeminiService = require('../Services/Gemini.Service');
const ErrorBody = require('../Utils/ErrorBody');
const GlobalAIHelper = require('../Utils/GlobalAIHelper');
const axios = require('axios');
const STTHelper = require('../Utils/STTHelper');

async function extractKycDataController(req, res, next) {
    try {
        const { file, mimeType } = req.body;
        
        if (!file || !mimeType) {
            throw new ErrorBody(400, 'File and mimeType are required');
        }

        const data = await GeminiService.extractKYCData(file, mimeType);
        
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
}

async function generateDescriptionController(req, res, next) {
    try {
        const { productName, category, features } = req.body;
        
        if (!productName || !category) {
            throw new ErrorBody(400, 'productName and category are required');
        }

        const description = await GeminiService.generateDescription(productName, category, features || []);
        
        res.status(200).json({
            success: true,
            data: { description }
        });
    } catch (error) {
        next(error);
    }
}

async function globalChatController(req, res, next) {
    try {
        const { message, type, history, latitude, longitude } = req.body;
        const userId = req.user?.id; // From verifyToken middleware

        let finalMessage = message;
        let transcriptionText = null;

        if (type === 'AUDIO' && message) {
            try {
                console.log(`[Global AI Chat Audio] Transcribing audio URL: ${message}`);
                const audioResponse = await axios.get(message, { responseType: 'arraybuffer' });
                const fileBuffer = Buffer.from(audioResponse.data);
                const mimeType = audioResponse.headers['content-type'] || 'audio/wav';

                transcriptionText = await STTHelper.transcribeAudio(fileBuffer, mimeType, null);
                finalMessage = transcriptionText || "[Unintelligible Audio]";
            } catch (sttError) {
                console.error("❌ [Global AI Chat Audio STT Error]:", sttError.message);
                finalMessage = "[Voice Message]";
            }
        }

        console.log(`[Chat Request] msg="${finalMessage}" hist_len=${history?.length || 0} lat=${latitude} lng=${longitude} userId=${userId}`);

        const response = await GlobalAIHelper.generateGlobalAIResponse(
            userId, 
            finalMessage, 
            history || [], 
            latitude && longitude ? { latitude, longitude } : null
        );
        
        // response is now { reply: string, storeCards: [] }
        const reply     = (response && typeof response === 'object') ? (response.reply      || '') : (response || '');
        const storeCards = (response && typeof response === 'object') ? (response.storeCards || []) : [];

        res.status(200).json({
            success: true,
            data: { 
                reply, 
                storeCards, 
                transcription: transcriptionText 
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    extractKycDataController,
    generateDescriptionController,
    globalChatController
};
