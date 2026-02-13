document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const heightInput = document.getElementById('box-height');
    const widthInput = document.getElementById('box-width');
    const lengthInput = document.getElementById('box-length');
    const weightInput = document.getElementById('box-weight');
    const addBoxBtn = document.getElementById('add-box-btn');

    // List & Results
    const boxesList = document.getElementById('boxes-list');
    const emptyMsg = document.getElementById('empty-msg');
    const totalVolumeDisplay = document.getElementById('total-volume');
    const totalWeightDisplay = document.getElementById('total-weight');

    // State
    let boxList = [];
    let boxIdCounter = 0;

    // --- Initialization ---
    // Apply weight mask to static input
    setupWeightInput(weightInput);

    // --- Event Listeners ---
    addBoxBtn.addEventListener('click', addBox);

    // Enter key navigation for static inputs
    const staticInputs = [heightInput, widthInput, lengthInput, weightInput];
    staticInputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < staticInputs.length - 1) {
                    staticInputs[index + 1].focus();
                } else {
                    addBox();
                }
            }
        });
    });

    // --- Core Functions ---

    function addBox() {
        const h = parseFloat(heightInput.value);
        const w = parseFloat(widthInput.value);
        const l = parseFloat(lengthInput.value);
        const weight = parseBRFloat(weightInput.value);

        if (!h || !w || !l) {
            alert("Por favor, preencha todas as dimensões com valores maiores que zero.");
            return;
        }

        // Add to list
        const newItem = {
            id: ++boxIdCounter,
            h: h,
            w: w,
            l: l,
            weight: weight,
            qty: 1
        };

        boxList.push(newItem);

        // Clear inputs
        heightInput.value = '';
        widthInput.value = '';
        lengthInput.value = '';
        weightInput.value = '';
        heightInput.focus();

        renderList();
        calculateTotals();
    }

    function renderList() {
        boxesList.innerHTML = '';

        if (boxList.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';

        boxList.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '1rem';
            li.style.marginBottom = '0.5rem';
            li.style.backgroundColor = '#fff';
            li.style.border = '1px solid var(--border-color)';
            li.style.borderRadius = 'var(--radius-md)';
            li.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';

            li.innerHTML = `
                <div style="flex: 1; margin-right: 1rem;">
                    <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 0.2rem;">
                        Caixa #${item.id}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-muted);">
                        ${item.h} x ${item.w} x ${item.l} cm
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Peso un: ${formatWeight(item.weight)}
                    </div>
                </div>
                
                <!-- Editable Quantity -->
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; margin-right: 1rem;">
                     <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Qtd:</label>
                     <input type="number" class="list-qty-input" data-index="${index}" value="${item.qty}" min="1" 
                        style="width: 60px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;">
                </div>

                <div style="display: flex; align-items: center; gap: 1rem;">
                     <!-- Item Subtotal (Optional but helpful) 
                    <span style="font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: right; color: var(--secondary-color);">
                        ${formatWeight(item.weight * item.qty)}
                    </span>
                    -->
                    <button class="remove-btn" data-index="${index}" style="
                        background: #ffcccc; color: #cc0000; border: none; 
                        width: 32px; height: 32px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-trash" style="pointer-events: none;"></i>
                    </button>
                </div>
            `;

            boxesList.appendChild(li);
        });

        // Add listeners
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                boxList.splice(index, 1);
                renderList();
                calculateTotals();
            });
        });

        document.querySelectorAll('.list-qty-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newQty = parseInt(e.target.value) || 1;
                boxList[index].qty = newQty;
                calculateTotals();
            });
        });
    }

    function calculateTotals() {
        let totalVol = 0;
        let totalWeight = 0;

        boxList.forEach(item => {
            // Volume cm³ -> m³
            const volM3 = (item.h * item.w * item.l) / 1000000;
            totalVol += volM3 * item.qty;

            // Weight in grams
            totalWeight += item.weight * item.qty;
        });

        totalVolumeDisplay.textContent = totalVol.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        // Display decimals for weight (kg) to ensure small values are visible
        // Actually the display unit in HTML is 'g' (grams). 
        // If we want kg, we should divide by 1000. 
        // HTML says 0 g. Let's keep it grams? Or change to kg?
        // Weight input is masked as 0,000 (implies kg usually?). 
        // The helper `parseBRFloat` on `0,001` returns `0.001`. 
        // If input is "1,000" (1kg), parse returns 1.
        // So the unit is KG. 
        // But the HTML Result says <span class="unit">g</span>?
        // Let's check HTML.
        // Line 62: <span class="unit" ...>g</span>
        // But previously logic was mixing things.
        // Let's assume input is in Grams logic for the mask?
        // Wait, `setupWeightInput` divides by 1000. 
        // "1" -> 0.001. "1000" -> 1.000.
        // So the internal value is effectively KG.
        // If result display says 'g', it might be confusing if we show 1.000 (which is 1kg).
        // Let's change the unit in HTML to KG via JS if possible, or just treat it as KG.
        // Actually, let's look at `setupWeightInput`.
        // Line 36: floatVal = parseFloat(value) / 1000;
        // So typng 1234 gives 1.234.
        // If that is grams, 1.234 grams is tiny.
        // Usually these masks are for KG. 1234g = 1.234kg.
        // So the internal value IS KG.
        // The display in HTML says 'g'. That is a bug in HTML effectively if we use KG.
        // I'll stick to KG since `parseBRFloat` likely returns the number as is.

        // Let's assume the user wants KG.
        // If the HTML header says 'g', I should probably update it to 'kg' or output grams.
        // If internal is KG: 1.5 kg. Output in grams: 1500.
        // If I output 1.500 and unit is g, that's 1.5 grams.
        // Let's update the unit text to 'kg' via JS to be safe, or just output grams.
        // I will output KG and change unit text if I can, or just expect the user to know.
        // Re-checking HTML... `box-calculator.html` Line 62: `g`.
        // I'll update it to 'kg' in this script to fix the inconsistency.

        const unitSpan = document.querySelector('#total-weight + .unit');
        if (unitSpan) unitSpan.textContent = "kg";

        totalWeightDisplay.textContent = totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }

    // --- Helpers ---

    function parseBRFloat(str) {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        // Remove dots (thousands), replace comma with dot
        const cleanStr = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanStr) || 0;
    }

    function formatWeight(val) {
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' kg';
    }

    function setupWeightInput(input) {
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Strip non-digits
            if (value === '') {
                e.target.value = '';
                return;
            }

            // Format as Weight: 3 decimals 
            // 1 -> 0,001
            const floatVal = parseFloat(value) / 1000;

            // Format to PT-BR
            const formatted = floatVal.toLocaleString('pt-BR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            });

            e.target.value = formatted;
        });
    }
});
