require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  console.log('Connected to DB');
  
  await c.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      dflag INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      flag INTEGER NOT NULL DEFAULT 0
    );
  `);
  console.log('Table created');

  await c.query(`
    INSERT INTO categories (name) VALUES 
      ('Electronics'), ('Fashion'), ('Home'), ('Beauty'), ('Sports'), 
      ('Grocery'), ('General'), ('Software'), ('Utensils')
    ON CONFLICT (name) DO NOTHING;
  `);
  console.log('Seed data inserted');
}

run()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => c.end());
