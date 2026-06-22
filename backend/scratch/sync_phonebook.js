const { Order, PhoneBook, ChatRoom } = require('../Utils/Postgres');
const { v4: uuidv4 } = require('uuid');

async function syncPhoneBook() {
  try {
    console.log('Starting PhoneBook synchronization...');

    // 1. Get all unique interactions from Orders
    const orders = await Order.findAll({
      attributes: ['userId', 'integrationId'],
      raw: true
    });
    
    // 2. Get all unique interactions from ChatRooms
    const chatRooms = await ChatRoom.findAll({
      attributes: ['userId', 'integrationId'],
      raw: true
    });

    // Combine and deduplicate
    const interactions = [...orders, ...chatRooms];
    const uniquePairs = Array.from(new Set(interactions.map(i => `${i.userId}|${i.integrationId}`)))
      .map(pair => {
        const [userId, integrationId] = pair.split('|');
        return { userId, integrationId };
      });

    console.log(`Found ${uniquePairs.length} unique customer-merchant pairs.`);

    let syncedCount = 0;
    for (const pair of uniquePairs) {
      const [pb, created] = await PhoneBook.findOrCreate({
        where: {
          userId: pair.userId,
          integrationId: pair.integrationId
        },
        defaults: {
          uuid: uuidv4()
        }
      });

      if (created) {
        syncedCount++;
        console.log(`Linked User ${pair.userId} to Merchant ${pair.integrationId}`);
      }
    }

    console.log(`Synchronization completed. Added ${syncedCount} new links.`);
    process.exit(0);
  } catch (error) {
    console.error('Synchronization failed:', error);
    process.exit(1);
  }
}

syncPhoneBook();
