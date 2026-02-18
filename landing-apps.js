
// --- SHARED DATA & STATE ---
let allProducts = []; // Shared product list
let currentApp = 'app-rendimento'; // Default app

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Load Products (Shared)
    await loadSharedProducts();

    // 2. Setup Navigation
    setupNavigation();

    // 3. Setup App Logics
    // 3. Setup App Logics
    try { setupRendimentoApp(); } catch (e) { console.error("Error in Rendimento:", e); }
    try { setupTacosApp(); } catch (e) { console.error("Error in Tacos:", e); }
    try { setupCaixasApp(); } catch (e) { console.error("Error in Caixas:", e); }
    try { setupPesoApp(); } catch (e) { console.error("Error in Peso:", e); }
    try { setupCarrierApp(); } catch (e) { console.error("CRITICAL Error in Carrier:", e); }
    try { setupLabelsApp(); } catch (e) { console.error("Error in Labels:", e); }
    try { setupNewsletterApp(); } catch (e) { console.error("Error in Newsletter:", e); }
    try { setupFaqApp(); } catch (e) { console.error("Error in FAQ:", e); }
    try { setupTaxApp(); } catch (e) { console.error("Error in Tax:", e); }
    try { setupDatabaseApp(); } catch (e) { console.error("Error in DB:", e); }

    // 4. Initial Animation
    showApp('app-rendimento');
});

// --- HELPER: Load Products ---
async function loadSharedProducts() {
    try {
        if (typeof products !== 'undefined' && Array.isArray(products)) {
            allProducts = products.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            console.warn("products.js not loaded or empty.");
            allProducts = [];
        }
    } catch (e) {
        console.error("Error loading products:", e);
    }
}

// --- HELPER: Navigation & Animation ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Identify target app from data-target
            const targetId = link.dataset.target;

            // If it's a valid app switch
            if (targetId) {
                e.preventDefault();

                if (targetId !== currentApp) {
                    // Update active state
                    navLinks.forEach(n => n.classList.remove('active'));
                    link.classList.add('active');
                    switchApp(targetId);
                }
            }
            // Else: Let it be a normal link (e.g. external shop)
        });
    });
}

function switchApp(targetId) {
    const oldApp = document.getElementById(currentApp);
    const newApp = document.getElementById(targetId);

    if (!oldApp || !newApp) return;

    // 1. Hide Old
    oldApp.classList.add('hidden');

    // 2. Reset Old App Inputs (Generic reset)
    resetInputs(oldApp);

    // 3. Show New App with Animation
    newApp.classList.remove('hidden');
    newApp.style.animation = 'none';
    newApp.offsetHeight; /* trigger reflow */
    newApp.style.animation = 'appZoomIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

    currentApp = targetId;
}

function showApp(id) {
    const app = document.getElementById(id);
    if (app) {
        app.classList.remove('hidden');
        app.style.animation = 'appZoomIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    }
}

function resetInputs(container) {
    // Skip reset for Carrier App to persist data
    if (container.id === 'app-carrier') return;

    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => input.value = '');
    // Specific resets per app could go here
    const results = container.querySelectorAll('.search-dropdown, .result-card');
    results.forEach(el => el.classList.add('hidden'));
}


