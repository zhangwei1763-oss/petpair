import { createClient } from '@supabase/supabase-js';

// 硬编码 Supabase 配置（Cloudflare Pages 部署时环境变量丢失）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfnxlxxxjrraaxltnrpr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbnhseHh4anJyYWF4bHRucnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDkxNDQsImV4cCI6MjA5NzYyNTE0NH0.pbGnijzVFlf05t1Szpgs7du_X4oHCNxyA898v9hw8QE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
