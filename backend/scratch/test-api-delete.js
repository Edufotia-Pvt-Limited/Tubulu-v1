const axios = require('axios');
const { User, connectPostgres, sequelize } = require('./Utils/Postgres');

async function test() {
  await connectPostgres();
  
  // Create a temporary user
  const dummyUser = await User.create({
    uuid: 'test-uuid-9999',
    firstName: 'TestDelete',
    lastName: 'User',
    phoneNumber: '8888888888',
    email: 'testdelete@example.com',
    role: 'User'
  });
  console.log("Created dummy user:", dummyUser.id);
  
  // We need an admin token to perform the delete.
  // Instead of logging in, let's just write a test function in the server OR bypass auth.
  // Wait, I cannot easily bypass auth from a script sending HTTP request.
  
  // BUT I can just try calling the adminDeleteUser function directly.
  const adminController = require('./Controllers/Admin.controller');
  
  const req = { params: { id: dummyUser.id } };
  const res = { 
    status: (code) => { console.log('STATUS:', code); return res; },
    json: (data) => { console.log('JSON:', data); }
  };
  const next = (err) => { console.log('NEXT CALLED WITH ERROR:', err); };
  
  console.log("Calling adminDeleteUser directly...");
  await adminController.adminDeleteUser(req, res, next);
  
  // Clean up if it failed
  await User.destroy({ where: { id: dummyUser.id } }).catch(() => {});
  process.exit(0);
}
test();
