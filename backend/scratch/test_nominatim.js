const axios = require('axios');

async function testNominatim(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  try {
    const res = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Tubulu-App/1.0.0 (contact: info@tubulu.com)'
      }
    });
    console.log(`Nominatim response for "${address}":`, res.data);
  } catch (e) {
    console.error(`Nominatim error for "${address}":`, e.message);
  }
}

async function run() {
  await testNominatim("Vijayanagar, Mysuru, Karnataka");
  await testNominatim("Mysuru, Karnataka");
}
run();
