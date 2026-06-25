import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PetProfile } from '../types';
import { nearbyPets, getCurrentUser, getAllInvitations, saveAllInvitations } from '../data/mockData';
import {
  ArrowLeft,
  Send,
  Edit3,
  MapPin,
  Weight,
  Calendar,
  Shield,
  Scissors,
  Zap,
  Users,
  Heart,
  X,
} from 'lucide-react';

const personalityLabelMap: Record<string, string> = {
  lively: '活泼',
  gentle: '温顺',
  timid: '胆小',
  independent: '独立',
  clingy: '粘人',
};

const sizeLabelMap: Record<string, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
  giant: '巨型',
};

const energyLabelMap: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const energyColorMap: Record<string, string> = {
  low: '#7a9e7e',
  medium: '#e8b94b',
  high: '#e74c3c',
};

const activityLabelMap: Record<string, string> = {
  outdoor_run: '户外跑步',
  walk: '散步',
  indoor_play: '室内玩耍',
  water: '水上活动',
  hiking: '徒步',
};

const socialLabelMap: Record<string, string> = {
  big_dogs: '大型犬',
  small_dogs: '小型犬',
  cats: '猫咪',
  quiet: '安静环境',
  chase: '追逐游戏',
};

const vaccineLabelMap: Record<string, string> = {
  up_to_date: '已接种',
  partial: '部分接种',
  none: '未接种',
};

const vaccineColorMap: Record<string, string> = {
  up_to_date: '#27ae60',
  partial: '#e8b94b',
  none: '#e74c3c',
};

