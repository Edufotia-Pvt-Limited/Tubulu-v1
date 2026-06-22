const twilio = require('twilio');
const AIService = require('../Services/AI.Service');
const { logger } = require('../Utils/Logger');

/**
 * WhatsApp Controller handles the Twilio Webhook interaction.
 */
class WhatsAppController {
    /**
     * Webhook for incoming WhatsApp messages
     */
    async handleIncoming(req, res) {
        const { Body, From } = req.body;
        
        logger.info(`Received WhatsApp message from ${From}: ${Body}`);

        try {
            // 1. Get response from AI Agent
            const aiResponse = await AIService.processMessage(Body, From);

            // 2. Respond via Twilio XML (TwiML)
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(aiResponse);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        } catch (error) {
            logger.error("WhatsApp Controller Error:", error);
            
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message("Sorry, Tubulu AI is taking a quick break. Please try again later!");
            
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        }
    }

    /**
     * Manual Trigger for testing without Twilio (Simulation)
     */
    async simulateChat(req, res) {
        const { message, phone } = req.body;
        
        try {
            const aiResponse = await AIService.processMessage(message, phone || "simulated-user");
            res.json({ success: true, response: aiResponse });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new WhatsAppController();
