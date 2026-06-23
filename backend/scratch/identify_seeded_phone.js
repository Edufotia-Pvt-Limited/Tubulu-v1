const { config } = require('../config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    config.POSTGRES.database, config.POSTGRES.user, config.POSTGRES.password,
    { host: config.POSTGRES.host, dialect: 'postgres', logging: false }
);

async function main() {
    try {
        await sequelize.authenticate();
        const [recs] = await sequelize.query(`SELECT "integrationId", COUNT(*) as cnt FROM "Settlements" GROUP BY "integrationId";`);
        console.log("Active Settlement Groups Found in Tubulu DB:", recs);

        if (recs.length > 0) {
            const iId = recs[0].integrationId;
            const [phones] = await sequelize.query(`SELECT "phoneNumber", "integrationName" FROM "Integrations" WHERE id = '${iId}';`);
            console.log(`MATCHING PHONE FOR TEST: ${phones[0]?.phoneNumber} (${phones[0]?.integrationName})`);
        } else {
            console.log("No settlements in DB!");
        }
    } catch (e) { console.error(e.message); }
    finally { process.exit(0); }
}
main();
