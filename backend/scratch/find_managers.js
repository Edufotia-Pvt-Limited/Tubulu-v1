const { User, City } = require('../Utils/Postgres');

async function findCityManagers() {
    try {
        const managers = await User.findAll({
            where: { role: 'city_manager' },
            include: [{ model: City, as: 'city_detail' }]
        });

        console.log('=== CITY MANAGER ACCOUNTS IN DATABASE ===');
        if (managers.length === 0) {
            console.log('No City Managers found.');
        } else {
            managers.forEach(m => {
                console.log(`Name: ${m.firstName} ${m.lastName || ''}`);
                console.log(`Phone: ${m.phoneNumber}`);
                console.log(`Email: ${m.email || 'N/A'}`);
                console.log(`Role: ${m.role}`);
                console.log(`City Scope: ${m.city_detail ? m.city_detail.name : 'N/A'} (ID: ${m.scopedCityId})`);
                console.log(`-----------------------------------`);
            });
        }
    } catch (e) {
        console.error('Error fetching city managers:', e.message);
    }
}

findCityManagers();
