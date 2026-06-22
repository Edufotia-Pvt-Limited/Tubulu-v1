const axios = require('axios');

async function run() {
  try {
    const res = await axios.get('http://localhost:3008/api/v1/integrations/discovery', {
      params: {
        lat: 12.3237008,
        lng: 76.6022778
      }
    });
    console.log(`Discovery returned ${res.data.data.length} stores.`);
    const gobiStore = res.data.data.find(s => s.id === '1ea6266f-2b37-4412-a430-9aca176c0f33');
    if (gobiStore) {
      console.log("SUCCESS! Mysuru Gobi (new) is returned:", JSON.stringify(gobiStore, null, 2));
    } else {
      console.log("WARNING! Mysuru Gobi (new) was NOT found in the results!");
      console.log("List of stores returned:");
      res.data.data.forEach(s => console.log(`- ${s.integrationName} (ID: ${s.id}, ${s.distance} km)`));
    }
    process.exit(0);
  } catch (e) {
    console.error("Discovery request failed:", e.message);
    process.exit(1);
  }
}
run();
