const { Integration } = require('../Utils/Postgres');

async function checkLocations() {
    const list = await Integration.findAll({ attributes: ['id', 'integrationName', 'city', 'state', 'cityId', 'stateId'] });
    console.log('--- Current Vendors Location Data ---');
    list.forEach(v => {
        console.log(`Name: ${v.integrationName} | City: ${v.city} | State: ${v.state} | CityId: ${v.cityId} | StateId: ${v.stateId}`);
    });
    process.exit(0);
}
checkLocations();
