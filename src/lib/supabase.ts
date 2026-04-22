import { createClient } from '@supabase/supabase-js';

// 🔍 DEBUG (esto va arriba, NO dentro de createClient)
console.log("🔍 SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "🔍 SUPABASE KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "OK" : "MISSING"
);

// Variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !supabaseUrl.includes('falta-configurar');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase no está configurado correctamente');
}

// Cliente
export const supabase = createClient(
  supabaseUrl || 'https://falta-configurar-url.supabase.co',
  supabaseAnonKey || 'falta-configurar-key'
);
