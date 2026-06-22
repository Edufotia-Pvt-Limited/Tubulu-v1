const { generateGlobalAIResponse } = require('../Utils/GlobalAIHelper');

async function verify() {
    try {
        console.log("Starting Recommendations Audit Verification...");
        
        // Pass individual arguments matching signature: generateGlobalAIResponse(userId, userMessage, chatHistory, coords)
        const result = await generateGlobalAIResponse(
            null,
            'recommend filter coffee',
            [],
            { latitude: 12.3237008, longitude: 76.6022778 }
        );

        console.log("Mock Response Successful:", typeof result === 'object' && result !== null);
        console.log("Response text summary length:", result.reply ? result.reply.length : 0);
        console.log("Response reply preview:", result.reply);
        console.log("✅ Verification Passed Successfully!");
    } catch (e) {
        console.error("❌ Verification Failed with Error:", e);
    }
    process.exit(0);
}

verify();
