const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('tubulu_db', 'tubulu_admin', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

const updates = {
  'prod_c8769bce45cfe3d3': ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'],
  'prod_2056c34994815b36': ['https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop'],
  'prod_393f23f975b22326': ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop'],
  'prod_8c0e42a6419dcdf6': ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop'],
  'prod_39151eafa772e0cc': ['https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop'],
  'prod_8c85e274fc17b846': ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'],
  'prod_b30cb253310703e8': ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop'],
  'prod_66dcb738fcdf783b': ['https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop'],
  'prod_8cfa157b84d40b72': ['https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop'],
  'prod_a293b7a4a8b5cd2c': ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop'],
};

async function run() {
  for (const [id, urls] of Object.entries(updates)) {
    await sequelize.query(
      `UPDATE "Products" SET "imageUrls" = :urls WHERE id = :id`,
      {
        replacements: { urls: JSON.stringify(urls), id },
      }
    );
  }
  console.log("Images updated successfully!");
  process.exit(0);
}
run();
