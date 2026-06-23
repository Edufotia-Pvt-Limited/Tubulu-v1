const axios = require('axios');

const BASE_URL = 'http://localhost:3008/api/v1';

async function login(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/integrations/admin/login`, {
            username,
            password
        });
        return 'Bearer ' + response.data.data.authToken;
    } catch (e) {
        console.error(`Login Failed for ${username}:`, e.message);
        throw e;
    }
}

async function run() {
    console.log('--- STARTING STATE PROVIDERS TEST ---');
    try {
        const token = await login('admin', '123456');
        console.log('✅ Logged in as super admin');

        // Fetch states
        const statesRes = await axios.get(`${BASE_URL}/locations/states`, {
            headers: { Authorization: token }
        });
        const states = statesRes.data.data;
        if (!states || states.length === 0) {
            throw new Error('No states found');
        }
        
        const testState = states[0];
        console.log(`Found state: ${testState.name} (id: ${testState.id})`);
        console.log(`Current voiceProvider: ${testState.voiceProvider}, chatProvider: ${testState.chatProvider}`);

        // Update state providers
        console.log('Updating providers to voice="gemini" and chat="sarvam"...');
        const updateRes = await axios.put(`${BASE_URL}/locations/states/${testState.id}`, {
            voiceProvider: 'gemini',
            chatProvider: 'sarvam'
        }, {
            headers: { Authorization: token }
        });

        const updated = updateRes.data.data;
        console.log(`Updated state voiceProvider: ${updated.voiceProvider}, chatProvider: ${updated.chatProvider}`);
        
        if (updated.voiceProvider === 'gemini' && updated.chatProvider === 'sarvam') {
            console.log('✅ Success: State providers updated in DB.');
        } else {
            throw new Error('Verification failed: providers do not match expected values.');
        }

        // Restore original defaults
        console.log('Restoring defaults...');
        await axios.put(`${BASE_URL}/locations/states/${testState.id}`, {
            voiceProvider: 'sarvam',
            chatProvider: 'gemini'
        }, {
            headers: { Authorization: token }
        });
        console.log('✅ Restored defaults.');

        console.log('🏁 ALL TESTS PASSED SUCCESSFULLY! ✅');
    } catch (err) {
        console.error('❌ TEST FAILED:', err.response?.data || err.message);
    }
}

run();
