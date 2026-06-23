require('dotenv').config();
const { connectPostgres, City } = require('../Utils/Postgres');

async function run() {
  try {
    await connectPostgres();
    console.log('--- UPDATING CITY COORDINATES IN DATABASE ---');
    
    const [mysuruUpdated] = await City.update(
      { latitude: 12.3020, longitude: 76.6390, radius: 20.0 },
      { where: { name: 'Mysuru' } }
    );
    console.log(`Mysuru coordinates update status: ${mysuruUpdated > 0 ? 'SUCCESS' : 'NO CHANGE/NOT FOUND'}`);

    const [bengaluruUpdated] = await City.update(
      { latitude: 12.9716, longitude: 77.5946, radius: 30.0 },
      { where: { name: 'Bengaluru' } }
    );
    console.log(`Bengaluru coordinates update status: ${bengaluruUpdated > 0 ? 'SUCCESS' : 'NO CHANGE/NOT FOUND'}`);

    const [nagpurUpdated] = await City.update(
      { latitude: 21.1458, longitude: 79.0882, radius: 30.0 },
      { where: { name: 'Nagpur' } }
    );
    console.log(`Nagpur coordinates update status: ${nagpurUpdated > 0 ? 'SUCCESS' : 'NO CHANGE/NOT FOUND'}`);

    console.log('City coordinates seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed city coordinates:', error);
    process.exit(1);
  }
}

run();
