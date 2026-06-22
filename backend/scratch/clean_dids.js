const { config } = require('../config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  config.POSTGRES.database,
  config.POSTGRES.user,
  config.POSTGRES.password,
  {
    host: config.POSTGRES.host,
    dialect: 'postgres',
    logging: false
  }
);

async function run() {
  try {
    // Clear DID for default Anand Bakery (ID: 908fa830-7d67-4555-8d3b-a72b20636d44)
    await sequelize.query(`
      UPDATE "Integrations" 
      SET "pstnDID" = NULL 
      WHERE id = '908fa830-7d67-4555-8d3b-a72b20636d44';
    `);
    console.log("Cleared duplicate DID mapping from default Anand Bakery.");
    
    // Verify latest mappings
    const [results] = await sequelize.query(`
      SELECT id, "integrationName", "pstnDID" 
      FROM "Integrations" 
      WHERE "pstnDID" = '07127191144';
    `);
    console.log("Current mapping for DID 07127191144:", JSON.stringify(results, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
