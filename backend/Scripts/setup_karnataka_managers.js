require('dotenv').config();
const { User, Integration, connectPostgres } = require('../Utils/Postgres');
const { generateUUID } = require('../Utils/Helper');
const { Op } = require('sequelize');

async function runSetup() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await connectPostgres();

    const karnatakaStateId = 'fb954aae-56d1-4459-8779-401dc00873ec';
    const mysuruCityId = 'eb927813-debb-43fa-8dc1-fb339882b72d';

    // 1. Create or Update Karnataka Regional Manager
    const rmEmail = 'karnataka_rm@tubulu.com';
    const rmPhone = '9900000010';
    let rmUser = await User.findOne({ where: { [Op.or]: [{ email: rmEmail }, { phoneNumber: rmPhone }] } });
    
    const rmData = {
      email: rmEmail,
      userName: rmEmail,
      phoneNumber: rmPhone,
      password: '2123',
      role: 'regional_manager',
      firstName: 'Karnataka',
      lastName: 'Regional',
      scopedStateId: karnatakaStateId,
      scopedCityId: null,
      userVerified: true
    };

    if (rmUser) {
      console.log(`👤 Regional Manager already exists. Updating details...`);
      await rmUser.update(rmData);
    } else {
      console.log(`👤 Creating Regional Manager...`);
      rmUser = await User.create({
        uuid: generateUUID(),
        ...rmData
      });
    }
    console.log(`✅ Regional Manager: ${rmUser.email} (Password: ${rmUser.password})`);

    // 2. Create or Update Mysore City Manager
    const cmEmail = 'mysore_cm@tubulu.com';
    const cmPhone = '9900000011';
    let cmUser = await User.findOne({ where: { [Op.or]: [{ email: cmEmail }, { phoneNumber: cmPhone }] } });
    
    const cmData = {
      email: cmEmail,
      userName: cmEmail,
      phoneNumber: cmPhone,
      password: '2123',
      role: 'city_manager',
      firstName: 'Mysore',
      lastName: 'City',
      scopedStateId: karnatakaStateId,
      scopedCityId: mysuruCityId,
      userVerified: true
    };

    if (cmUser) {
      console.log(`👤 City Manager already exists. Updating details...`);
      await cmUser.update(cmData);
    } else {
      console.log(`👤 Creating City Manager...`);
      cmUser = await User.create({
        uuid: generateUUID(),
        ...cmData
      });
    }
    console.log(`✅ City Manager: ${cmUser.email} (Password: ${cmUser.password})`);

    // 3. Map all vendors (integrations) to Mysore, Karnataka
    console.log('🏢 Re-mapping vendors to Mysuru, Karnataka...');
    const [updatedCount] = await Integration.update(
      {
        stateId: karnatakaStateId,
        cityId: mysuruCityId
      },
      {
        where: {
          isActive: true,
          [Op.and]: [
            { phoneNumber: { [Op.notIn]: ['9999999999', '+919999999999'] } },
            { role: { [Op.notIn]: ['super_admin'] } },
            { category: { [Op.notIn]: ['SuperAdmin', 'super_admin'] } }
          ]
        }
      }
    );

    console.log(`✅ Successfully updated ${updatedCount} vendors to Mysore, Karnataka!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

runSetup();
