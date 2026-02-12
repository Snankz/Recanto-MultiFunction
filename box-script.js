document.addEventListener('DOMContentLoaded', () => {
    const boxesContainer = document.getElementById('boxes-container');
    const addBoxBtn = document.getElementById('add-box-btn');
    const totalVolumeDisplay = document.getElementById('total-volume');
    const totalWeightDisplay = document.getElementById('total-weight');

    let boxCount = 0;

    // Initialize with one box
    addBoxRow();

    addBoxBtn.addEventListener('click', () => {
        addBoxRow();
    });

    // --- Helper Functions ---

    function parseBRFloat(str) {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        // Remove dots (thousands), replace comma with dot
        const cleanStr = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanStr) || 0;
    }

    function setupWeightInput(input) {
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Strip non-digits
            if (value === '') {
                e.target.value = '';
                return;
            }

            // Format as Weight: 3 decimals (1g -> 0,001kg if unit is kg, usually user puts grams but asked for 3 decimals logic)
            // If user types 1 -> 0,001. If user types 1234 -> 1,234.
            const floatVal = parseFloat(value) / 1000;

            // Format to PT-BR
            const formatted = floatVal.toLocaleString('pt-BR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            });

            e.target.value = formatted;
        });
    }

    function addBoxRow() {
        boxCount++;
        const boxId = `box-${boxCount}`;

        const boxRow = document.createElement('div');
        boxRow.classList.add('style-box-item');
        boxRow.id = boxId;
        boxRow.style.display = 'flex';
        boxRow.style.flexDirection = 'column';
        boxRow.style.gap = '1rem';
        boxRow.style.padding = '1.5rem';
        boxRow.style.marginBottom = '1rem';
        boxRow.style.background = '#f8f9fa';
        boxRow.style.border = '1px solid var(--border-color)';
        boxRow.style.borderRadius = 'var(--radius-md)';
        boxRow.style.position = 'relative';

        // Header
        const rowHeader = document.createElement('div');
        rowHeader.style.display = 'flex';
        rowHeader.style.justifyContent = 'space-between';
        rowHeader.style.alignItems = 'center';
        rowHeader.innerHTML = `<h3 style="color: var(--primary-color); font-size: 1.1rem;">Caixa Nº ${boxCount}</h3>`;

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeBtn.classList.add('style-remove-btn');
        removeBtn.addEventListener('click', () => {
            boxRow.remove();
            calculateTotals();
        });
        rowHeader.appendChild(removeBtn);
        boxRow.appendChild(rowHeader);

        // Inputs Container
        const inputsGrid = document.createElement('div');
        inputsGrid.style.display = 'grid';
        inputsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        inputsGrid.style.gap = '1rem';

        // Helper to create input
        const createInput = (labelText, type, placeholder, unit, isWeight = false) => {
            const wrapper = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = labelText;
            label.style.display = 'block';
            label.style.marginBottom = '0.5rem';
            label.style.fontSize = '0.9rem';
            label.style.fontWeight = '600';
            label.style.color = 'var(--primary-color)';

            const inputGroup = document.createElement('div');
            inputGroup.style.position = 'relative';

            const input = document.createElement('input');
            input.type = isWeight ? 'text' : type; // Text for weight masking
            if (isWeight) input.inputMode = 'numeric';
            input.placeholder = placeholder;
            input.classList.add('calc-input');
            input.style.width = '100%';
            input.style.padding = '0.8rem';
            input.style.border = '1px solid var(--border-color)';
            input.style.borderRadius = 'var(--radius-md)';

            if (isWeight) {
                setupWeightInput(input);
            } else {
                input.min = '0';
                if (type === 'number') input.step = '0.1';
            }

            const unitSpan = document.createElement('span');
            unitSpan.textContent = unit;
            unitSpan.style.position = 'absolute';
            unitSpan.style.right = '1rem';
            unitSpan.style.top = '50%';
            unitSpan.style.transform = 'translateY(-50%)';
            unitSpan.style.color = 'var(--text-muted)';
            unitSpan.style.pointerEvents = 'none';

            inputGroup.appendChild(input);
            inputGroup.appendChild(unitSpan);
            wrapper.appendChild(label);
            wrapper.appendChild(inputGroup);
            return { wrapper, input };
        };

        // 1. Height
        const heightInput = createInput('Altura', 'number', '0', 'cm');
        heightInput.input.dataset.type = 'height';
        inputsGrid.appendChild(heightInput.wrapper);

        // 2. Width
        const widthInput = createInput('Largura', 'number', '0', 'cm');
        widthInput.input.dataset.type = 'width';
        inputsGrid.appendChild(widthInput.wrapper);

        // 3. Length
        const lengthInput = createInput('Comprimento', 'number', '0', 'cm');
        lengthInput.input.dataset.type = 'length';
        inputsGrid.appendChild(lengthInput.wrapper);

        // 4. Weight (Masked)
        const weightInput = createInput('Peso Unitário', 'number', '0,000', 'g', true);
        weightInput.input.dataset.type = 'weight';
        inputsGrid.appendChild(weightInput.wrapper);

        // 5. Quantity
        const qtyWrapper = document.createElement('div');
        qtyWrapper.style.gridColumn = '1 / -1';
        const qtyLabel = document.createElement('label');
        qtyLabel.textContent = 'Quantidade';
        qtyLabel.style.display = 'block';
        qtyLabel.style.marginBottom = '0.5rem';
        qtyLabel.style.fontWeight = '600';
        qtyLabel.style.color = 'var(--primary-color)';

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.value = '1';
        qtyInput.classList.add('calc-input');
        qtyInput.dataset.type = 'qty';
        qtyInput.style.width = '100%';
        qtyInput.style.padding = '0.8rem';
        qtyInput.style.border = '1px solid var(--border-color)';
        qtyInput.style.borderRadius = 'var(--radius-md)';

        qtyWrapper.appendChild(qtyLabel);
        qtyWrapper.appendChild(qtyInput);
        inputsGrid.appendChild(qtyWrapper);

        boxRow.appendChild(inputsGrid);
        boxesContainer.appendChild(boxRow);

        // Add listeners
        const allInputs = boxRow.querySelectorAll('.calc-input');
        allInputs.forEach((inp, index) => {
            inp.addEventListener('input', calculateTotals);

            // Enter key nav
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < allInputs.length - 1) {
                        allInputs[index + 1].focus();
                    } else {
                        const formInputs = Array.from(document.querySelectorAll('.calc-input'));
                        const globalIndex = formInputs.indexOf(inp);
                        if (globalIndex > -1 && globalIndex < formInputs.length - 1) {
                            formInputs[globalIndex + 1].focus();
                        } else {
                            addBoxRow();
                            setTimeout(() => {
                                const newInputs = document.querySelectorAll('.calc-input');
                                if (newInputs.length) newInputs[newInputs.length - 5].focus();
                            }, 50);
                        }
                    }
                }
            });
        });
    }

    function calculateTotals() {
        let totalVol = 0;
        let totalWeight = 0;

        const rows = document.querySelectorAll('#boxes-container > div');

        rows.forEach(row => {
            const h = parseFloat(row.querySelector('input[data-type="height"]').value) || 0;
            const w = parseFloat(row.querySelector('input[data-type="width"]').value) || 0;
            const l = parseFloat(row.querySelector('input[data-type="length"]').value) || 0;

            // Weight is masked text, must parse
            const weightVal = row.querySelector('input[data-type="weight"]').value;
            const weight = parseBRFloat(weightVal);

            const qty = parseFloat(row.querySelector('input[data-type="qty"]').value) || 0;

            // Volume cm³ -> m³
            const volM3 = (h * w * l) / 1000000;
            totalVol += volM3 * qty;

            const weightG = weight;
            totalWeight += weightG * qty;
        });

        totalVolumeDisplay.textContent = totalVol.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        // Fix: Display decimals for weight (kg) to ensure small values (grams) are visible
        totalWeightDisplay.textContent = totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
});
