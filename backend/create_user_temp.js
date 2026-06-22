const { User } = require('./Utils/Postgres');
const { generateUUID } = require('./Utils/Helper');

async function createTestUser() {
  try {
    const phoneNumber = '9844985623';
    // Check if exists
    let user = await User.findOne({ where: { phoneNumber } });
    if (user) {
      console.log('User already exists, updating pin...');
      await user.update({ pinCode: '2123' });
      console.log('Pin updated.');
    } else {
      console.log('Creating user...');
      user = await User.create({
        phoneNumber: phoneNumber,
        uuid: generateUUID(),
        role: 'User',
        pinCode: '2123',
        userVerified: true,
      });
      console.log('User created successfully:', user.id);
    }
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
