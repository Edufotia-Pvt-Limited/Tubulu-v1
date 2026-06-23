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

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find users with 9898989898 or 6868686868
        const [users] = await sequelize.query(`
            SELECT id, "phoneNumber", "firstName", "lastName", "role" 
            FROM "Users" 
            WHERE "phoneNumber" LIKE '%9898989898%' OR "phoneNumber" LIKE '%6868686868%'
        `);
        console.log('Users found:', users);

        // Find all UserContacts
        const [contacts] = await sequelize.query(`
            SELECT id, "userId", "contactName", "contactPhoneNumber" 
            FROM "UserContacts" 
            WHERE "contactPhoneNumber" LIKE '%9898989898%' OR "contactPhoneNumber" LIKE '%6868686868%'
        `);
        console.log('Contacts found:', contacts);

        // Check chat messages or chat rooms for these users
        if (users.length > 0) {
            for (const user of users) {
                const [chatRooms] = await sequelize.query(`
                    SELECT id, "participants", "isAiActive" 
                    FROM "ChatRooms" 
                    WHERE :userId = ANY("participants") OR "participants"::text LIKE :userIdLike
                `, {
                    replacements: { userId: user.id, userIdLike: `%${user.id}%` }
                });
                console.log(`Chat rooms for user ${user.phoneNumber} (${user.id}):`, chatRooms);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
    }
}

run();
