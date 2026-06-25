import { useState, useEffect } from 'react';
import type { Invitation, PetProfile } from '../types';
import { getCurrentUser, getNearbyPets, initInteractionData, getAllInvitations, saveAllInvitations } from '../data/mockData';
import InvitationCard from '../components/InvitationCard';
import { Inbox, Send, X, PawPrint, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const activityLabelMap: Record<string, string> = {
  outdoor_run: '户外跑步',
  walk: '散步',
  indoor_play: '室内玩耍',
  water: '水上活动',
  hiking: '徒步',
};

export default function InvitationsPage() {
  initInteractionData();
  const currentUser = getCurrentUser();
  const nearbyPets = getNearbyPets();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [invitations, setInvitations] = useState<Invitation[]>(() => getAllInvitations());
  const [showNewInvite, setShowNewInvite] = useState(false);
  const [newInviteTarget, setNewInviteTarget] = useState<PetProfile | null>(null);
  const [newInviteForm, setNewInviteForm] = useState({
    time: '',
    location: '',
    activityType: 'walk',
    message: '',
  });

  // 当当前用户变化时，重新加载邀约数据
  useEffect(() => {
    setInvitations(getAllInvitations());
    setShowNewInvite(false);
    setNewInviteTarget(null);
  }, [currentUser.id]);

  // Helper to find pet by id across all pets
  const findPet = (petId: string): PetProfile | undefined => {
    const myPet = currentUser.pets.find((p) => p.id === petId);
    if (myPet) return myPet;
    return nearbyPets.find((p) => p.id === petId);
  };

  const received = invitations.filter((inv) => inv.toUserId === currentUser.id);
  const sent = invitations.filter((inv) => inv.fromUserId === currentUser.id);

  const handleAccept = (id: string) => {
    setInvitations((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'accepted' as const, respondedAt: new Date().toISOString() }
          : inv
      );
      saveAllInvitations(updated);
      return updated;
    });
  };

  const handleReject = (id: string) => {
    setInvitations((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'rejected' as const, respondedAt: new Date().toISOString() }
          : inv
      );
      saveAllInvitations(updated);
      return updated;
    });
  };

  const handleNewInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteTarget) return;

    const newInv: Invitation = {
      id: `inv_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: newInviteTarget.ownerId,
      fromPetId: currentUser.pets[0]?.id || '',
      toPetId: newInviteTarget.id,
      status: 'pending',
      proposedTime: newInviteForm.time,
      proposedLocation: newInviteForm.location,
      activityType: newInviteForm.activityType,
      message: newInviteForm.message,
      createdAt: new Date().toISOString(),
    };

    setInvitations((prev) => {
      const updated = [newInv, ...prev];
      saveAllInvitations(updated);
      return updated;
    });
    setShowNewInvite(false);
    setNewInviteTarget(null);
    setNewInviteForm({ time: '', location: '', activityType: 'walk', message: '' });
  };

  const displayList = activeTab === 'received' ? received : sent;

  return (
    <div className="invitations-page container">
      <div className="invitations-page__header">
        <h1>邀约管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowNewInvite(true);
            setNewInviteTarget(null);
          }}
        >
          <Send size={16} />
          发起新邀约
        </button>
      </div>

      {/* Tabs */}
      <div className="invitations-page__tabs">
        <button
          className={`invitations-page__tab ${activeTab === 'received' ? 'invitations-page__tab--active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <Inbox size={16} />
          收到的邀约
          {received.filter((i) => i.status === 'pending').length > 0 && (
            <span className="badge">
              {received.filter((i) => i.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          className={`invitations-page__tab ${activeTab === 'sent' ? 'invitations-page__tab--active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={16} />
          发出的邀约
        </button>
      </div>

      {/* List */}
      <div className="invitations-page__list">
        {displayList.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'received' ? <Inbox size={64} /> : <Send size={64} />}
            <h3>{activeTab === 'received' ? '暂无收到的邀约' : '暂无发出的邀约'}</h3>
            <p>
              {activeTab === 'received'
                ? '当有宠物主人向你发起邀约时，会显示在这里'
                : '去匹配页面找到心仪的玩伴，发起邀约吧'}
            </p>
          </div>
        ) : (
          displayList.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              fromPet={findPet(inv.fromPetId)}
              toPet={findPet(inv.toPetId)}
              onAccept={activeTab === 'received' ? handleAccept : undefined}
              onReject={activeTab === 'received' ? handleReject : undefined}
            />
          ))
        )}
      </div>

      {/* New Invitation Modal */}
      {showNewInvite && (
        <div className="invitations-page__modal-overlay" onClick={() => setShowNewInvite(false)}>
          <div className="card invitations-page__modal" onClick={(e) => e.stopPropagation()}>
            <div className="invitations-page__modal-header">
              <h2>发起新邀约</h2>
              <button
                className="invitations-page__modal-close"
                onClick={() => setShowNewInvite(false)}
              >
                <X size={20} />
              </button>
            </div>

            {currentUser.pets.length === 0 ? (
              <div className="invitations-page__no-pets">
                <PawPrint size={48} />
                <p>您还没有添加宠物</p>
                <p className="invitations-page__no-pets-hint">添加宠物后才能向其他宠物发起邀约</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowNewInvite(false);
                    navigate('/pets');
                  }}
                >
                  <Plus size={16} />
                  添加宠物
                </button>
              </div>
            ) : !newInviteTarget ? (
              <div className="invitations-page__pet-select">
                <h4>选择对方宠物</h4>
                <div className="invitations-page__pet-grid">
                  {nearbyPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="card invitations-page__pet-option"
                      onClick={() => setNewInviteTarget(pet)}
                    >
                      <img
                        className="avatar"
                        src={pet.photos[0]}
                        alt={pet.name}
                      />
                      <div>
                        <strong>{pet.name}</strong>
                        <p className="invitations-page__pet-breed">{pet.breed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form className="invitations-page__form" onSubmit={handleNewInvite}>
                <div className="invitations-page__selected-pet">
                  <img
                    className="avatar"
                    src={newInviteTarget.photos[0]}
                    alt={newInviteTarget.name}
                  />
                  <div>
                    <strong>邀约对象：{newInviteTarget.name}</strong>
                    <p className="invitations-page__pet-breed">{newInviteTarget.breed}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setNewInviteTarget(null)}
                  >
                    重新选择
                  </button>
                </div>

                <div className="form-group">
                  <label>选择时间</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={newInviteForm.time}
                    onChange={(e) =>
                      setNewInviteForm({ ...newInviteForm, time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>地点</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="如：滨江公园"
                    value={newInviteForm.location}
                    onChange={(e) =>
                      setNewInviteForm({ ...newInviteForm, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>活动类型</label>
                  <select
                    className="form-select"
                    value={newInviteForm.activityType}
                    onChange={(e) =>
                      setNewInviteForm({ ...newInviteForm, activityType: e.target.value })
                    }
                  >
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
                    value={newInviteForm.message}
                    onChange={(e) =>
                      setNewInviteForm({ ...newInviteForm, message: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="invitations-page__form-actions">
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} />
                    发送邀约
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowNewInvite(false)}
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .invitations-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .invitations-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* Tabs */
        .invitations-page__tabs {
          display: flex;
          gap: 0;
          margin-bottom: 20px;
          border-bottom: 2px solid var(--border);
        }
        .invitations-page__tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all var(--transition-fast);
          background: none;
        }
        .invitations-page__tab:hover {
          color: var(--text);
        }
        .invitations-page__tab--active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* List */
        .invitations-page__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Modal */
        .invitations-page__modal-overlay {
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
        .invitations-page__modal {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 32px;
        }
        .invitations-page__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .invitations-page__modal-close {
          color: var(--text-secondary);
          padding: 4px;
        }
        .invitations-page__modal-close:hover {
          color: var(--text);
        }

        /* No Pets State */
        .invitations-page__no-pets {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 24px;
          text-align: center;
          color: var(--text-secondary);
        }
        .invitations-page__no-pets p {
          margin: 0;
          font-size: 14px;
        }
        .invitations-page__no-pets-hint {
          font-size: 13px;
          opacity: 0.7;
        }

        /* Pet Select */
        .invitations-page__pet-select h4 {
          margin-bottom: 16px;
        }
        .invitations-page__pet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          max-height: 50vh;
          overflow-y: auto;
        }
        .invitations-page__pet-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          cursor: pointer;
        }
        .invitations-page__pet-option:hover {
          border-color: var(--primary);
        }
        .invitations-page__pet-breed {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Selected Pet */
        .invitations-page__selected-pet {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }
        .invitations-page__selected-pet strong {
          font-size: 14px;
        }

        /* Form Actions */
        .invitations-page__form-actions {
          display: flex;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
