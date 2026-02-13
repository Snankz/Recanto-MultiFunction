document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const resultsContainer = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    const detailsSection = document.getElementById('product-details');
    const placeholderSection = document.getElementById('initial-placeholder');

    // Detail Elements
    const detailImg = document.getElementById('detail-image');
    const detailName = document.getElementById('detail-name');
    const detailBrand = document.getElementById('detail-brand');
    const infoGrid = document.getElementById('info-grid');
    const detailFisqp = document.getElementById('detail-fisqp');

    let allProducts = [];

    // Initialize logic once products are loaded
    async function loadProducts() {
        if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
            allProducts = products;
            console.log(`Loaded ${allProducts.length} from local products.js.`);
        } else if (window.fetchProducts) {
            allProducts = await window.fetchProducts();
        } else {
            console.error("fetchProducts function not found!");
        }
    }
    loadProducts();

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
        searchInput.value = '';
        searchInput.focus();
        resultsContainer.classList.add('hidden');
        clearBtn.style.display = 'none';
        // Optional: clear details? No, keep user context usually better.
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    // Handle Dropdown Selection
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
            });
            resultsContainer.appendChild(item);
        });
        resultsContainer.classList.remove('hidden');
    }

    // Handle Product Display
    function selectProduct(p) {
        // Show sections
        placeholderSection.classList.add('hidden');
        detailsSection.classList.remove('hidden');

        // Populate Basic Data
        detailImg.src = p.image || 'https://placehold.co/400x400';
        detailName.textContent = p.name;
        detailBrand.textContent = p.brand;

        const detailBulletin = document.getElementById('detail-bulletin');
        detailBulletin.href = p.bulletin || '#';
        detailFisqp.href = p.fisqp || '#';

        // Build Info Grid
        infoGrid.innerHTML = '';

        const fields = [
            { label: 'Modelo', val: p.model },
            { label: 'Categoria', val: p.category },
            { label: 'Código Barras', val: p.barcode },
            { label: 'NCM', val: p.ncm },
            { label: 'CEST', val: p.cest },
            { label: 'Peso / Vol.', val: `${p.weight} ${p.measure_unit.toUpperCase()}` },
            { label: 'Rendimento', val: p.coverage },
            { label: 'Ferramenta', val: p.roller },
            { label: 'Composição', val: p.composition },
            { label: 'Odor', val: p.odor },
            { label: 'Cor Líquida', val: p.color },
            { label: 'Consistência', val: p.consistency },
            { label: 'Tom Final', val: p.tonality },
            { label: 'Tempo Secagem', val: p.drying_time },
            { label: 'Cura Total', val: p.cure_time },
            { label: 'Resistência', val: p.resistance },
            { label: 'Res. Especial', val: p.special_resistance }
        ];

        fields.forEach(f => {
            const div = document.createElement('div');
            div.className = 'spec-item';
            div.innerHTML = `
                <span class="spec-label">${f.label}</span>
                <span class="spec-val">${f.val || '-'}</span>
            `;
            infoGrid.appendChild(div);
        });
    }
});
