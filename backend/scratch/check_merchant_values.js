const { sequelize } = require('../Utils/Postgres');

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully.");
    const [results] = await sequelize.query(`
      SELECT id, "integrationName", "deliveryFee", "minimumOrderValue", "estimatedDeliveryTime"
      FROM "Integrations"
      WHERE "integrationName" LIKE '%Mysore Royal%';
    `);
    console.log("Mysore Royal Kitchen Integration Details:");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

run();
