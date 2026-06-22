const { sequelize } = require('../Utils/Postgres');

async function run() {
  try {
    const results = await sequelize.query('SELECT id, "phoneNumber", "pinCode", role FROM "Users" LIMIT 50;');
    console.log('--- USERS IN DB ---');
    console.log(JSON.stringify(results[0], null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error querying DB:', error);
    process.exit(1);
  }
}

run();