// --- APP 1: RENDIMENTO ---
function setupRendimentoApp() {
    const searchInput = document.getElementById('rendimento-search');
    const resultsDiv = document.getElementById('rendimento-results');
    const areaInput = document.getElementById('rendimento-area');
    const resultCard = document.getElementById('rendimento-result-card');

    // Tech Grid Elements
    const detailName = document.getElementById('rendimento-detail-name');
    const detailBrand = document.getElementById('rendimento-detail-brand');
    const detailImage = document.getElementById('rendimento-detail-image');
    const techGrid = document.getElementById('rendimento-tech-grid');
    const btnFisqp = document.getElementById('btn-fisqp');
    const btnBulletin = document.getElementById('btn-bulletin');

    let selectedProd = null;

    // Generic Search Handler
    function handleSearch(query) {
        if (query.length === 0) {
            renderDropdown(allProducts.slice(0, 50), resultsDiv, onSelectProduct);
        } else {
            const matches = allProducts.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
            renderDropdown(matches, resultsDiv, onSelectProduct);
        }
    }

    searchInput.addEventListener('focus', () => handleSearch(searchInput.value.toLowerCase()));
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value.toLowerCase()));

    searchInput.addEventListener('blur', () => {
        setTimeout(() => resultsDiv.classList.add('hidden'), 200);
    });

    function onSelectProduct(prod) {
        selectedProd = prod;
        searchInput.value = prod.name;
        resultsDiv.classList.add('hidden');

        // Toggle Views
        const dp = document.getElementById('rendimento-product-details');
        const ip = document.getElementById('rendimento-intro-placeholder');

        if (dp) dp.classList.remove('hidden');
        if (ip) ip.classList.add('hidden');

        // Banner Info
        if (detailName) detailName.textContent = prod.name;
        if (detailBrand) detailBrand.textContent = prod.brand;
        if (detailImage) detailImage.src = prod.image || 'img/placeholder.png';

        // Populate Tech Grid
        if (techGrid) {
            // Fields mapping based on requested image layout
            const fields = [
                { label: 'MODELO', val: prod.model },
                { label: 'CATEGORIA', val: prod.category },
                { label: 'CÓDIGO BARRAS', val: prod.barcode },
                { label: 'NCM', val: prod.ncm },
                { label: 'CEST', val: prod.cest },
                { label: 'PESO / VOL.', val: prod.weight ? `${prod.weight} ${prod.measure_unit || ''}`.toUpperCase() : null },
                { label: 'RENDIMENTO', val: prod.coverage },
                { label: 'FERRAMENTA', val: prod.roller },
                { label: 'COMPOSIÇÃO', val: prod.composition, full: true },
                { label: 'ODOR', val: prod.odor },
                { label: 'COR LÍQUIDA', val: prod.color },
                { label: 'CONSISTÊNCIA', val: prod.consistency },
                { label: 'TOM FINAL', val: prod.tonality },
                { label: 'TEMPO SECAGEM', val: prod.drying_time },
                { label: 'CURA TOTAL', val: prod.cure_time },
                { label: 'RESISTÊNCIA', val: prod.resistance },
                { label: 'RES. ESPECIAL', val: prod.special_resistance }
            ];

            techGrid.innerHTML = fields.map(f => {
                if (!f.val || f.val === 'n/a') return '';
                const widthClass = f.full ? 'full-width' : '';
                return `
                    <div class="tech-item ${widthClass}">
                        <div class="tech-label">${f.label}</div>
                        <div class="tech-value">${f.val}</div>
                    </div>
                `;
            }).join('');
        }

        // Buttons
        if (btnFisqp) {
            if (prod.fisqp) {
                btnFisqp.href = prod.fisqp;
                btnFisqp.classList.remove('hidden');
            } else {
                btnFisqp.classList.add('hidden');
            }
        }
        if (btnBulletin) {
            if (prod.bulletin) {
                btnBulletin.href = prod.bulletin;
                btnBulletin.classList.remove('hidden');
            } else {
                btnBulletin.classList.add('hidden');
            }
        }

        calculateRendimento();
    }

    if (areaInput) areaInput.addEventListener('input', calculateRendimento);

    function calculateRendimento() {
        if (!selectedProd || !areaInput.value) {
            resultCard.classList.add('hidden');
            return;
        }

        const area = parseFloat(areaInput.value);
        let val = 0;
        let unit = 'unidades';

        // Simple logic based on original script
        if (selectedProd.type === 'coverage') {
            // If coverage is "10" (means 10 m²/L), and we have area.
            // But products.value stores the coverage numeric usually?
            // Checking products.js: "value": 10, "unit": "M²/L".
            // So needed liters = area / value.
            // THEN needed units depends on container size (weight/volume). 
            // Simplified logic as per previous version:
            val = area / (selectedProd.value || 10);
            unit = 'Litros'; // Approximate if calculating volume

            // If user wants Units, we'd need to div by container size. 
            // Previous code just did val = area / selectedProd.value. 
            // Let's stick to that but display decimal.
        } else {
            val = area * (selectedProd.value || 1); // Fallback
        }

        // Rounding
        val = Math.ceil(val * 100) / 100;

        document.getElementById('rendimento-total-val').textContent = val.toFixed(2);
        document.getElementById('rendimento-total-unit').textContent = unit;
        resultCard.classList.remove('hidden');
    }
}


// --- GENERIC DROPDOWN RENDERER ---
function renderDropdown(items, container, onSelect) {
    container.innerHTML = '';
    if (items.length === 0) return;

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'search-item'; // Reuse existing class or create new
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid #444';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.gap = '10px';
        div.style.alignItems = 'center';

        div.innerHTML = `
            <img src="${item.image || ''}" style="width:30px; height:30px; border-radius:4px; background:#fff;">
            <div>
                <div style="font-weight:bold; color: var(--text-light);">${item.name}</div>
                <div style="font-size:0.8rem; color: var(--text-dim);">${item.brand}</div>
            </div>
        `;
        div.addEventListener('click', () => onSelect(item));
        container.appendChild(div);
    });
    container.classList.remove('hidden');
}

