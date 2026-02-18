const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const moonIcon = themeToggleBtn.querySelector('.fa-moon');
const sunIcon = themeToggleBtn.querySelector('.fa-sun');

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
        themeToggleBtn.setAttribute('aria-label', 'Alternar para Modo Escuro');
    } else {
        moonIcon.style.display = 'inline-block';
        sunIcon.style.display = 'none';
        themeToggleBtn.setAttribute('aria-label', 'Alternar para Modo Claro');
    }
});
