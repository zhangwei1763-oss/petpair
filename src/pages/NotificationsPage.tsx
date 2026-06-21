import { useState } from 'react';
import type { Notification } from '../types';
import { mockNotifications } from '../data/mockData';
import {
  Heart,
  Send,
  MessageCircle,
  Bell,
  Star,
  ThumbsUp,
  CheckCheck,
  Trash2,
} from 'lucide-react';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  return date.toLocaleDateString('zh-CN');
}

type NotifType = Notification['type'];

const typeIconMap: Record<NotifType, React.ReactNode> = {
  match: <Heart size={20} />,
  invitation: <Send size={20} />,
  message: <MessageCircle size={20} />,
  system: <Bell size={20} />,
  review: <Star size={20} />,
  like: <ThumbsUp size={20} />,
};

const typeColorMap: Record<NotifType, string> = {
  match: '#e74c3c',
  invitation: '#1890ff',
  message: '#7a9e7e',
  system: '#e8b94b',
  review: '#f5a623',
  like: '#c4785a',
};

const typeLabelMap: Record<NotifType, string> = {
  match: '匹配',
  invitation: '邀约',
  message: '消息',
  system: '系统',
  review: '评价',
  like: '点赞',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sort by time descending
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="notifications-page container">
      {/* Header */}
      <div className="notifications-page__header">
        <div className="notifications-page__title">
          <h1>通知中心</h1>
          {unreadCount > 0 && (
            <span className="badge badge--danger">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-sm btn-outline" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            全部已读
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notifications-page__tabs">
        <button className="notifications-page__tab notifications-page__tab--active">
          全部
        </button>
        {(['match', 'invitation', 'message', 'system', 'review', 'like'] as NotifType[]).map(
          (type) => (
            <button key={type} className="notifications-page__tab">
              {typeLabelMap[type]}
            </button>
          )
        )}
      </div>

      {/* Notification List */}
      <div className="notifications-page__list">
        {sortedNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>暂无通知</h3>
            <p>所有通知都已处理完毕</p>
          </div>
        ) : (
          sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`card notifications-page__item ${
                notif.read ? '' : 'notifications-page__item--unread'
              }`}
              onClick={() => handleMarkRead(notif.id)}
            >
              {/* Unread Dot */}
              {!notif.read && (
                <div className="notifications-page__unread-dot" />
              )}

              {/* Type Icon */}
              <div
                className="notifications-page__icon"
                style={{
                  background: typeColorMap[notif.type] + '18',
                  color: typeColorMap[notif.type],
                }}
              >
                {typeIconMap[notif.type]}
              </div>

              {/* Content */}
              <div className="notifications-page__content">
                <div className="notifications-page__content-header">
                  <span
                    className="notifications-page__type-label"
                    style={{ color: typeColorMap[notif.type] }}
                  >
                    {typeLabelMap[notif.type]}
                  </span>
                  <span className="notifications-page__time">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <h4 className="notifications-page__title">{notif.title}</h4>
                <p className="notifications-page__text">{notif.content}</p>
              </div>

              {/* Delete Button */}
              <button
                className="notifications-page__delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notif.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .notifications-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .notifications-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .notifications-page__title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .notifications-page__title h1 {
          font-size: 1.5rem;
        }

        /* Tabs */
        .notifications-page__tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .notifications-page__tab {
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .notifications-page__tab:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .notifications-page__tab--active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
        .notifications-page__tab--active:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: #fff;
        }

        /* Notification List */
        .notifications-page__list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Notification Item */
        .notifications-page__item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          position: relative;
          cursor: pointer;
          transition: all var(--transition-normal);
        }
        .notifications-page__item:hover {
          box-shadow: var(--shadow-md);
          transform: translateX(4px);
        }
        .notifications-page__item--unread {
          background: linear-gradient(90deg, rgba(24,144,255,0.04) 0%, var(--bg-card) 100%);
        }

        /* Unread Dot */
        .notifications-page__unread-dot {
          position: absolute;
          left: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1890ff;
          flex-shrink: 0;
        }
        .notifications-page__item--unread {
          padding-left: 24px;
        }

        /* Type Icon */
        .notifications-page__icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Content */
        .notifications-page__content {
          flex: 1;
          min-width: 0;
        }
        .notifications-page__content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .notifications-page__type-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .notifications-page__time {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .notifications-page__title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .notifications-page__text {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
          line-height: 1.5;
        }

        /* Delete Button */
        .notifications-page__delete-btn {
          color: var(--text-secondary);
          padding: 4px;
          opacity: 0;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .notifications-page__item:hover .notifications-page__delete-btn {
          opacity: 1;
        }
        .notifications-page__delete-btn:hover {
          color: var(--danger);
        }

        /* Mobile */
        @media (max-width: 480px) {
          .notifications-page__item {
            padding: 12px;
            gap: 10px;
          }
          .notifications-page__item--unread {
            padding-left: 20px;
          }
          .notifications-page__icon {
            width: 36px;
            height: 36px;
          }
          .notifications-page__icon svg {
            width: 16px;
            height: 16px;
          }
          .notifications-page__delete-btn {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
