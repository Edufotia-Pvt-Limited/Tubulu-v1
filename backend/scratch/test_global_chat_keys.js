const jwt = require('jsonwebtoken');
const axios = require('axios');

async function run() {
    try {
        const payload = {
            id: '4202016f-47fd-47e7-ace4-81c2be3d4ee6', // Rajesh
            phoneNumber: '6868686868',
            role: 'User'
        };

        const token = jwt.sign(payload, "tubulu_secret_key_2026", { expiresIn: '1d' });
        console.log("Generated token:", token);

        console.log("Sending global-chat request to http://localhost:3008/api/v1/ai/global-chat...");
        const response = await axios.post(
            'http://localhost:3008/api/v1/ai/global-chat',
            {
                message: "any recommedation from my friend ?",
                history: []
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
