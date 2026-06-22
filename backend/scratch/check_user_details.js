const { User, City, State } = require('../Utils/Postgres');

async function checkUser() {
    const user = await User.findOne({
        where: { email: 'mysuru@tubulu.com' },
        include: [
            { model: City, as: 'city_detail', attributes: ['id', 'name'] },
            { model: State, as: 'state_detail', attributes: ['id', 'name'] }
        ]
    });
    if (user) {
        console.log('--- User DB Details ---');
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`ScopedCityId: ${user.scopedCityId}`);
        console.log(`ScopedStateId: ${user.scopedStateId}`);
        console.log(`City Detail:`, user.city_detail ? user.city_detail.name : 'None');
        console.log(`State Detail:`, user.state_detail ? user.state_detail.name : 'None');
    } else {
        console.log('User not found');
    }
    process.exit(0);
}
checkUser();
