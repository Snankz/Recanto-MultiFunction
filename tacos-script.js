document.addEventListener('DOMContentLoaded', () => {
    const areaInput = document.getElementById('area-input');
    const resultsContainer = document.getElementById('tacos-results-container');
    const resultsPlaceholder = document.getElementById('results-placeholder');

    const tacos = [
        { name: "Taco 7 x 21", w: 7, l: 21 },
        { name: "Taco 5,5 x 16,5", w: 5.5, l: 16.5 },
        { name: "Taco 10 x 40", w: 10, l: 40 },
        { name: "Taco 7 x 42", w: 7, l: 42 },
        { name: "Taco 7 x 35", w: 7, l: 35 }
    ];

    areaInput.addEventListener('input', calculateTacos);

    function calculateTacos() {
        const area = parseFloat(areaInput.value);

        if (!area || area <= 0) {
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(resultsPlaceholder);
            return;
        }

        resultsContainer.innerHTML = ''; // Clear previous results

        tacos.forEach(taco => {
            // Calculate area of one taco in m²
            // Dimensions are in cm, so divide by 100
            const tacoAreaM2 = (taco.w / 100) * (taco.l / 100);

            // Calculate quantity needed (Area / TacoArea), rounded up
            const qtyNeeded = Math.ceil(area / tacoAreaM2);

            // Create result item
            const resultItem = document.createElement('div');
            resultItem.style.marginBottom = '1rem';
            resultItem.style.padding = '1rem';
            resultItem.style.borderScale = '1px solid var(--border-color)';
            resultItem.style.background = '#f8f9fa';
            resultItem.style.borderRadius = 'var(--radius-md)';
            resultItem.style.display = 'flex';
            resultItem.style.justifyContent = 'space-between';
            resultItem.style.alignItems = 'center';

            resultItem.innerHTML = `
                <div style="text-align: left;">
                    <h3 style="color: var(--primary-color); font-size: 1.1rem; margin-bottom: 0.2rem;">${taco.name}</h3>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Dimensões: ${taco.w}x${taco.l} cm</span>
                </div>
                <div style="text-align: right;">
                    <span style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--secondary-color);">${qtyNeeded.toLocaleString('pt-BR')}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">unidades</span>
                </div>
            `;

            resultsContainer.appendChild(resultItem);
        });
    }
});
