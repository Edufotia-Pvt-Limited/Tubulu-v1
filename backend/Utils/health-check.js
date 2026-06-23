const axios = require('axios');
const { User, Integration, State, City, SupportTicket, SystemSetting } = require('./Postgres');
const { config } = require('../config');

/**
 * Diagnostic health check utility for Super Admin dashboard.
 */
async function checkChatbotHealth() {
    try {
        const geminiKeySetting = await SystemSetting.findOne({ where: { key: 'GEMINI_API_KEY' } });
        const sarvamKeySetting = await SystemSetting.findOne({ where: { key: 'SARVAM_API_KEY' } });
        
        const hasGemini = !!(geminiKeySetting && geminiKeySetting.value);
        const hasSarvam = !!(sarvamKeySetting && sarvamKeySetting.value);

        if (!hasGemini && !hasSarvam) {
            return {
                status: 'warning',
                message: 'No global API keys configured. Set Gemini or Sarvam API Key in Settings.'
            };
        }

        const textProviderSetting = await SystemSetting.findOne({ where: { key: 'DEFAULT_TEXT_PROVIDER' } });
        const activeProvider = textProviderSetting ? textProviderSetting.value : 'gemini';

        return {
            status: 'healthy',
            message: `Chatbot configurations are set. Active text provider: ${activeProvider}.`
        };
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Failed to query Chatbot configuration: ${e.message}`
        };
    }
}

async function checkVoiceGatewayHealth() {
    const port = process.env.PORT || 8080;
    const url = `http://localhost:${port}/health`;
    try {
        const response = await axios.get(url, { timeout: 1000 });
        if (response.status === 200 && response.data?.status === 'ok') {
            return {
                status: 'healthy',
                message: `Voice-AI gateway is running and active on port ${port}.`
            };
        }
        return {
            status: 'warning',
            message: `Voice-AI gateway returned an unexpected response on port ${port}.`
        };
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Voice-AI gateway is offline. Server at port ${port} is unreachable.`
        };
    }
}

async function checkSmsGatewayHealth() {
    try {
        const apiKeySetting = await SystemSetting.findOne({ where: { key: 'SMS_API_KEY' } });
        const keyVal = apiKeySetting?.value || config.smsApiKey;
        const apiUrl = config.smsApiUrl || 'https://transapi.pinnacle.in/genericapi/QSGenericReceiver';

        if (!keyVal) {
            return {
                status: 'warning',
                message: 'Pinnacle SMS Access Key not configured.'
            };
        }

        // Test reachability of SMS Gateway
        try {
            await axios.get(apiUrl, { timeout: 1200 });
            return {
                status: 'healthy',
                message: 'Pinnacle SMS Gateway is reachable.'
            };
        } catch (netErr) {
            // A 403 or similar status code means it is reachable but rejected. A socket timeout or 503 means offline/unreachable.
            if (netErr.response) {
                return {
                    status: 'healthy',
                    message: `Pinnacle SMS Gateway is reachable (Status: ${netErr.response.status}). Remember to whitelist VM IP.`
                };
            }
            return {
                status: 'unhealthy',
                message: `Pinnacle SMS Gateway is unreachable: ${netErr.message}`
            };
        }
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Failed to verify SMS configuration: ${e.message}`
        };
    }
}

async function checkScopingHealth() {
    try {
        const [stateCount, cityCount] = await Promise.all([
            State.count(),
            City.count()
        ]);
        return {
            status: 'healthy',
            message: `Database scoping active. Total states: ${stateCount}, Total cities: ${cityCount}.`
        };
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Database scoping query failed: ${e.message}`
        };
    }
}

async function checkSupportDeskHealth() {
    try {
        const ticketCount = await SupportTicket.count();
        return {
            status: 'healthy',
            message: `Ticketing module database is online. Registered support tickets: ${ticketCount}.`
        };
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Failed to query support tickets database: ${e.message}`
        };
    }
}

async function checkMerchantCustomizationHealth() {
    try {
        const merchantCount = await Integration.count({
            where: {
                isActive: true
            }
        });
        const hasGcpConfig = !!(config.gcpProjectId && config.gcpBucket && config.gcpBucket !== 'gcp_bucket_placeholder');
        
        if (!hasGcpConfig) {
            return {
                status: 'warning',
                message: `Total merchants: ${merchantCount}. GCP Cloud Storage bucket not configured.`
            };
        }

        return {
            status: 'healthy',
            message: `Merchant catalogs active. Total active merchants: ${merchantCount}. GCP Storage configured.`
        };
    } catch (e) {
        return {
            status: 'unhealthy',
            message: `Failed to query merchant customizations: ${e.message}`
        };
    }
}

async function checkAllModulesHealth() {
    const results = await Promise.allSettled([
        checkChatbotHealth(),
        checkVoiceGatewayHealth(),
        checkSmsGatewayHealth(),
        checkScopingHealth(),
        checkSupportDeskHealth(),
        checkMerchantCustomizationHealth()
    ]);

    return {
        chatbot: results[0].status === 'fulfilled' ? results[0].value : { status: 'unhealthy', message: 'Unknown error in Chatbot diagnostic' },
        voice_gateway: results[1].status === 'fulfilled' ? results[1].value : { status: 'unhealthy', message: 'Unknown error in Voice diagnostic' },
        sms_campaigns: results[2].status === 'fulfilled' ? results[2].value : { status: 'unhealthy', message: 'Unknown error in SMS diagnostic' },
        scoping: results[3].status === 'fulfilled' ? results[3].value : { status: 'unhealthy', message: 'Unknown error in Scoping diagnostic' },
        support_tickets: results[4].status === 'fulfilled' ? results[4].value : { status: 'unhealthy', message: 'Unknown error in Ticketing diagnostic' },
        merchant_profile: results[5].status === 'fulfilled' ? results[5].value : { status: 'unhealthy', message: 'Unknown error in Merchant diagnostic' }
    };
}

module.exports = {
    checkAllModulesHealth
};
