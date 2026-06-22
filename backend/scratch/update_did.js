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
    const [result] = await sequelize.query(`
      UPDATE "Integrations" 
      SET "pstnDID" = '07127191144' 
      WHERE id = '908fa830-7d67-4555-8d3b-a72b20636d44';
    `);
    console.log("Successfully updated DID mapping for Anand Bakery.");
    
    // Verify the update
    const [results] = await sequelize.query(`
      SELECT id, "integrationName", "pstnDID" 
      FROM "Integrations" 
      WHERE id = '908fa830-7d67-4555-8d3b-a72b20636d44';
    `);
    console.log(JSON.stringify(results, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
