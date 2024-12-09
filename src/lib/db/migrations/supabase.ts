import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = 'https://siukegkcregepkwqiora.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDk4MjYsImV4cCI6MjA0OTE4NTgyNn0.MDuT_GbDGLqYmxj8FFLFc0fD1Z5gqcBIgtGG3yuzu0o';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
