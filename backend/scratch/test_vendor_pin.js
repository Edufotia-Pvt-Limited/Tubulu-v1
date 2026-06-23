const axios = require('axios');

async function runTest() {
  const BACKEND_URL = 'http://localhost:3008/api/v1';
  const testPhone = '9900000405'; // Mysuru Organic & Groceries

  console.log('--- TEST 1: Register/Login Initiated via Integrations ---');
  try {
    const registerRes = await axios.post(`${BACKEND_URL}/integrations/verifyIntegrationPhoneNumber`, {
      phoneNumber: testPhone
    });
    console.log('Register Response:', registerRes.data);

    console.log('\n--- TEST 2: Verify PIN Login via Integrations ---');
    const verifyRes = await axios.post(`${BACKEND_URL}/integrations/verifyPin`, {
      phoneNumber: testPhone,
      pin: '2123'
    });
    console.log('Verify PIN Response success:', verifyRes.data.success);
    console.log('Auth Token returned:', !!verifyRes.data.authToken);
    console.log('User Role returned:', verifyRes.data.data.role);
  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

runTest();
