/* 
    If using npm: import { createClient } from '@supabase/supabase-js'
    If using CDN, 'supabase' is available globally.
*/
const SUPABASE_URL = 'https://gujuzxjzfdkpucynpchg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anV6eGp6ZmRrcHVjeW5wY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTczNzYsImV4cCI6MjA4NjQ3MzM3Nn0.1Yc7aAML3OI4yDYtrrgvGNxBky9clWb-hHmCf9NVJT0';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Function to fetch products
async function fetchProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*');
    
    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data;
}