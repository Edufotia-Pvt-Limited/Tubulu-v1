require('dotenv').config();
const { connectPostgres, Integration } = require('../Utils/Postgres');
const { reverseGeocode } = require('../Utils/map');

async function backfillAddresses() {
    await connectPostgres();

    // Fetch all integrations
    const integrations = await Integration.findAll();
    console.log(`Found ${integrations.length} integrations to process.`);

    for (const integration of integrations) {
        console.log(`\n----------------------------------------`);
        console.log(`Processing ID: ${integration.id} - Name: ${integration.integrationName}`);
        console.log(`Current: Country: "${integration.country}", Address: "${integration.addressLine}", Pincode: "${integration.pincode}", Lat: ${integration.latitude}, Lng: ${integration.longitude}`);

        let newCountry = "India";
        let newAddress = integration.addressLine;
        let newPincode = integration.pincode;
        let newCity = integration.city;
        let newState = integration.state;

        // Ensure country is set to India
        if (!newCountry || newCountry.trim() === '') {
            newCountry = "India";
        }

        const hasCoords = integration.latitude && integration.longitude && 
                          Math.abs(parseFloat(integration.latitude)) > 0.0001 && 
                          Math.abs(parseFloat(integration.longitude)) > 0.0001;

        if (hasCoords) {
            try {
                console.log(`Attempting reverse geocoding for coordinates (${integration.latitude}, ${integration.longitude})...`);
                const geo = await reverseGeocode(integration.latitude, integration.longitude);
                if (geo && geo.components) {
                    const comp = geo.components;
                    
                    // Extract values from geocoding components
                    const resolvedPincode = comp.postcode || '';
                    const resolvedCity = comp.city || comp.town || comp.village || comp.county || '';
                    const resolvedState = comp.state || '';
                    
                    // Address Line parts: road, suburb, neighbourhood
                    const roadParts = [];
                    if (comp.road) roadParts.push(comp.road);
                    if (comp.suburb) roadParts.push(comp.suburb);
                    if (comp.neighbourhood) roadParts.push(comp.neighbourhood);
                    
                    let resolvedAddress = roadParts.join(', ');
                    if (!resolvedAddress) {
                        resolvedAddress = geo.formatted || 'Karnataka, India';
                    }

                    // Update values if currently empty/invalid
                    if (!newAddress || newAddress.trim() === '') {
                        newAddress = resolvedAddress;
                    }
                    if (!newPincode || newPincode.trim() === '' || newPincode.length !== 6) {
                        newPincode = resolvedPincode;
                    }
                    if (!newCity || newCity.trim() === '') {
                        newCity = resolvedCity;
                    }
                    if (!newState || newState.trim() === '') {
                        newState = resolvedState;
                    }
                }
            } catch (err) {
                console.error(`Reverse geocoding failed: ${err.message}`);
            }
        }

        // Apply fallback defaults if still empty
        if (!newAddress || newAddress.trim() === '') {
            newAddress = "Mysore Center";
        }
        if (!newPincode || newPincode.trim() === '' || newPincode.length !== 6) {
            newPincode = "570001"; // Fallback Mysuru pincode
        }
        if (!newCity || newCity.trim() === '') {
            newCity = "Mysuru";
        }
        if (!newState || newState.trim() === '') {
            newState = "Karnataka";
        }

        console.log(`Updated to: Country: "${newCountry}", Address: "${newAddress}", Pincode: "${newPincode}", City: "${newCity}", State: "${newState}"`);

        await integration.update({
            country: newCountry,
            addressLine: newAddress,
            pincode: newPincode,
            city: newCity,
            state: newState
        });
    }

    console.log(`\n----------------------------------------`);
    console.log(`Successfully completed backfilling addresses!`);
    process.exit(0);
}

backfillAddresses().catch(err => {
    console.error(`Script error:`, err);
    process.exit(1);
});
