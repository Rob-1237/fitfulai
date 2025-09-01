import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,      // keeps session in localStorage
        autoRefreshToken: true,    // refreshes JWT automatically
        detectSessionInUrl: true   // parses magic link tokens
    }
});

// Checks if a valid JWT is loaded and attached every time the app starts
supabase.auth.getSession().then(({ data }) => {
    console.log("Chrome Debug: Current session in supabaseClient.js:", data.session);
});