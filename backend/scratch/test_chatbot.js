const { sequelize } = require('../Utils/Postgres');
const { processAiChat } = require('../Controllers/Chatbot.controller');
const redis = require('../Utils/Redis');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("DB authenticated.");

        const req = {
            body: {
                message: "Do you have fresh bread?",
                history: [],
                integrationId: "f1665785-dab5-4a4b-a543-109b62e9af4a" // Anand Bakery Indiranagar
            }
        };

        const res = {
            status: function(code) {
                console.log("Response status code:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON:", JSON.stringify(data, null, 2));
            }
        };

        const next = function(err) {
            console.error("Next called with error:", err);
        };

        console.log("Running processAiChat...");
        await processAiChat(req, res, next);

    } catch (err) {
        console.error("Test error:", err);
    } finally {
        // Clean up connections
        await sequelize.close();
        await redis.quit();
    }
}

test();
