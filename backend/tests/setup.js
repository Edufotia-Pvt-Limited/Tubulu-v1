const { sequelize } = require('../Utils/Postgres');

afterAll(async () => {
    // Close the database connection after all tests complete
    await sequelize.close();
});
