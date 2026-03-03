const fs = require('fs');
fetch('http://localhost:3001/api/products')
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync('products_dump.json', JSON.stringify(data, null, 2));
    console.log("Dumped to products_dump.json");
  })
  .catch(err => console.error(err));
