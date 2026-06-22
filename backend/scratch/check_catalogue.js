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
    const [cats] = await sequelize.query(`SELECT * FROM \"Catalogues\" WHERE \"integrationId\" = '${integrationId}';`);
    console.log('Catalogues:', JSON.stringify(cats, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
