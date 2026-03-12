const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_4sL2CKXfBFMG@ep-long-hat-aifqypcc-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to Neon DB');
    client.end();
  })
  .catch(err => {
    console.error('ERROR: Connection failed', err);
  });
