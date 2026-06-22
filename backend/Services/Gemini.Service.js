const { GoogleGenerativeAI } = require('@google/generative-ai');
const ErrorBody = require('../Utils/ErrorBody');
const { SystemSetting } = require('../Utils/Postgres');
const { config } = require('../config');

async function getGenAIInstance() {
    let apiKey = process.env.GEMINI_API_KEY || config.GOOGLE_API_KEY || 'PLACEHOLDER_KEY';
    try {
        const dbSetting = await SystemSetting.findOne({ where: { key: 'GEMINI_API_KEY' } });
        if (dbSetting && dbSetting.value) {
            apiKey = dbSetting.value;
        }
    } catch (dbErr) {
        console.error("Failed to fetch GEMINI_API_KEY from database in Gemini.Service:", dbErr.message);
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Extracts data from business documents (GST, PAN, Aadhaar)
 * @param {string} base64Data 
 * @param {string} mimeType 
 * @returns {Promise<Object>}
 */
async function extractKYCData(base64Data, mimeType) {
    try {
        const genAI = await getGenAIInstance();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            Analyze this business document and extract the following information in valid JSON format:
            - businessName (if available)
            - registrationNumber (GSTIN or PAN or Aadhaar number)
            - address (if available)
            - entityType (Proprietorship, Partnership, etc.)
            
            Return ONLY the JSON object.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data.split(',')[1] || base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Failed to parse AI response as JSON');
    } catch (error) {
        console.error('Gemini KYC Extraction Error:', error.message);
        throw new ErrorBody(500, 'AI extraction failed: ' + error.message);
    }
}

/**
 * Generates marketing descriptions for products
 */
async function generateDescription(productName, category, features = []) {
    try {
        const genAI = await getGenAIInstance();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            Write a professional and catchy product description for:
            Name: ${productName}
            Category: ${category}
            Features: ${features.join(', ')}
            
            Keep it under 80 words. Focus on benefits.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        throw new ErrorBody(500, 'AI description generation failed');
    }
}

module.exports = {
    extractKYCData,
    generateDescription
};
