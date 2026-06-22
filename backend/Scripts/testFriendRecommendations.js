const { FriendRecommendation, UserContact, User, Integration } = require('../Utils/Postgres');

async function testRecs() {
  try {
    console.log('Fetching all FriendRecommendations in DB...');
    const recs = await FriendRecommendation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['phoneNumber', 'firstName', 'lastName'] },
        { model: Integration, as: 'integration', attributes: ['integrationName'] }
      ]
    });
    console.log(`Found ${recs.length} friend recommendations:`);
    recs.forEach(r => {
      console.log(`- Rec by ${r.user?.firstName} ${r.user?.lastName} (${r.user?.phoneNumber}) for "${r.integration?.integrationName}": rating=${r.rating}, text="${r.reviewText}"`);
    });

    console.log('\n--- TESTING GET /user/friend-recommendations LOGIC FOR EACH USER ---');
    const users = await User.findAll();
    for (const user of users) {
      console.log(`\nChecking recommendations visible to: ${user.firstName} ${user.lastName} (${user.phoneNumber})`);
      const contacts = await UserContact.findAll({ where: { userId: user.id } });
      console.log(`Contacts list: ${contacts.map(c => `${c.contactName} (${c.contactPhoneNumber})`).join(', ') || 'No contacts'}`);

      if (contacts.length === 0) {
        console.log('No visible recommendations (contacts list is empty).');
        continue;
      }

      const phoneNumbers = [];
      contacts.forEach(c => {
        const clean = c.contactPhoneNumber.replace(/[^0-9]/g, '');
        const last10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
        if (last10) {
          phoneNumbers.push(last10);
          phoneNumbers.push(`+91${last10}`);
          phoneNumbers.push(`91${last10}`);
        }
      });

      const friends = await User.findAll({ where: { phoneNumber: phoneNumbers } });
      const friendIds = friends.map(f => f.id);
      console.log(`Friends on Tubulu: ${friends.map(f => `${f.firstName} (${f.phoneNumber})`).join(', ') || 'None'}`);

      if (friendIds.length === 0) {
        console.log('No visible recommendations (no friends are registered on Tubulu).');
        continue;
      }

      const visibleRecs = await FriendRecommendation.findAll({
        where: { userId: friendIds },
        include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phoneNumber'] }],
        order: [['createdAt', 'DESC']]
      });

      console.log(`Visible Recommendations count: ${visibleRecs.length}`);
      visibleRecs.forEach(r => {
        const friend = r.user;
        const contactRel = contacts.find(c => {
          if (!friend) return false;
          const cPhone = c.contactPhoneNumber.replace(/[^0-9]/g, '');
          const fPhone = friend.phoneNumber.replace(/[^0-9]/g, '');
          return cPhone.endsWith(fPhone.substring(fPhone.length - 10));
        });
        const displayName = (friend ? `${friend.firstName || ''} ${friend.lastName || ''}`.trim() : null) || 
                            contactRel?.contactName || 
                            friend?.phoneNumber || 
                            "Your friend";
        console.log(`- Friend: ${displayName} recommends Store ID: ${r.integrationId} | Rating: ${r.rating} | Text: "${r.reviewText}"`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Test script failed:', err);
    process.exit(1);
  }
}

testRecs();
