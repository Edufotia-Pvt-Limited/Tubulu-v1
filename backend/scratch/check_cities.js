const { City } = require('../Utils/Postgres');

async function listCities() {
    const list = await City.findAll();
    list.forEach(c => {
        console.log(`City: ${c.name} | Id: ${c.id} | StateId: ${c.stateId}`);
    });
    process.exit(0);
}
listCities();
