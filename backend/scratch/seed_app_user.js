const User = require('../Models/User.pg.model');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    // Connect happens on require
    
    const userPayload = {
      uuid: uuidv4(),
      phoneNumber: '8989898989',
      cc: '+91',
      otp: '000000',
      userVerified: true,
      role: 'User',
      firstName: 'Test',
      lastName: 'Shopper',
      email: 'shopper@test.com'
    };

    const existing = await User.findOne({ where: { phoneNumber: '8989898989' } });
    if (existing) {
        await existing.update(userPayload);
        console.log('Updated existing user 8989898989');
    } else {
        await User.create(userPayload);
        console.log('Created new user 8989898989');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
