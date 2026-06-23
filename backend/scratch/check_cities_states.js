const { State, City, User } = require('../Utils/Postgres');

async function main() {
    try {
        console.log('--- States ---');
        const states = await State.findAll({ attributes: ['id', 'name'] });
        states.forEach(s => console.log(`State: ${s.name} (${s.id})`));

        console.log('\n--- Cities ---');
        const cities = await City.findAll({ attributes: ['id', 'name', 'stateId'] });
        cities.forEach(c => console.log(`City: ${c.name} (${c.id}), StateId: ${c.stateId}`));

        console.log('\n--- Users (Admins/Managers) ---');
        const users = await User.findAll({
            where: {
                role: ['super_admin', 'regional_manager', 'state_manager', 'city_manager', 'ops_admin']
            },
            attributes: ['id', 'phoneNumber', 'role', 'scopedStateId', 'scopedCityId']
        });
        users.forEach(u => {
            console.log(JSON.stringify({
                id: u.id,
                phoneNumber: u.phoneNumber,
                role: u.role,
                scopedStateId: u.scopedStateId,
                scopedCityId: u.scopedCityId
            }, null, 2));
        });

        process.exit(0);
    } catch (e) {
        console.error('Error running check_cities_states.js:', e);
        process.exit(1);
    }
}

main();
