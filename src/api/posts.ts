import { supabase, isSupabaseConfigured } from './client';
import { mockActivityPosts } from '../data/mockData';
import type { ActivityPost } from '../types';

export async function getPosts(): Promise<ActivityPost[]> {
  if (!isSupabaseConfigured) return mockActivityPosts;
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(name, avatar), pet:pets(name, photos)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPostFromDB);
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    return true;
  }
}

export async function addComment(postId: string, userId: string, content: string): Promise<any> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select('*, user:users(name, avatar)')
    .single();
  if (error) throw error;
  return data;
}

function mapPostFromDB(row: any): ActivityPost {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.name || '未知用户',
    authorAvatar: row.author?.avatar || '',
    petId: row.pet_id,
    petName: row.pet?.name || '',
    petPhoto: row.pet?.photos?.[0] || '',
    content: row.content,
    images: row.images || [],
    likes: row.likes_count || 0,
    comments: [],
    isLiked: false,
    createdAt: row.created_at,
  };
}
