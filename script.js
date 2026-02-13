document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const resultsContainer = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    // Removed legacy selection elements

    const areaInput = document.getElementById('area-input');

    // Results & Yield Elements
    const yieldInfo = document.getElementById('yield-info');
    const yieldText = document.getElementById('yield-text');
    const resultCard = document.getElementById('result-card');
    const resultValue = document.getElementById('result-value');
    const resultUnit = document.getElementById('result-unit');
    const resultNote = document.getElementById('result-note');

    // Detail Elements
    // Detail Elements
    // const productDataContainer = document.getElementById('product-data-container'); // Deprecated

    // Legacy detail elements removed

    let currentProduct = null;
    let allProducts = [];

    // --- SUPABASE INTIALIZATION (External) ---
    // Handled by db-service.js
    // ---------------------------------------

    // Hardcoded Fallback Products (to ensure calculator works if DB fails)
    const fallbackProducts = [
        {
            id: 'fallback-1',
            name: 'Bona Traffic HD',
            brand: 'Bona',
            image: 'https://placehold.co/200x200?text=Bona',
            type: 'coverage',
            value: 10,
            unit: 'm²/L',
            note: 'Rendimento estimado por demão.',
            // Fallback Details
            model: 'Traffic HD',
            category: 'Verniz',
            ncm: '3209.90.19',
            odour: 'Baixo',
            drying_time: '2-3 horas',
            cure_time: '5 dias'
        },
        {
            id: 'fallback-2',
            name: 'Skania Best',
            brand: 'Skania',
            image: 'https://placehold.co/200x200?text=Skania',
            type: 'coverage',
            value: 12,
            unit: 'm²/L',
            note: 'Rendimento estimado.',
            // Fallback Details
            model: 'Best',
            category: 'Verniz',
            ncm: '3209.90.19',
            drying_time: '3 horas'
        }
    ];

    // Fetch products from Supabase
    // Fetch products from Supabase or Local File
    async function loadProducts() {
        console.log("loadProducts called");
        try {
            // First, try to use the local products.js file which is now included
            if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
                allProducts = products;
                console.log(`Loaded ${allProducts.length} from local products.js.`);
            }
            // If local file is empty or missing, try simpler fallback
            else if (window.fetchProducts) {
                const dbProducts = await window.fetchProducts();

                if (Array.isArray(dbProducts) && dbProducts.length > 0) {
                    allProducts = dbProducts;
                    console.log(`Loaded ${allProducts.length} from DB.`);
                } else {
                    console.warn("DB empty/failed. Using fallback.");
                    allProducts = fallbackProducts;
                }
            } else {
                console.warn("No products found. Using fallback.");
                allProducts = fallbackProducts;
            }
        } catch (error) {
            console.error("Critical error loading. Using fallback.", error);
            allProducts = fallbackProducts;
        }

        // Enable search if we have products
        if (allProducts.length > 0) {
            searchInput.placeholder = `Buscar entre ${allProducts.length} produtos...`;
        }
    }

    // Initial Load
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

        // Reset selection
        currentProduct = null;
        // selectedDisplay.classList.add('hidden');
        yieldInfo.classList.add('hidden');

        // Toggle Placeholders
        const detailsSection = document.getElementById('product-details');
        const placeholder = document.getElementById('intro-placeholder');

        if (detailsSection) detailsSection.classList.add('hidden');
        if (placeholder) placeholder.classList.remove('hidden');

        hideResult();
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

        // Update selection UI (Calculator side)
        // selectedName.textContent = p.name;
        // selectedBrand.textContent = p.brand;
        // selectedDisplay.classList.remove('hidden');

        // Update Yield Display (Logic Only, if needed, or remove)
        updateYieldDisplay(p);

        // Update Product Details Card (Large Visual Aid)
        updateProductDetails(p);

        // Recalculate
        calculate();
    }

    areaInput.addEventListener('input', calculate);

    function updateYieldDisplay(product) {
        if (product) {
            yieldInfo.classList.remove('hidden');

            let yieldString = "";
            if (product.type === 'coverage') {
                yieldString = `${product.value} ${product.unit}`;
            } else if (product.type === 'consumption') {
                yieldString = `${product.value} ${product.unit}/m²`;
            } else {
                yieldString = "Consulte manual";
            }

            yieldText.textContent = `Rendimento: ${yieldString}`;
        } else {
            yieldInfo.classList.add('hidden');
        }
    }

    function updateProductDetails(p) {
        const detailsSection = document.getElementById('product-details');
        const placeholder = document.getElementById('intro-placeholder');

        if (!p) {
            detailsSection.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
            return;
        }

        detailsSection.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');

        // Elements
        const detailImg = document.getElementById('detail-image');
        const detailName = document.getElementById('detail-name-aid');
        const detailBrand = document.getElementById('detail-brand-aid');
        const infoGrid = document.getElementById('info-grid');
        const detailBulletin = document.getElementById('detail-bulletin');
        const detailFisqp = document.getElementById('detail-fisqp');

        // Populate Basic Data
        detailImg.src = p.image || 'https://placehold.co/400x400';
        detailName.textContent = p.name;
        detailBrand.textContent = p.brand;

        // Links
        detailBulletin.href = p.bulletin || '#';
        if (!p.bulletin) detailBulletin.style.display = 'none';
        else detailBulletin.style.display = 'inline-block';

        detailFisqp.href = p.fisqp || '#';
        if (!p.fisqp) detailFisqp.style.display = 'none';
        else detailFisqp.style.display = 'inline-block';

        // Build Info Grid
        infoGrid.innerHTML = '';

        // Helper for null/undefined check
        const val = (v) => v || '-';

        const fields = [
            { label: 'Modelo', val: val(p.model) },
            { label: 'Categoria', val: val(p.category) },
            { label: 'Código Barras', val: val(p.barcode) },
            { label: 'NCM', val: val(p.ncm) },
            { label: 'CEST', val: val(p.cest) },
            { label: 'Peso / Vol.', val: `${p.weight} ${p.measure_unit ? p.measure_unit.toUpperCase() : 'KG'}` },
            { label: 'Rendimento', val: val(p.coverage) },
            { label: 'Ferramenta', val: val(p.roller) },
            { label: 'Composição', val: val(p.composition) },
            { label: 'Odor', val: val(p.odor) },
            { label: 'Cor Líquida', val: val(p.color) },
            { label: 'Consistência', val: val(p.consistency) },
            { label: 'Tom Final', val: val(p.tonality) },
            { label: 'Tempo Secagem', val: val(p.drying_time) },
            { label: 'Cura Total', val: val(p.cure_time) },
            { label: 'Resistência', val: val(p.resistance) },
            { label: 'Res. Especial', val: val(p.special_resistance) }
        ];

        fields.forEach(f => {
            const div = document.createElement('div');
            div.className = 'spec-item';
            div.innerHTML = `
                <span class="spec-label">${f.label}</span>
                <span class="spec-val">${f.val}</span>
            `;
            infoGrid.appendChild(div);
        });
    }

    // Calculation Logic
    function calculate() {
        const product = currentProduct;
        const area = parseFloat(areaInput.value);

        if (!product || !area || area <= 0) {
            hideResult();
            return;
        }

        let total = 0;
        let resultUnitLabel = "Unidades"; // Default

        if (product.type === 'coverage') {
            // Yield is m² per Unit (e.g. 15 m²/L)
            // Total Units = Area / Yield
            total = area / product.value;
            resultUnitLabel = "Litros";
        } else if (product.type === 'consumption') {
            // Yield is Units per m² (e.g. 0.2 kg/m²)
            // Total Units = Area * Yield
            total = area * product.value;
            resultUnitLabel = "Kg";
        } else {
            // Manual or unknown
            total = 0;
            // If product unit is 'unid', keep Unidades, else try to infer
            if (product.unit && product.unit.toLowerCase().includes('l')) resultUnitLabel = "Litros";
            if (product.unit && product.unit.toLowerCase().includes('kg')) resultUnitLabel = "Kg";
        }

        // Format number based on magnitude
        const formattedTotal = total === 0 ? "---" : (total < 1 ? total.toFixed(3) : total.toFixed(2));

        showResult(formattedTotal, resultUnitLabel, product.note);
    };

    // UI Helpers
    const showResult = (value, unit, note) => {
        // Update value
        if (value === "---") {
            resultValue.innerHTML = "<span style='font-size: 0.6em'>Consulte</span>";
        } else {
            const numericValue = parseFloat(value);
            animateValue(resultValue, parseFloat(resultValue.textContent) || 0, numericValue, 500);
        }

        resultUnit.textContent = unit;

        // Update note if exists
        if (note) {
            resultNote.textContent = note;
        } else {
            resultNote.textContent = "*Cálculo estimado. Consulte ficha técnica.";
        }


        if (!resultCard.classList.contains('active')) {
            resultCard.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                resultCard.classList.add('active');
            }, 10);
        }
    };

    const hideResult = () => {
        resultCard.classList.remove('active');
        setTimeout(() => {
            if (!resultCard.classList.contains('active')) {
                resultCard.classList.add('hidden');
            }
        }, 500); // Wait for transition
    };

    // Number animation
    const animateValue = (obj, start, end, duration) => {
        if (isNaN(end)) {
            obj.innerHTML = end;
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = progress * (end - start) + start;
            obj.innerHTML = val < 1 && val > 0 ? val.toFixed(3) : val.toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };
});
