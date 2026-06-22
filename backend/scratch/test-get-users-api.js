const axios = require('axios');

async function run() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:3008/api/v1/integrations/admin/login', {
      username: 'superadmin',
      password: '2123'
    });
    
    const token = loginRes.data.data.authToken;
    console.log("Logged in successfully. Token length:", token.length);
    
    // 2. Fetch users
    const usersRes = await axios.get('http://localhost:3008/api/v1/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Response success:", usersRes.data.success);
    console.log("Users returned count:", usersRes.data.data.length);
    if (usersRes.data.data.length > 0) {
      console.log("First user keys:", Object.keys(usersRes.data.data[0]));
      console.log("First user sample data:", JSON.stringify(usersRes.data.data[0], null, 2));
    }
  } catch (err) {
    console.error("API request failed:", err.response ? err.response.data : err.message);
  }
}

run();
