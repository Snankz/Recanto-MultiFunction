const fs = require('fs');
const path = require('path');

// Read existing products.js
const productsPath = path.join(__dirname, 'products.js');
let productsContent = fs.readFileSync(productsPath, 'utf8');

// Use a more robust CommonJS export conversion
const tempFilePath = path.join(__dirname, 'temp_products.js');
// Replace the declaration with module.exports
const moduleContent = productsContent.replace('const products =', 'module.exports =');
fs.writeFileSync(tempFilePath, moduleContent);

let products;
try {
    products = require(tempFilePath);
} catch (error) {
    console.error("Error parsing products.js:", error);
    process.exit(1);
} finally {
    // Cleanup
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }
}

console.log(`Found ${products.length} products.`);

// 1. Generate JSON for Import
const jsonOutputPath = path.join(__dirname, 'supabase_products.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(products, null, 2));
console.log(`JSON data written to ${jsonOutputPath}`);

// 2. Generate SQL Schema
// Infer schema from the first full record or merge fields from all
const allKeys = new Set();
products.forEach(p => Object.keys(p).forEach(k => allKeys.add(k)));

// Map JS types to SQL types
function getSqlType(key, value) {
    if (key === 'id') return 'TEXT PRIMARY KEY';
    if (typeof value === 'number') return 'NUMERIC';
    if (typeof value === 'boolean') return 'BOOLEAN';
    // Default to TEXT for strings and others
    return 'TEXT';
}

// Build CREATE TABLE statement
let sql = `CREATE TABLE public.products (\n`;
const columnDefs = [];

// Allow manual overrides for specific fields if known
const typeOverrides = {
    weight: 'NUMERIC',
    value: 'NUMERIC',
    measure_unit: 'TEXT',
    // ...
};

// We iterate "allKeys" to ensure we cover every field found in the data
Array.from(allKeys).sort().forEach(key => {
    // Find a sample value (first non-null/undefined)
    const sampleProduct = products.find(p => p[key] !== undefined && p[key] !== null);
    const sampleValue = sampleProduct ? sampleProduct[key] : '';

    let sqlType = typeOverrides[key] || getSqlType(key, sampleValue);
    columnDefs.push(`    "${key}" ${sqlType}`);
});

sql += columnDefs.join(',\n');
sql += `\n);\n\n`;

// Enable Row Level Security (good practice)
sql += `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;\n`;
sql += `CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);\n`;

const sqlOutputPath = path.join(__dirname, 'supabase_schema.sql');
fs.writeFileSync(sqlOutputPath, sql);
console.log(`SQL schema written to ${sqlOutputPath}`);
