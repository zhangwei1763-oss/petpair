import { useState, useMemo, useEffect } from 'react';
import type { MatchResult, PetProfile } from '../types';
import { getCurrentUser } from '../api/auth';
import { getAllPets, getMyPets } from '../api/pets';
import { createInvitation } from '../api/invitations';
import { sendMessage } from '../api/messages';
import {
  calculateAdvancedMatchScore,
  getDimensionLabel,
  getCompatibilityAdvice,
} from '../utils/matchEngine';
import PetCard from '../components/PetCard';
import HealthBadge from '../components/HealthBadge';
import ReportModal from '../components/ReportModal';
import { MapPin, Filter, Send, X, CheckCircle, PawPrint, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sizeLabelMap: Record<string, string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
  giant: '巨型',
};

const energyLabelMap: Record<string, string> = {
  low: '低能量',
  medium: '中能量',
  high: '高能量',
};

const activityLabelMap: Record<string, string> = {
  outdoor_run: '户外跑步',
  walk: '散步',
  indoor_play: '室内玩耍',
  water: '水上活动',
  hiking: '徒步',
};

// 维度等级颜色映射
const LEVEL_COLOR_MAP: Record<string, string> = {
  excellent: '#52c41a',
  good: '#1890ff',
  fair: '#fa8c16',
  poor: '#f5222d',
};

// 维度等级中文映射
const LEVEL_LABEL_MAP: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

