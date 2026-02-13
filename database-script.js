document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('products-list');
    const saveBtn = document.getElementById('save-db-btn');

    let products = [];

    async function init() {
        if (window.fetchProducts) {
            products = await window.fetchProducts();
        } else {
            console.error("fetchProducts function not found.");
            showError("Erro: Cliente Supabase não encontrado.");
            return;
        }

        if (!products || products.length === 0) {
            showEmpty();
            return;
        }

        // Attach to window for potential debugging or save logic reuse if needed
        window.productsData = products;
        renderProducts();
    }

    init();

    function showError(msg) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #dc3545;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Erro ao carregar banco de dados</h2>
                <p>${msg}</p>
            </div>
        `;
    }

    function showEmpty() {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Nenhum produto encontrado</h2>
                <p>A lista de produtos está vazia no Supabase.</p>
            </div>
        `;
    }

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

            // Group 1.5: Prices
            addTitle('Preços');
            rightCol.appendChild(createInput(index, 'cost_price', 'Preço de Custo (R$)', p.cost_price, 'number'));
            rightCol.appendChild(createInput(index, 'sale_price', 'Preço de Venda (R$)', p.sale_price, 'number'));

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

    // --- NEW PRODUCT MODAL LOGIC ---
    const newProductBtn = document.getElementById('new-product-btn');
    const modal = document.getElementById('new-product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const newProductForm = document.getElementById('new-product-form');
    const confirmAddBtn = document.getElementById('confirm-add-btn');

    newProductBtn.addEventListener('click', () => {
        renderNewProductForm();
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    function renderNewProductForm() {
        newProductForm.innerHTML = '';

        // Essential fields for creation
        const fields = [
            { id: 'new_id', label: 'ID (Único, sem espaços)', type: 'text', required: true },
            { id: 'new_name', label: 'Nome do Produto', type: 'text', required: true },
            { id: 'new_brand', label: 'Marca', type: 'text', required: true },
            { id: 'new_cost_price', label: 'Preço Custo', type: 'number' },
            { id: 'new_sale_price', label: 'Preço Venda', type: 'number' },
            { id: 'new_weight', label: 'Peso', type: 'number' },
            { id: 'new_measure_unit', label: 'Unidade (l/kg)', type: 'text', val: 'l' }
        ];

        fields.forEach(f => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label>${f.label}</label>
                <input type="${f.type}" id="${f.id}" ${f.required ? 'required' : ''} value="${f.val || ''}">
            `;
            newProductForm.appendChild(div);
        });
    }

    confirmAddBtn.addEventListener('click', async () => {
        const id = document.getElementById('new_id').value.trim();
        const name = document.getElementById('new_name').value.trim();
        const brand = document.getElementById('new_brand').value.trim();

        if (!id || !name || !brand) {
            alert("Preencha ID, Nome e Marca.");
            return;
        }

        const newObj = {
            id: id,
            name: name,
            brand: brand,
            cost_price: parseFloat(document.getElementById('new_cost_price').value) || 0,
            sale_price: parseFloat(document.getElementById('new_sale_price').value) || 0,
            weight: parseFloat(document.getElementById('new_weight').value) || 0,
            measure_unit: document.getElementById('new_measure_unit').value || 'l',
            // Defaults
            type: 'coverage',
            value: 0,
            unit: 'M²/L'
        };

        confirmAddBtn.disabled = true;
        confirmAddBtn.innerText = "Criando...";

        try {
            const { error } = await window.supabaseClient
                .from('products')
                .insert(newObj);

            if (error) throw error;

            alert("Produto criado com sucesso!");
            modal.style.display = 'none';
            // Refresh list
            init();

        } catch (e) {
            console.error(e);
            alert("Erro ao criar produto: " + e.message);
        } finally {
            confirmAddBtn.disabled = false;
            confirmAddBtn.innerText = "Confirmar Cadastro";
        }
    });

    renderProducts();

    // Save Logic - Upload to Supabase
    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            if (!window.supabaseClient) {
                throw new Error("Cliente Supabase não inicializado.");
            }

            // Upsert all products
            // Note: For large datasets, batching might be needed, but for 60 items it's fine.
            const { data, error } = await window.supabaseClient
                .from('products')
                .upsert(products, { onConflict: 'id' });

            if (error) throw error;

            alert("Banco de dados atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert("Erro ao salvar no banco de dados: " + (err.message || err));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Salvar Alterações (Supabase)';
        }
    });

    // Deprecated file download logic removed

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
