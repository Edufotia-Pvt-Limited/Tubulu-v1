const { config } = require('../config');
const Sequelize = require('sequelize');
const { crypto } = require('crypto');

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

async function main() {
    try {
        await sequelize.authenticate();
        console.log("DB Authenticated.");
        
        // Find dynamic merchant ID from integrations
        const [merchants] = await sequelize.query(`SELECT id, "integrationName" FROM "Integrations" WHERE "phoneNumber" LIKE '%1234567890%' LIMIT 1;`);
        if (!merchants.length) {
            console.error("Test merchant not found. Aborting seed.");
            process.exit(1);
        }
        
        const merchantId = merchants[0].id;
        const merchantName = merchants[0].integrationName;
        console.log(`Seeding Settlements for Merchant: ${merchantName} (${merchantId})`);

        // Sync table to ensure it exists
        const Settlement = require('../Models/Settlement.pg');
        await Settlement.sync();

        // Check if records exist to prevent duplication
        const count = await Settlement.count({ where: { integrationId: merchantId } });
        if (count > 0) {
            console.log(`Already found ${count} settlement records. Skipping seed.`);
            return;
        }

        const sampleRecords = [
            {
                id: require('crypto').randomUUID(),
                integrationId: merchantId,
                amount: 2450.50,
                currency: 'INR',
                status: 'Success',
                utr: 'UTR887923193829',
                settlementDate: new Date(Date.now() - (24 * 60 * 60 * 1000)) // yesterday
            },
            {
                id: require('crypto').randomUUID(),
                integrationId: merchantId,
                amount: 1200.00,
                currency: 'INR',
                status: 'Success',
                utr: 'UTR228394023849',
                settlementDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)) // 3 days ago
            },
            {
                id: require('crypto').randomUUID(),
                integrationId: merchantId,
                amount: 560.75,
                currency: 'INR',
                status: 'Pending',
                utr: null,
                settlementDate: null
            }
        ];

        await Settlement.bulkCreate(sampleRecords);
        console.log(`SUCCESSFULLY SEEDED 3 SETTLEMENT RECORDS!`);

    } catch (err) {
        console.error("Seed Error:", err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
main();
