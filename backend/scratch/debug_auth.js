const { Integration } = require('../Utils/Postgres');

async function debug() {
    // Find all integrations created recently
    const list = await Integration.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5
    });
    
    console.log('Recent integrations:');
    list.forEach(i => {
        console.log(`ID: ${i.id}, Name: ${i.integrationName}, Phone: ${i.phoneNumber}, Approved: ${i.isApproved}, Onboarded: ${i.isOnboarded}`);
    });
    process.exit(0);
}

debug();