// Simulated distances for nearby pets
const distanceMap: Record<string, number> = {
  pet_101: 2.3,
  pet_102: 4.1,
  pet_103: 6.8,
  pet_104: 8.5,
  pet_105: 3.2,
  pet_106: 7.1,
  pet_107: 5.4,
  pet_108: 1.8,
  pet_109: 9.2,
  pet_110: 11.0,
  pet_003: 6.5,
  pet_004: 6.5,
  pet_005: 3.8,
  pet_006: 3.8,
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myPets, setMyPets] = useState<PetProfile[]>([]);
  const [nearbyPets, setNearbyPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterEnergy, setFilterEnergy] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    time: '',
    location: '',
    activityType: 'walk',
    message: '',
  });
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // 加载用户、宠物和附近宠物数据
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (!user) {
          setError('用户未登录');
          setLoading(false);
          return;
        }
        setCurrentUser(user);

        const [pets, allPets] = await Promise.all([
          getMyPets(user.id),
          getAllPets(),
        ]);
        setMyPets(pets);
        setNearbyPets(allPets.filter((p) => p.ownerId !== user.id));

        if (pets.length > 0) {
          setSelectedPetId(pets[0].id);
        }
      } catch (err: any) {
        setError(err.message || '加载数据失败');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedPet = myPets.find((p) => p.id === selectedPetId);

  const matchResults: MatchResult[] = useMemo(() => {
    if (!selectedPet) return [];
    return nearbyPets
      .map((pet) => {
        const dist = distanceMap[pet.id] || Math.random() * 15;
        const { score, reasons } = calculateAdvancedMatchScore(selectedPet, pet, dist);
        return { pet, score, matchReasons: reasons, distanceKm: dist };
      })
      .filter((r) => r.distanceKm <= maxDistance)
      .filter((r) => filterSize === 'all' || r.pet.size === filterSize)
      .filter((r) => filterEnergy === 'all' || r.pet.energyLevel === filterEnergy)
      .filter((r) => {
        if (!filterVerifiedOnly) return true;
        return r.pet.vaccineStatus === 'up_to_date' && r.pet.neutered;
      })
      .sort((a, b) => b.score - a.score);
  }, [selectedPet, nearbyPets, filterSize, filterEnergy, maxDistance, filterVerifiedOnly]);

  // 计算当前选中匹配的维度分析
  const selectedDimensions = useMemo(() => {
    if (!selectedMatch || !selectedPet) return null;
    const result = calculateAdvancedMatchScore(
      selectedPet,
      selectedMatch.pet,
      selectedMatch.distanceKm
    );
    return result.dimensions;
  }, [selectedMatch, selectedPet]);

  const selectedAdvice = useMemo(() => {
    if (!selectedDimensions) return [];
    return getCompatibilityAdvice(selectedDimensions);
  }, [selectedDimensions]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !currentUser || !selectedPet) return;

    try {
      const invitation = await createInvitation({
        fromUserId: currentUser.id,
        toUserId: selectedMatch.pet.ownerId,
        fromPetId: selectedPet.id,
        toPetId: selectedMatch.pet.id,
        proposedTime: inviteForm.time,
        proposedLocation: inviteForm.location,
        activityType: inviteForm.activityType,
        message: inviteForm.message,
      });

      await sendMessage({
        senderId: currentUser.id,
        receiverId: selectedMatch.pet.ownerId,
        content: `我邀请你带 ${selectedMatch.pet.name} 一起${activityLabelMap[inviteForm.activityType]}，地点：${inviteForm.location}，时间：${inviteForm.time}`,
        type: 'invitation',
        invitationId: invitation.id,
      });

      setInviteSuccess(true);
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInviteForm(false);
        setSelectedMatch(null);
        setInviteForm({ time: '', location: '', activityType: 'walk', message: '' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || '发送邀约失败');
    }
  };

  const handleReport = (reason: string) => {
    // Simulate report submission
    console.log('Report submitted:', reason);
  };

  return (
    <div className="dashboard-page container">
      {/* Toast */}
      {toastVisible && (
        <div className="dashboard-page__toast">
          <CheckCircle size={16} />
          <span>邀约发送成功！等待对方回应。</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="dashboard-page__loading">
          <PawPrint size={32} className="dashboard-page__loading-icon" />
          <p>加载中...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="dashboard-page__error">
          <p>{error}</p>
        </div>
      )}

      {/* Welcome */}
      <div className="dashboard-page__welcome">
        <h1>你好，{currentUser?.user_metadata?.name || '用户'}！</h1>
        <p className="dashboard-page__welcome-sub">
          为 <strong>{selectedPet?.name}</strong> 找到最合适的玩伴吧
        </p>
      </div>

      {/* Pet Selector */}
      <div className="dashboard-page__pet-selector">
        <h3>我的宠物</h3>
        {myPets.length === 0 ? (
          <div className="dashboard-page__empty-pets">
            <PawPrint size={48} />
            <p>还没有添加宠物</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/pets')}
            >
              <Plus size={16} />
              添加宠物
            </button>
          </div>
        ) : (
          <div className="dashboard-page__pet-scroll">
            {myPets.map((pet) => (
              <div
                key={pet.id}
                className={`dashboard-page__pet-item ${
                  pet.id === selectedPetId ? 'dashboard-page__pet-item--active' : ''
                }`}
                onClick={() => setSelectedPetId(pet.id)}
              >
                <img
                  className="avatar"
                  src={pet.photos[0]}
                  alt={pet.name}
                />
                <span className="dashboard-page__pet-name">{pet.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Header */}
      <div className="dashboard-page__rec-header">
        <div className="dashboard-page__rec-title">
          <MapPin size={20} />
          <h2>附近推荐</h2>
          <span className="badge">{matchResults.length} 只</span>
        </div>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={14} />
          筛选
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card dashboard-page__filters">
          <div className="dashboard-page__filter-row">
            <label>体型</label>
            <select
              className="form-select"
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
            >
              <option value="all">全部</option>
              {Object.entries(sizeLabelMap).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="dashboard-page__filter-row">
            <label>能量值</label>
            <select
              className="form-select"
              value={filterEnergy}
              onChange={(e) => setFilterEnergy(e.target.value)}
            >
              <option value="all">全部</option>
              {Object.entries(energyLabelMap).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="dashboard-page__filter-row">
            <label>最大距离: {maxDistance}km</label>
            <input
              type="range"
              min={1}
              max={20}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="dashboard-page__range"
            />
          </div>
          <div className="dashboard-page__filter-row">
            <label>
              <input
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                style={{ marginRight: 8, accentColor: 'var(--primary)' }}
              />
              仅显示已认证
            </label>
          </div>
        </div>
      )}

      {/* Match Results */}
      <div className="dashboard-page__results">
        {matchResults.length === 0 ? (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>暂无匹配结果</h3>
            <p>试试调整筛选条件，扩大搜索范围</p>
          </div>
        ) : (
          matchResults.map((result) => (
            <PetCard
              key={result.pet.id}
              pet={result.pet}
              matchResult={result}
              showMatchInfo={true}
              onClick={() => {
                setSelectedMatch(result);
                setShowInviteForm(false);
                setInviteSuccess(false);
              }}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedMatch && (
        <div className="dashboard-page__modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="card dashboard-page__modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="dashboard-page__modal-close"
              onClick={() => setSelectedMatch(null)}
            >
              <X size={20} />
            </button>

            <div className="dashboard-page__modal-header">
              <img
                className="avatar-xl"
                src={selectedMatch.pet.photos[0]}
                alt={selectedMatch.pet.name}
              />
              <div>
                <h2>{selectedMatch.pet.name}</h2>
                <p className="dashboard-page__modal-breed">
                  {selectedMatch.pet.breed} · {selectedMatch.pet.gender === 'male' ? '公' : '母'} · {selectedMatch.pet.age}岁
                </p>
              </div>
            </div>

            <div className="dashboard-page__modal-score">
              <span className="dashboard-page__modal-score-num">{selectedMatch.score}分</span>
              <span className="dashboard-page__modal-score-label">
                {selectedMatch.score >= 90 ? '完美匹配' : selectedMatch.score >= 70 ? '高度匹配' : selectedMatch.score >= 50 ? '一般匹配' : '匹配度低'}
              </span>
            </div>

            {/* 匹配维度分析 */}
            {selectedDimensions && (
              <div className="dashboard-page__dimensions">
                <h4>匹配维度分析</h4>
                {(['personality', 'energy', 'size', 'distance', 'health'] as const).map((dim) => {
                  const dimInfo = getDimensionLabel(dim, selectedDimensions[dim]);
                  const color = LEVEL_COLOR_MAP[dimInfo.level];
                  const levelLabel = LEVEL_LABEL_MAP[dimInfo.level];
                  // 将维度分数映射到进度条百分比: -25 ~ +15 => 0% ~ 100%
                  const barPercent = Math.max(0, Math.min(100, ((selectedDimensions[dim] + 25) / 40) * 100));
                  return (
                    <div key={dim} className="dashboard-page__dimension-row">
                      <span className="dashboard-page__dimension-label">{dimInfo.label}</span>
                      <div className="dashboard-page__dimension-bar-wrap">
                        <div
                          className="dashboard-page__dimension-bar"
                          style={{
                            width: `${barPercent}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="dashboard-page__dimension-score" style={{ color }}>
                        {selectedDimensions[dim] > 0 ? '+' : ''}{selectedDimensions[dim]}
                      </span>
                      <span
                        className="dashboard-page__dimension-level"
                        style={{ color, borderColor: color + '40', background: color + '10' }}
                      >
                        {levelLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 匹配建议 */}
            {selectedAdvice.length > 0 && (
              <div className="dashboard-page__advice">
                <h4>匹配建议</h4>
                <ul>
                  {selectedAdvice.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="dashboard-page__modal-reasons">
              <h4>匹配原因</h4>
              <ul>
                {selectedMatch.matchReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>

            {/* 健康认证标签 */}
            <div className="dashboard-page__health-section">
              <h4>健康认证</h4>
              <HealthBadge
                vaccineStatus={selectedMatch.pet.vaccineStatus}
                neutered={selectedMatch.pet.neutered}
              />
            </div>

            <div className="dashboard-page__modal-info">
              <p><strong>体型：</strong>{sizeLabelMap[selectedMatch.pet.size]}</p>
              <p><strong>体重：</strong>{selectedMatch.pet.weight}kg</p>
              <p><strong>能量：</strong>{energyLabelMap[selectedMatch.pet.energyLevel]}</p>
              <p><strong>距离：</strong>{selectedMatch.distanceKm.toFixed(1)}km</p>
              <p className="dashboard-page__modal-bio">{selectedMatch.pet.bio}</p>
            </div>

            {/* 举报按钮 */}
            <div className="dashboard-page__report-link">
              <button
                className="dashboard-page__report-btn"
                onClick={() => setShowReportModal(true)}
              >
                举报
              </button>
            </div>

            {!showInviteForm && !inviteSuccess && (
              <button
                className="btn btn-primary btn-lg dashboard-page__invite-btn"
                onClick={() => setShowInviteForm(true)}
              >
                <Send size={18} />
                发起邀约
              </button>
            )}

            {inviteSuccess && (
              <div className="dashboard-page__invite-success">
                邀约发送成功！等待对方回应。
              </div>
            )}

            {showInviteForm && (
              <form className="dashboard-page__invite-form" onSubmit={handleInvite}>
                <h4>发起邀约</h4>
                <div className="form-group">
                  <label>选择时间</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={inviteForm.time}
                    onChange={(e) => setInviteForm({ ...inviteForm, time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>地点</label>
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
                  <select
                    className="form-select"
                    value={inviteForm.activityType}
                    onChange={(e) => setInviteForm({ ...inviteForm, activityType: e.target.value })}
                  >
                    {Object.entries(activityLabelMap).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>留言</label>
                  <textarea
                    className="form-textarea"
                    placeholder="说点什么..."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="dashboard-page__invite-actions">
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} />
                    发送邀约
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedMatch && (
        <ReportModal
          petName={selectedMatch.pet.name}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}

      <style>{`
        .dashboard-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .dashboard-page__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 24px;
          color: var(--text-secondary);
        }
        .dashboard-page__loading-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .dashboard-page__error {
          padding: 16px 24px;
          background: #fff2f0;
          border: 1px solid #ffccc7;
          border-radius: var(--radius-sm);
          color: #cf1322;
          margin-bottom: 16px;
        }
        .dashboard-page__error p {
          margin: 0;
        }
        .dashboard-page__welcome {
          margin-bottom: 24px;
        }
        .dashboard-page__welcome h1 {
          font-size: 1.75rem;
          margin-bottom: 4px;
        }
        .dashboard-page__welcome-sub {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Toast */
        .dashboard-page__toast {
          position: fixed;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #52c41a;
          color: #fff;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          z-index: 2000;
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
          animation: dashboard-page__toast-slide-in 0.3s ease-out;
        }
        @keyframes dashboard-page__toast-slide-in {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        /* Pet Selector */
        .dashboard-page__pet-selector {
          margin-bottom: 24px;
        }
        .dashboard-page__pet-selector h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .dashboard-page__empty-pets {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 24px;
          background: var(--bg-card);
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }
        .dashboard-page__empty-pets p {
          margin: 0;
          font-size: 14px;
        }
        .dashboard-page__pet-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }
        .dashboard-page__pet-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 2px solid var(--border);
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .dashboard-page__pet-item--active {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .dashboard-page__pet-name {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Recommendations Header */
        .dashboard-page__rec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .dashboard-page__rec-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dashboard-page__rec-title h2 {
          font-size: 1.25rem;
        }

        /* Filters */
        .dashboard-page__filters {
          margin-bottom: 20px;
          padding: 16px;
        }
        .dashboard-page__filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .dashboard-page__filter-row:last-child {
          margin-bottom: 0;
        }
        .dashboard-page__filter-row label {
          font-size: 14px;
          font-weight: 500;
          min-width: 80px;
          white-space: nowrap;
        }
        .dashboard-page__filter-row .form-select {
          max-width: 200px;
        }
        .dashboard-page__range {
          flex: 1;
          accent-color: var(--primary);
          max-width: 200px;
        }

        /* Results */
        .dashboard-page__results {
          display: grid;
          gap: 16px;
        }

        /* Modal */
        .dashboard-page__modal-overlay {
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
        .dashboard-page__modal {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 32px;
        }
        .dashboard-page__modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          color: var(--text-secondary);
          padding: 4px;
        }
        .dashboard-page__modal-close:hover {
          color: var(--text);
        }
        .dashboard-page__modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .dashboard-page__modal-breed {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        .dashboard-page__modal-score {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }
        .dashboard-page__modal-score-num {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }
        .dashboard-page__modal-score-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }

        /* Dimensions */
        .dashboard-page__dimensions {
          margin-bottom: 16px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }
        .dashboard-page__dimensions h4 {
          font-size: 14px;
          margin-bottom: 12px;
        }
        .dashboard-page__dimension-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .dashboard-page__dimension-row:last-child {
          margin-bottom: 0;
        }
        .dashboard-page__dimension-label {
          font-size: 13px;
          font-weight: 500;
          min-width: 36px;
          color: var(--text);
        }
        .dashboard-page__dimension-bar-wrap {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .dashboard-page__dimension-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .dashboard-page__dimension-score {
          font-size: 12px;
          font-weight: 600;
          min-width: 30px;
          text-align: right;
        }
        .dashboard-page__dimension-level {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid;
          min-width: 36px;
          text-align: center;
        }

        /* Advice */
        .dashboard-page__advice {
          margin-bottom: 16px;
        }
        .dashboard-page__advice h4 {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .dashboard-page__advice ul {
          list-style: none;
          padding: 0;
        }
        .dashboard-page__advice li {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 4px 0;
          padding-left: 16px;
          position: relative;
        }
        .dashboard-page__advice li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
        }

        /* Health section */
        .dashboard-page__health-section {
          margin-bottom: 16px;
        }
        .dashboard-page__health-section h4 {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .dashboard-page__modal-reasons {
          margin-bottom: 16px;
        }
        .dashboard-page__modal-reasons h4 {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .dashboard-page__modal-reasons ul {
          list-style: none;
          padding: 0;
        }
        .dashboard-page__modal-reasons li {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 4px 0;
          padding-left: 16px;
          position: relative;
        }
        .dashboard-page__modal-reasons li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
        }
        .dashboard-page__modal-info {
          margin-bottom: 20px;
        }
        .dashboard-page__modal-info p {
          font-size: 13px;
          margin-bottom: 6px;
        }
        .dashboard-page__modal-bio {
          color: var(--text-secondary);
          font-style: italic;
          margin-bottom: 0;
        }

        /* Report link */
        .dashboard-page__report-link {
          text-align: right;
          margin-bottom: 16px;
        }
        .dashboard-page__report-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          text-decoration: underline;
        }
        .dashboard-page__report-btn:hover {
          color: #f5222d;
        }

        .dashboard-page__invite-btn {
          width: 100%;
        }
        .dashboard-page__invite-success {
          text-align: center;
          padding: 16px;
          background: var(--success);
          color: #fff;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }
        .dashboard-page__invite-form {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .dashboard-page__invite-form h4 {
          margin-bottom: 16px;
        }
        .dashboard-page__invite-actions {
          display: flex;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
