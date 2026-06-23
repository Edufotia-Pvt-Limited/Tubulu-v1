const { config } = require('../config');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function main() {
    try {
        const token = jwt.sign({ id: '6c858926-3ba4-4c6c-9cce-e134b4a77a20', role: 'super_admin' }, config.integrationDashboardAuthKey);
        const response = await axios.get('http://localhost:3008/api/v1/ai-playbooks', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("AI Playbooks API Result for Super Admin Token:", JSON.stringify(response.data, null, 2));
    } catch (e) { console.error("FAIL:", e.message); }
    finally { process.exit(0); }
}
main();
