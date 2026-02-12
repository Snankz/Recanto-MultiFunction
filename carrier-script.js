document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const inputs = {
        destDoc: document.getElementById('dest-doc'),
        destCity: document.getElementById('dest-city'),
        destZip: document.getElementById('dest-zip'),
        contentDesc: document.getElementById('content-desc'),
        payerDoc: document.getElementById('payer-doc'),
        volQty: document.getElementById('vol-qty'),
        volMeasures: document.getElementById('vol-measures'), // Simple mode input
        grossWeight: document.getElementById('gross-weight'),
        invoiceValue: document.getElementById('invoice-value')
    };

    const resultText = document.getElementById('result-text');
    const copyBtn = document.getElementById('copy-btn');
    const copyFeedback = document.getElementById('copy-feedback');

    // Toggle Elements
    const modeCubageBtn = document.getElementById('mode-cubage');
    const modeBoxesBtn = document.getElementById('mode-boxes');
    const sectionCubage = document.getElementById('section-cubage');
    const sectionBoxes = document.getElementById('section-boxes');

    // Box Builder Elements
    const addQty = document.getElementById('add-qty');
    const addL = document.getElementById('add-l');
    const addW = document.getElementById('add-w');
    const addH = document.getElementById('add-h');
    const addMeasureBtn = document.getElementById('add-measure-btn');
    const boxMeasuresList = document.getElementById('box-measures-list');

    let isBoxMode = false;
    let boxList = [];

    // Values that are static as per requirement
    const SENDER_CNPJ = "23843103000119";
    const SENDER_CITY = "São Paulo";
    const SENDER_ZIP = "05581-000";

    // --- MASKING FUNCTIONS ---

    const masks = {
        cpfCnpj: (value) => {
            value = value.replace(/\D/g, '');
            if (value.length <= 11) {
                // CPF: 000.000.000-00
                return value
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                    .replace(/(-\d{2})\d+?$/, '$1');
            } else {
                // CNPJ: 00.000.000/0000-00
                return value
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                    .replace(/(\d{4})(\d)/, '$1-$2')
                    .replace(/(-\d{2})\d+?$/, '$1');
            }
        },
        cep: (value) => {
            return value
                .replace(/\D/g, '')
                .replace(/^(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{3})\d+?$/, '$1');
        },
        money: (value) => {
            value = value.replace(/\D/g, '');
            const floatVal = parseFloat(value) / 100;
            if (isNaN(floatVal)) return '';
            return 'R$ ' + floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        weight: (value) => {
            value = value.replace(/\D/g, '');
            const floatVal = parseFloat(value) / 1000;
            if (isNaN(floatVal)) return '';
            return floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' kg';
        }
    };

    function applyMask(input, maskFunc) {
        input.addEventListener('input', (e) => {
            const oldVal = e.target.value;
            // For money/weight, we likely want to strip everything and re-apply from raw digits
            // For others like CPF, standard replace usually works fine
            e.target.value = maskFunc(e.target.value);
            generateText();
        });
    }

    applyMask(inputs.destDoc, masks.cpfCnpj);
    applyMask(inputs.payerDoc, masks.cpfCnpj);
    applyMask(inputs.destZip, masks.cep);
    applyMask(inputs.invoiceValue, masks.money);
    applyMask(inputs.grossWeight, masks.weight);


    // --- TOGGLE LOGIC ---

    modeCubageBtn.addEventListener('click', () => setMode(false));
    modeBoxesBtn.addEventListener('click', () => setMode(true));

    function setMode(boxMode) {
        isBoxMode = boxMode;
        if (isBoxMode) {
            modeBoxesBtn.classList.add('active');
            modeBoxesBtn.style.backgroundColor = 'white';
            modeBoxesBtn.style.color = 'var(--primary-color)';
            modeCubageBtn.classList.remove('active');
            modeCubageBtn.style.backgroundColor = 'transparent';
            modeCubageBtn.style.color = '#666';

            sectionCubage.classList.add('hidden');
            sectionBoxes.classList.remove('hidden');
        } else {
            modeCubageBtn.classList.add('active');
            modeCubageBtn.style.backgroundColor = 'white';
            modeCubageBtn.style.color = 'var(--primary-color)';
            modeBoxesBtn.classList.remove('active');
            modeBoxesBtn.style.backgroundColor = 'transparent';
            modeBoxesBtn.style.color = '#666';

            sectionBoxes.classList.add('hidden');
            sectionCubage.classList.remove('hidden');
        }
        generateText();
    }

    // --- BOX BUILDER LOGIC ---

    addMeasureBtn.addEventListener('click', () => {
        const qty = parseInt(addQty.value) || 1;
        const l = addL.value;
        const w = addW.value;
        const h = addH.value;

        if (!l || !w || !h) return;

        const boxStr = `${l}x${w}x${h}`;
        boxList.push({ qty, boxStr });

        // Reset inputs
        addL.value = ''; addW.value = ''; addH.value = '';
        addL.focus();

        renderBoxList();
        generateText();
    });

    function renderBoxList() {
        boxMeasuresList.innerHTML = '';
        boxList.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.padding = '0.25rem 0.5rem';
            li.style.borderBottom = '1px solid #eee';
            li.style.fontSize = '0.9rem';

            li.innerHTML = `
                <span><b>${item.qty}x</b> de ${item.boxStr}</span>
                <i class="fa-solid fa-trash" style="color: #cc0000; cursor: pointer;" data-index="${index}"></i>
            `;

            li.querySelector('i').addEventListener('click', () => {
                boxList.splice(index, 1);
                renderBoxList();
                generateText();
            });
            boxMeasuresList.appendChild(li);
        });
    }

    // --- GENERATE TEXT ---

    function generateText() {
        // Determine Cubage Field
        let cubageText = "";
        if (isBoxMode) {
            // Generate: [4x de 30x30x30 + 2x de 20x30x20]
            if (boxList.length > 0) {
                const parts = boxList.map(item => `${item.qty}x de ${item.boxStr}`);
                cubageText = parts.join(' + ');
            } else {
                cubageText = "";
            }
        } else {
            cubageText = inputs.volMeasures.value;
        }


        const text = `👨🦲 CNPJ/CPF do Remetente: [ ${SENDER_CNPJ} ]
👨🦲 CNPJ/CPF do Destinatário: [ ${inputs.destDoc.value} ]
🚚 Cidade Origem: [ ${SENDER_CITY} ]
✈ Cidade Destino: [ ${inputs.destCity.value} ]
🚩 CEP origem: [ ${SENDER_ZIP} ]
🏁 CEP destino: [ ${inputs.destZip.value} ]
✏ O que será transportado: [ ${inputs.contentDesc.value} ]
💸 CNPJ do Pagador do frete: [ ${inputs.payerDoc.value} ]
📦 Quantidades de Volumes: [ ${inputs.volQty.value} ]
📐 Medidas dos Volumes e/ou cubagem: [ ${cubageText} ]
⚓ Peso Bruto: [ ${inputs.grossWeight.value} ]
🏷 Valor total da nota fiscal: [ ${inputs.invoiceValue.value} ]`;

        resultText.value = text;
    }

    // Attach listeners to standard inputs
    Object.values(inputs).forEach(input => {
        if (input) input.addEventListener('input', generateText);
    });

    // Initial generation
    generateText();

    // Copy function
    copyBtn.addEventListener('click', () => {
        resultText.select();
        resultText.setSelectionRange(0, 99999); // Mobile
        navigator.clipboard.writeText(resultText.value).then(() => {
            copyFeedback.style.opacity = '1';
            setTimeout(() => {
                copyFeedback.style.opacity = '0';
            }, 2000);
        });
    });
});
