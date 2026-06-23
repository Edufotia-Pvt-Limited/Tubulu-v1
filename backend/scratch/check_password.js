const { User } = require('../Utils/Postgres');

async function checkPassword() {
    try {
        const user = await User.findOne({ where: { phoneNumber: '8500000000' } });
        if (user) {
            console.log('Password in DB:', user.password);
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    }
}
checkPassword();