// --- APP 2: TACOS ---
function setupTacosApp() {
    const areaInput = document.getElementById('tacos-area');
    const resultsList = document.getElementById('tacos-results-list');

    const tacosSizes = [
        { name: '7x35', area: 0.0245 },
        { name: '7x42', area: 0.0294 },
        { name: '10x30', area: 0.0300 },
        { name: '10x40', area: 0.0400 },
    ]; // Example data

    if (areaInput) {
        areaInput.addEventListener('input', () => {
            const area = parseFloat(areaInput.value);
            if (!area) {
                resultsList.innerHTML = '<p style="color: var(--text-dim);">Informe a área...</p>';
                return;
            }

            resultsList.innerHTML = '';
            tacosSizes.forEach(size => {
                const qtd = Math.ceil(area / size.area);
                const div = document.createElement('div');
                div.style.marginBottom = '10px';
                div.style.borderBottom = '1px dashed #444';
                div.style.paddingBottom = '5px';
                // Added class 'tacos-result-count' for green color
                div.innerHTML = `<span style="color:var(--accent-orange); font-weight:bold;">${size.name}</span>: <span class="tacos-result-count">${qtd}</span> peças`;
                resultsList.appendChild(div);
            });
        });
    }
}

// --- APP 3: CAIXAS ---
function setupCaixasApp() {
    const inputs = ['box-h', 'box-w', 'box-l', 'box-weight'].map(id => document.getElementById(id));
    const addBtn = document.getElementById('box-add-btn');
    const list = document.getElementById('box-list');

    let boxItems = []; // { h, w, l, weight, vol, qty }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const [h, w, l, weight] = inputs.map(i => parseFloat(i.value) || 0);
            if (h && w && l) {
                const vol = (h * w * l) / 1000000; // cm3 to m3

                // Check if identical box exists? Optional. Let's just add new.
                // Or merge if exactly same dims and weight?
                const existing = boxItems.find(i => i.h === h && i.w === w && i.l === l && i.weight === weight);
                if (existing) {
                    existing.qty++;
                } else {
                    boxItems.push({ h, w, l, weight, vol, qty: 1 });
                }

                renderBoxList();
                updateTotals();
                inputs.forEach(i => i.value = ''); // Clear
                inputs[0].focus();
            }
        });
    }

    function updateTotals() {
        let totalVol = 0;
        let totalWeight = 0;
        boxItems.forEach(item => {
            totalVol += item.vol * item.qty;
            totalWeight += item.weight * item.qty;
        });

        document.getElementById('caixas-total-vol').textContent = totalVol.toFixed(3);
        document.getElementById('caixas-total-weight').textContent = totalWeight;
    }

    function renderBoxList() {
        list.innerHTML = '';
        boxItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'weight-item'; // Reuse styling from peso app (flex, dark bg, etc)
            // If weight-item class is not generic enough in CSS, we might need to add styles. 
            // Assuming 'weight-item' and 'weight-controls' are available globally or we added them.
            // If not, we use inline styles matching the look.

            li.innerHTML = `
                <div>
                     <div style="font-weight:bold; color: var(--text-light);">${item.h}x${item.w}x${item.l} cm</div>
                     <div style="font-size:0.8rem; color: var(--text-dim);">${item.vol.toFixed(4)} m³ | ${item.weight}g</div>
                </div>
                <div class="weight-controls">
                    <button class="weight-btn btn-minus" data-idx="${index}">-</button>
                    <span style="min-width:20px; text-align:center;">${item.qty}</span>
                    <button class="weight-btn btn-plus" data-idx="${index}">+</button>
                    <button class="weight-btn btn-delete" data-idx="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            list.appendChild(li);
        });

        // Add Listeners
        list.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                boxItems[idx].qty++;
                renderBoxList();
                updateTotals();
            });
        });
        list.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (boxItems[idx].qty > 1) {
                    boxItems[idx].qty--;
                    renderBoxList();
                    updateTotals();
                }
            });
        });
        list.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                boxItems.splice(idx, 1);
                renderBoxList();
                updateTotals();
            });
        });
    }
}

// --- APP 4: PESO ---
function setupPesoApp() {
    const search = document.getElementById('peso-search');
    const results = document.getElementById('peso-search-results');
    const selectedCard = document.getElementById('peso-selected-card');
    const addBtn = document.getElementById('peso-add-btn');
    const list = document.getElementById('peso-list');

    let tempInfo = null;
    let totalW = 0;
    let count = 0;

    function handleSearch(query) {
        let matches = [];
        if (query.length === 0) {
            matches = allProducts.slice(0, 50);
        } else {
            matches = allProducts.filter(p => p.name.toLowerCase().includes(query));
        }

        if (matches.length === 0 && query.length > 0) {
            results.classList.add('hidden');
            return;
        }

        renderDropdown(matches, results, (p) => {
            tempInfo = p;
            document.getElementById('peso-sel-name').textContent = p.name + ` (${p.weight}kg)`;
            selectedCard.classList.remove('hidden');
            results.classList.add('hidden');
        });
    }

    if (search) {
        search.addEventListener('focus', () => handleSearch(search.value.toLowerCase()));
        search.addEventListener('input', (e) => handleSearch(e.target.value.toLowerCase()));
        search.addEventListener('blur', () => { setTimeout(() => results.classList.add('hidden'), 200); });
    }

    let listItems = []; // Array of objects: { product, qty }

    function updatePesoTotals() {
        let totalW = 0;
        let count = 0;
        listItems.forEach(item => {
            totalW += (item.product.weight || 0) * item.qty;
            count += item.qty;
        });
        document.getElementById('peso-total-val').textContent = totalW.toFixed(2);
        document.getElementById('peso-total-items').textContent = count;
    }

    function renderPesoList() {
        list.innerHTML = '';
        listItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'weight-item';
            li.innerHTML = `
                <div>
                    <div style="font-weight:bold;">${item.product.name}</div>
                    <div style="font-size:0.8rem; color:#aaa;">${item.product.weight} kg/unid</div>
                </div>
                <div class="weight-controls">
                    <button class="weight-btn btn-minus" data-idx="${index}">-</button>
                    <span style="min-width:20px; text-align:center;">${item.qty}</span>
                    <button class="weight-btn btn-plus" data-idx="${index}">+</button>
                    <button class="weight-btn btn-delete" data-idx="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
             `;
            list.appendChild(li);
        });

        // Add Listeners
        list.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                listItems[idx].qty++;
                renderPesoList();
                updatePesoTotals();
            });
        });
        list.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (listItems[idx].qty > 1) {
                    listItems[idx].qty--;
                    renderPesoList();
                    updatePesoTotals();
                }
            });
        });
        list.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                listItems.splice(idx, 1);
                renderPesoList();
                updatePesoTotals();
            });
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (tempInfo) {
                // Check if already exists
                const existing = listItems.find(i => i.product.name === tempInfo.name);
                if (existing) {
                    existing.qty++;
                } else {
                    listItems.push({ product: tempInfo, qty: 1 });
                }

                renderPesoList();
                updatePesoTotals();

                selectedCard.classList.add('hidden');
                search.value = '';
                tempInfo = null;
            }
        });
    }
}

// --- APP 5: CARRIER ---
function setupCarrierApp() {
    const genBtn = document.getElementById('carrier-gen-btn');
    const resultArea = document.getElementById('carrier-result');
    const copyBtn = document.getElementById('carrier-copy-btn');

    // Inputs
    const inputs = {
        destDoc: document.getElementById('carrier-dest-doc'),
        destName: document.getElementById('carrier-dest-name'),
        destCep: document.getElementById('carrier-dest-cep'),
        city: document.getElementById('carrier-city'),
        content: document.getElementById('carrier-content'),
        payerDoc: document.getElementById('carrier-payer-doc'),
        volQty: document.getElementById('carrier-vol-qty'),
        weight: document.getElementById('carrier-weight'),
        value: document.getElementById('carrier-value')
    };

    // New Cubage UI Elements
    const measureUi = {
        toggleBtn: document.getElementById('carrier-toggle-mode'),
        m3Input: document.getElementById('carrier-measures-m3'),
        dimsWrapper: document.getElementById('carrier-dims-wrapper'), // Wrapper
        newBoxBtn: document.getElementById('carrier-new-box-btn'),     // New Btn
        dimsContainer: document.getElementById('carrier-dims-container'),
        dimQ: document.getElementById('carrier-dim-q'), // New Qty Input
        dimC: document.getElementById('carrier-dim-c'),
        dimL: document.getElementById('carrier-dim-l'),
        dimA: document.getElementById('carrier-dim-a'),
        addBtn: document.getElementById('carrier-add-dim'),
        list: document.getElementById('carrier-measures-list'),
        finalInput: document.getElementById('carrier-measures-final')
    };

    let cubageMode = 'm3'; // 'm3' or 'dims'
    let cubageItems = [];

    // Toggle Mode
    if (measureUi.toggleBtn) {
        measureUi.toggleBtn.addEventListener('click', () => {
            if (cubageMode === 'm3') {
                cubageMode = 'dims';
                measureUi.toggleBtn.textContent = 'Alternar: Dimensões';
                measureUi.m3Input.classList.add('hidden');

                // Requirement: Inputs appear immediately
                if (measureUi.newBoxBtn) measureUi.newBoxBtn.classList.add('hidden');
                if (measureUi.dimsContainer) {
                    measureUi.dimsContainer.classList.remove('hidden');
                    measureUi.dimsContainer.style.display = 'grid';
                }

            } else {
                cubageMode = 'm3';
                measureUi.toggleBtn.textContent = 'Alternar: m³';
                measureUi.m3Input.classList.remove('hidden');

                // Hide Dimensions UI
                if (measureUi.newBoxBtn) measureUi.newBoxBtn.classList.add('hidden');
                if (measureUi.dimsContainer) measureUi.dimsContainer.classList.add('hidden');
                if (measureUi.dimsContainer) measureUi.dimsContainer.style.display = 'none';
            }
            updateFinalMeasureString();
        });
    }

    // "Nova Caixa" Button Handler (Backup if needed, but inputs are default open now)
    if (measureUi.newBoxBtn) {
        measureUi.newBoxBtn.addEventListener('click', () => {
            measureUi.newBoxBtn.classList.add('hidden');
            measureUi.dimsContainer.classList.remove('hidden');
            measureUi.dimsContainer.style.display = 'grid';
            measureUi.dimQ.focus();
        });
    }

    // Add Dimension to List
    if (measureUi.addBtn) {
        measureUi.addBtn.addEventListener('click', () => {
            const q = measureUi.dimQ.value || '1';
            const c = measureUi.dimC.value;
            const l = measureUi.dimL.value;
            const a = measureUi.dimA.value;

            if (q && c && l && a) {
                // Store as object or formatted string. Using string for simplicity in display/join
                // Format: "Nx de CxLxA"
                cubageItems.push(`${q}x de ${c}x${l}x${a}`);
                renderCubageList();
                updateFinalMeasureString();

                // Clear inputs (Reset Qty to 1)
                measureUi.dimQ.value = '1';
                measureUi.dimC.value = '';
                measureUi.dimL.value = '';
                measureUi.dimA.value = '';

                // UX Requirement: Make sure inputs stay visible
                if (measureUi.dimsContainer) {
                    measureUi.dimsContainer.classList.remove('hidden');
                    measureUi.dimsContainer.style.display = 'grid';
                }
                measureUi.dimQ.focus();
            }
        });
    }


    // Direct m3 input update
    if (measureUi.m3Input) {
        measureUi.m3Input.addEventListener('input', () => {
            updateFinalMeasureString();
        });
    }



    // Apply Masks
    if (inputs.destDoc) setupInputMasks(inputs.destDoc, 'cnpj_cpf');
    if (inputs.payerDoc) setupInputMasks(inputs.payerDoc, 'cnpj_cpf');
    if (inputs.destCep) setupInputMasks(inputs.destCep, 'cep');
    if (inputs.value) setupInputMasks(inputs.value, 'money');

    // Generator Logic
    const generateCarrierText = () => {
        try {
            const destDoc = inputs.destDoc?.value || '';
            const destName = inputs.destName?.value || '';
            const destCep = inputs.destCep?.value || '';
            const city = inputs.city?.value || '';
            const content = inputs.content?.value || '';
            const payerDoc = inputs.payerDoc?.value || '';

            const vol = inputs.volQty?.value || '';
            const weight = inputs.weight?.value || '';
            const val = inputs.value?.value || '';

            // Get measures from our new logic
            let measures = measureUi.finalInput?.value || '';
            // Fallback if mode is m3 but list empty (though list is for dims)
            if (cubageMode === 'm3' && !measures) measures = measureUi.m3Input.value ? (measureUi.m3Input.value + ' m³') : '';
            if (cubageMode === 'dims' && cubageItems.length > 0 && !measures) measures = cubageItems.join(' + ');
            if (cubageMode === 'dims' && cubageItems.length === 0) measures = 'N/A';

            // Template using emojis and specific structure
            const text = `👨🦲 CNPJ/CPF do Remetente: [ 23843103000119 ]
👨🦲 CNPJ/CPF do Destinatário: [ ${destDoc} ]
🚚 Cidade Origem: [ São Paulo ]
✈ Cidade Destino: [ ${city.toUpperCase()} ]
🚩 CEP origem: [ 05581-000 ]
🏁 CEP destino: [ ${destCep} ]
✏ O que será transportado: [ ${content.toUpperCase()} ]
💸 CNPJ do Pagador do frete: [ ${payerDoc} ]
📦 Quantidades de Volumes: [ ${vol} ]
📐 Medidas dos Volumes e/ou cubagem: [ ${measures} ]
⚓ Peso Bruto: [ ${weight} ]
🏷 Valor total da nota fiscal: [ ${val} ]`;

            if (resultArea) resultArea.value = text;
        } catch (e) {
            if (resultArea) resultArea.value = 'Erro ao gerar texto: ' + e.message;
            console.error(e);
        }
    };

    // Helper: Update Final Measure String
    function updateFinalMeasureString() {
        let str = '';
        if (cubageMode === 'm3') {
            str = measureUi.m3Input.value ? (measureUi.m3Input.value + ' m³') : '';
        } else {
            str = cubageItems.join(' + ');
            if (!str) str = 'N/A';
        }

        if (measureUi.finalInput) measureUi.finalInput.value = str;
        generateCarrierText();
    }

    // Helper: Render List
    function renderCubageList() {
        if (!measureUi.list) return;
        measureUi.list.innerHTML = '';
        cubageItems.forEach((item, idx) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.marginBottom = '5px';
            li.style.background = 'rgba(255,255,255,0.05)';
            li.style.padding = '5px 10px';
            li.style.borderRadius = '4px';
            li.innerHTML = `<span>${item}</span> <button class="btn-delete-item" onclick="removeCubageItem(${idx})"><i class="fa-solid fa-trash"></i></button>`;
            measureUi.list.appendChild(li);
        });
    }

    // Global Remover (closure awareness)
    window.removeCubageItem = (idx) => {
        cubageItems.splice(idx, 1);
        renderCubageList();
        updateFinalMeasureString();
    };

    // Real-time Updates: Add listener to ALL inputs
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', generateCarrierText);
        }
    });

    // Also on button click if preferred
    if (genBtn) {
        genBtn.addEventListener('click', generateCarrierText);
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (resultArea) {
                resultArea.select();
                document.execCommand('copy');
                alert('Copiado!');
            }
        });
    }

    // Initial run
    generateCarrierText();
}


// --- APP 6: LABELS ---
function setupLabelsApp() {
    const inputs = {
        name: document.getElementById('label-name'),
        cep: document.getElementById('label-cep'),
        address: document.getElementById('label-address'),
        number: document.getElementById('label-number'),
        compl: document.getElementById('label-compl'),
        bairro: document.getElementById('label-bairro'),
        city: document.getElementById('label-city'),
        uf: document.getElementById('label-uf'),
        obs: document.getElementById('label-obs')
    };

    // Apply Mask for CEP
    if (inputs.cep) setupInputMasks(inputs.cep, 'cep');

    // Config Inputs
    const printQ = document.getElementById('print-qty');
    const printW = document.getElementById('print-width');
    const printH = document.getElementById('print-height');

    const printBtn = document.getElementById('label-print-btn');
    const previewDiv = document.getElementById('label-preview');
    const obsCount = document.getElementById('label-obs-count');

    // Sender Info (Fixed)
    const senderInfo = {
        name: "Recanto Do Raspador",
        address: "Av. Corifeu De Azevedo Marques, 1199",
        bairro: "Butantã",
        city: "São Paulo / SP",
        cep: "05581-000",
        ref: "Loja Recanto Do Raspador"
    };

    // 1. CEP Search logic
    if (inputs.cep) {
        inputs.cep.addEventListener('blur', async () => {
            let cep = inputs.cep.value.replace(/\D/g, '');
            if (cep.length === 8) {
                // Format display
                inputs.cep.value = cep.substring(0, 5) + '-' + cep.substring(5);
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        if (inputs.address) inputs.address.value = data.logradouro;
                        if (inputs.bairro) inputs.bairro.value = data.bairro;
                        if (inputs.city) inputs.city.value = data.localidade;
                        if (inputs.uf) inputs.uf.value = data.uf;
                        updatePreview();
                    } else {
                        alert('CEP não encontrado.');
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    }

    // 2. Obs Char Count
    if (inputs.obs) {
        inputs.obs.addEventListener('input', () => {
            const len = inputs.obs.value.length;
            if (obsCount) obsCount.textContent = 60 - len;
            updatePreview();
        });
    }

    // 3. Real-time preview update
    Object.values(inputs).forEach(input => {
        if (input) input.addEventListener('input', updatePreview);
    });
    if (printW) printW.addEventListener('input', updatePreview);
    if (printH) printH.addEventListener('input', updatePreview);


    function generateLabelHTML(isPreview = false) {
        const name = inputs.name.value || '';
        const cep = inputs.cep.value || '';
        const address = inputs.address.value || '';
        const number = inputs.number.value || '';
        const compl = inputs.compl.value || '';
        const bairro = inputs.bairro.value || '';
        const city = inputs.city.value || '';
        const uf = inputs.uf.value || '';
        const obs = inputs.obs.value || '';

        // Dimensions
        const wStr = printW ? printW.value : 80;
        const hStr = printH ? printH.value : 40;

        // CSS expects mm, convert to styling if needed (screen preview px)
        const widthVal = parseFloat(wStr);
        const heightVal = parseFloat(hStr); // Height of ONE block (Dest or Rem)

        // Styles for the Label Content
        const labelStyle = `
            width: ${widthVal}mm;
            height: ${heightVal}mm;
            box-sizing: border-box;
            border: 1px solid #000;
            padding: 10px;
            font-family: Arial, sans-serif;
            font-size: 11px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            color: black;
            overflow: hidden;
            position: relative;
        `;

        // Destinatário Block
        const destHTML = `
            <div style="${labelStyle} border-bottom: 1px dashed #000;">
                <div style="font-weight:bold; font-size:14px; text-transform:uppercase; margin-bottom:5px; display:flex; justify-content:space-between;">
                    <span>Destinatário</span>
                </div>
                <div style="font-size:12px; margin-bottom:5px;">
                    <div style="font-weight:bold; text-transform:uppercase;">${name}</div>
                    <div>${address}, ${number} ${compl}</div>
                    <div>${bairro}</div>
                    <div>${city} / ${uf}</div>
                    <div style="margin-top:2px; font-style:italic;">${obs}</div>
                </div>
                <div style="font-weight:bold; font-size:14px;">CEP: ${cep}</div>
            </div>
        `;

        // Remetente Block
        const remHTML = `
             <div style="${labelStyle}">
                <div style="font-weight:bold; font-size:12px; text-transform:uppercase; margin-bottom:5px;">
                    Remetente
                </div>
                <div style="font-size:11px;">
                    <div style="font-weight:bold; text-transform:uppercase;">${senderInfo.name}</div>
                    <div>${senderInfo.address}</div>
                    <div>${senderInfo.bairro}</div>
                    <div>${senderInfo.city}</div>
                </div>
                <div style="font-weight:bold; font-size:12px; margin-top:5px;">CEP: ${senderInfo.cep}</div>
                <div style="font-size:10px; margin-top:2px;">Ref: ${senderInfo.ref}</div>
            </div>
        `;

        // Return Pair
        return `
            <div class="label-pair" style="display:flex; flex-direction:column;">
                ${destHTML}
                ${remHTML}
            </div>
        `;
    }

    function updatePreview() {
        if (!previewDiv) return;
        // Render 1 Unit
        previewDiv.innerHTML = generateLabelHTML(true);
    }

    // Initial Render
    updatePreview();

    // Print Logic (A4 Packer)
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const w = parseFloat(printW.value) || 80;
            const h = parseFloat(printH.value) || 40; // Height of ONE label (Dest). Pair is 2*h.

            // A4 Dims (mm) - Margins
            const pageW = 210;
            const pageH = 297;
            const margin = 10;
            const safeW = pageW - (2 * margin);
            const safeH = pageH - (2 * margin);

            const pairH = h * 2; // Dest + Rem

            const cols = Math.floor(safeW / w);
            const rows = Math.floor(safeH / pairH);
            const maxPerSheet = cols * rows;

            // User requested quantity (default 1)
            let count = parseInt(printQ.value) || 1;

            if (count > maxPerSheet) {
                alert(`Quantidade ajustada para o máximo da página (${maxPerSheet})`);
                count = maxPerSheet;
            }

            if (count < 1) count = 1;

            // Generate Content
            const singleLabel = generateLabelHTML(false);
            let content = '';
            for (let i = 0; i < count; i++) {
                content += singleLabel;
            }

            // Open Print Window
            const win = window.open('', '', 'width=900,height=700');
            win.document.write(`
                <html>
                <head>
                    <title>Imprimir Etiquetas</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        .page-grid {
                            display: grid;
                            grid-template-columns: repeat(${cols}, ${w}mm);
                            grid-template-rows: repeat(${rows}, ${pairH}mm);
                            gap: 0;
                            justify-content: start;
                            align-content: start;
                        }
                        .label-pair {
                             page-break-inside: avoid;
                        }
                    </style>
                </head>
                <body>
                    <div class="page-grid">
                        ${content}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            win.document.close();
        });
    }
}

