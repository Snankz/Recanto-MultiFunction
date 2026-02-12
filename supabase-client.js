
const SUPABASE_URL = 'https://gujuzxjzfdkpucynpchg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-XhPC6LMuB1DJESX1Q72yw_CcFx8yNj';

let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Supabase client failed to initialize:", e);
}

// Function to fetch products
async function fetchProducts() {
    if (!supabase) {
        console.error("Supabase not initialized");
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data;
}

// Expose to window for global access if needed, or just allow script access
// Expose to window for global access if needed, or just allow script access
window.fetchProducts = fetchProducts;
window.supabaseClient = supabase;
