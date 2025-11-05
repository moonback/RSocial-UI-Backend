import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables d\'environnement Supabase manquantes');
}

// Client pour les opérations publiques
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin pour les opérations privilégiées
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;

