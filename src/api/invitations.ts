import { supabase } from './client';
import type { Invitation } from '../types';

// 获取当前用户收到的邀约
export async function getReceivedInvitations(userId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, from_pet:pets!from_pet_id(*), to_pet:pets!to_pet_id(*)')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapInvitationFromDB);
}

// 获取当前用户发出的邀约
export async function getSentInvitations(userId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, from_pet:pets!from_pet_id(*), to_pet:pets!to_pet_id(*)')
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapInvitationFromDB);
}

// 获取所有与当前用户相关的邀约
export async function getUserInvitations(userId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, from_pet:pets!from_pet_id(*), to_pet:pets!to_pet_id(*)')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapInvitationFromDB);
}

// 创建邀约
export async function createInvitation(params: {
  fromUserId: string;
  toUserId: string;
  fromPetId: string;
  toPetId: string;
  proposedTime: string;
  proposedLocation: string;
  activityType: string;
  message: string;
}): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      from_user_id: params.fromUserId,
      to_user_id: params.toUserId,
      from_pet_id: params.fromPetId,
      to_pet_id: params.toPetId,
      meet_time: params.proposedTime,
      location: params.proposedLocation,
      activity_type: params.activityType,
      message: params.message,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return mapInvitationFromDB(data);
}

// 更新邀约状态
export async function updateInvitationStatus(
  id: string,
  status: 'accepted' | 'rejected' | 'completed' | 'cancelled'
): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapInvitationFromDB(data);
}

// 数据库字段映射到前端类型
function mapInvitationFromDB(row: any): Invitation {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    fromPetId: row.from_pet_id,
    toPetId: row.to_pet_id,
    status: row.status,
    proposedTime: row.meet_time || '',
    proposedLocation: row.location || '',
    activityType: row.activity_type || '',
    message: row.message || '',
    createdAt: row.created_at,
    respondedAt: row.status !== 'pending' ? row.updated_at || row.created_at : undefined,
  };
}
