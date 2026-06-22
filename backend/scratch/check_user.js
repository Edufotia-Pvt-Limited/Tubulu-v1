const { User } = require('../Utils/Postgres');

async function run() {
  const user = await User.findOne({ where: { phoneNumber: '9900000405' } });
  console.log('User record:', user ? user.toJSON() : 'None found');
}

run().catch(console.error);
