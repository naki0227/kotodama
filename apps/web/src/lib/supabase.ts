import { createClient } from "@supabase/supabase-js";

// These variables should be in .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Environment Variables missing!");
} else {
    console.log("Supabase Client Initialized:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        detectSessionInUrl: true,
        persistSession: true,
    },
});
