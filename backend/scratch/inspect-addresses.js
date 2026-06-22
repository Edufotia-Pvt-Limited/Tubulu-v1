const { User } = require('./Utils/Postgres');

async function run() {
  try {
    const users = await User.findAll();
    console.log("Total users found:", users.length);
    for (const u of users) {
      console.log(`User: ${u.id} | Phone: ${u.phoneNumber} | Role: ${u.role}`);
      console.log("Addresses:", JSON.stringify(u.addresses, null, 2));
      console.log("----------------------------------------");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

run();
