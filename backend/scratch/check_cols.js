const { sequelize } = require('../Utils/Postgres');

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully.");
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Integrations';
    `);
    console.log("Columns of Integrations table:");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

run();
