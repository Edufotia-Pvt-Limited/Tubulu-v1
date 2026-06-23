const { User, connectPostgres } = require('./Utils/Postgres');
const adminController = require('./Controllers/Admin.controller');

async function run() {
  await connectPostgres();
  
  // Create a dummy user
  const dummyUser = await User.create({
    uuid: 'test-uuid-1234',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '9999999999',
    email: 'test@example.com',
    role: 'User'
  });
  console.log("Created dummy user with id:", dummyUser.id);
  
  // Try to delete via destroy
  try {
    await User.destroy({ where: { id: dummyUser.id } });
    console.log("Successfully deleted dummy user.");
  } catch (err) {
    console.error("Failed to delete user:", err.message);
  }
  process.exit(0);
}
run();
