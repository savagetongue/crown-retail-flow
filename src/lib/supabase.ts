import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://svunqpzuyzdvdfmuylqw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dW5xcHp1eXpkdmRmbXV5bHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODg4MzMsImV4cCI6MjA3NzA2NDgzM30.bZa5_6VTs9YZAVyIIVlwLHZL1e5QTRscCqTY8n2Pqxo";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
