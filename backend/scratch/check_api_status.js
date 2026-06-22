const axios = require('axios');

async function checkApi(name, baseUrl) {
  console.log(`\n--- Checking ${name} API at ${baseUrl} ---`);
  try {
    // Check base discovery endpoint
    console.log(`Sending GET to ${baseUrl}/integrations/discovery ...`);
    const response = await axios.get(`${baseUrl}/integrations/discovery?lat=12.3237&lng=76.6022`, {
      timeout: 5000
    });
    console.log(`✅ Status Code: ${response.status}`);
    console.log(`✅ Integrations count: ${response.data?.data?.length || 0}`);
    
    // Check advertisement discovery
    console.log(`Sending GET to ${baseUrl}/advertisement/discovery ...`);
    const adRes = await axios.get(`${baseUrl}/advertisement/discovery?lat=12.3237&lng=76.6022`, {
      timeout: 5000
    });
    console.log(`✅ Ads count: ${adRes.data?.data?.length || 0}`);

  } catch (error) {
    console.error(`❌ ${name} API check failed:`, error.message);
    if (error.response) {
      console.error(`   Response Status: ${error.response.status}`);
      console.error(`   Response Data:`, error.response.data);
    }
  }
}

async function runChecks() {
  await checkApi('Local Backend', 'http://localhost:3008/api/v1');
  await checkApi('Staging Backend', 'http://34.135.72.28:3008/api/v1');
}

runChecks();
