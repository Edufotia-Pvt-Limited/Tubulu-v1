require('dotenv').config();
const { connectPostgres, User, UserContact, FriendRecommendation, Review, Integration } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function check() {
  try {
    console.log('--- CONNECTING TO POSTGRES ---');
    const { sequelize } = require('../Utils/Postgres');
    await sequelize.authenticate();
    console.log('Postgres connected.');

    const userPhone = '9844982389';
    const friendPhoneRaw = '7795739458';

    console.log('\n--- 1. CHECKING USER DETAILS ---');
    const user = await User.findOne({ where: { phoneNumber: userPhone } });
    if (user) {
      console.log(`User found: ID=${user.id}, Name=${user.firstName} ${user.lastName}, Phone=${user.phoneNumber}, Role=${user.role}`);
    } else {
      console.log(`User with phone ${userPhone} NOT found!`);
    }

    console.log('\n--- 2. CHECKING FRIEND DETAILS ---');
    const friends = await User.findAll({
      where: {
        phoneNumber: {
          [Op.or]: [
            friendPhoneRaw,
            `+91${friendPhoneRaw}`,
            `91${friendPhoneRaw}`,
            `0${friendPhoneRaw}`
          ]
        }
      }
    });

    if (friends.length > 0) {
      friends.forEach(f => {
        console.log(`Friend found: ID=${f.id}, Name=${f.firstName} ${f.lastName}, Phone=${f.phoneNumber}, Role=${f.role}`);
      });
    } else {
      console.log(`Friend with phone containing ${friendPhoneRaw} NOT found!`);
    }

    if (user) {
      console.log('\n--- 3. CHECKING USER CONTACTS ---');
      const contacts = await UserContact.findAll({ where: { userId: user.id } });
      console.log(`Total contacts for user: ${contacts.length}`);
      contacts.forEach(c => {
        if (c.contactPhoneNumber.includes(friendPhoneRaw)) {
          console.log(`MATCHING CONTACT FOUND: Name="${c.contactName}", Phone="${c.contactPhoneNumber}"`);
        }
      });
      if (contacts.length > 0 && !contacts.some(c => c.contactPhoneNumber.includes(friendPhoneRaw))) {
        console.log(`No contacts matching ${friendPhoneRaw} in user's contacts list!`);
        console.log('Sample contacts:');
        contacts.slice(0, 5).forEach(c => console.log(`  - ${c.contactName}: ${c.contactPhoneNumber}`));
      }
    }

    console.log('\n--- 4. CHECKING REVIEWS & RECOMMENDATIONS BY FRIEND ---');
    for (const f of friends) {
      const recs = await FriendRecommendation.findAll({ where: { userId: f.id } });
      console.log(`Friend ${f.firstName} (${f.phoneNumber}) has ${recs.length} friend recommendations:`);
      recs.forEach(r => {
        console.log(`  - Rec ID=${r.id}, Store ID=${r.integrationId}, Rating=${r.rating}, ReviewText="${r.reviewText}"`);
      });

      const reviews = await Review.findAll({ where: { userId: f.id } });
      console.log(`Friend ${f.firstName} (${f.phoneNumber}) has ${reviews.length} total reviews:`);
      reviews.forEach(rv => {
        console.log(`  - Review ID=${rv.id}, Store ID=${rv.integrationId}, Rating=${rv.rating}, Text="${rv.reviewText}", isPublicToContacts=${rv.isPublicToContacts}`);
      });
    }

    console.log('\n--- 5. CHECKING MYSORE STORES ---');
    const stores = await Integration.findAll({
      where: {
        city: {
          [Op.iLike]: '%mysor%'
        }
      }
    });
    console.log(`Found ${stores.length} stores in Mysore:`);
    stores.forEach(s => {
      console.log(`  - Store ID=${s.id}, Name="${s.integrationName}", Phone="${s.phoneNumber}", City="${s.city}"`);
    });

  } catch (err) {
    console.error('Error during checks:', err);
  } finally {
    process.exit(0);
  }
}

check();
