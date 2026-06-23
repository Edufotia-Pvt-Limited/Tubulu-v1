const axios = require('axios');
async function test() {
  try {
    // try to make a dummy call to see what happens
    // We don't have a token, so we might get 401 Unauthorized
    const res = await axios.delete('http://localhost:3008/api/v1/admin/users/test-id');
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
  }
}
test();
