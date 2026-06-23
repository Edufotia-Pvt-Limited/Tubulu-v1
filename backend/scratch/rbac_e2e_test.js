const axios = require('axios');
const { State, City, User } = require('../Utils/Postgres');

async function runE2ETests() {
    console.log('🧪 ==================================================');
    console.log('🧪 Starting 4-Tier RBAC E2E Test Suite...');
    console.log('🧪 ==================================================');

    const BASE_URL = 'http://localhost:3008/api/v1';

    try {
        // Step 0: Ensure we have State and City to scope our tests
        const state = await State.findOne();
        if (!state) {
            throw new Error("No states found in database for scoping");
        }
        console.log(`📍 Found State for scoping: ${state.name} (${state.id})`);

        const city = await City.findOne({ where: { stateId: state.id } });
        if (!city) {
            throw new Error(`No cities found in database for state ${state.name}`);
        }
        console.log(`📍 Found City for scoping: ${city.name} (${city.id})`);

        // Clean up previous test users if any
        await User.destroy({
            where: {
                phoneNumber: ['9111111111', '9222222222']
            }
        });
        console.log('🧹 Cleaned up old test users.');

        // Step 1: Login as Super Admin
        console.log('\n📡 Logging in as Super Admin...');
        const superAdminLoginRes = await axios.post(`${BASE_URL}/integrations/admin/login`, {
            username: 'admin',
            password: '123456'
        });
        const superAdminToken = superAdminLoginRes.data.data.authToken;
        console.log('✅ Super Admin login success!');

        // Step 2: Fetch Super Admin stats
        console.log('\n📡 Fetching Super Admin stats...');
        const superAdminStatsRes = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });
        console.log('✅ Super Admin stats returned successfully!');
        console.log('📊 Stats payload keys:', Object.keys(superAdminStatsRes.data.data));

        // Step 3: Create Regional Manager as Super Admin
        console.log('\n📡 Creating Regional Manager as Super Admin...');
        const regManagerRes = await axios.post(`${BASE_URL}/admin/users/create`, {
            firstName: 'E2E Regional',
            lastName: 'Manager',
            phoneNumber: '9111111111',
            email: 'e2e_regional@tubulu.com',
            role: 'regional_manager',
            scopedStateId: state.id,
            scopedCountryId: state.countryId
        }, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });
        console.log('✅ Regional Manager created successfully!');
        const regionalPassword = regManagerRes.data.data.password;
        console.log(`🔑 Generated Regional Manager Password: ${regionalPassword}`);

        // Step 4: Login as new Regional Manager
        console.log('\n📡 Logging in as Regional Manager...');
        const regLoginRes = await axios.post(`${BASE_URL}/integrations/admin/login`, {
            username: 'e2e_regional@tubulu.com',
            password: regionalPassword
        });
        const regToken = regLoginRes.data.data.authToken;
        console.log('✅ Regional Manager login success!');

        // Step 5: Fetch Regional Manager stats
        console.log('\n📡 Fetching Regional Manager stats...');
        const regStatsRes = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${regToken}` }
        });
        console.log('✅ Regional Manager stats returned successfully!');
        console.log('📊 Stats payload keys:', Object.keys(regStatsRes.data.data));

        // Step 6: Create City Manager as Regional Manager
        console.log('\n📡 Creating City Manager as Regional Manager...');
        const cityManagerRes = await axios.post(`${BASE_URL}/admin/users/create`, {
            firstName: 'E2E City',
            lastName: 'Manager',
            phoneNumber: '9222222222',
            email: 'e2e_city@tubulu.com',
            role: 'city_manager',
            scopedStateId: state.id,
            scopedCityId: city.id,
            scopedCountryId: state.countryId
        }, {
            headers: { Authorization: `Bearer ${regToken}` }
        });
        console.log('✅ City Manager created successfully!');
        const cityPassword = cityManagerRes.data.data.password;
        console.log(`🔑 Generated City Manager Password: ${cityPassword}`);

        // Step 7: Regional Manager trying to create Super Admin (should fail)
        console.log('\n📡 Testing Hierarchy Violation: Regional Manager trying to create Super Admin...');
        try {
            await axios.post(`${BASE_URL}/admin/users/create`, {
                firstName: 'Fake Super',
                lastName: 'Admin',
                phoneNumber: '9333333333',
                email: 'fake_super@tubulu.com',
                role: 'super_admin'
            }, {
                headers: { Authorization: `Bearer ${regToken}` }
            });
            throw new Error('FAIL: Allowed Regional Manager to create a Super Admin!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ Correctly blocked Regional Manager from creating a Super Admin (403)!');
            } else {
                throw err;
            }
        }

        // Step 8: Login as new City Manager
        console.log('\n📡 Logging in as City Manager...');
        const cityLoginRes = await axios.post(`${BASE_URL}/integrations/admin/login`, {
            username: 'e2e_city@tubulu.com',
            password: cityPassword
        });
        const cityToken = cityLoginRes.data.data.authToken;
        console.log('✅ City Manager login success!');

        // Step 9: Fetch City Manager stats
        console.log('\n📡 Fetching City Manager stats...');
        const cityStatsRes = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${cityToken}` }
        });
        console.log('✅ City Manager stats returned successfully!');
        console.log('📊 Stats payload keys:', Object.keys(cityStatsRes.data.data));

        // Step 10: City Manager trying to create user (should fail)
        console.log('\n📡 Testing Hierarchy Violation: City Manager trying to create user...');
        try {
            await axios.post(`${BASE_URL}/admin/users/create`, {
                firstName: 'Underling',
                lastName: 'User',
                phoneNumber: '9444444444',
                email: 'underling@tubulu.com',
                role: 'city_manager'
            }, {
                headers: { Authorization: `Bearer ${cityToken}` }
            });
            throw new Error('FAIL: Allowed City Manager to create another user!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ Correctly blocked City Manager from creating a user (403)!');
            } else {
                throw err;
            }
        }

        console.log('\n🧪 ==================================================');
        console.log('🏁      ALL 4-TIER RBAC E2E TESTS PASSED! ✅         ');
        console.log('🧪 ==================================================');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ E2E RBAC Test Suite Failed!');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message:`, error.response.data);
        } else {
            console.error(`   Error details:`, error.message);
        }
        process.exit(1);
    }
}

runE2ETests();
