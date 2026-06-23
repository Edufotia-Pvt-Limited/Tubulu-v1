const { Integration } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function main() {
    try {
        console.log('--- Searching for Integrations matching "gobi" or "bhavan" ---');
        
        // Query integrations including potentially soft-deleted ones (if any)
        const integrations = await Integration.findAll({
            where: {
                integrationName: {
                    [Op.or]: [
                        { [Op.iLike]: '%gobi%' },
                        { [Op.iLike]: '%bhavan%' }
                    ]
                }
            },
            paranoid: false // Show soft-deleted ones too, just in case
        });

        console.log(`Found ${integrations.length} records:`);
        integrations.forEach(item => {
            console.log(JSON.stringify({
                id: item.id,
                integrationName: item.integrationName,
                isActive: item.isActive,
                isApproved: item.isApproved,
                role: item.role,
                category: item.category,
                stateId: item.stateId,
                cityId: item.cityId,
                latitude: item.latitude,
                longitude: item.longitude,
                phoneNumber: item.phoneNumber,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }, null, 2));
        });

        process.exit(0);
    } catch (e) {
        console.error('Error running check_deleted_and_bhavan.js:', e);
        process.exit(1);
    }
}

main();
