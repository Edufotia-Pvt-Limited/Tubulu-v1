const { Integration } = require('../Utils/Postgres');

async function run() {
  const list = await Integration.findAll();
  console.log('--- INTEGRATIONS IN DATABASE ---');
  list.forEach(i => {
    console.log(`ID: ${i.id}, Name: ${i.integrationName}, Phone: ${i.phoneNumber}, Category: ${i.category}`);
  });
}

run().catch(console.error);
