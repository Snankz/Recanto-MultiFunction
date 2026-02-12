const SUPABASE_URL = 'https://gujuzxjzfdkpucynpchg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-XhPC6LMuB1DJESX1Q72yw_CcFx8yNj';

// Global variable
window.supabaseClient = null;

// Function to initialize Supabase
function initSupabase() {
    console.log("Initializing Supabase from db-service.js...");
    try {
        if (window.supabase) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase initialized successfully.");
        } else {
            console.error("Supabase library not found in window.");
            alert("Erro crítico: Biblioteca Supabase não carregada. Verifique sua conexão.");
        }
    } catch (e) {
        console.error("Supabase init error:", e);
        alert("Erro ao inicializar Supabase: " + e.message);
    }
}

// Function to fetch products
async function fetchProducts() {
    if (!window.supabaseClient) {
        // Try to init if not already
        initSupabase();
        if (!window.supabaseClient) {
            console.error("Supabase client is null.");
            return [];
        }
    }

    try {
        const { data, error } = await window.supabaseClient.from('products').select('*');
        if (error) throw error;

        console.log(`Fetched ${data ? data.length : 0} products.`);
        return data || [];
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Erro ao buscar dados: " + error.message);
        return [];
    }
}

// Expose globally
window.fetchProducts = fetchProducts;

// Auto-init if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
