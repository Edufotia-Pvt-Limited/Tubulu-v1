const { connectPostgres, User, FriendRecommendation, Integration, sequelize } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function test() {
    try {
        await connectPostgres();
        console.log('Successfully connected to DB');

        // Find all users with "Suma" in their name
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.iLike]: '%Suma%' } },
                    { lastName: { [Op.iLike]: '%Suma%' } }
                ]
            }
        });

        console.log(`Found ${users.length} users with name containing 'Suma':`);
        for (const u of users) {
            console.log(`- User: ${u.firstName} ${u.lastName} (ID: ${u.id}, Phone: ${u.phoneNumber})`);
            
            // Find recommendations by this user
            const recs = await FriendRecommendation.findAll({
                where: { userId: u.id },
                include: [{ model: Integration, as: 'integration' }]
            });
            console.log(`  Recommendations count: ${recs.length}`);
            for (const r of recs) {
                console.log(`    * Store: ${r.integration?.integrationName} (ID: ${r.integration?.id}, City: ${r.integration?.city}), Text: "${r.reviewText}", Rating: ${r.rating}`);
            }
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

test();
