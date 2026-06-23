const { config } = require('../config');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const sequelize = new Sequelize(config.POSTGRES.database, config.POSTGRES.user, config.POSTGRES.password, { host: config.POSTGRES.host, dialect: 'postgres', logging: false });

async function main() {
    try {
        await sequelize.authenticate();
        const [admins] = await sequelize.query(`SELECT id FROM "Integrations" WHERE "phoneNumber" = '9999999999' LIMIT 1;`);
        const adminId = admins[0].id;
        
        console.log(`1. Verifying Admin ID: ${adminId}`);
        const [countCheck] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "Settlements" WHERE "integrationId" = '${adminId}';`);
        console.log("2. SQL Result for count:", countCheck[0].cnt);

        const token = jwt.sign({ id: adminId, role: 'super_admin' }, config.integrationDashboardAuthKey);
        console.log("3. Dynamic Token signed. Querying backend API /api/v1/settlements/merchant...");
        
        const response = await axios.get('http://localhost:3008/api/v1/settlements/merchant', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("4. API RESPONSE:", response.data);

    } catch (e) { console.error("ERR:", e.message); }
    finally { process.exit(0); }
}
main();
