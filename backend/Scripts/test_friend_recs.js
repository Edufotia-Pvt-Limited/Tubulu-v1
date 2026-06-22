const axios = require('axios');

async function testFriendRecs() {
  try {
    console.log('Logging in as 9844985623...');
    const loginRes = await axios.post('http://localhost:3008/api/v1/user/auth/login', { phoneNumber: '9844985623' });
    
    // Let's verify OTP
    const verifyRes = await axios.post('http://localhost:3008/api/v1/user/auth/verifyOtp', { phoneNumber: '9844985623', code: '000000' });
    
    let token = verifyRes.data?.data?.token || verifyRes.data?.token;
    if (!token) {
        console.log('Verify res:', verifyRes.data);
        return;
    }
    
    console.log('Fetching friend recommendations...');
    const recRes = await axios.get('http://localhost:3008/api/v1/user/friend-recommendations?lat=12.3237&lng=76.6022', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
      
    console.log('API Response:', JSON.stringify(recRes.data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

testFriendRecs();
