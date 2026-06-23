const { City } = require('../Utils/Postgres');

const stateId = 'fb954aae-56d1-4459-8779-401dc00873ec'; // Karnataka
const districts = [
  'Bagalkot',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagar',
  'Chikkaballapur',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayanagara',
  'Vijayapura',
  'Yadgir'
];

async function seed() {
  console.log("Seeding Karnataka districts...");
  for (const name of districts) {
    try {
      const [city, created] = await City.findOrCreate({
        where: { name, stateId },
        defaults: { name, stateId, isActive: true }
      });
      if (created) {
        console.log(`Created city: ${name}`);
      } else {
        console.log(`City already exists: ${name}`);
      }
    } catch (err) {
      console.error(`Error creating city ${name}:`, err.message);
    }
  }
  console.log("Seeding completed!");
  process.exit(0);
}

seed();
