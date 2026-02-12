const fs = require('fs');
const path = require('path');

// Configuration
const tools = [
    { id: 'yield', name: 'Calculadora Rendimento', file: 'index.html' },
    { id: 'tacos', name: 'Calculadora Tacos', file: 'tacos-calculator.html' },
    { id: 'box', name: 'Calculadora Caixas', file: 'box-calculator.html' },
    { id: 'weight', name: 'Calculadora Peso', file: 'weight-calculator.html' },
    { id: 'carrier', name: 'Gerador Transportadora', file: 'carrier-generator.html' },
    { id: 'faq', name: 'Catálogo / FAQ', file: 'faq.html' },
    { id: 'tax', name: 'Calculadora Impostos', file: 'tax-calculator.html' },
    { id: 'database', name: 'Banco de Dados', file: 'database.html' }
];

const commonCSSFile = 'style.css';
const productsJSFile = 'products.js';

// Helper to read file
function readFile(filename) {
    return fs.readFileSync(path.join(__dirname, filename), 'utf8');
}

// Main generation function
function generate() {
    console.log('Starting bundle generation...');

    const cssContent = readFile(commonCSSFile);
    const productsContent = readFile(productsJSFile);

    let framesData = {};

    tools.forEach(tool => {
        console.log(`Processing ${tool.name}...`);
        let html = readFile(tool.file);

        // 1. Inline CSS
        // Replace <link rel="stylesheet" href="style.css">
        html = html.replace(/<link rel="stylesheet" href="style.css">/g, `<style>${cssContent}</style>`);

        // 2. Hide Navigation and Footer in the iframe (since Bundle has its own)
        // Inject a style to hide .main-header and .main-footer
        const hideNavStyle = `<style>.main-header, .main-footer { display: none !important; } body { padding-top: 0 !important; } .background-decor { display: none !important; } .main-wrapper { margin-top: 0 !important; min-height: auto !important; }</style>`;
        html = html.replace('</head>', `${hideNavStyle}</head>`);

        // 3. Inline Products JS
        // Replace <script src="products.js"></script>
        html = html.replace(/<script src="products.js"><\/script>/g, `<script>${productsContent}</script>`);

        // 4. Inline Tool Specific JS
        // Find other scripts. Regex to find <script src="..."></script>
        // Note: We need to handle multiple scripts (like boxes.js + box-script.js)
        // We will execute a regex loop to find all script src tags
        const scriptRegex = /<script src="([^"]+)"><\/script>/g;
        let match;
        while ((match = scriptRegex.exec(html)) !== null) {
            const scriptName = match[1];
            if (scriptName === 'products.js') continue; // Already handled (though regex probably consumed it, so this might be redundant but safe)

            console.log(`  Inlining ${scriptName}...`);
            try {
                const scriptContent = readFile(scriptName);
                // Replace the *entire match* with the inline script
                // We restart the regex or just replace strings? string replace verify safety.
                // String replace is safer if filenames are unique.
                html = html.replace(`<script src="${scriptName}"></script>`, `<script>${scriptContent}</script>`);
            } catch (e) {
                console.error(`  Error reading ${scriptName}: ${e.message}`);
            }
        }

        // Save processed HTML
        framesData[tool.id] = html;
    });

    // Construct Master HTML
    const masterHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity Bundle</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --background-color: #f8f9fa;
            --text-color: #2c3e50;
            --text-muted: #6c757d;
            --border-color: #dee2e6;
            --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
        body { background: var(--background-color); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        
        /* Navigation */
        .bundle-nav {
            background: white;
            padding: 1rem;
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            border-bottom: 1px solid var(--border-color);
            box-shadow: var(--shadow-sm);
            flex-shrink: 0;
            justify-content: center;
        }
        .bundle-nav button {
            background: transparent;
            border: 1px solid var(--border-color);
            padding: 0.75rem 1.25rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-color);
            transition: all 0.2s;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .bundle-nav button:hover {
            background: #f1f3f5;
            border-color: #adb5bd;
        }
        .bundle-nav button.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        /* Content Area */
        .bundle-content {
            flex: 1;
            position: relative;
            background: #f0f2f5;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            position: absolute;
            top: 0;
            left: 0;
            background: transparent;
        }
        .hidden { display: none; }
    </style>
</head>
<body>

    <nav class="bundle-nav">
        ${tools.map((t, index) => `
        <button class="${index === 0 ? 'active' : ''}" onclick="switchTool('${t.id}')" id="btn-${t.id}">
            ${getIcon(t.id)} ${t.name}
        </button>`).join('')}
    </nav>

    <div class="bundle-content">
        ${tools.map((t, index) => `
        <iframe id="frame-${t.id}" class="${index === 0 ? '' : 'hidden'}" srcdoc="${escapeHtml(framesData[t.id])}"></iframe>
        `).join('')}
    </div>

    <script>
        function switchTool(id) {
            // Hide all frames
            document.querySelectorAll('iframe').forEach(f => f.classList.add('hidden'));
            // Remove active class from buttons
            document.querySelectorAll('.bundle-nav button').forEach(b => b.classList.remove('active'));
            
            // Show selected
            document.getElementById('frame-' + id).classList.remove('hidden');
            document.getElementById('btn-' + id).classList.add('active');
        }
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(__dirname, 'antigravity_bundle.html'), masterHTML);
    console.log('Bundle generated successfully: antigravity_bundle.html');
}

function getIcon(id) {
    const icons = {
        'yield': '<i class="fa-solid fa-calculator"></i>',
        'tacos': '<i class="fa-solid fa-layer-group"></i>',
        'box': '<i class="fa-solid fa-box-open"></i>',
        'weight': '<i class="fa-solid fa-weight-hanging"></i>',
        'carrier': '<i class="fa-solid fa-truck"></i>',
        'faq': '<i class="fa-solid fa-book-open"></i>',
        'tax': '<i class="fa-solid fa-file-invoice-dollar"></i>',
        'database': '<i class="fa-solid fa-database"></i>'
    };
    return icons[id] || '<i class="fa-solid fa-circle"></i>';
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

generate();
