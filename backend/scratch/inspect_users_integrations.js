const { connectPostgres, User, Integration, sequelize } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function run() {
    try {
        await connectPostgres();
        console.log('Connected to DB.');

        // Fetch users
        const users = await User.findAll({
            where: {
                phoneNumber: {
                    [Op.or]: ['7795739458', '9898989898', '+917795739458', '+919898989898', '917795739458', '919898989898']
                }
            }
        });

        console.log('\n--- USERS ---');
        users.forEach(u => {
            console.log(`User ID: ${u.id}`);
            console.log(`Phone: ${u.phoneNumber}`);
            console.log(`Name: ${u.firstName} ${u.lastName}`);
            console.log(`Role: ${u.role}`);
            console.log('------------------------');
        });

        // Fetch integrations
        const integrations = await Integration.findAll({
            where: {
                phoneNumber: {
                    [Op.or]: ['7795739458', '9898989898', '+917795739458', '+919898989898', '917795739458', '919898989898']
                }
            }
        });

        console.log('\n--- INTEGRATIONS ---');
        integrations.forEach(i => {
            console.log(`Integration ID: ${i.id}`);
            console.log(`Name: ${i.integrationName}`);
            console.log(`Phone: ${i.phoneNumber}`);
            console.log(`Role: ${i.role}`);
            console.log('------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

run();
