document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const resultsContainer = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    const selectedDisplay = document.getElementById('selected-product-display');
    const selectedName = document.getElementById('selected-name');
    const selectedBrand = document.getElementById('selected-brand');

    const areaInput = document.getElementById('area-input');

    // Yield Info Elements
    const yieldInfo = document.getElementById('yield-info');
    const yieldText = document.getElementById('yield-text');

    // Result Elements
    const resultCard = document.getElementById('result-card');
    const resultValue = document.getElementById('result-value');
    const resultUnit = document.getElementById('result-unit');
    const resultNote = document.querySelector('.result-note');

    // Image Elements
    const productImage = document.getElementById('product-image');
    const productImageContainer = document.getElementById('product-image-container');
    const imagePlaceholderMsg = document.getElementById('image-placeholder-msg');

    let currentProduct = null;
    let allProducts = [];

    // Check if products data exists
    if (window.productsData) {
        allProducts = window.productsData;
    } else {
        console.error("Products data not loaded!");
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

        // Reset selection
        currentProduct = null;
        selectedDisplay.classList.add('hidden');
        yieldInfo.classList.add('hidden');
        updateProductImage(null);
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
                searchInput.value = ''; // Clear search text for cleaner look? Or keep p.name?
                // Keeping it empty or replacing with name:
                // searchInput.value = p.name; 
                // Let's clear it and rely on the display box below.

                clearBtn.style.display = 'none';
            });
            resultsContainer.appendChild(item);
        });
        resultsContainer.classList.remove('hidden');
    }

    function selectProduct(p) {
        currentProduct = p;

        // Update selection UI
        selectedName.textContent = p.name;
        selectedBrand.textContent = p.brand;
        selectedDisplay.classList.remove('hidden');

        // Update Image
        updateProductImage(p.image);

        // Update Yield Display
        updateYieldDisplay(p);

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

    function updateProductImage(imageUrl) {
        if (!imageUrl) {
            productImageContainer.classList.add('hidden');
            imagePlaceholderMsg.classList.remove('hidden');
            return;
        }

        // Reset animation
        productImage.classList.remove('animate-slide-up');
        void productImage.offsetWidth; // Trigger reflow

        productImage.src = imageUrl;

        imagePlaceholderMsg.classList.add('hidden');
        productImageContainer.classList.remove('hidden');

        // Add animation class
        productImage.classList.add('animate-slide-up');
    }

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
