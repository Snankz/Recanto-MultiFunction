const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'products.js');
let productsContent = fs.readFileSync(productsPath, 'utf8');

const match = productsContent.match(/const products = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('Could not find products array');
    process.exit(1);
}

const products = eval(match[1]);

const hdflex = products.filter(p => p.brand.toLowerCase().includes('hdflex'));

if (hdflex.length === 0) {
    console.log('No HDFlex products found.');
} else {
    hdflex.forEach(p => console.log(JSON.stringify(p, null, 2)));
}
