const adminController = require('../Controllers/Admin.controller.js');
const { User, Integration } = require('../Utils/Postgres');

async function testRole(userDescription, userObj) {
    console.log(`\n--- Testing list for: ${userDescription} ---`);
    let resultData = null;
    const req = {
        user: userObj,
        query: {}
    };
    const res = {
        status: (code) => {
            return {
                json: (payload) => {
                    resultData = payload.data;
                }
            };
        }
    };
    const next = (err) => {
        console.error('Error returned to next():', err);
    };

    try {
        await adminController.getAllIntegrations(req, res, next);
        if (resultData) {
            console.log(`Integrations returned: ${resultData.length}`);
            const bhavan = resultData.find(item => item.integrationName === 'bhavan');
            if (bhavan) {
                console.log(`  [FOUND] "bhavan" (id: ${bhavan.id}) is in the list.`);
            } else {
                console.log(`  [HIDDEN] "bhavan" is NOT in the list.`);
            }
        } else {
            console.log('No response returned.');
        }
    } catch (e) {
        console.error(e);
    }
}

async function main() {
    try {
        // 1. Super Admin
        await testRole('Super Admin', {
            id: '6cfa1050-3dbd-486e-b01a-b71d6e78b4c1',
            role: 'super_admin'
        });

        // 2. Karnataka Regional Manager (scopedStateId of Karnataka)
        await testRole('Karnataka Regional Manager', {
            id: '40fc203b-f360-42c4-8b68-ae93c55770dd',
            role: 'regional_manager',
            scopedStateId: 'fb954aae-56d1-4459-8779-401dc00873ec'
        });

        // 3. Mysuru City Manager (scopedCityId of Mysuru)
        await testRole('Mysuru City Manager', {
            id: '423ca58f-8792-46ff-9abf-bbd3eed98571',
            role: 'city_manager',
            scopedStateId: 'fb954aae-56d1-4459-8779-401dc00873ec',
            scopedCityId: 'eb927813-debb-43fa-8dc1-fb339882b72d'
        });

        // 4. Bengaluru City Manager (scopedCityId of Bengaluru)
        await testRole('Bengaluru City Manager', {
            id: '5ac1849d-c049-4173-b511-d6d51f36ee59',
            role: 'city_manager',
            scopedStateId: 'fb954aae-56d1-4459-8779-401dc00873ec',
            scopedCityId: 'c58d308a-d23a-447f-9f14-ccd07c6be0a8'
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
