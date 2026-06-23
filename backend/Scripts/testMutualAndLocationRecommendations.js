require('dotenv').config();
const { connectPostgres, User, UserContact, Integration, FriendRecommendation, City, sequelize } = require('../Utils/Postgres');

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isSameCity(city1, city2) {
  if (!city1 || !city2) return false;
  const c1 = city1.trim().toLowerCase();
  const c2 = city2.trim().toLowerCase();
  if (c1 === c2) return true;
  if ((c1 === 'bangalore' || c1 === 'bengaluru') && (c2 === 'bangalore' || c2 === 'bengaluru')) return true;
  if ((c1 === 'mysore' || c1 === 'mysuru') && (c2 === 'mysore' || c2 === 'mysuru')) return true;
  return false;
}

// Extract endpoint query/filter logic directly so we can run assertions on it
async function getFriendRecommendationsLogic({ userId, lat, lng }) {
  const { Op } = require('sequelize');

  // 1. Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser || !currentUser.phoneNumber) {
    return [];
  }

  const cleanUserPhone = currentUser.phoneNumber.replace(/[^0-9]/g, '');
  const last10UserPhone = cleanUserPhone.length >= 10 ? cleanUserPhone.substring(cleanUserPhone.length - 10) : cleanUserPhone;

  // 2. Fetch viewing user's contacts
  const contacts = await UserContact.findAll({ where: { userId } });
  if (contacts.length === 0) {
    return [];
  }

  const phoneNumbers = [];
  contacts.forEach(c => {
    const clean = c.contactPhoneNumber.replace(/[^0-9]/g, '');
    const last10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
    if (last10) {
      phoneNumbers.push(last10);
      phoneNumbers.push(`+91${last10}`);
      phoneNumbers.push(`91${last10}`);
    }
  });

  // 3. Find registered friends
  const friends = await User.findAll({ where: { phoneNumber: { [Op.in]: phoneNumbers } } });
  const friendIds = friends.map(f => f.id).filter(id => id !== userId);
  if (friendIds.length === 0) {
    return [];
  }

  // 4. Verify mutual contacts
  const mutualContacts = await UserContact.findAll({
    where: {
      userId: { [Op.in]: friendIds },
      contactPhoneNumber: {
        [Op.or]: [
          { [Op.like]: `%${last10UserPhone}` }
        ]
      }
    }
  });

  const mutualFriendIds = [];
  for (const mc of mutualContacts) {
    const cleanPhone = mc.contactPhoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.endsWith(last10UserPhone)) {
      mutualFriendIds.push(mc.userId);
    }
  }

  if (mutualFriendIds.length === 0) {
    return [];
  }

  // 5. Fetch all recommendations from mutual friends
  const recs = await FriendRecommendation.findAll({
    where: {
      userId: { [Op.in]: mutualFriendIds }
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'phoneNumber']
      },
      {
        model: Integration,
        as: 'integration',
        attributes: ['city', 'assignedCity', 'cityId']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // 6. Location Filtering
  let filteredRecs = recs;
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const cities = await City.findAll({
      where: {
        isActive: true,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      }
    });

    if (cities.length > 0) {
      let closestCity = null;
      let minDistance = Infinity;

      for (const city of cities) {
        const cityLat = parseFloat(city.latitude);
        const cityLng = parseFloat(city.longitude);
        const distance = getDistance(userLat, userLng, cityLat, cityLng);

        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }

      const radius = closestCity.radius ? parseFloat(closestCity.radius) : 20.0;
      if (minDistance <= radius) {
        filteredRecs = recs.filter(r => {
          const integration = r.integration;
          if (!integration) return false;
          return (integration.cityId === closestCity.id) ||
                 isSameCity(integration.city, closestCity.name) ||
                 isSameCity(integration.assignedCity, closestCity.name);
        });
      } else {
        filteredRecs = [];
      }
    } else {
      filteredRecs = [];
    }
  }

  return filteredRecs;
}

