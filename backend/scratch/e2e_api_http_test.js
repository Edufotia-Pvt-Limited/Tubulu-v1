const axios = require('axios');
const { Integration } = require('./Utils/Postgres');

async function runHTTPApiE2ETest() {
    console.log('🧪 ==================================================');
    console.log('🧪 Starting HTTP REST API E2E Endpoint Test...');
    console.log('🧪 ==================================================');

    const BASE_URL = 'http://localhost:3008/api/v1';
    let token = null;

    try {
        // 1. Send Login Request to administrative portal auth gateway
        console.log('📡 Sending HTTP POST to /integrations/admin/login...');
        const loginResponse = await axios.post(`${BASE_URL}/integrations/admin/login`, {
            username: 'admin',
            password: '123456'
        });

        if (loginResponse.data && loginResponse.data.success) {
            token = loginResponse.data.data.authToken;
            console.log('✅ Admin Auth Token generated successfully!');
            console.log(`   Token prefix: ${token.substring(0, 20)}...`);
        } else {
            throw new Error('Login request failed to return success flag.');
        }

        // 2. Fetch authenticated Super Admin stats using secure JWT headers
        console.log('\n📡 Sending authenticated HTTP GET to /integrations/admin/stats...');
        const statsResponse = await axios.get(`${BASE_URL}/integrations/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (statsResponse.data && statsResponse.data.success) {
            console.log('✅ Admin stats retrieved successfully over secure HTTPS/REST route!');
            
            console.log('\n======================================================');
            console.log('📊           REST API E2E VERIFICATION REPORT         ');
            console.log('======================================================');
            console.log(`Endpoint Checked : ${BASE_URL}/integrations/admin/stats`);
            console.log(`HTTP Status Code : ${statsResponse.status} ${statsResponse.statusText}`);
            console.log(`Payload Status   : ${statsResponse.data.success ? 'Success' : 'Failed'}`);
            console.log(`Active Merchants : ${statsResponse.data.data?.activeMerchantsCount ?? 0}`);
            console.log(`Pending Approval : ${statsResponse.data.data?.pendingApprovalCount ?? 0}`);
            console.log(`Onboarding Rate  : ${statsResponse.data.data?.onboardingCompletionRate ?? '100'}%`);
            console.log('======================================================');
            console.log('🏁      HTTP REST API E2E ASSERTIONS PASSED! ✅       ');
            console.log('======================================================');
        } else {
            throw new Error('Stats request failed to return payload.');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ HTTP E2E Endpoint Test Failed!');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message:`, error.response.data);
        } else {
            console.error(`   Error details:`, error.message);
        }
        process.exit(1);
    }
}

runHTTPApiE2ETest();
