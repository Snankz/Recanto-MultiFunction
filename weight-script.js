document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('product-search');
    const resultsContainer = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    const selectedDisplay = document.getElementById('selected-product-display');
    const selectedName = document.getElementById('selected-name');
    const selectedBrand = document.getElementById('selected-brand');

    const qtyInput = document.getElementById('qty-input');
    const addBtn = document.getElementById('add-product-btn');
    const productList = document.getElementById('product-list');
    const totalWeightDisplay = document.getElementById('total-weight');
    const totalItemsDisplay = document.getElementById('total-items');
    const emptyMsg = document.getElementById('empty-list-msg');

    // State
    let cart = []; // Array of { product, qty }
    let currentProduct = null;
    let allProducts = [];

    // Get unique products
    if (window.productsData && Array.isArray(window.productsData)) {
        allProducts = window.productsData;
    } else {
        console.error("Products data not loaded!");
        // Optional: Disable search or show error
        searchInput.disabled = true;
        searchInput.placeholder = "Erro ao carregar produtos";
        return;
    }

    // --- Search Logic ---
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length > 0) {
            clearBtn.style.display = 'block';
            const matches = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
            renderDropdown(matches);
        } else {
            clearBtn.style.display = 'none';
            resultsContainer.classList.add('hidden');
        }
    });

    clearBtn.addEventListener('click', () => {
        resetSearch();
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    function resetSearch() {
        searchInput.value = '';
        searchInput.focus();
        resultsContainer.classList.add('hidden');
        clearBtn.style.display = 'none';

        currentProduct = null;
        selectedDisplay.classList.add('hidden');
    }

    function renderDropdown(products) {
        resultsContainer.innerHTML = '';
        if (products.length === 0) {
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = '<div class="search-item no-result">Nenhum produto encontrado.</div>';
            return;
        }

        products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.innerHTML = `
                <img src="${p.image || 'https://placehold.co/50x50'}" alt="Thumb">
                <div>
                    <div class="search-name">${p.name}</div>
                    <div class="search-brand">${p.brand}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                selectProduct(p);
                resultsContainer.classList.add('hidden');
                searchInput.value = '';
                clearBtn.style.display = 'none';
            });
            resultsContainer.appendChild(item);
        });
        resultsContainer.classList.remove('hidden');
    }

    function selectProduct(p) {
        currentProduct = p;
        selectedName.textContent = p.name;
        selectedBrand.textContent = `${p.brand} - ${p.weight}${p.measure_unit || 'kg'}`;
        selectedDisplay.classList.remove('hidden');
    }

    // 3. Handle Add to List
    addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value);

        if (!currentProduct || qty <= 0) {
            if (!currentProduct) alert("Selecione um produto primeiro.");
            return;
        }

        const product = currentProduct;

        // Check if already in cart
        const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += qty;
        } else {
            cart.push({
                product: product,
                qty: qty
            });
        }

        renderList();
        calculateTotal();

        // Optional: Reset selection after add?
        // resetSearch(); 
        // User might want to add same product again, so keep it? 
        // Usually clearer to keep selection.
    });

    // 4. Render List
    function renderList() {
        productList.innerHTML = '';

        if (cart.length === 0) {
            productList.appendChild(emptyMsg);
            return;
        }

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '0.75rem';
            li.style.marginBottom = '0.5rem';
            li.style.backgroundColor = '#f8f9fa';
            li.style.border = '1px solid var(--border-color)';
            li.style.borderRadius = 'var(--radius-md)';

            li.innerHTML = `
                <div style="flex: 1; margin-right: 1rem;">
                    <div style="font-weight: 600; color: var(--primary-color);">${item.product.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        ${item.qty} x ${item.product.weight} ${item.product.measure_unit || 'kg'}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 700; color: var(--secondary-color);">
                        ${(item.product.weight * item.qty).toFixed(2)}kg
                    </span>
                    <button class="remove-btn" data-index="${index}" style="
                        background: #ffcccc; color: #cc0000; border: none; 
                        width: 28px; height: 28px; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-trash" style="pointer-events: none;"></i>
                    </button>
                </div>
            `;

            productList.appendChild(li);
        });

        // Add listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                renderList();
                calculateTotal();
            });
        });
    }

    // 5. Calculate Total
    function calculateTotal() {
        let totalWeight = 0;
        let totalItems = 0;

        cart.forEach(item => {
            let itemWeight = item.product.weight * item.qty;
            totalWeight += itemWeight;
            totalItems += item.qty;
        });

        totalWeightDisplay.textContent = totalWeight.toFixed(2);
        totalItemsDisplay.textContent = totalItems;
    }
});
