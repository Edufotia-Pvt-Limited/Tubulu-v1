const { Sequelize } = require('sequelize');
const { config } = require('../config');

const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.user,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        port: config.POSTGRES.port,
        dialect: 'postgres',
        logging: false
    }
);

async function check() {
    try {
        await sequelize.authenticate();
        
        // Find integration details
        const [intg] = await sequelize.query(`
            SELECT id, "integrationName", "stateId" 
            FROM "Integrations" 
            WHERE id = 'f1665785-dab5-4a4b-a543-109b62e9af4a';
        `);
        console.log('Integration info:', intg[0]);

        if (intg[0]) {
            const [state] = await sequelize.query(`
                SELECT id, name, "geminiApiKey", "chatProvider" 
                FROM "States" 
                WHERE id = '${intg[0].stateId}';
            `);
            console.log('State info for Integration:', state[0]);
        }

        // Print state that user updated (fb954aae-56d1-4459-8779-401dc00873ec)
        const [updatedState] = await sequelize.query(`
            SELECT id, name, "geminiApiKey", "chatProvider" 
            FROM "States" 
            WHERE id = 'fb954aae-56d1-4459-8779-401dc00873ec';
        `);
        console.log('Updated State info:', updatedState[0]);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

check();
