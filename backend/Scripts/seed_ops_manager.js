require('dotenv').config();
const { User, connectPostgres } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');

async function seedOpsManager() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await connectPostgres();

    const email = 'ops@tubulu.com';
    const password = '2123';
    const phoneNumber = '9900000012'; // unique phone number
    const role = 'ops_manager';

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log(`👤 Ops Manager ${email} already exists. Updating details...`);
      await user.update({
        password,
        role,
        phoneNumber,
        firstName: 'Operations',
        lastName: 'Manager',
        userVerified: true
      });
    } else {
      console.log(`👤 Creating Ops Manager ${email}...`);
      user = await User.create({
        uuid: generateUUID(),
        email,
        userName: email,
        password,
        role,
        phoneNumber,
        firstName: 'Operations',
        lastName: 'Manager',
        userVerified: true
      });
    }

    console.log('✅ Ops Manager seeded successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      password: user.password
    });
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedOpsManager();
