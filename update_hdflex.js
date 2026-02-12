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

// Update existing Wood Glue
const woodGlue = products.find(p => p.id === 'hdflex-cola-pu');
if (woodGlue) {
    woodGlue.name = "Cola PU HD Flex (Pisos de Madeira)";
    woodGlue.model = "5kg"; // Bucket size
    woodGlue.usage = "Fixação de pisos de madeira";
}

// Add Vinyl Glue if not exists
let vinylGlue = products.find(p => p.id === 'hdflex-cola-vinilico');
if (!vinylGlue) {
    vinylGlue = {
        "id": "hdflex-cola-vinilico",
        "name": "Cola para Piso Vinílico HD Flex",
        "brand": "HDFlex",
        "image": "img/HDFlex_ColaVinilico.jpg", // Placeholder
        "weight": 4, // 4kg bucket
        "measure_unit": "kg",
        "type": "consumption",
        "value": 4, // Approx 4 m²/kg (250g/m²)
        "unit": "M²/Kg",
        "ncm": "3506.91.90",
        "cest": "28.063.00",
        "barcode": "n/a",
        "model": "4kg/20kg",
        "category": "Adesivo",
        "coverage": "4 M²/Kg",
        "roller": "Espátula Dentada",
        "fisqp": "#",
        "bulletin": "#",
        "composition": "Acrílica Base Água",
        "odor": "Baixo",
        "color": "Branco",
        "consistency": "Pastosa",
        "tonality": "n/a",
        "drying_time": "1 Hora (Formação de película) / 24 Horas (Total)",
        "cure_time": "24 Horas",
        "resistance": "Alto Tráfego",
        "special_resistance": "Umidade"
    };
    products.push(vinylGlue);
}

// Sort products by id to keep it tidy? Or just append.
// Keeping order roughly as is.

const newContent = `const products = ${JSON.stringify(products, null, 4)};

// Tornar global para acesso em outros scripts
if (typeof window !== 'undefined') {
    window.productsData = products;
}
`;

fs.writeFileSync(productsPath, newContent);
console.log('Updated HDFlex Products');
