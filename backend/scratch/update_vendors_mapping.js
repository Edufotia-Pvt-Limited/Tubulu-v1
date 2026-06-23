const { Integration, City, State } = require('../Utils/Postgres');

async function mapVendors() {
    console.log('🔄 Mapping vendors by name matching...');
    const integrations = await Integration.findAll();
    
    // Find cities
    const mysuru = await City.findOne({ where: { name: 'Mysuru' } });
    const bengaluru = await City.findOne({ where: { name: 'Bengaluru' } });
    
    if (!mysuru || !bengaluru) {
        console.error("Cities not found!");
        process.exit(1);
    }
    
    const karnataka = await State.findOne({ where: { name: 'Karnataka' } });
    const countryId = karnataka ? karnataka.countryId : null;

    let mysuruCount = 0;
    let bengaluruCount = 0;

    for (const vendor of integrations) {
        const nameLower = vendor.integrationName.toLowerCase();
        
        // Mysuru keywords
        const isMysuru = nameLower.includes('mysore') || 
                         nameLower.includes('mysuru') || 
                         nameLower.includes('chamundi') || 
                         nameLower.includes('vijayanagar') || 
                         nameLower.includes('cauvery') ||
                         nameLower.includes('heritage') ||
                         nameLower.includes('organic') ||
                         nameLower.includes('green') ||
                         nameLower.includes('spice') ||
                         nameLower.includes('gourmet') ||
                         nameLower.includes('need') ||
                         nameLower.includes('provision') ||
                         nameLower.includes('idli');
                         
        // Bengaluru keywords
        const isBengaluru = nameLower.includes('indiranagar') || 
                            nameLower.includes('anand') || 
                            nameLower.includes('pradeep') || 
                            nameLower.includes('bangalore');

        if (isBengaluru) {
            await vendor.update({
                city: 'Bengaluru',
                state: 'Karnataka',
                cityId: bengaluru.id,
                stateId: bengaluru.stateId,
                countryId: countryId
            });
            bengaluruCount++;
        } else if (isMysuru) {
            await vendor.update({
                city: 'Mysuru',
                state: 'Karnataka',
                cityId: mysuru.id,
                stateId: mysuru.stateId,
                countryId: countryId
            });
            mysuruCount++;
        }
    }

    console.log(`✅ Mapped ${mysuruCount} vendors to Mysuru.`);
    console.log(`✅ Mapped ${bengaluruCount} vendors to Bengaluru.`);
    process.exit(0);
}

mapVendors();
