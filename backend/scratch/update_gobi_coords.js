const { Integration } = require('/Users/pradeep/Desktop/Tubulu-v1/backend/Utils/Postgres');
const { getGeolocation } = require('/Users/pradeep/Desktop/Tubulu-v1/backend/Utils/map');

async function run() {
  try {
    const integrations = await Integration.findAll({
      where: {
        latitude: null
      }
    });
    console.log(`Found ${integrations.length} integrations with null coordinates.`);

    for (const integration of integrations) {
      const addressParts = [
        integration.addressLine,
        integration.city,
        integration.state,
        integration.pincode
      ].filter(Boolean);

      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(', ');
        console.log(`Geocoding "${integration.integrationName}" address: "${fullAddress}"...`);
        try {
          const geo = await getGeolocation(fullAddress);
          await integration.update({
            latitude: geo.lat,
            longitude: geo.lng
          });
          console.log(`Successfully updated "${integration.integrationName}" to lat: ${geo.lat}, lng: ${geo.lng}`);
        } catch (err) {
          console.error(`Failed to geocode address for "${integration.integrationName}":`, err.message);
        }
      } else {
        // Fallback to Mysore coordinates
        console.log(`No address fields for "${integration.integrationName}". Defaulting to Mysore coordinates.`);
        await integration.update({
          latitude: 12.3237008,
          longitude: 76.6022778
        });
      }
    }
    console.log("All done!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
