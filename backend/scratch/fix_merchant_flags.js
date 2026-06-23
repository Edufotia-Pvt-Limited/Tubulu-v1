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

const integrationId = '908fa830-7d67-4555-8d3b-a72b20636d44';

async function run() {
  try {
    console.log('Updating compliance flags for Integration ID:', integrationId);

    const [results] = await sequelize.query(`
      UPDATE "Integrations"
      SET 
        "isApproved" = true,
        "isOnboarded" = true,
        "isDocumentsUploaded" = true,
        "isTubuluAppSetupDone" = true
      WHERE "id" = '${integrationId}'
      RETURNING id, "isApproved", "isOnboarded", "isDocumentsUploaded", "isTubuluAppSetupDone";
    `);

    console.log('Updated Flags:', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
