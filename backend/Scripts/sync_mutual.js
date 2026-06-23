const { User, UserContact } = require('../Utils/Postgres');

async function syncMutual() {
  try {
    const friend = await User.findOne({ where: { phoneNumber: '9844985623' } });
    if (!friend) {
      console.log('User 9844985623 not found');
      return;
    }

    console.log('Syncing contact for', friend.id);
    
    await UserContact.findOrCreate({
      where: {
        userId: friend.id,
        contactPhoneNumber: '9844982389'
      },
      defaults: {
        contactName: 'Pradeep Main',
        contactPhoneNumber: '9844982389',
        isTubuluUser: true
      }
    });
    
    console.log('Synced! 9844985623 now has 9844982389 in their contacts.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncMutual();
