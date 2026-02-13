document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const noteTotalInput = document.getElementById('note-total');
    const productsTotalInput = document.getElementById('products-total');
    const globalRateDisplay = document.getElementById('global-rate');
    const itemsList = document.getElementById('items-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const totalNetDisplay = document.getElementById('total-net');
    const totalGrossDisplay = document.getElementById('total-gross');
    const diffValDisplay = document.getElementById('diff-val');
    const itemsHeaderRow = document.getElementById('items-header-row');

    // State
    let items = [];
    let itemIdCounter = 1;
    let allProducts = []; // Store fetched products

    // Initialize
    async function init() {
        if (window.fetchProducts) {
            allProducts = await window.fetchProducts();
            console.log("Tax Calc: Products loaded", allProducts.length);
        }
        updateHeader();
        addItem();
    }
    init();

    // Initialize standard inputs with masks
    setupCurrencyInput(noteTotalInput);
    setupCurrencyInput(productsTotalInput);

    // Event Listeners
    addItemBtn.addEventListener('click', addItem);
    noteTotalInput.addEventListener('input', updateCalculations);
    productsTotalInput.addEventListener('input', updateCalculations);

    // --- Masking Functions ---

    function setupCurrencyInput(input) {
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Strip non-digits
            if (value === '') {
                e.target.value = '';
                return;
            }

            // Format as Currency: 2 decimals
            const floatVal = parseFloat(value) / 100;

            // Format to PT-BR
            const formatted = floatVal.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            e.target.value = formatted;
        });
    }

    // Helper to parse "1.234,56" -> 1234.56
    function parseBRFloat(str) {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        // Remove dots (thousands), replace comma with dot
        const cleanStr = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanStr) || 0;
    }

    // --- Product Search Logic ---
    function createProductSearchWrapper(input, onSelect) {
        // Create wrapper for positioning
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';

        wrapper.appendChild(input);

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.display = 'none';
        wrapper.appendChild(dropdown);

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase().trim();
            if (query.length < 1) {
                dropdown.style.display = 'none';
                return;
            }

            const matches = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );

            dropdown.innerHTML = '';
            if (matches.length === 0) {
                dropdown.style.display = 'none';
                return; // Allow generic text
            }

            matches.forEach(p => {
                const item = document.createElement('div');
                item.style.padding = '8px';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid #eee';
                item.style.fontSize = '0.9rem';
                item.innerHTML = `<strong>${p.name}</strong> <span style="font-size:0.8em; color:#666;">(${p.brand})</span>`;

                item.addEventListener('mouseenter', () => item.style.background = '#f0f0f0');
                item.addEventListener('mouseleave', () => item.style.background = 'white');

                item.addEventListener('click', () => {
                    input.value = p.name; // Set name
                    dropdown.style.display = 'none';
                    onSelect(p); // Callback with full product object
                });
                dropdown.appendChild(item);
            });
            dropdown.style.display = 'block';
        });

        // Hide on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        return wrapper;
    }


    // --- Core Logic ---

    function updateHeader() {
        // Uniform Header
        itemsHeaderRow.className = 'items-header grid-per-item';
        // Qtd | Name | Value | Op | Bonus Ctrl | Final | Remove
        itemsHeaderRow.innerHTML = `
            <div style="text-align: center;">Qtd</div>
            <div>Produto</div>
            <div>Valor Unit. (R$)</div>
            <div style="text-align: center;">Op</div>
            <div style="text-align: center;">Bonificação</div>
            <div style="text-align: right;">Custo Final Un.</div>
            <div></div>
        `;
    }

    function addItem() {
        const id = itemIdCounter++;
        const item = {
            id: id,
            name: ``, // Empty start for search
            value: 0,        // Raw float value
            quantity: 1,     // Quantity Paid
            operation: 1,    // 1 (+), -1 (-)
            isBonus: false,  // Bonus toggle state
            qtyBonus: 0      // Quantity Free
        };
        items.push(item);
        renderItem(item);
        updateCalculations();
    }

    function removeItem(id) {
        if (items.length <= 1) {
            alert("A lista precisa ter pelo menos um item.");
            return;
        }
        items = items.filter(item => item.id !== id);
        renderAllItems();
        updateCalculations();
    }

    function renderAllItems() {
        itemsList.innerHTML = '';
        items.forEach(renderItem);
    }

    function renderItem(item) {
        const row = document.createElement('div');
        row.id = `item-row-${item.id}`;
        row.className = 'item-row grid-per-item'; // Use CSS class
        row.style.alignItems = 'center';

        // 1. Quantity Input
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.placeholder = 'Qtd';
        qtyInput.style.textAlign = 'center';
        qtyInput.value = item.quantity;
        qtyInput.addEventListener('input', (e) => {
            item.quantity = parseFloat(e.target.value) || 1;
            updateCalculations();
        });

        // 2. Name Input (now Searchable)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.placeholder = 'Buscar Produto...';
        nameInput.addEventListener('input', (e) => item.name = e.target.value);

        // 3. Value Input (Masked)
        const valInput = document.createElement('input');
        valInput.type = 'text'; // Changed to text for mask
        valInput.inputMode = 'numeric';
        valInput.placeholder = '0,00';

        // Set initial value formatted
        if (item.value > 0) {
            valInput.value = item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        setupCurrencyInput(valInput);

        valInput.addEventListener('input', (e) => {
            // Update item state with parsed value
            item.value = parseBRFloat(e.target.value);
            updateCalculations();
        });

        // Attach Search Logic
        const nameWrapper = createProductSearchWrapper(nameInput, (product) => {
            item.name = product.name;
            // Auto-fill value: Priority: cost_price > value > 0
            let price = product.cost_price || product.value || 0;
            item.value = parseFloat(price);

            // Update UI
            valInput.value = item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            updateCalculations();
        });

        // 4. Operation Toggle
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.justifyContent = 'center';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-op-btn';
        updateToggleStyle(toggleBtn, item.operation);

        toggleBtn.addEventListener('click', () => {
            item.operation *= -1;
            updateToggleStyle(toggleBtn, item.operation);
            updateCalculations();
        });
        toggleContainer.appendChild(toggleBtn);

        // 5. Bonus Control Container
        const bonusContainer = document.createElement('div');
        bonusContainer.className = 'bonus-container';

        const bonusBtn = document.createElement('button');
        bonusBtn.className = `bonus-btn ${item.isBonus ? 'active' : ''}`;
        bonusBtn.textContent = item.isBonus ? 'Sim' : 'Bon?';

        const bonusInput = document.createElement('input');
        bonusInput.type = 'number';
        bonusInput.className = 'bonus-input';
        bonusInput.placeholder = '+Grátis';
        bonusInput.min = '0';
        bonusInput.value = item.qtyBonus === 0 ? '' : item.qtyBonus;
        bonusInput.style.display = item.isBonus ? 'block' : 'none';

        bonusBtn.addEventListener('click', () => {
            item.isBonus = !item.isBonus;
            if (item.isBonus) {
                bonusBtn.textContent = 'Sim';
                bonusBtn.classList.add('active');
                bonusInput.style.display = 'block';
                bonusInput.focus();
            } else {
                bonusBtn.textContent = 'Bon?';
                bonusBtn.classList.remove('active');
                bonusInput.style.display = 'none';
                item.qtyBonus = 0;
                bonusInput.value = '';
                updateCalculations();
            }
        });

        bonusInput.addEventListener('input', (e) => {
            item.qtyBonus = parseFloat(e.target.value) || 0;
            updateCalculations();
        });

        bonusContainer.appendChild(bonusBtn);
        bonusContainer.appendChild(bonusInput);

        // 6. Final Value Display
        const finalValDisplay = document.createElement('div');
        finalValDisplay.className = 'item-final-val';
        finalValDisplay.style.textAlign = 'right';
        finalValDisplay.style.fontWeight = '600';
        finalValDisplay.textContent = 'R$ 0,00';

        // 7. Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeBtn.className = 'style-remove-btn';
        removeBtn.addEventListener('click', () => removeItem(item.id));

        row.appendChild(qtyInput);
        row.appendChild(nameWrapper);
        row.appendChild(valInput);
        row.appendChild(toggleContainer);
        row.appendChild(bonusContainer);
        row.appendChild(finalValDisplay);
        row.appendChild(removeBtn);

        itemsList.appendChild(row);
    }

    function updateToggleStyle(btn, op) {
        if (op === 1) {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            btn.style.background = '#e6f0fa';
            btn.style.color = '#1B365D';
            btn.style.border = '1px solid #1B365D';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
            btn.style.background = '#fff5eb';
            btn.style.color = '#F58220';
            btn.style.border = '1px solid #F58220';
        }
        btn.style.width = '32px';
        btn.style.height = '32px';
        btn.style.borderRadius = '50%';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.transition = 'all 0.2s';
    }

    function updateCalculations() {
        const noteTotal = parseBRFloat(noteTotalInput.value);
        const productsTotal = parseBRFloat(productsTotalInput.value);

        // 1. Calculate Global Rate (Manual Inputs)
        let globalRate = 0;
        if (productsTotal > 0) {
            globalRate = ((noteTotal - productsTotal) / productsTotal);
        }
        globalRateDisplay.textContent = (globalRate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // 2. Calculations per Item
        let totalGross = 0;
        let totalNet = 0;

        items.forEach(item => {
            const absTax = item.value * Math.abs(globalRate);
            const unitPriceWithTax = item.value + (absTax * item.operation);

            const totalPaidCost = unitPriceWithTax * item.quantity;
            const totalUnits = item.quantity + (item.isBonus ? item.qtyBonus : 0);

            let realUnitCost = 0;
            if (totalUnits > 0) {
                realUnitCost = totalPaidCost / totalUnits;
            } else {
                realUnitCost = unitPriceWithTax;
            }

            // Update Row Display
            const row = document.getElementById(`item-row-${item.id}`);
            if (row) {
                const finalDiv = row.querySelector('.item-final-val');
                const formattedCost = realUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                finalDiv.innerHTML = `<div>R$ ${formattedCost}</div>`;

                if (item.isBonus && item.qtyBonus > 0 && unitPriceWithTax > 0) {
                    const reduction = (1 - (realUnitCost / unitPriceWithTax)) * 100;
                    finalDiv.innerHTML += `<div style="font-size: 0.75rem; color: #1B365D;">-${reduction.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</div>`;
                }
            }

            totalGross += totalPaidCost;
            totalNet += (item.value * item.quantity);
        });

        // 3. Update Summaries
        totalNetDisplay.textContent = totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalGrossDisplay.textContent = totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const diff = noteTotal - totalGross;
        diffValDisplay.textContent = diff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (Math.abs(diff) > 0.01) {
            diffValDisplay.style.color = '#F58220';
        } else {
            diffValDisplay.style.color = 'white';
        }
    }
});
