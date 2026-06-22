const { config } = require('../config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    config.POSTGRES.database, config.POSTGRES.user, config.POSTGRES.password,
    { host: config.POSTGRES.host, dialect: 'postgres', logging: false }
);

async function main() {
    try {
        await sequelize.authenticate();
        
        // 1. Find Super Admin integration
        const [admins] = await sequelize.query(`SELECT id FROM "Integrations" WHERE "phoneNumber" = '9999999999' LIMIT 1;`);
        if (!admins.length) throw new Error("Super Admin not created yet in DB. Run UI Login once to create it.");
        const adminId = admins[0].id;
        console.log("🎯 Super Admin Integration Found:", adminId);

        // 2. Re-assign ALL seeded settlements to the Super Admin integration so they always show up in our automated test account!
        await sequelize.query(`UPDATE "Settlements" SET "integrationId" = '${adminId}';`);
        console.log("✅ SUCCESSFULLY MOVED SETTLEMENT RECORDS TO SUPER ADMIN ID!");
        
    } catch (e) { console.error("REASSIGN FAIL:", e.message); }
    finally { process.exit(0); }
}
main();
