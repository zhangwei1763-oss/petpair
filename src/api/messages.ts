import { supabase } from './client';
import type { Message } from '../types';

// 获取与某用户的对话消息
export async function getMessagesBetween(userId: string, partnerId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMessageFromDB);
}

// 获取当前用户的所有消息（用于构建对话列表）
export async function getUserMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMessageFromDB);
}

// 发送消息
export async function sendMessage(params: {
  senderId: string;
  receiverId: string;
  content: string;
  type?: 'text' | 'image' | 'location' | 'invitation';
  invitationId?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content: params.content,
      type: params.type || 'text',
      invitation_id: params.invitationId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMessageFromDB(data);
}

// 发送邀约消息（同时创建邀约和消息）
export async function sendInvitationMessage(params: {
  senderId: string;
  receiverId: string;
  invitationId: string;
  content: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content: params.content,
      type: 'invitation',
      invitation_id: params.invitationId,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMessageFromDB(data);
}

// 标记消息为已读
export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
  if (messageIds.length === 0) return;
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .in('id', messageIds);
  if (error) throw error;
}

// 数据库字段映射到前端类型
function mapMessageFromDB(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    type: row.type,
    invitationId: row.invitation_id,
    isRead: row.is_read ?? false,
    createdAt: row.created_at,
  };
}
