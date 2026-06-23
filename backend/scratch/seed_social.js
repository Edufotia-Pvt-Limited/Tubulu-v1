const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('tubulu_db', 'tubulu_admin', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

async function seedData() {
  try {
    // 1. Get current user (9898989898)
    const [user1] = await sequelize.query(`SELECT id FROM "Users" WHERE "phoneNumber" = '9898989898'`);
    if (!user1 || user1.length === 0) { console.log('User1 not found'); return; }
    const userId1 = user1[0].id;

    // 2. Get friend user (+919999999999)
    const [user2] = await sequelize.query(`SELECT id FROM "Users" WHERE "phoneNumber" = '+919999999999'`);
    if (!user2 || user2.length === 0) { console.log('User2 not found'); return; }
    const userId2 = user2[0].id;

    // 3. Set friend's name
    await sequelize.query(`UPDATE "Users" SET "firstName" = 'Rahul', "lastName" = 'Sharma' WHERE id = '${userId2}'`);

    // 4. Create UserContact
    await sequelize.query(`
      INSERT INTO "UserContacts" ("userId", "contactPhoneNumber", "contactName", "createdAt", "updatedAt")
      VALUES ('${userId1}', '+919999999999', 'Rahul Sharma', NOW(), NOW())
      ON CONFLICT ("userId", "contactPhoneNumber") DO NOTHING;
    `);

    // 5. Create Review for test merchant
    const integrationId = '908fa830-7d67-4555-8d3b-a72b20636d44';
    await sequelize.query(`
      INSERT INTO "Reviews" ("userId", "integrationId", "rating", "reviewText", "isPublicToContacts", "createdAt", "updatedAt")
      VALUES ('${userId2}', '${integrationId}', 5, 'The food here is absolutely incredible! Highly recommend the Peri Peri Fries and the Margherita Pizza.', true, NOW(), NOW())
    `);

    console.log("Seed data injected successfully!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedData();
