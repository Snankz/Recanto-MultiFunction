const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'products.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace fisqp: "#" with fisqp: "#",\n        bulletin: "#"
// handling potential variations in whitespace if any, though I just wrote it standard.
// The file has 8 spaces indent.

// Use a strict replacement since I know the format I generated
const target = 'fisqp: "#"';
const replacement = 'fisqp: "#",\n        bulletin: "#"';

if (content.includes(target)) {
    const newContent = content.replaceAll(target, replacement);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Updated products.js");
} else {
    console.log("Target string not found, maybe already updated?");
}
