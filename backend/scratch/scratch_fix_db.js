const { sequelize } = require("./Utils/Postgres");

async function run() {
  console.log("Connecting and altering Users table...");
  await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "pinResetCount" INTEGER DEFAULT 0;`);
  await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "pinResetDate" TIMESTAMP WITH TIME ZONE;`);
  console.log("Columns added successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
