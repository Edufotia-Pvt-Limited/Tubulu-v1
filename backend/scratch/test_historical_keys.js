const { GoogleGenerativeAI } = require("@google/generative-ai");

const keys = [
    "AIzaSyCL41v_I36GA-nnEa5o6tmmtwXyMqZzkMk",
    "AIzaSyBblTs8WpB8BramnO1ivSLBi-9zAPNQ3D4"
];

async function testKeys() {
    for (const key of keys) {
        try {
            console.log("Testing key:", key);
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello, reply with one word.");
            console.log("SUCCESS! Response:", result.response.text());
        } catch (e) {
            console.error("FAILED:", e.message);
        }
    }
}

testKeys();
