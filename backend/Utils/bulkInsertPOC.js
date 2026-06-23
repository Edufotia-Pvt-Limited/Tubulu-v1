const { bulkInsertMessages } = require("../Services/ChatMessage.Service");
const { generateUUID } = require("./Helper");

async function insertBulkMessages() {
    try {
        const messages = [];
        for (let i = 0; i < 20000; i++) {
            messages.push({
                "uuid": generateUUID(),
                "chatRoom": "6423c37dab6625f0d302436b",
                "type": "TEXT",
                "message": "H-All, testing the new message with bulk insert",
                "messageActions": [],
                "integrationId": "64234128ddda8165789eac27",
                "messageByUser": "63048bead9f31a848da01f7e",
                "quickActions": [],
            });
        }        
        await bulkInsertMessages(messages);        
    } catch (error) {
        console.log('Error occurred when trying to bulk insert the messages');
        console.log(error);
    }
}

module.exports = insertBulkMessages