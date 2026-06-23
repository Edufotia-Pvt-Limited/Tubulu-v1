const { sequelize } = require('../Utils/Postgres');
const User = require('../Models/User.pg.model');
const { config } = require('../config');
const jwt = require('jsonwebtoken');

async function createSuperAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connected to Postgres');

        const [user, created] = await User.findOrCreate({
            where: { phoneNumber: '+919999999999' },
            defaults: {
                uuid: require('uuid').v4(),
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@tubulu.ai',
                role: 'SuperAdmin',
                userVerified: true
            }
        });

        if (created) {
            console.log('Super Admin created');
        } else {
            console.log('Super Admin already exists');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwtKey,
            { expiresIn: '24h' }
        );

        console.log('\n--- Super Admin Token ---');
        console.log(token);
        console.log('--------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createSuperAdmin();
