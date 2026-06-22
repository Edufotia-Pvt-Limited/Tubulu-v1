const { connectPostgres, User, FriendRecommendation, Integration, sequelize } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function test() {
    try {
        await connectPostgres();
        console.log('Successfully connected to DB');

        // Find Suma B (7795739458)
        const user = await User.findOne({
            where: { phoneNumber: { [Op.like]: '%7795739458' } }
        });
        if (!user) {
            console.error('Suma B (7795739458) not found.');
            return;
        }

        // Find all recommendations by this user ID
        const recs = await FriendRecommendation.findAll({
            where: { userId: user.id },
            include: [{ model: Integration, as: 'integration' }]
        });

        console.log(`\nAll recommendations by Suma B (${user.id}) in database (total ${recs.length}):`);
        for (const r of recs) {
            console.log(`- Rec ID: ${r.id}`);
            console.log(`  Store: ${r.integration?.integrationName} (ID: ${r.integration?.id})`);
            console.log(`  City: ${r.integration?.city}, Active: ${r.integration?.isActive}`);
            console.log(`  Text: "${r.reviewText}"`);
            console.log(`  Rating: ${r.rating}`);
            console.log(`  CreatedAt: ${r.createdAt}`);
            console.log(`-----------------------------------`);
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

test();