// Mock owner data
const ownerMap: Record<string, { name: string; avatar: string }> = {
  user_101: { name: 'Lucky爸', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  user_102: { name: '豆豆妈', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
  user_103: { name: '大橘铲屎官', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  user_104: { name: '二哈铲屎官', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face' },
  user_105: { name: '小白妈', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face' },
  user_106: { name: '咪咪妈', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face' },
  user_107: { name: '皮皮爸', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face' },
  user_108: { name: '毛球主人', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  user_109: { name: '阿福爸', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face' },
  user_110: { name: '花花妈', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face' },
};

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    time: '',
    location: '',
    activityType: 'walk',
    message: '',
    selectedPetId: '',
  });
  const currentUser = getCurrentUser();

  const pet: PetProfile | undefined = useMemo(() => {
    // Search in nearbyPets and currentUser's pets
    const allPets = [...nearbyPets, ...currentUser.pets];
    return allPets.find((p) => p.id === petId);
  }, [petId, currentUser]);

  const isOwnPet = pet ? currentUser.pets.some((p) => p.id === pet.id) : false;
  const owner = pet ? ownerMap[pet.ownerId] : null;

  if (!pet) {
    return (
      <div className="pet-detail-page container">
        <div className="empty-state">
          <Heart size={64} />
          <h3>找不到该宠物</h3>
          <p>宠物信息可能已被删除或ID无效</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-detail-page container">
      {/* Back Button */}
      <button className="pet-detail-page__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        返回
      </button>

      {/* Hero Avatar */}
      <div className="pet-detail-page__hero">
        <img
          className="pet-detail-page__hero-img"
          src={pet.photos[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'}
          alt={pet.name}
        />
        <div className="pet-detail-page__hero-overlay">
          <h1 className="pet-detail-page__hero-name">{pet.name}</h1>
          <p className="pet-detail-page__hero-breed">
            {pet.breed} · {pet.gender === 'male' ? '公' : '母'} · {pet.age}岁
          </p>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="pet-detail-page__info-grid">
        <div className="pet-detail-page__info-card">
          <Weight size={18} />
          <span className="pet-detail-page__info-value">{pet.weight}kg</span>
          <span className="pet-detail-page__info-label">体重</span>
        </div>
        <div className="pet-detail-page__info-card">
          <MapPin size={18} />
          <span className="pet-detail-page__info-value">{sizeLabelMap[pet.size]}</span>
          <span className="pet-detail-page__info-label">体型</span>
        </div>
        <div className="pet-detail-page__info-card">
          <Calendar size={18} />
          <span className="pet-detail-page__info-value">{pet.age}岁</span>
          <span className="pet-detail-page__info-label">年龄</span>
        </div>
        <div className="pet-detail-page__info-card">
          <Zap size={18} />
          <span
            className="pet-detail-page__info-value"
            style={{ color: energyColorMap[pet.energyLevel] }}
          >
            {energyLabelMap[pet.energyLevel]}
          </span>
          <span className="pet-detail-page__info-label">能量值</span>
        </div>
      </div>

      {/* Health Status */}
      <div className="card pet-detail-page__section">
        <h3>健康状态</h3>
        <div className="pet-detail-page__health">
          <div className="pet-detail-page__health-item">
            <Shield size={18} />
            <span className="pet-detail-page__health-label">疫苗</span>
            <span
              className="pet-detail-page__health-badge"
              style={{
                color: vaccineColorMap[pet.vaccineStatus],
                background: vaccineColorMap[pet.vaccineStatus] + '18',
                borderColor: vaccineColorMap[pet.vaccineStatus] + '40',
              }}
            >
              {vaccineLabelMap[pet.vaccineStatus]}
            </span>
          </div>
          <div className="pet-detail-page__health-item">
            <Scissors size={18} />
            <span className="pet-detail-page__health-label">绝育</span>
            <span
              className="pet-detail-page__health-badge"
              style={{
                color: pet.neutered ? '#27ae60' : '#e8b94b',
                background: pet.neutered ? 'rgba(39,174,96,0.1)' : 'rgba(232,185,75,0.1)',
                borderColor: pet.neutered ? 'rgba(39,174,96,0.25)' : 'rgba(232,185,75,0.25)',
              }}
            >
              {pet.neutered ? '已绝育' : '未绝育'}
            </span>
          </div>
        </div>
      </div>

      {/* Personality Tags */}
      <div className="card pet-detail-page__section">
        <h3>性格标签</h3>
        <div className="pet-detail-page__tags">
          {pet.personalityTags.map((tag) => (
            <span className="tag" key={tag}>
              {personalityLabelMap[tag] || tag}
            </span>
          ))}
        </div>
      </div>

      {/* Activity & Social Preferences */}
      <div className="card pet-detail-page__section">
        <h3>活动偏好</h3>
        <div className="pet-detail-page__tags">
          {pet.activityPreferences.map((pref) => (
            <span className="tag" key={pref}>
              {activityLabelMap[pref] || pref}
            </span>
          ))}
        </div>
        <h3 style={{ marginTop: 16 }}>社交偏好</h3>
        <div className="pet-detail-page__tags">
          {pet.socialPreferences.map((pref) => (
            <span className="tag" key={pref}>
              <Users size={12} />
              {socialLabelMap[pref] || pref}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="card pet-detail-page__section">
        <h3>宠物简介</h3>
        <p className="pet-detail-page__bio">{pet.bio}</p>
      </div>

      {/* Photo Wall */}
      {pet.photos.length > 1 && (
        <div className="card pet-detail-page__section">
          <h3>照片墙</h3>
          <div className="pet-detail-page__photos">
            {pet.photos.map((photo, idx) => (
              <div key={idx} className="pet-detail-page__photo-item">
                <img src={photo} alt={`${pet.name}照片${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner Info */}
      {owner && !isOwnPet && (
        <div className="card pet-detail-page__section">
          <h3>主人信息</h3>
          <div className="pet-detail-page__owner">
            <img className="avatar-lg" src={owner.avatar} alt={owner.name} />
            <span className="pet-detail-page__owner-name">{owner.name}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pet-detail-page__actions">
        {isOwnPet ? (
          <button
            className="btn btn-outline btn-lg pet-detail-page__action-btn"
            onClick={() => navigate('/pets')}
          >
            <Edit3 size={18} />
            编辑档案
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg pet-detail-page__action-btn"
            onClick={() => setShowInviteModal(true)}
          >
            <Send size={18} />
            发起邀约
          </button>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="pet-detail-page__modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="card pet-detail-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="pet-detail-page__modal-close"
              onClick={() => setShowInviteModal(false)}
            >
              <X size={20} />
            </button>
            <div className="pet-detail-page__modal-header">
              <img className="avatar-lg" src={pet.photos[0]} alt={pet.name} />
              <div>
                <h3>向 {pet.name} 发起邀约</h3>
                <p className="pet-detail-page__modal-breed">
                  {pet.breed} · {pet.gender === 'male' ? '公' : '母'}
                </p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // 真正创建邀约并保存到 localStorage
                const newInvitation = {
                  id: `inv_${Date.now()}`,
                  fromUserId: currentUser.id,
                  toUserId: pet.ownerId,
                  fromPetId: inviteForm.selectedPetId || currentUser.pets[0]?.id || '',
                  toPetId: pet.id,
                  status: 'pending' as const,
                  proposedTime: inviteForm.time,
                  proposedLocation: inviteForm.location,
                  activityType: inviteForm.activityType,
                  message: inviteForm.message,
                  createdAt: new Date().toISOString(),
                };
                const allInvitations = getAllInvitations();
                saveAllInvitations([newInvitation, ...allInvitations]);
                setShowInviteModal(false);
                setInviteForm({ time: '', location: '', activityType: 'walk', message: '', selectedPetId: '' });
              }}
            >
              <div className="form-group">
                <label>选择你的宠物</label>
                <select className="form-select" value={inviteForm.selectedPetId || currentUser.pets[0]?.id || ''} onChange={(e) => setInviteForm({ ...inviteForm, selectedPetId: e.target.value })}>
                  {getCurrentUser().pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.breed})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>活动时间</label>
                <input className="form-input" type="datetime-local" value={inviteForm.time} onChange={(e) => setInviteForm({ ...inviteForm, time: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>活动地点</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="如：滨江公园"
                  value={inviteForm.location}
                  onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>活动类型</label>
                <select className="form-select" value={inviteForm.activityType} onChange={(e) => setInviteForm({ ...inviteForm, activityType: e.target.value })}>
                  {Object.entries(activityLabelMap).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>留言</label>
                <textarea
                  className="form-textarea"
                  placeholder="说点什么..."
                  rows={3}
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary pet-detail-page__submit-btn">
                <Send size={16} />
                发送邀约
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pet-detail-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }

        /* Back */
        .pet-detail-page__back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          padding: 4px 0;
        }
        .pet-detail-page__back:hover {
          color: var(--primary);
        }

        /* Hero */
        .pet-detail-page__hero {
          position: relative;
          width: 100%;
          height: 320px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .pet-detail-page__hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pet-detail-page__hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: #fff;
        }
        .pet-detail-page__hero-name {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }
        .pet-detail-page__hero-breed {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 0;
        }

        /* Info Grid */
        .pet-detail-page__info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .pet-detail-page__info-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px 8px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          color: var(--text-secondary);
        }
        .pet-detail-page__info-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }
        .pet-detail-page__info-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Section */
        .pet-detail-page__section {
          margin-bottom: 16px;
        }
        .pet-detail-page__section h3 {
          font-size: 1rem;
          margin-bottom: 12px;
        }

        /* Health */
        .pet-detail-page__health {
          display: flex;
          gap: 20px;
        }
        .pet-detail-page__health-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pet-detail-page__health-label {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .pet-detail-page__health-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid;
        }

        /* Tags */
        .pet-detail-page__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Bio */
        .pet-detail-page__bio {
          font-size: 14px;
          line-height: 1.8;
          color: var(--text-secondary);
        }

        /* Photo Wall */
        .pet-detail-page__photos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .pet-detail-page__photo-item {
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .pet-detail-page__photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }
        .pet-detail-page__photo-item:hover img {
          transform: scale(1.05);
        }

        /* Owner */
        .pet-detail-page__owner {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pet-detail-page__owner-name {
          font-size: 16px;
          font-weight: 600;
        }

        /* Actions */
        .pet-detail-page__actions {
          margin-top: 24px;
          margin-bottom: 20px;
        }
        .pet-detail-page__action-btn {
          width: 100%;
        }

        /* Modal */
        .pet-detail-page__modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .pet-detail-page__modal {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 28px;
        }
        .pet-detail-page__modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          color: var(--text-secondary);
          padding: 4px;
        }
        .pet-detail-page__modal-close:hover {
          color: var(--text);
        }
        .pet-detail-page__modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .pet-detail-page__modal-breed {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        .pet-detail-page__submit-btn {
          width: 100%;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .pet-detail-page__info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pet-detail-page__hero {
            height: 240px;
          }
        }
        @media (max-width: 480px) {
          .pet-detail-page__hero {
            height: 200px;
            border-radius: var(--radius-md);
          }
          .pet-detail-page__hero-name {
            font-size: 1.5rem;
          }
          .pet-detail-page__health {
            flex-direction: column;
            gap: 12px;
          }
          .pet-detail-page__photos {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
