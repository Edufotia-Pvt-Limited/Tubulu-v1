const { Integration } = require('./Utils/Postgres');
const { Op } = require('sequelize');

async function checkLogos() {
  try {
    const integrations = await Integration.findAll({
      where: { isActive: true, isApproved: true },
      attributes: ['id', 'integrationName', 'logo']
    });
    console.log("--- DUMPING ALL APPROVED ACTIVE INTEGRATIONS ---");
    integrations.forEach(i => {
       console.log(`Name: ${i.integrationName} | ID: ${i.id} | Logo: ${i.logo}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkLogos();
