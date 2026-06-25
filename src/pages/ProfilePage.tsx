import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserProfile } from '../api/auth';
import type { User } from '../types';
import {
  User as UserIcon,
  Bell,
  Lock,
  Info,
  LogOut,
  Trophy,
  Calendar,
  Star,
  X,
  Check,
  Mail,
  MessageSquare,
  CalendarDays,
  Shield,
  Eye,
  FileText,
  Heart,
  Code,
  Dog,
} from 'lucide-react';

const personalityLabelMap: Record<string, string> = {
  lively: '活泼',
  gentle: '温顺',
  timid: '胆小',
  independent: '独立',
  clingy: '粘人',
};

type ModalType = 'editProfile' | 'notifications' | 'privacy' | 'about' | null;

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const authUser = await getCurrentUser();
        if (authUser) {
          const profile = await getUserProfile(authUser.id);
          setCurrentUser(profile);
          if (profile) {
            setUserName(profile.name);
            setUserPhone(profile.phone);
          }
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    match: true,
    invitation: true,
    message: true,
    activity: false,
    system: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    verifiedOnly: false,
    hideLocation: false,
    noStrangerMsg: false,
  });

  // Calculate stats
  const totalMatches = 12;
  const invitations: any[] = [];
  const reviews: any[] = [];
  const totalInvitations = invitations.length;
  const totalMeetings = invitations.filter(
    (inv) => inv.status === 'completed'
  ).length;
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => {
            const avg =
              (r.ratings.friendliness +
                r.ratings.punctuality +
                r.ratings.accuracy) /
              3;
            return sum + avg;
          }, 0) / reviews.length
        ).toFixed(1)
      : '0.0';

  const stats = [
    { icon: <Trophy size={20} />, label: '匹配次数', value: totalMatches },
    { icon: <Calendar size={20} />, label: '邀约次数', value: totalInvitations },
    { icon: <Star size={20} />, label: '见面次数', value: totalMeetings },
    { icon: <Star size={20} />, label: '平均评分', value: avgRating },
  ];

  const menuItems = [
    { icon: <Dog size={18} />, label: '宠物档案管理', action: () => navigate('/pets') },
    { icon: <UserIcon size={18} />, label: '编辑资料', action: () => setActiveModal('editProfile') },
    { icon: <Bell size={18} />, label: '通知设置', action: () => setActiveModal('notifications') },
    { icon: <Lock size={18} />, label: '隐私设置', action: () => setActiveModal('privacy') },
    { icon: <Info size={18} />, label: '关于我们', action: () => setActiveModal('about') },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    setActiveModal(null);
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="profile-page container" style={{ textAlign: 'center', paddingTop: '48px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>加载中...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile-page container" style={{ textAlign: 'center', paddingTop: '48px' }}>
        <p>请先登录</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '16px' }}>
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page container">
      {/* User Info */}
      <div className="profile-page__user-card card">
        <div className="profile-page__user-info">
          <img
            className="avatar-xl"
            src={currentUser.avatar}
            alt={currentUser.name}
          />
          <div className="profile-page__user-detail">
            <h1>{userName}</h1>
            <p className="profile-page__user-phone">{userPhone}</p>
            <p className="profile-page__user-location">
              {currentUser.location.city} {currentUser.location.district}
            </p>
          </div>
        </div>
      </div>

      {/* My Pets */}
      <div className="profile-page__section">
        <div className="profile-page__section-header">
          <h2 className="profile-page__section-title">我的宠物</h2>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => navigate('/pets')}
          >
            <Dog size={14} />
            管理宠物
          </button>
        </div>
        <div className="profile-page__pets">
          {currentUser.pets.map((pet) => (
            <div key={pet.id} className="card profile-page__pet-card">
              <img
                className="avatar"
                src={pet.photos[0]}
                alt={pet.name}
              />
              <div className="profile-page__pet-info">
                <strong>{pet.name}</strong>
                <p className="profile-page__pet-breed">{pet.breed}</p>
                <div className="profile-page__pet-tags">
                  {pet.personalityTags.map((tag) => (
                    <span className="tag" key={tag}>
                      {personalityLabelMap[tag] || tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="profile-page__section">
        <h2 className="profile-page__section-title">统计数据</h2>
        <div className="profile-page__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="card profile-page__stat-card">
              <div className="profile-page__stat-icon">{stat.icon}</div>
              <div className="profile-page__stat-value">{stat.value}</div>
              <div className="profile-page__stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="profile-page__section">
        <h2 className="profile-page__section-title">设置</h2>
        <div className="card profile-page__menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="profile-page__menu-item"
              onClick={item.action}
            >
              <span className="profile-page__menu-icon">{item.icon}</span>
              <span className="profile-page__menu-label">{item.label}</span>
              <span className="profile-page__menu-arrow">&rsaquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button className="btn btn-outline btn-lg profile-page__logout" onClick={handleLogout}>
        <LogOut size={18} />
        退出登录
      </button>

      {/* ====== Modals ====== */}
      {activeModal && (
        <div className="profile-modal__overlay" onClick={() => setActiveModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="profile-modal__header">
              <h3>
                {activeModal === 'editProfile' && '编辑资料'}
                {activeModal === 'notifications' && '通知设置'}
                {activeModal === 'privacy' && '隐私设置'}
                {activeModal === 'about' && '关于我们'}
              </h3>
              <button className="profile-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Edit Profile */}
            {activeModal === 'editProfile' && (
              <div className="profile-modal__body">
                <div className="form-group">
                  <label>昵称</label>
                  <input
                    className="form-input"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请输入昵称"
                  />
                </div>
                <div className="form-group">
                  <label>手机号</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入手机号"
                    maxLength={11}
                  />
                </div>
                <div className="form-group">
                  <label>所在城市</label>
                  <input
                    className="form-input"
                    type="text"
                    value={`${currentUser.location.city} ${currentUser.location.district}`}
                    disabled
                  />
                  <p className="profile-modal__hint">城市信息暂不支持修改</p>
                </div>
                <button className="btn btn-primary profile-modal__save" onClick={handleSaveProfile}>
                  <Check size={16} />
                  保存修改
                </button>
              </div>
            )}

            {/* Notification Settings */}
            {activeModal === 'notifications' && (
              <div className="profile-modal__body">
                <div className="profile-modal__toggle-list">
                  {[
                    { key: 'match' as const, icon: <Heart size={18} />, label: '匹配推荐', desc: '有新的匹配推荐时通知我' },
                    { key: 'invitation' as const, icon: <Mail size={18} />, label: '邀约提醒', desc: '收到新的邀约时通知我' },
                    { key: 'message' as const, icon: <MessageSquare size={18} />, label: '消息通知', desc: '收到新消息时通知我' },
                    { key: 'activity' as const, icon: <CalendarDays size={18} />, label: '活动提醒', desc: '附近有新的宠物活动时通知我' },
                    { key: 'system' as const, icon: <Shield size={18} />, label: '系统通知', desc: '平台更新、安全提醒等' },
                  ].map((item) => (
                    <div key={item.key} className="profile-modal__toggle-item">
                      <div className="profile-modal__toggle-info">
                        <span className="profile-modal__toggle-icon">{item.icon}</span>
                        <div>
                          <div className="profile-modal__toggle-label">{item.label}</div>
                          <div className="profile-modal__toggle-desc">{item.desc}</div>
                        </div>
                      </div>
                      <button
                        className={`profile-modal__toggle-switch ${notifSettings[item.key] ? 'profile-modal__toggle-switch--on' : ''}`}
                        onClick={() => toggleNotif(item.key)}
                      >
                        <span className="profile-modal__toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeModal === 'privacy' && (
              <div className="profile-modal__body">
                <div className="profile-modal__toggle-list">
                  {[
                    { key: 'verifiedOnly' as const, icon: <Shield size={18} />, label: '仅允许认证用户邀约', desc: '开启后，未通过认证的用户无法向您发送邀约' },
                    { key: 'hideLocation' as const, icon: <Eye size={18} />, label: '隐藏我的位置', desc: '开启后，其他用户无法看到您的精确位置信息' },
                    { key: 'noStrangerMsg' as const, icon: <MessageSquare size={18} />, label: '不接收陌生消息', desc: '开启后，仅允许已匹配的用户向您发送消息' },
                  ].map((item) => (
                    <div key={item.key} className="profile-modal__toggle-item">
                      <div className="profile-modal__toggle-info">
                        <span className="profile-modal__toggle-icon">{item.icon}</span>
                        <div>
                          <div className="profile-modal__toggle-label">{item.label}</div>
                          <div className="profile-modal__toggle-desc">{item.desc}</div>
                        </div>
                      </div>
                      <button
                        className={`profile-modal__toggle-switch ${privacySettings[item.key] ? 'profile-modal__toggle-switch--on' : ''}`}
                        onClick={() => togglePrivacy(item.key)}
                      >
                        <span className="profile-modal__toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Us */}
            {activeModal === 'about' && (
              <div className="profile-modal__body profile-modal__about">
                <div className="profile-modal__about-logo">
                  <Heart size={40} color="var(--primary)" />
                  <h2>PetPair</h2>
                  <p>为宠物找到最合适的玩伴</p>
                </div>
                <div className="profile-modal__about-info">
                  <div className="profile-modal__about-row">
                    <span>版本号</span>
                    <span>V1.0.0</span>
                  </div>
                  <div className="profile-modal__about-row">
                    <span>更新时间</span>
                    <span>2026-06-20</span>
                  </div>
                  <div className="profile-modal__about-row">
                    <span>开发者</span>
                    <span>PetPair Team</span>
                  </div>
                  <div className="profile-modal__about-row">
                    <span>开源协议</span>
                    <span>MIT License</span>
                  </div>
                </div>
                <div className="profile-modal__about-links">
                  <a href="#" onClick={(e) => e.preventDefault()}><FileText size={16} /> 用户协议</a>
                  <a href="#" onClick={(e) => e.preventDefault()}><Shield size={16} /> 隐私政策</a>
                  <a href="#" onClick={(e) => e.preventDefault()}><Code size={16} /> GitHub</a>
                </div>
                <p className="profile-modal__about-copyright">
                  &copy; 2026 PetPair. All rights reserved.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .profile-page {
          padding-top: 24px;
          padding-bottom: 60px;
        }

        /* User Card */
        .profile-page__user-card {
          text-align: center;
          padding: 32px 24px;
          margin-bottom: 24px;
        }
        .profile-page__user-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .profile-page__user-detail h1 {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .profile-page__user-phone {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }
        .profile-page__user-location {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Section */
        .profile-page__section {
          margin-bottom: 24px;
        }
        .profile-page__section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .profile-page__section-title {
          font-size: 1.125rem;
          margin-bottom: 0;
        }

        /* Pets */
        .profile-page__pets {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-page__pet-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }
        .profile-page__pet-info {
          flex: 1;
          min-width: 0;
        }
        .profile-page__pet-info strong {
          font-size: 14px;
        }
        .profile-page__pet-breed {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .profile-page__pet-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        /* Stats */
        .profile-page__stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) {
          .profile-page__stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .profile-page__stat-card {
          text-align: center;
          padding: 20px 12px;
        }
        .profile-page__stat-icon {
          color: var(--primary);
          margin-bottom: 8px;
          display: flex;
          justify-content: center;
        }
        .profile-page__stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .profile-page__stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Menu */
        .profile-page__menu {
          padding: 0;
          overflow: hidden;
        }
        .profile-page__menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          transition: background var(--transition-fast);
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 0;
        }
        .profile-page__menu-item:last-child {
          border-bottom: none;
        }
        .profile-page__menu-item:hover {
          background: var(--bg-secondary);
        }
        .profile-page__menu-icon {
          color: var(--text-secondary);
          display: flex;
        }
        .profile-page__menu-label {
          flex: 1;
          font-size: 14px;
        }
        .profile-page__menu-arrow {
          color: var(--text-secondary);
          font-size: 20px;
        }

        /* Logout */
        .profile-page__logout {
          width: 100%;
          margin-top: 8px;
          color: var(--danger);
          border-color: var(--danger);
        }
        .profile-page__logout:hover:not(:disabled) {
          background: var(--danger);
          color: #fff;
        }

        /* ====== Modal Styles ====== */
        .profile-modal__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .profile-modal {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 480px;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.25s ease;
        }
        .profile-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .profile-modal__header h3 {
          font-size: 1.125rem;
          margin: 0;
        }
        .profile-modal__close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .profile-modal__close:hover {
          background: var(--border);
          color: var(--text);
        }
        .profile-modal__body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        .profile-modal__save {
          width: 100%;
          margin-top: 8px;
        }
        .profile-modal__hint {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
          margin-bottom: 0;
        }

        /* Toggle List */
        .profile-modal__toggle-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .profile-modal__toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .profile-modal__toggle-item:last-child {
          border-bottom: none;
        }
        .profile-modal__toggle-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .profile-modal__toggle-icon {
          color: var(--primary);
          display: flex;
          flex-shrink: 0;
        }
        .profile-modal__toggle-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .profile-modal__toggle-desc {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Toggle Switch */
        .profile-modal__toggle-switch {
          width: 48px;
          height: 26px;
          border-radius: 13px;
          background: var(--border);
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
          padding: 0;
        }
        .profile-modal__toggle-switch--on {
          background: var(--primary);
        }
        .profile-modal__toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .profile-modal__toggle-switch--on .profile-modal__toggle-knob {
          transform: translateX(22px);
        }

        /* About */
        .profile-modal__about {
          text-align: center;
          padding: 32px 20px;
        }
        .profile-modal__about-logo {
          margin-bottom: 24px;
        }
        .profile-modal__about-logo h2 {
          font-size: 1.5rem;
          margin: 8px 0 4px;
        }
        .profile-modal__about-logo p {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0;
        }
        .profile-modal__about-info {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-bottom: 20px;
        }
        .profile-modal__about-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--border);
        }
        .profile-modal__about-row:last-child {
          border-bottom: none;
        }
        .profile-modal__about-row span:first-child {
          color: var(--text-secondary);
        }
        .profile-modal__about-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .profile-modal__about-links a {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--primary);
          text-decoration: none;
        }
        .profile-modal__about-links a:hover {
          text-decoration: underline;
        }
        .profile-modal__about-copyright {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
