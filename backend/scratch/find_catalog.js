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
    const [results] = await sequelize.query("SELECT * FROM \"Catalogues\";");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
