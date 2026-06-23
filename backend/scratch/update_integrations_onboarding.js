const { Integration } = require('../Utils/Postgres');

async function run() {
  const result = await Integration.update({
    isOnboarded: true,
    isApproved: true,
    isDocumentsUploaded: true,
    isTubuluAppSetupDone: true
  }, {
    where: {}
  });
  console.log(`Updated integrations count: ${result[0]}`);
}

run().catch(console.error);
