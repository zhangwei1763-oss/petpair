import { supabase } from './client';

// 获取当前用户收到的所有评价（作为被评价者）
export async function getReceivedReviews(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// 获取某个宠物收到的所有评价
export async function getPetReviews(petId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('to_pet_id', petId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// 计算平均评分（基于 reviews 数组的 friendliness/punctuality/accuracy 三项平均值）
export function calcAvgRating(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => {
    const f = r.friendliness || 0;
    const p = r.punctuality || 0;
    const a = r.accuracy || 0;
    return sum + (f + p + a) / 3;
  }, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
