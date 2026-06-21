import { supabase, isSupabaseConfigured } from './client';
import type { User } from '../types';

export async function signUpWithEmail(email: string, password: string, name: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function onAuthStateChange(callback: (user: any) => void) {
  if (!isSupabaseConfigured) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

// 获取或创建用户 profile
export async function getUserProfile(userId: string): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// 创建用户 profile（首次注册时）
export async function createUserProfile(userId: string, name: string, phone?: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, name, phone })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 更新用户 profile
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
