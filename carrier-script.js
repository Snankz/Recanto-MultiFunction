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
    // --- CARRIER DATABASE LOGIC ---

    const carriers = [
        { name: "Mandala Transportes", cnpj: "26.470.807/0002-62", coverage: "SP, MG, DF, GO, MT, MS, TO", phone: "(11) 2413-4577", ufs: ["SP", "MG", "DF", "GO", "MT", "MS", "TO"] },
        { name: "Frilog", cnpj: "01.489.122/0001-56", coverage: "SP, RJ, ES, SC", phone: "(11) 98292-0109", ufs: ["SP", "RJ", "ES", "SC"] },
        { name: "Caiapó Cargas", cnpj: "05.543.757/0001-45", coverage: "SP, MG, GO, DF", phone: "(11) 99496-5149", ufs: ["SP", "MG", "GO", "DF"] },
        { name: "Transpen Cargas", cnpj: "78.706.751/0001-14", coverage: "SP, PR, MG (Foco em SP)", phone: "(15) 99713-2740", ufs: ["SP", "PR", "MG"] },
        { name: "Risso", cnpj: "52.661.634/0001-99", coverage: "SP, PR, SC, RS, MG, MS, RJ, ES, GO, DF", phone: "(11) 3648-4444", ufs: ["SP", "PR", "SC", "RS", "MG", "MS", "RJ", "ES", "GO", "DF"] },
        { name: "Zargo Transportes", cnpj: "54.635.420/0001-73", coverage: "Atendimento Nacional (Foco em SP)", phone: "(11) 2967-4324 / (35) 98705-4329", ufs: ["ALL"] },
        { name: "Ostel", cnpj: "04.560.557/0001-38", coverage: "SP, RJ, MG, PR, SC, RS", phone: "(11) 91741-7468", ufs: ["SP", "RJ", "MG", "PR", "SC", "RS"] },
        { name: "Alfa Transportes", cnpj: "82.110.818/0001-21", coverage: "RS, SC, PR, SP, MG, ES, RJ, GO, DF, MS, MT", phone: "(49) 3561-5100", ufs: ["RS", "SC", "PR", "SP", "MG", "ES", "RJ", "GO", "DF", "MS", "MT"] },
        { name: "THL Transportes", cnpj: "26.514.086/0001-64", coverage: "SP, PR (Carga Fracionada) / Nacional (Lotação)", phone: "(11) 98156-1479", ufs: ["ALL"] }
    ];

    const ufFilter = document.getElementById('uf-filter');
    const carriersList = document.getElementById('carriers-list');

    // Populate UF Filter
    const allUfs = new Set();
    carriers.forEach(c => {
        if (c.ufs.includes("ALL")) return;
        c.ufs.forEach(uf => allUfs.add(uf.trim()));
    });
    const sortedUfs = Array.from(allUfs).sort();

    sortedUfs.forEach(uf => {
        const option = document.createElement('option');
        option.value = uf;
        option.textContent = uf;
        ufFilter.appendChild(option);
    });

    function renderCarriers(filterUf = "") {
        carriersList.innerHTML = "";

        const filtered = carriers.filter(c => {
            if (!filterUf) return true; // Show all if no filter
            if (c.ufs.includes("ALL")) return true; // Always show national
            return c.ufs.includes(filterUf);
        });

        if (filtered.length === 0) {
            carriersList.innerHTML = `<p class="no-result" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhuma transportadora encontrada para este estado.</p>`;
            return;
        }

        filtered.forEach(c => {
            const card = document.createElement('div');
            card.className = 'carrier-card';

            card.innerHTML = `
                <div class="carrier-name">
                    ${c.name}
                    <i class="fa-solid fa-truck-moving" style="color: var(--secondary-color); opacity: 0.5;"></i>
                </div>
                <span class="carrier-cnpj">CNPJ: ${c.cnpj}</span>
                <div class="carrier-coverage">
                    <strong>Área de Atuação:</strong>
                    ${c.coverage}
                </div>
                <div class="carrier-contact">
                    <label>Telefone / Contato</label>
                    <div style="font-weight: 600; font-size: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>
                        ${c.phone}
                    </div>
                </div>
            `;
            carriersList.appendChild(card);
        });
    }

    // Initial Render
    renderCarriers();

    // Filter Event
    ufFilter.addEventListener('change', (e) => {
        renderCarriers(e.target.value);
    });

});
