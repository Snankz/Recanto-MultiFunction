const fs = require('fs');

const productsFile = 'products.js';

try {
    let content = fs.readFileSync(productsFile, 'utf8');

    // Extract array content loosely (assuming format 'const products = [...]')
    // We'll use a regex to find invalid barcodes and replace them in-place string manipulation
    // to preserve formatting/comments if possible, or we can parse/stringify.
    // Given the file structure is simple JS object literals, we can try to direct replace.

    // Simpler approach: Read, eval (in VM), modify, write back? 
    // Writing back JSON might lose the 'const products =' part or formatting.
    // Let's use regex replacement for specific fields.

    // Regex to find "barcode": "n/a"
    // matches: "barcode": "n/a" or 'barcode': 'n/a'
    const regex = /("barcode"\s*:\s*)["']n\/a["']/g;

    let count = 0;
    const newContent = content.replace(regex, (match, prefix) => {
        count++;
        // Generate a mock EAN-13: 789 + random 9 digits + check? 
        // For simplicity: 7890000000000 + count
        const mockEan = (7890000000000 + Date.now() + count).toString();
        return `${prefix}"${mockEan}"`;
    });

    if (count > 0) {
        fs.writeFileSync(productsFile, newContent, 'utf8');
        console.log(`Updated ${count} barcodes.`);
    } else {
        console.log("No 'n/a' barcodes found.");
    }

} catch (e) {
    console.error("Error:", e);
    process.exit(1);
}
