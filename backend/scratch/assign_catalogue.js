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
    // Update both catalogues of default Anand Bakery to belong to Anand Bakery Indiranagar (f1665785-dab5-4a4b-a543-109b62e9af4a)
    await sequelize.query(`
      UPDATE "Catalogues" 
      SET "integrationId" = 'f1665785-dab5-4a4b-a543-109b62e9af4a' 
      WHERE "integrationId" = '908fa830-7d67-4555-8d3b-a72b20636d44';
    `);
    console.log("Assigned catalogues to Anand Bakery Indiranagar.");
    
    // Verify mapping
    const [results] = await sequelize.query(`
      SELECT id, "integrationId", name 
      FROM "Catalogues" 
      WHERE "integrationId" = 'f1665785-dab5-4a4b-a543-109b62e9af4a';
    `);
    console.log("Catalogues for Anand Bakery Indiranagar:", JSON.stringify(results, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
