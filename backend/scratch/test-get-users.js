const { User, connectPostgres } = require('./Utils/Postgres');

async function test() {
  await connectPostgres();
  const users = await User.findAll({ limit: 1 });
  console.log("First user:", JSON.stringify(users[0].toJSON(), null, 2));
  process.exit(0);
}
test();
