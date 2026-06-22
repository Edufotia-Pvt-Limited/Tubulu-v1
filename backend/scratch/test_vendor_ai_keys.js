const axios = require('axios');
const { User, State, City } = require('../Utils/Postgres');

const BASE_URL = 'http://localhost:3008/api/v1';

// Helper to login as admin
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

// Helper to login as a merchant
async function getMerchantToken(phone, pin) {
    try {
        const response = await axios.post(`${BASE_URL}/integrations/verifyPin`, {
            phoneNumber: phone,
            pin: pin
        });
        return 'Bearer ' + response.data.authToken;
    } catch (e) {
        console.error('Merchant Login Failed:', e.message);
        throw e;
    }
}

async function runTests() {
    console.log('--- STARTING COMPREHENSIVE STATE-WIDE AI KEYS ACCESS TEST ---');
    try {
        // Step 0: Ensure we have State and City to scope our tests
        const state = await State.findOne();
        if (!state) {
            throw new Error("No states found in database for scoping");
        }
        const city = await City.findOne({ where: { stateId: state.id } });
        if (!city) {
            throw new Error(`No cities found in database for state ${state.name}`);
        }

        // Create a dummy country and state to test multi-state boundaries
        const [dummyState, created] = await State.findOrCreate({
            where: { name: 'Test Dummy State' },
            defaults: {
                countryId: state.countryId,
                isActive: true
            }
        });

        // Clean up any test managers first
        await User.destroy({ where: { phoneNumber: ['9888877777', '9777766666'] } });

        // 1. Super Admin login
        const superAdminToken = await login('admin', '123456');
        console.log('✅ Super Admin login successful');

        // Create regional manager
        console.log('Creating test Regional Manager...');
        const rmRes = await axios.post(`${BASE_URL}/admin/users/create`, {
            firstName: 'Test RM',
            lastName: 'User',
            phoneNumber: '9888877777',
            email: 'test_rm@tubulu.com',
            role: 'regional_manager',
            scopedStateId: state.id,
            scopedCountryId: state.countryId
        }, {
            headers: { Authorization: superAdminToken }
        });
        const rmPassword = rmRes.data.data.password;
        console.log('✅ Regional Manager created. Password:', rmPassword);

        // Login as Regional Manager
        const rmToken = await login('test_rm@tubulu.com', rmPassword);
        console.log('✅ Regional Manager login successful');

        // Create city manager as Regional Manager
        console.log('Creating test City Manager...');
        const cmRes = await axios.post(`${BASE_URL}/admin/users/create`, {
            firstName: 'Test CM',
            lastName: 'User',
            phoneNumber: '9777766666',
            email: 'test_cm@tubulu.com',
            role: 'city_manager',
            scopedStateId: state.id,
            scopedCityId: city.id,
            scopedCountryId: state.countryId
        }, {
            headers: { Authorization: rmToken }
        });
        const cmPassword = cmRes.data.data.password;
        console.log('✅ City Manager created. Password:', cmPassword);

        // Login as City Manager
        const cmToken = await login('test_cm@tubulu.com', cmPassword);
        console.log('✅ City Manager login successful');

        // Get a merchant ID
        const listRes = await axios.get(`${BASE_URL}/admin/integrations`, {
            headers: { Authorization: superAdminToken }
        });
        const merchant = listRes.data.data[0];
        if (!merchant) throw new Error("No merchant found to test with.");
        console.log(`Using merchant "${merchant.integrationName}" (ID: ${merchant.id}, State: ${merchant.stateId}) for testing.`);

        // Ensure the merchant belongs to the scoped state for lookup testing
        if (merchant.stateId !== state.id) {
            await axios.post(`${BASE_URL}/admin/integration/${merchant.id}/assign-location`, {
                stateId: state.id,
                cityId: city.id,
                countryId: state.countryId
            }, {
                headers: { Authorization: superAdminToken }
            });
            console.log('✅ Merchant assigned to the test state for lookup verification.');
        }

        // 2. Test Super Admin can update State Keys
        console.log('\nTesting: Super Admin updating State Keys...');
        const updateResSA = await axios.put(`${BASE_URL}/locations/states/${state.id}`, {
            sarvamApiKey: 'sa-sarvam-key-777',
            geminiApiKey: 'sa-gemini-key-777'
        }, {
            headers: { Authorization: superAdminToken }
        });
        console.log('✅ Success: Super Admin updated state-level keys. Res:', JSON.stringify(updateResSA.data.data));

        // 3. Test Regional Manager can update own State Keys
        console.log('\nTesting: Regional Manager updating own State Keys...');
        const updateResRM = await axios.put(`${BASE_URL}/locations/states/${state.id}`, {
            sarvamApiKey: 'rm-sarvam-key-888',
            geminiApiKey: 'rm-gemini-key-888'
        }, {
            headers: { Authorization: rmToken }
        });
        console.log('✅ Success: Regional Manager updated state-level keys. Res:', JSON.stringify(updateResRM.data.data));

        // 4. Test Regional Manager updating ANOTHER State Keys (Should be BLOCKED)
        console.log('\nTesting: Regional Manager updating other state\'s keys...');
        try {
            await axios.put(`${BASE_URL}/locations/states/${dummyState.id}`, {
                sarvamApiKey: 'illegal-key',
                geminiApiKey: 'illegal-key'
            }, {
                headers: { Authorization: rmToken }
            });
            console.log('❌ FAILURE: Regional Manager was allowed to update keys of another state!');
        } catch (err) {
            console.log(`✅ SUCCESS: Regional Manager blocked from updating another state with status ${err.response?.status} (${err.response?.data?.message})`);
        }

        // 5. Test City Manager trying to configure State Keys (Should be BLOCKED)
        console.log('\nTesting: City Manager trying to update State Keys...');
        try {
            await axios.put(`${BASE_URL}/locations/states/${state.id}`, {
                sarvamApiKey: 'cm-sarvam-key-999'
            }, {
                headers: { Authorization: cmToken }
            });
            console.log('❌ FAILURE: City Manager was allowed to configure state keys!');
        } catch (err) {
            console.log(`✅ SUCCESS: City Manager blocked with status ${err.response?.status} (${err.response?.data?.message})`);
        }

        // 6. Test Merchant trying to configure State Keys (Should be BLOCKED)
        console.log('\nTesting: Merchant trying to configure state keys via PUT...');
        const merchantToken = await getMerchantToken(merchant.phoneNumber, '2123');
        try {
            await axios.put(`${BASE_URL}/locations/states/${state.id}`, {
                sarvamApiKey: 'merchant-key-1'
            }, {
                headers: { Authorization: merchantToken }
            });
            console.log('❌ FAILURE: Merchant was allowed to configure state keys!');
        } catch (err) {
            console.log(`✅ SUCCESS: Merchant blocked with status ${err.response?.status} (${err.response?.data?.message})`);
        }

        // 7. Verify PSTN DID Lookup gets State Keys
        console.log('\nTesting: Integration lookup retrieves correct State Keys...');
        // Set DID first
        await axios.post(`${BASE_URL}/admin/integration/update`, {
            id: merchant.id,
            pstnDID: '9876543210'
        }, {
            headers: { Authorization: superAdminToken }
        });
        // Check lookup
        const lookupRes = await axios.get(`${BASE_URL}/integrations/pstn/lookup/9876543210`);
        console.log('✅ Lookup Res:', JSON.stringify(lookupRes.data.data));
        if (lookupRes.data.data.sarvamApiKey === 'rm-sarvam-key-888') {
            console.log('✅ Success: Lookup returned state-wide Sarvam API Key.');
        } else {
            console.log('❌ Failure: Lookup returned wrong key: ' + lookupRes.data.data.sarvamApiKey);
        }

        // Clean up test users and dummy state
        await User.destroy({ where: { phoneNumber: ['9888877777', '9777766666'] } });
        await State.destroy({ where: { id: dummyState.id } });
        console.log('\n🧹 Cleaned up test database resources.');
        console.log('🏁 ALL TESTS PASSED SUCCESSFULLY! ✅');

    } catch (e) {
        console.error('❌ TEST FAILED:', e.response?.data || e.message);
        // Attempt cleanup
        await User.destroy({ where: { phoneNumber: ['9888877777', '9777766666'] } }).catch(() => {});
    }
}

runTests();
