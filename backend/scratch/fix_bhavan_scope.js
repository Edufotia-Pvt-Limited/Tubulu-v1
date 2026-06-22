const { Integration, State, City } = require('/Users/pradeep/Desktop/Tubulu-v1/backend/Utils/Postgres');

async function run() {
  try {
    const karnataka = await State.findOne({ where: { name: 'Karnataka' } });
    const mysuru = await City.findOne({ where: { name: 'Mysuru' } });
    
    if (!karnataka || !mysuru) {
      console.error("Karnataka state or Mysuru city not found in DB!");
      process.exit(1);
    }

    const bhavan = await Integration.findOne({ where: { integrationName: 'bhavan' } });
    if (bhavan) {
      await bhavan.update({
        stateId: karnataka.id,
        cityId: mysuru.id,
        city: 'Mysuru',
        state: 'Karnataka'
      });
      console.log(`bhavan scope updated successfully to state: ${karnataka.id}, city: ${mysuru.id}!`);
    } else {
      console.log("bhavan store not found.");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
