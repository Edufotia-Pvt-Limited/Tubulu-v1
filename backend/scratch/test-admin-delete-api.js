const axios = require('axios');
const { Integration, connectPostgres, sequelize } = require('../Utils/Postgres');

async function test() {
    try {
        console.log("Connecting to Postgres...");
        await connectPostgres();

        // 1. Admin login via API to get auth token
        console.log("Logging in as admin via API...");
        const loginRes = await axios.post('http://localhost:3008/api/v1/integrations/admin/login', {
            username: 'superadmin',
            password: '2123'
        });
        const token = loginRes.data.data?.authToken || loginRes.data.authToken || loginRes.data.token;
        console.log("Login successful! Token acquired:", token ? "YES (masked)" : "NO");
        if (!token) {
            console.error("Full login response:", loginRes.data);
            process.exit(1);
        }

        // 2. Create a test vendor via Sequelize so we have a valid vendor to delete
        console.log("Creating test vendor in database...");
        const testVendor = await Integration.create({
            integrationName: 'API Delete Test Store',
            phoneNumber: '1112223333',
            category: 'Testing',
            isActive: true,
            isApproved: false
        });
        console.log("Test vendor created. ID:", testVendor.id);

        // 3. Make the DELETE request via axios using the token
        console.log(`Sending DELETE request to http://localhost:3008/api/v1/admin/integration/${testVendor.id}...`);
        const deleteRes = await axios.delete(`http://localhost:3008/api/v1/admin/integration/${testVendor.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("DELETE API Response Status:", deleteRes.status);
        console.log("DELETE API Response Body:", deleteRes.data);

        // 4. Verify vendor has been deleted from the database
        const checked = await Integration.findByPk(testVendor.id);
        if (!checked) {
            console.log("SUCCESS: Vendor was successfully deleted from database!");
        } else {
            console.error("FAILURE: Vendor still exists in database after DELETE API call!");
            // Clean up
            await testVendor.destroy().catch(() => {});
        }

    } catch (error) {
        console.error("Test error occurred:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Body:", error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

test();
