document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('products-list');
    const saveBtn = document.getElementById('save-db-btn');

    if (!window.productsData || !Array.isArray(window.productsData)) {
        console.error("Erro CRÍTICO: window.productsData não encontrado ou inválido.", window.productsData);
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #dc3545;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Erro ao carregar banco de dados</h2>
                <p>O arquivo products.js não foi carregado corretamente ou está vazio.</p>
                <p>Verifique o console (F12) para mais detalhes.</p>
            </div>
        `;
        return;
    }

    if (window.productsData.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Nenhum produto encontrado</h2>
                <p>A lista de produtos está vazia.</p>
            </div>
        `;
        return;
    }

    let products = window.productsData;

    function renderProducts() {
        listContainer.innerHTML = '';

        products.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Left Col: Image & ID
            const leftCol = document.createElement('div');
            leftCol.innerHTML = `
                <img src="${p.image || 'https://placehold.co/200x200'}" class="product-img-preview">
                <div class="form-group">
                    <label>ID (Não editar)</label>
                    <input type="text" value="${p.id}" disabled style="background: #eee;">
                </div>
            `;

            // Right Col: Form
            const rightCol = document.createElement('div');
            rightCol.className = 'form-grid';

            // Define fields to edit
            // Group 1: Basic Info
            // Helper for titles
            const addTitle = (text) => {
                const div = document.createElement('div');
                div.className = 'section-title';
                div.textContent = text;
                rightCol.appendChild(div);
            };

            // Define fields to edit
            // Group 1: Basic Info
            addTitle('Informações Básicas');
            rightCol.appendChild(createInput(index, 'name', 'Nome', p.name));
            rightCol.appendChild(createInput(index, 'brand', 'Marca', p.brand));
            rightCol.appendChild(createInput(index, 'image', 'Caminho Imagem', p.image));

            // Group 2: Calculator Data
            addTitle('Dados para Calculadora');
            rightCol.appendChild(createInput(index, 'type', 'Tipo (coverage/consumption)', p.type));
            rightCol.appendChild(createInput(index, 'value', 'Valor Rendimento', p.value, 'number'));
            rightCol.appendChild(createInput(index, 'unit', 'Unidade Rend. (ex: M²/L)', p.unit));
            rightCol.appendChild(createInput(index, 'weight', 'Peso Bruto', p.weight, 'number'));
            rightCol.appendChild(createInput(index, 'measure_unit', 'Unidade Medida (l/kg)', p.measure_unit));

            // Group 3: Technical Specs
            addTitle('Ficha Técnica');
            rightCol.appendChild(createInput(index, 'ncm', 'NCM', p.ncm));
            rightCol.appendChild(createInput(index, 'cest', 'CEST', p.cest));
            rightCol.appendChild(createInput(index, 'barcode', 'Cód. Barras', p.barcode));
            rightCol.appendChild(createInput(index, 'model', 'Modelo', p.model));
            rightCol.appendChild(createInput(index, 'category', 'Categoria', p.category));
            rightCol.appendChild(createInput(index, 'coverage', 'Rendimento Texto', p.coverage));
            rightCol.appendChild(createInput(index, 'roller', 'Ferramenta', p.roller));
            rightCol.appendChild(createInput(index, 'composition', 'Composição', p.composition));
            rightCol.appendChild(createInput(index, 'odor', 'Odor', p.odor));
            rightCol.appendChild(createInput(index, 'color', 'Cor Líquida', p.color));
            rightCol.appendChild(createInput(index, 'consistency', 'Consistência', p.consistency));
            rightCol.appendChild(createInput(index, 'tonality', 'Tom Final', p.tonality));
            rightCol.appendChild(createInput(index, 'drying_time', 'Secagem', p.drying_time));
            rightCol.appendChild(createInput(index, 'cure_time', 'Cura Total', p.cure_time));
            rightCol.appendChild(createInput(index, 'resistance', 'Resistência', p.resistance));
            rightCol.appendChild(createInput(index, 'special_resistance', 'Res. Especial', p.special_resistance));

            // Group 4: Documents
            addTitle('Documentos (Links)');
            rightCol.appendChild(createInput(index, 'fisqp', 'Link FISQP', p.fisqp));
            rightCol.appendChild(createInput(index, 'bulletin', 'Link Boletim', p.bulletin));

            card.appendChild(leftCol);
            card.appendChild(rightCol);
            listContainer.appendChild(card);
        });
    }

    function createInput(index, field, label, value, type = 'text') {
        const div = document.createElement('div');
        div.className = 'form-group';

        const lbl = document.createElement('label');
        lbl.textContent = label;

        const input = document.createElement('input');
        input.type = type;
        input.value = value || '';
        input.dataset.index = index;
        input.dataset.field = field;

        input.addEventListener('change', (e) => {
            const idx = e.target.dataset.index;
            const fld = e.target.dataset.field;
            let val = e.target.value;

            if (type === 'number') val = parseFloat(val);

            products[idx][fld] = val;
            console.log(`Updated ${fld} for item ${idx} to ${val}`);
        });

        div.appendChild(lbl);
        div.appendChild(input);
        return div;
    }

    renderProducts();

    // Save Logic
    saveBtn.addEventListener('click', () => {
        // 1. Sort Data
        products.sort((a, b) => {
            if (a.brand < b.brand) return -1;
            if (a.brand > b.brand) return 1;
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        // 2. Format JS File Content
        const fileContent = generateJSContent(products);

        // 3. Trigger Download
        const blob = new Blob([fileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("Arquivo products.js baixado! Substitua o arquivo original na pasta do projeto.");
    });

    function generateJSContent(data) {
        // Identical formatter to the node script used before

        function formatProduct(p) {
            const keysOrder = [
                'id', 'name', 'brand', 'image',
                'weight', 'measure_unit', 'type', 'value', 'unit',
                'ncm', 'cest', 'barcode', 'model', 'category',
                'coverage', 'roller', 'fisqp', 'bulletin',
                'composition', 'odor', 'color', 'consistency', 'tonality',
                'drying_time', 'cure_time', 'resistance', 'special_resistance'
            ];

            let lines = [];

            // Standard keys
            keysOrder.forEach(key => {
                let val = p[key];
                // Ensure quotes for strings
                let valStr = JSON.stringify(val);
                lines.push(`        ${key}: ${valStr}`);
            });

            // Extra keys
            Object.keys(p).forEach(key => {
                if (!keysOrder.includes(key) && key !== 'note') {
                    let val = p[key];
                    let valStr = JSON.stringify(val);
                    lines.push(`        ${key}: ${valStr}`);
                }
            });

            if (p.note) {
                lines.push(`        note: ${JSON.stringify(p.note)}`);
            }

            return `    {\n${lines.join(',\n')}\n    }`;
        }

        let output = 'const products = [\n';
        let currentBrand = '';

        data.forEach((p) => {
            if (p.brand !== currentBrand) {
                currentBrand = p.brand;
                output += `    // --- ${currentBrand.toUpperCase()} ---\n`;
            }
            output += formatProduct(p);
            output += ',\n';
        });

        output += '];\n\nwindow.productsData = products;\n';
        return output;
    }
});
