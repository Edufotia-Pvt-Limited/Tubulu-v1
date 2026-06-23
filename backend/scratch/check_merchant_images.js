require('dotenv').config({ path: __dirname + '/../.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tubulu_db', 'tubulu_admin', 'tubulu_pass', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false,
});

async function main() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(`
      SELECT 
        "integrationName", 
        SUBSTRING("logo", 1, 80) AS logo_preview,
        SUBSTRING("bannerImage", 1, 120) AS banner_preview,
        "city"
      FROM "Integrations"
      WHERE "isActive" = true AND "isApproved" = true
      LIMIT 10;
    `);
    console.log('Merchant Image Data:');
    rows.forEach(r => {
      console.log(`\n🏪 ${r.integrationName} (${r.city})`);
      console.log(`   logo:   ${r.logo_preview || '(empty)'}`);
      console.log(`   banner: ${r.banner_preview || '(empty)'}`);
    });
  } catch (e) {
    console.error(e.message);
  } finally {
    await sequelize.close();
  }
}

main();
