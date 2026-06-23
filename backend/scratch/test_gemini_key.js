const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyAGdtvY77rDM0YcB2gWKZuF9sZjhFaybkU";

async function run() {
    try {
        console.log("Testing API key:", apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, write a short word.");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

run();
