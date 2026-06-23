const { Integration } = require('/Users/pradeep/Desktop/Tubulu-v1/backend/Utils/Postgres');

async function run() {
  try {
    const store = await Integration.findOne({
      where: { integrationName: 'bhavan' }
    });
    if (!store) {
      console.log("bhavan not found!");
      process.exit(0);
    }
    console.log("bhavan details:", JSON.stringify(store.toJSON(), null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