async function test() {
  let userA, userB, userC;
  let intMysuru, intBengaluru;
  let contactAtoB, contactAtoC, contactBtoA;
  let recB1, recB2, recC1;

  try {
    await connectPostgres();
    console.log('--- STARTING MUTUAL CONTACTS & LOCATION RECOMMENDATIONS TESTING ---');

    // Clean up any stale test records first
    await FriendRecommendation.destroy({ where: { reviewText: { [sequelize.Sequelize.Op.like]: 'TEST_%' } } });
    await UserContact.destroy({ where: { contactName: { [sequelize.Sequelize.Op.like]: 'TEST_%' } } });
    await Integration.destroy({ where: { integrationName: { [sequelize.Sequelize.Op.like]: 'TEST_%' } } });
    await User.destroy({ where: { firstName: { [sequelize.Sequelize.Op.like]: 'TEST_%' } } });

    // 1. Create target cities if not exists (Bengaluru & Mysuru coordinates check)
    const bangaloreCity = await City.findOne({ where: { name: 'Bengaluru' } });
    const mysoreCity = await City.findOne({ where: { name: 'Mysuru' } });

    // 2. Create Users
    userA = await User.create({ firstName: 'TEST_UserA', phoneNumber: '9999900001', uuid: 'test-uuid-a' });
    userB = await User.create({ firstName: 'TEST_UserB', phoneNumber: '9999900002', uuid: 'test-uuid-b' });
    userC = await User.create({ firstName: 'TEST_UserC', phoneNumber: '9999900003', uuid: 'test-uuid-c' });

    // 3. Create Integrations
    intMysuru = await Integration.create({
      integrationName: 'TEST_Mysuru_Store',
      city: 'Mysuru',
      cityId: mysoreCity ? mysoreCity.id : null,
      phoneNumber: '9999999001'
    });
    intBengaluru = await Integration.create({
      integrationName: 'TEST_Bengaluru_Store',
      city: 'Bengaluru',
      cityId: bangaloreCity ? bangaloreCity.id : null,
      phoneNumber: '9999999002'
    });

    // 4. Create User Contacts
    // User A has B and C in contacts
    contactAtoB = await UserContact.create({ userId: userA.id, contactName: 'TEST_Friend_B', contactPhoneNumber: '9999900002' });
    contactAtoC = await UserContact.create({ userId: userA.id, contactName: 'TEST_Friend_C', contactPhoneNumber: '9999900003' });
    
    // User B has A in contacts (mutual friend)
    contactBtoA = await UserContact.create({ userId: userB.id, contactName: 'TEST_Friend_A', contactPhoneNumber: '9999900001' });

    // User C does NOT have A in contacts (non-mutual friend)

    // 5. Create Recommendations
    // User B (mutual friend) recommends Mysore and Bangalore stores
    recB1 = await FriendRecommendation.create({ userId: userB.id, integrationId: intMysuru.id, rating: 5, reviewText: 'TEST_B_likes_Mysuru' });
    recB2 = await FriendRecommendation.create({ userId: userB.id, integrationId: intBengaluru.id, rating: 4, reviewText: 'TEST_B_likes_Bengaluru' });
    
    // User C (non-mutual friend) recommends Mysore store
    recC1 = await FriendRecommendation.create({ userId: userC.id, integrationId: intMysuru.id, rating: 5, reviewText: 'TEST_C_likes_Mysuru' });

    console.log('Test data seeded successfully.');

    // --- TEST 1: No Coordinates Passed ---
    console.log('\n--- Running Test 1: No Coordinates (Should return all mutual friend recommendations) ---');
    const recsNoCoords = await getFriendRecommendationsLogic({ userId: userA.id });
    console.log(`Results: ${recsNoCoords.length} recommendations returned.`);
    recsNoCoords.forEach(r => console.log(`- Review: "${r.reviewText}" by ${r.user?.firstName} for integration ${r.integration?.city}`));
    
    const recTextsNoCoords = recsNoCoords.map(r => r.reviewText);
    const hasBRecs = recTextsNoCoords.includes('TEST_B_likes_Mysuru') && recTextsNoCoords.includes('TEST_B_likes_Bengaluru');
    const hasCRecs = recTextsNoCoords.includes('TEST_C_likes_Mysuru');

    if (hasBRecs && !hasCRecs) {
      console.log('✅ TEST 1 PASSED: Only mutual friend B\'s recommendations returned, non-mutual C\'s recommendations excluded.');
    } else {
      console.error('❌ TEST 1 FAILED: Expected only TEST_B_likes_Mysuru and TEST_B_likes_Bengaluru.');
    }

    // --- TEST 2: Mysuru Coordinates Passed ---
    console.log('\n--- Running Test 2: Mysuru Coordinates (Should return only Mysuru mutual friend recommendations) ---');
    // Coords of Mysuru: 12.302, 76.639
    const recsMysuru = await getFriendRecommendationsLogic({ userId: userA.id, lat: 12.3020, lng: 76.6390 });
    console.log(`Results: ${recsMysuru.length} recommendations returned.`);
    recsMysuru.forEach(r => console.log(`- Review: "${r.reviewText}" for city: ${r.integration?.city}`));

    const recTextsMysuru = recsMysuru.map(r => r.reviewText);
    if (recTextsMysuru.length === 1 && recTextsMysuru[0] === 'TEST_B_likes_Mysuru') {
      console.log('✅ TEST 2 PASSED: Only Mysuru recommendation returned.');
    } else {
      console.error('❌ TEST 2 FAILED: Expected only TEST_B_likes_Mysuru.');
    }

    // --- TEST 3: Bengaluru Coordinates Passed ---
    console.log('\n--- Running Test 3: Bengaluru Coordinates (Should return only Bengaluru mutual friend recommendations) ---');
    // Coords of Bengaluru: 12.9716, 77.5946
    const recsBengaluru = await getFriendRecommendationsLogic({ userId: userA.id, lat: 12.9716, lng: 77.5946 });
    console.log(`Results: ${recsBengaluru.length} recommendations returned.`);
    recsBengaluru.forEach(r => console.log(`- Review: "${r.reviewText}" for city: ${r.integration?.city}`));

    const recTextsBengaluru = recsBengaluru.map(r => r.reviewText);
    if (recTextsBengaluru.length === 1 && recTextsBengaluru[0] === 'TEST_B_likes_Bengaluru') {
      console.log('✅ TEST 3 PASSED: Only Bengaluru recommendation returned.');
    } else {
      console.error('❌ TEST 3 FAILED: Expected only TEST_B_likes_Bengaluru.');
    }

    // --- TEST 4: Outside City Coordinates Passed ---
    console.log('\n--- Running Test 4: Coordinates outside active cities (Should return empty array) ---');
    // Coords of Chennai or Delhi: 28.6139, 77.2090
    const recsDelhi = await getFriendRecommendationsLogic({ userId: userA.id, lat: 28.6139, lng: 77.2090 });
    console.log(`Results: ${recsDelhi.length} recommendations returned.`);
    if (recsDelhi.length === 0) {
      console.log('✅ TEST 4 PASSED: Returned empty list for location outside active city radius.');
    } else {
      console.error('❌ TEST 4 FAILED: Expected empty list.');
    }

  } catch (e) {
    console.error('Test execution failed:', e);
  } finally {
    console.log('\nCleaning up test data...');
    // Cleanup
    if (recB1) await recB1.destroy();
    if (recB2) await recB2.destroy();
    if (recC1) await recC1.destroy();
    if (contactAtoB) await contactAtoB.destroy();
    if (contactAtoC) await contactAtoC.destroy();
    if (contactBtoA) await contactBtoA.destroy();
    if (intMysuru) await intMysuru.destroy();
    if (intBengaluru) await intBengaluru.destroy();
    if (userA) await userA.destroy();
    if (userB) await userB.destroy();
    if (userC) await userC.destroy();
    console.log('Cleanup complete.');
    process.exit(0);
  }
}

test();
