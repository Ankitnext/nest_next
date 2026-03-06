const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function query() {
  await client.connect();
  const res = await client.query(`SELECT id, email, role, 'users' as tbl FROM users LIMIT 10`);
  console.log('Users:', res.rows);
  const res2 = await client.query(`SELECT id, email, vehicle_type, 'delivery_boys' as tbl FROM delivery_boys LIMIT 10`);
  console.log('Delivery:', res2.rows);
  const res3 = await client.query(`SELECT id, email, 'admin' as tbl FROM admins LIMIT 10`);
  console.log('Admins:', res3.rows);
  await client.end();
}

query().catch(console.error);
