const jwt = require('jsonwebtoken');
const axios = require('axios');

async function run() {
    try {
        const payload = {
            id: 'd0b83594-f364-48c9-aed6-c1cb29c4223b', // User d0b83594-f364-48c9-aed6-c1cb29c4223b
            phoneNumber: '9999988881',
            role: 'User'
        };

        const token = jwt.sign(payload, "tubulu_secret_key_2026", { expiresIn: '1d' });
        console.log("Generated token:", token);

        console.log("Sending chat request to http://localhost:3008/api/v1/chatbot/chat...");
        const response = await axios.post(
            'http://localhost:3008/api/v1/chatbot/chat',
            {
                message: "Hello, do you have fresh bread?",
                integrationId: "f1665785-dab5-4a4b-a543-109b62e9af4a" // Anand Bakery Indiranagar
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log("Success response status:", response.status);
        console.log("Response data:", JSON.stringify(response.data, null, 2));

    } catch (err) {
        if (err.response) {
            console.error("Server responded with error status:", err.response.status);
            console.error("Error data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Request error:", err.message);
        }
    }
}

run();
