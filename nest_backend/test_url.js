const https = require('http');
https.get('http://localhost:3001/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const products = JSON.parse(data);
    const laptop = products.find(p => p.name.includes('Laptop'));
    console.log("---- LAPTOP RENDER PAYLOAD ----");
    console.log("URL:", laptop.image);
    console.log("-------------------------------");
  });
});
