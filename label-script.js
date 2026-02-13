document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const destNameInput = document.getElementById('dest-name');
    const destCepInput = document.getElementById('dest-cep');
    const destObsInput = document.getElementById('dest-obs');
    const obsCounter = document.getElementById('obs-counter');
    const destMpInput = document.getElementById('dest-mp');

    // Address Parts
    const destStreet = document.getElementById('dest-address-street');
    const destNumber = document.getElementById('dest-number');
    const destCompl = document.getElementById('dest-compl');
    const destDistrict = document.getElementById('dest-district');
    const destCity = document.getElementById('dest-city');
    const destUf = document.getElementById('dest-uf');

    const widthInput = document.getElementById('label-width');
    const heightInput = document.getElementById('label-height');
    const qtyInput = document.getElementById('label-qty');
    const btnPrint = document.getElementById('btn-print');
    const packingInfo = document.getElementById('packing-info');

    // Preview Container
    const previewContainer = document.getElementById('label-preview-container');
    const printArea = document.getElementById('print-area');

    // Sender Info (Fixed)
    const sender = {
        name: "Recanto Do Raspador",
        address: "Av. Corifeu De Azevedo Marques, 1199\nButantã - São Paulo / SP",
        cep: "05581-000",
        ref: "Loja Recanto Do Raspador"
    };

    // A4 Dimensions (mm) - roughly customizable
    // Standard A4 is 210mm x 297mm.
    // Safe Print Area usually less, say 5mm margin.
    const PAGE_WIDTH_MM = 210;
    const PAGE_HEIGHT_MM = 297;
    const MARGIN_MM = 5; // Global page margin
    const GAP_MM = 2; // Gap between labels

    // Init
    updatePreview();

    // Event Listeners
    const allInputs = [
        destNameInput, destCepInput, destObsInput, destMpInput,
        destStreet, destNumber, destCompl, destDistrict, destCity, destUf,
        widthInput, heightInput, qtyInput
    ];

    allInputs.forEach(el => {
        if (el) el.addEventListener('input', updatePreview);
    });

    // Obs Counter
    destObsInput.addEventListener('input', () => {
        const remaining = 60 - destObsInput.value.length;
        obsCounter.textContent = `caracteres restantes: ${remaining}`;
    });

    btnPrint.addEventListener('click', generatePrintLayout);

    // --- Core Functions ---

    function getLabelData() {
        return {
            destName: destNameInput.value || "Nome Destinatário",
            destCep: destCepInput.value || "00000-000",
            destObs: destObsInput.value || "",
            mp: destMpInput.checked,

            street: destStreet.value || "Rua Exemplo",
            number: destNumber.value || "123",
            compl: destCompl.value || "",
            district: destDistrict.value || "Bairro",
            city: destCity.value || "Cidade",
            uf: destUf.value || "SP",

            widthCm: parseFloat(widthInput.value) || 10,
            heightCm: parseFloat(heightInput.value) || 7,
            qty: parseInt(qtyInput.value) || 1
        };
    }

    function createLabelHTML(data, isPreview = false) {
        // Convert CM to whatever unit for display.
        // For screen preview, we can scale roughly 1cm = 30px? or just use cm units in style.
        // Using inline styles for dimensions to be accurate in print.

        const w = data.widthCm + 'cm';
        const h = data.heightCm + 'cm';

        // Construct Address Lines
        // Line 1: Street, Num [Compl]
        let line1 = `${data.street}, ${data.number}`;
        if (data.compl) line1 += ` - ${data.compl}`;

        // Line 2: District - City / UF
        const line2 = `${data.district} - ${data.city} / ${data.uf}`;

        // Sender Block
        const senderBlock = `
            <div class="label-sender">
                <div class="sender-info">
                    <strong>Remetente:</strong> ${sender.name}<br>
                    ${sender.address}<br>
                    <strong>CEP:</strong> ${sender.cep}<br>
                    <span class="ref-text">Ref: ${sender.ref}</span>
                </div>
                <img src="img/logo_loja.png" alt="Logo" class="sender-logo-img">
            </div>
        `;

        // Recipient Block
        const recipBlock = `
            <div class="label-recipient">
                <div class="label-tag">DESTINATÁRIO ${data.mp ? '<span style="float:right; border:1px solid #000; padding:0 2px;">MP</span>' : ''}</div>
                <div class="dest-name">${data.destName}</div>
                <div class="dest-address">
                    ${line1}<br>
                    ${line2}
                </div>
                <div class="dest-cep"><strong>CEP:</strong> ${data.destCep}</div>
                ${data.destObs ? `<div class="dest-obs"><strong>Obs:</strong> ${data.destObs}</div>` : ''}
            </div>
        `;

        // Logo (Optional - using text if image not available)
        const header = `
            <div class="label-header">
                <span class="service-name">ENCOMENDA</span>
                <span class="logo-placeholder"><i class="fa-solid fa-box"></i></span>
            </div>
        `;

        return `
            <div class="shipping-label-item" style="width: ${w}; height: ${h};">
                ${header}
                ${recipBlock}
                ${senderBlock}
            </div>
        `;
    }

    function updatePreview() {
        const data = getLabelData();

        // Render Single Preview
        previewContainer.innerHTML = createLabelHTML(data, true);

        // Calculate Packing
        const availW = PAGE_WIDTH_MM - (MARGIN_MM * 2);
        const availH = PAGE_HEIGHT_MM - (MARGIN_MM * 2);
        const labelW_mm = data.widthCm * 10;
        const labelH_mm = data.heightCm * 10;

        // Simple grid calculation
        const cols = Math.floor((availW + GAP_MM) / (labelW_mm + GAP_MM));
        const rows = Math.floor((availH + GAP_MM) / (labelH_mm + GAP_MM));
        const perPage = cols * rows;

        if (perPage > 0) {
            const pages = Math.ceil(data.qty / perPage);
            packingInfo.textContent = `A4 estimativa: ${cols} colunas x ${rows} linhas = ${perPage} etiquetas/pág. Total: ${pages} página(s).`;
            packingInfo.style.color = "var(--secondary-color)";
        } else {
            packingInfo.textContent = "Etiqueta muito grande para A4!";
            packingInfo.style.color = "red";
        }
    }

    function generatePrintLayout() {
        const data = getLabelData();
        printArea.innerHTML = ''; // Clear previous

        // create pages
        const labelW_mm = data.widthCm * 10;
        const labelH_mm = data.heightCm * 10;
        const availW = PAGE_WIDTH_MM - (MARGIN_MM * 2);
        const availH = PAGE_HEIGHT_MM - (MARGIN_MM * 2);

        const cols = Math.floor((availW + GAP_MM) / (labelW_mm + GAP_MM));
        const rows = Math.floor((availH + GAP_MM) / (labelH_mm + GAP_MM));
        const perPage = cols * rows;

        let labelsGiven = 0;
        let totalLabels = data.qty;

        if (perPage === 0) {
            alert("Etiqueta muito grande para a folha A4!");
            return;
        }

        while (labelsGiven < totalLabels) {
            // New Page
            const pageDiv = document.createElement('div');
            pageDiv.className = 'print-page';

            // Grid Container for this page
            const grid = document.createElement('div');
            grid.className = 'print-grid';
            grid.style.gridTemplateColumns = `repeat(${cols}, ${data.widthCm}cm)`;
            grid.style.gridTemplateRows = `repeat(${rows}, ${data.heightCm}cm)`;
            grid.style.gap = `${GAP_MM}mm`;

            // Fill slots
            const slotsForPage = Math.min(perPage, totalLabels - labelsGiven);

            for (let i = 0; i < slotsForPage; i++) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = createLabelHTML(data);
                grid.appendChild(wrapper.firstElementChild);
                labelsGiven++;
            }

            pageDiv.appendChild(grid);
            printArea.appendChild(pageDiv);
        }

        // Trigger Print
        window.print();
    }
});