// --- APP 7: NEWSLETTER ---
function setupNewsletterApp() {
    const feed = document.getElementById('messages-feed');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const clearImageBtn = document.getElementById('clear-image');
    const emptyState = document.getElementById('empty-state');

    let currentImageFile = null;

    // Check Supabase
    if (!window.supabaseClient && typeof initSupabase === 'function') {
        initSupabase();
    }

    if (!window.supabaseClient) return; // Fail validation

    // Subscribe Realtime
    window.supabaseClient
        .channel('public:newsletter_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'newsletter_messages' }, payload => {
            handleNewMessage(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'newsletter_messages' }, payload => {
            handleDeleteMessage(payload.old.id);
        })
        .subscribe();

    // Fetch Initial
    fetchMessages();

    // Event Listeners
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (imageUpload) imageUpload.addEventListener('change', handleImageSelect);
    if (clearImageBtn) clearImageBtn.addEventListener('click', clearImageSelection);

    // Helpers
    async function fetchMessages() {
        const { data, error } = await window.supabaseClient.from('newsletter_messages').select('*').order('created_at', { ascending: true });
        if (!error) renderFeed(data || []);
    }

    function renderFeed(messages) {
        feed.innerHTML = '';
        if (messages.length === 0) {
            feed.appendChild(emptyState);
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            messages.forEach(msg => feed.appendChild(createMessageElement(msg)));
            scrollToBottom();
        }
    }

    function handleNewMessage(msg) {
        if (document.getElementById(`msg-${msg.id}`)) return;
        emptyState.style.display = 'none';
        feed.appendChild(createMessageElement(msg));
        scrollToBottom();
    }

    function handleDeleteMessage(id) {
        const el = document.getElementById(`msg-${id}`);
        if (el) el.remove();
        if (feed.children.length === 0 || (feed.children.length === 1 && feed.children[0].id === 'empty-state')) {
            feed.appendChild(emptyState);
            emptyState.style.display = 'flex';
        }
    }

    function createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = 'message-bubble self';
        div.id = `msg-${msg.id}`;

        let imgHtml = msg.image_url ? `<div class="message-image"><img src="${msg.image_url}" alt="Imagem"></div>` : '';
        const textHtml = `<div class="message-text">${(msg.content || '').replace(/\n/g, '<br>')}</div>`;
        const timeStr = new Date(msg.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

        const footerHtml = `
            <div class="message-footer">
                <span class="message-time">${timeStr}</span>
                <button class="delete-msg-btn" onclick="deleteMessage(${msg.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        div.innerHTML = imgHtml + textHtml + footerHtml;
        return div;
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text && !currentImageFile) return;

        // Upload Img
        let publicURL = null;
        if (currentImageFile) {
            const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const { data, error } = await window.supabaseClient.storage.from('newsletter_images').upload(fileName, currentImageFile);
            if (!error) {
                const urlData = window.supabaseClient.storage.from('newsletter_images').getPublicUrl(fileName);
                publicURL = urlData.data.publicUrl;
            }
        }

        await window.supabaseClient.from('newsletter_messages').insert([{ content: text, image_url: publicURL }]);

        messageInput.value = '';
        clearImageSelection();
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function clearImageSelection() {
        currentImageFile = null;
        imageUpload.value = '';
        imagePreviewContainer.classList.add('hidden');
    }

    function scrollToBottom() {
        feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
    }

    // Global Delete
    window.deleteMessage = async function (id) {
        if (!confirm('Excluir?')) return;
        handleDeleteMessage(id); // Optimistic
        await window.supabaseClient.from('newsletter_messages').delete().eq('id', id);
    };
}

// --- APP 8: FAQ/CATALOG ---
function setupFaqApp() {
    renderCatalog();

    // Setup search listener if it exists
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.catalog-item');
            items.forEach(item => {
                const name = item.querySelector('.catalog-name').textContent.toLowerCase();
                if (name.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

function renderCatalog() {
    const grid = document.getElementById('faq-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Group
    const groups = {};
    allProducts.forEach(p => {
        const brand = p.brand || 'Outros';
        if (!groups[brand]) groups[brand] = [];
        groups[brand].push(p);
    });

    const sortedBrands = Object.keys(groups).sort();

    sortedBrands.forEach(brand => {
        const section = document.createElement('div');
        section.className = 'brand-section';

        const title = document.createElement('h3');
        title.className = 'brand-title';
        title.textContent = brand;
        section.appendChild(title);

        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'catalog-grid';

        groups[brand].forEach(prod => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'catalog-item';
            itemDiv.innerHTML = `
                <div class="catalog-img-container">
                    <img src="${prod.image || 'placeholder.png'}" class="catalog-img" loading="lazy">
                </div>
                <div class="catalog-name">${prod.name}</div>
            `;

            // Add click listener to show tech data (reuse logic or simple alert for now if no modal)
            // Ideally we should have a modal or a details view.
            itemDiv.addEventListener('click', () => {
                alert(`Ficha Técnica: ${prod.name}\n\nMarca: ${prod.brand}\nRendimento: ${prod.coverage}\nSecagem: ${prod.drying_time}`);
            });

            itemsGrid.appendChild(itemDiv);
        });

        section.appendChild(itemsGrid);
        grid.appendChild(section);
    });

    grid.style.display = 'block';
}

function setupTaxApp() { }
function setupDatabaseApp() { }

// Animation CSS injection
const style = document.createElement('style');
style.textContent = `
    @keyframes appZoomIn {
        0% { opacity: 0; transform: scale(0.95); margin-top: 50px; }
        100% { opacity: 1; transform: scale(1); margin-top: 0; }
    }
    .action-btn-full {
        width: 100%;
        background: var(--accent-orange);
        color: white;
        border: none;
        padding: 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.3s;
    }
    .action-btn-full:hover {
        background: #e67500;
    }
`;
document.head.appendChild(style);

function setupInputMasks(input, type) {
    if (!input) return;
    input.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (type === 'cep') {
            v = v.substring(0, 8);
            if (v.length > 5) v = v.substring(0, 5) + '-' + v.substring(5);
        } else if (type === 'cnpj_cpf') {
            if (v.length <= 11) { // CPF pattern if short
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else { // CNPJ pattern
                v = v.substring(0, 14);
                v = v.replace(/^(\d{2})(\d)/, '$1.$2');
                v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
                v = v.replace(/(\d{4})(\d)/, '$1-$2');
            }
        } else if (type === 'money') {
            // Format R$ X.XXX,XX
            // Remove all non-digits
            v = v.replace(/\D/g, "");

            // Convert to number / 100
            let val = (Number(v) / 100).toFixed(2);

            // Replace dot with comma
            val = val.replace(".", ",");

            // Add thousand separators
            val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

            // Set final value
            e.target.value = "R$ " + val;
            return; // Exit here as we construct full string
        }
        e.target.value = v;
    });
};
