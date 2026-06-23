const { User, State, City, Integration, Country } = require('../Utils/Postgres');
const { v4: uuidv4 } = require('uuid');

async function seedRBACUsers() {
    console.log('🌱 ==================================================');
    console.log('🌱 Starting DB Seeding & Mapping script...');
    console.log('🌱 ==================================================');

    try {
        // 1. Create/Update Super Admin
        console.log('👤 Seeding Super Admin user...');
        const [superAdmin, createdAdmin] = await User.findOrCreate({
            where: { email: 'superadmin@tubulu.com' },
            defaults: {
                uuid: uuidv4(),
                firstName: 'Platform',
                lastName: 'SuperAdmin',
                phoneNumber: '9999000000',
                userName: 'superadmin@tubulu.com',
                password: 'test123',
                role: 'super_admin',
                userVerified: true,
                portfolioAccess: { accessType: 'GLOBAL', merchants: [] }
            }
        });
        if (!createdAdmin) {
            await superAdmin.update({ password: 'test123', role: 'super_admin' });
            console.log('✅ Updated existing Super Admin password/role.');
        } else {
            console.log('✅ Created new Super Admin user.');
        }

        // 2. Fetch all states & countries
        const states = await State.findAll();
        console.log(`📍 Found ${states.length} states in database.`);

        // Seed Regional Managers for each state
        console.log('👤 Seeding Regional Managers for all states...');
        for (let i = 0; i < states.length; i++) {
            const state = states[i];
            const stateSlug = state.name.toLowerCase().replace(/[^a-z]/g, '');
            const email = `${stateSlug}@tubulu.com`;
            const dummyPhone = `950000${String(i).padStart(4, '0')}`;

            const [rm, createdRM] = await User.findOrCreate({
                where: { email },
                defaults: {
                    uuid: uuidv4(),
                    firstName: `${state.name} Regional`,
                    lastName: 'Manager',
                    phoneNumber: dummyPhone,
                    userName: email,
                    password: 'test123',
                    role: 'regional_manager',
                    scopedStateId: state.id,
                    scopedCountryId: state.countryId,
                    userVerified: true,
                    portfolioAccess: { accessType: 'GLOBAL', merchants: [] }
                }
            });

            if (!createdRM) {
                await rm.update({
                    password: 'test123',
                    role: 'regional_manager',
                    scopedStateId: state.id,
                    scopedCountryId: state.countryId
                });
            }
        }
        console.log('✅ Seeding of Regional Managers complete.');

        // 3. Fetch all cities
        const cities = await City.findAll();
        console.log(`📍 Found ${cities.length} cities in database.`);

        // Seed City Managers for all cities under Karnataka
        console.log('👤 Seeding City Managers...');
        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            const cityState = states.find(s => s.id === city.stateId);
            
            // Only seed City Managers if parent state exists
            if (cityState) {
                const citySlug = city.name.toLowerCase().replace(/[^a-z]/g, '');
                const email = `${citySlug}@tubulu.com`;
                const dummyPhone = `850000${String(i).padStart(4, '0')}`;

                const [cm, createdCM] = await User.findOrCreate({
                    where: { email },
                    defaults: {
                        uuid: uuidv4(),
                        firstName: `${city.name} City`,
                        lastName: 'Manager',
                        phoneNumber: dummyPhone,
                        userName: email,
                        password: 'test123',
                        role: 'city_manager',
                        scopedStateId: city.stateId,
                        scopedCityId: city.id,
                        scopedCountryId: cityState.countryId,
                        userVerified: true,
                        portfolioAccess: { accessType: 'GLOBAL', merchants: [] }
                    }
                });

                if (!createdCM) {
                    await cm.update({
                        password: 'test123',
                        role: 'city_manager',
                        scopedStateId: city.stateId,
                        scopedCityId: city.id,
                        scopedCountryId: cityState.countryId
                    });
                }
            }
        }
        console.log('✅ Seeding of City Managers complete.');

        // 4. Map existing integrations/vendors to cities & states
        console.log('📦 Mapping existing vendors to states and cities...');
        const integrations = await Integration.findAll();
        let mappedCount = 0;

        for (const vendor of integrations) {
            // Try to find city match
            if (vendor.city) {
                const matchedCity = cities.find(c => c.name.toLowerCase() === vendor.city.toLowerCase());
                if (matchedCity) {
                    const matchedState = states.find(s => s.id === matchedCity.stateId);
                    await vendor.update({
                        cityId: matchedCity.id,
                        stateId: matchedCity.stateId,
                        countryId: matchedState ? matchedState.countryId : null
                    });
                    mappedCount++;
                    continue;
                }
            }

            // Fallback: Try to find state match
            if (vendor.state) {
                const matchedState = states.find(s => s.name.toLowerCase() === vendor.state.toLowerCase());
                if (matchedState) {
                    await vendor.update({
                        stateId: matchedState.id,
                        countryId: matchedState.countryId
                    });
                    mappedCount++;
                }
            }
        }
        console.log(`✅ Successfully mapped ${mappedCount}/${integrations.length} vendors to location hierarchies.`);

        console.log('\n🌱 ==================================================');
        console.log('🏁      DB SEEDING & DATA MAPPING SUCCESSFUL! ✅     ');
        console.log('🌱 ==================================================');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedRBACUsers();
