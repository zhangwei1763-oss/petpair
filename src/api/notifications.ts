import { supabase } from './client';
import type { Notification } from '../types';

/**
 * 获取当前用户的所有通知
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getNotifications error:', error);
    return [];
  }

  return (data || []).map(mapNotificationFromDB);
}

/**
 * 标记单条通知为已读
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('markNotificationRead error:', error);
    return false;
  }
  return true;
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('markAllNotificationsRead error:', error);
    return false;
  }
  return true;
}

/**
 * 删除通知
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('deleteNotification error:', error);
    return false;
  }
  return true;
}

/**
 * 创建通知（供其他模块调用）
 */
export async function createNotification(params: {
  userId: string;
  type: Notification['type'];
  title: string;
  content: string;
  relatedId?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      content: params.content,
      related_id: params.relatedId || null,
    });

  if (error) {
    console.error('createNotification error:', error);
    return false;
  }
  return true;
}

/**
 * 获取未读通知数
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('getUnreadNotificationCount error:', error);
    return 0;
  }
  return count || 0;
}

function mapNotificationFromDB(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content || '',
    read: row.is_read ?? false,
    createdAt: row.created_at,
    relatedId: row.related_id,
  };
}
