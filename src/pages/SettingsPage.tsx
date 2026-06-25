import { useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Trash2,
  UserX,
  AlertTriangle,
  ChevronRight,
  Phone,
  KeyRound,
} from 'lucide-react';

interface BlacklistedUser {
  id: string;
  name: string;
  avatar: string;
  reason: string;
  blockedAt: string;
}

export default function SettingsPage(_props?: { user?: unknown; onLogout?: () => void }) {
  const [blacklist, setBlacklist] = useState<BlacklistedUser[]>([]);

  // Privacy toggles
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideLocation, setHideLocation] = useState(false);
  const [blockStrangers, setBlockStrangers] = useState(false);

  const handleUnblock = (userId: string) => {
    setBlacklist((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="settings-page container">
      <div className="settings-page__header">
        <Settings size={24} />
        <h1>设置</h1>
      </div>

      {/* Blacklist Management */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">
          <UserX size={18} />
          黑名单管理
        </h2>
        <div className="card settings-page__blacklist">
          {blacklist.length === 0 ? (
            <div className="settings-page__empty">
              <p>暂无拉黑用户</p>
            </div>
          ) : (
            blacklist.map((user) => (
              <div key={user.id} className="settings-page__blacklist-item">
                <img
                  className="avatar-sm"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className="settings-page__blacklist-info">
                  <span className="settings-page__blacklist-name">{user.name}</span>
                  <span className="settings-page__blacklist-reason">
                    拉黑原因：{user.reason}
                  </span>
                  <span className="settings-page__blacklist-date">
                    拉黑时间：{new Date(user.blockedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleUnblock(user.id)}
                >
                  解除拉黑
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">
          <Shield size={18} />
          隐私设置
        </h2>
        <div className="card settings-page__privacy">
          <div className="settings-page__toggle-item">
            <div className="settings-page__toggle-info">
              <span className="settings-page__toggle-label">仅允许认证用户邀约</span>
              <span className="settings-page__toggle-desc">
                开启后，未通过认证的用户无法向您发送邀约
              </span>
            </div>
            <button
              className={`settings-page__toggle ${verifiedOnly ? 'settings-page__toggle--active' : ''}`}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
            >
              <span className="settings-page__toggle-slider" />
            </button>
          </div>

          <div className="settings-page__toggle-item">
            <div className="settings-page__toggle-info">
              <span className="settings-page__toggle-label">隐藏我的位置</span>
              <span className="settings-page__toggle-desc">
                开启后，其他用户无法看到您的精确位置信息
              </span>
            </div>
            <button
              className={`settings-page__toggle ${hideLocation ? 'settings-page__toggle--active' : ''}`}
              onClick={() => setHideLocation(!hideLocation)}
            >
              <span className="settings-page__toggle-slider" />
            </button>
          </div>

          <div className="settings-page__toggle-item">
            <div className="settings-page__toggle-info">
              <span className="settings-page__toggle-label">不接收陌生消息</span>
              <span className="settings-page__toggle-desc">
                开启后，仅允许已匹配的用户向您发送消息
              </span>
            </div>
            <button
              className={`settings-page__toggle ${blockStrangers ? 'settings-page__toggle--active' : ''}`}
              onClick={() => setBlockStrangers(!blockStrangers)}
            >
              <span className="settings-page__toggle-slider" />
            </button>
          </div>
        </div>
      </section>

      {/* Account Security */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">
          <Lock size={18} />
          账号安全
        </h2>
        <div className="card settings-page__security">
          <button className="settings-page__security-item" onClick={() => {}}>
            <div className="settings-page__security-icon">
              <Phone size={18} />
            </div>
            <div className="settings-page__security-info">
              <span className="settings-page__security-label">修改手机号</span>
              <span className="settings-page__security-value">138****8000</span>
            </div>
            <ChevronRight size={18} className="settings-page__security-arrow" />
          </button>

          <button className="settings-page__security-item" onClick={() => {}}>
            <div className="settings-page__security-icon">
              <KeyRound size={18} />
            </div>
            <div className="settings-page__security-info">
              <span className="settings-page__security-label">修改密码</span>
              <span className="settings-page__security-value">上次修改：30天前</span>
            </div>
            <ChevronRight size={18} className="settings-page__security-arrow" />
          </button>

          <div className="settings-page__danger-zone">
            <button
              className="btn btn-danger btn-sm settings-page__delete-btn"
              onClick={() => {
                if (window.confirm('确定要注销账号吗？此操作不可恢复。')) {
                  alert('账号注销功能暂未开放');
                }
              }}
            >
              <Trash2 size={14} />
              注销账号
            </button>
            <span className="settings-page__danger-warning">
              <AlertTriangle size={12} />
              注销后所有数据将被永久删除且无法恢复
            </span>
          </div>
        </div>
      </section>

      <style>{`
        .settings-page {
          padding-top: 24px;
          padding-bottom: 60px;
        }
        .settings-page__header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: var(--primary);
        }
        .settings-page__header h1 {
          color: var(--text);
          font-size: 1.5rem;
        }

        /* Section */
        .settings-page__section {
          margin-bottom: 28px;
        }
        .settings-page__section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.125rem;
          margin-bottom: 12px;
          color: var(--text);
        }

        /* Blacklist */
        .settings-page__blacklist {
          padding: 0;
          overflow: hidden;
        }
        .settings-page__empty {
          padding: 32px 24px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .settings-page__blacklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .settings-page__blacklist-item:last-child {
          border-bottom: none;
        }
        .settings-page__blacklist-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .settings-page__blacklist-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .settings-page__blacklist-reason {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .settings-page__blacklist-date {
          font-size: 11px;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        /* Privacy toggles */
        .settings-page__privacy {
          padding: 0;
          overflow: hidden;
        }
        .settings-page__toggle-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .settings-page__toggle-item:last-child {
          border-bottom: none;
        }
        .settings-page__toggle-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .settings-page__toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }
        .settings-page__toggle-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .settings-page__toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          background: var(--border);
          border-radius: 12px;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          transition: background var(--transition-fast);
        }
        .settings-page__toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        .settings-page__toggle--active {
          background: var(--primary);
        }
        .settings-page__toggle--active .settings-page__toggle-slider {
          transform: translateX(20px);
        }

        /* Security */
        .settings-page__security {
          padding: 0;
          overflow: hidden;
        }
        .settings-page__security-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: none;
          cursor: pointer;
          transition: background var(--transition-fast);
          text-align: left;
        }
        .settings-page__security-item:last-of-type {
          border-bottom: none;
        }
        .settings-page__security-item:hover {
          background: var(--bg-secondary);
        }
        .settings-page__security-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .settings-page__security-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .settings-page__security-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }
        .settings-page__security-value {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .settings-page__security-arrow {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        /* Danger zone */
        .settings-page__danger-zone {
          padding: 20px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .settings-page__delete-btn {
          align-self: flex-start;
        }
        .settings-page__danger-warning {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--danger);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
