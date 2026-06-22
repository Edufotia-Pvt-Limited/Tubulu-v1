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

async function main() {
    try {
        await sequelize.authenticate();
        
        const [integrations] = await sequelize.query(`SELECT id, "integrationName" FROM "Integrations" WHERE "phoneNumber" LIKE '%1234567890%' AND "isApproved" = true LIMIT 1;`);
        
        if (!integrations.length) {
            console.log("No approved integration found for phone 1234567890.");
            process.exit(0);
        }
        
        const integrationId = integrations[0].id;
        console.log(`Found integration: ${integrations[0].integrationName} (ID: ${integrationId})`);
        
        const [catalogues] = await sequelize.query(`SELECT * FROM "Catalogues" WHERE "integrationId" = '${integrationId}' AND "isDeleted" = false;`);
        
        console.log(`Current catalog count: ${catalogues.length}`);
        
        if (catalogues.length === 0) {
            console.log("Seeding sample catalog...");
            const catId = '550e8400-e29b-41d4-a716-446655440000';
            await sequelize.query(`
                INSERT INTO "Catalogues" (id, name, description, "integrationId", "displayType", "isActive", "isDeleted", "createdAt", "updatedAt")
                VALUES ('${catId}', 'Premium Bakery Treats', 'Fresh daily pastries, bread, and personalized cakes.', '${integrationId}', 'Grid View', true, false, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            `);
            console.log("SAMPLE CATALOG SEEDED SUCCESSFULLY!");
        } else {
            console.log("Catalogues already exist!");
        }
        
    } catch (error) {
        console.error("Database Error:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

main();
