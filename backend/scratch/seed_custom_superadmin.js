require('dotenv').config();
const { sequelize } = require('../Utils/Postgres');
const User = require('../Models/User.pg.model');
const { Integration } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');

async function run() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        
        const phoneNumber = "9999999999";
        const cleanPhone = "9999999999";
        
        // 1. Create or update User in PostgreSQL
        let user = await User.findOne({ where: { phoneNumber: cleanPhone } });
        if (!user) {
            user = await User.create({
                phoneNumber: cleanPhone,
                uuid: generateUUID(),
                role: 'SuperAdmin',
                pinCode: '2123',
                userVerified: true
            });
            console.log("👤 Created User:", user.toJSON());
        } else {
            await user.update({
                pinCode: '2123',
                role: 'SuperAdmin',
                userVerified: true
            });
            console.log("👤 Updated existing User:", user.toJSON());
        }
        
        // 2. Create or update Integration in PostgreSQL
        let integration = await Integration.findOne({ where: { phoneNumber } });
        if (!integration) {
            integration = await Integration.create({
                phoneNumber,
                integrationName: 'Tubulu Master Admin',
                category: 'SuperAdmin',
                isApproved: true,
                isOnboarded: true,
                isDocumentsUploaded: true,
                isTubuluAppSetupDone: true,
                apiAuthKey: generateUUID(),
                role: 'super_admin'
            });
            console.log("🏢 Created Integration:", integration.toJSON());
        } else {
            await integration.update({
                role: 'super_admin',
                isApproved: true,
                isOnboarded: true,
                isDocumentsUploaded: true,
                isTubuluAppSetupDone: true
            });
            console.log("🏢 Updated existing Integration:", integration.toJSON());
        }
        
        console.log("🎉 Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

run();
