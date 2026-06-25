import { useState } from 'react';
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Users,
  Calendar,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';

type TabKey = 'total' | 'monthly' | 'newcomer';

const tabLabels: Record<TabKey, string> = {
  total: '总排行',
  monthly: '本月排行',
  newcomer: '新人榜',
};

// 模拟不同标签页的数据差异
function getTabData(_tab: TabKey): import('../types').LeaderboardEntry[] {
  return [];
}

const medalColors: Record<number, { bg: string; border: string; icon: string }> = {
  1: { bg: 'linear-gradient(135deg, #fff9c4, #ffe082)', border: '#ffc107', icon: '#f9a825' },
  2: { bg: 'linear-gradient(135deg, #eceff1, #cfd8dc)', border: '#90a4ae', icon: '#546e7a' },
  3: { bg: 'linear-gradient(135deg, #fbe9e7, #ffccbc)', border: '#a1887f', icon: '#6d4c41' },
};

function renderStars(rating: number) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  for (let i = 0; i < full; i++) {
    stars.push(
      <Star key={`full-${i}`} size={14} fill="#f5a623" color="#f5a623" />
    );
  }
  if (hasHalf) {
    stars.push(
      <Star key="half" size={14} fill="#f5a623" color="#f5a623" style={{ clipPath: 'inset(0 50% 0 0)' }} />
    );
  }
  const remaining = 5 - full - (hasHalf ? 1 : 0);
  for (let i = 0; i < remaining; i++) {
    stars.push(
      <Star key={`empty-${i}`} size={14} color="#d9d4cc" />
    );
  }
  return stars;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('total');
  const data = getTabData(activeTab);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="leaderboard-page container">
      {/* 页面标题 */}
      <div className="leaderboard-page__header">
        <h1>
          <Trophy size={24} />
          宠物社交排行榜
        </h1>
        <p className="leaderboard-page__subtitle">
          看看哪些宠物是最受欢迎的社交达人
        </p>
      </div>

      {/* 标签页切换 */}
      <div className="leaderboard-page__tabs">
        {(['total', 'monthly', 'newcomer'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`leaderboard-page__tab ${
              activeTab === tab ? 'leaderboard-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'total' && <Trophy size={14} />}
            {tab === 'monthly' && <Calendar size={14} />}
            {tab === 'newcomer' && <UserPlus size={14} />}
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* 前三名大卡片 */}
      <div className="leaderboard-page__top3">
        {top3.map((entry) => {
          const medal = medalColors[entry.rank];
          if (!medal) return null;
          return (
            <div
              key={entry.petId}
              className="leaderboard-page__top-card"
              style={{
                background: medal.bg,
                borderColor: medal.border,
              }}
            >
              <div className="leaderboard-page__top-card-rank">
                {entry.rank === 1 ? (
                  <Crown size={28} color={medal.icon} />
                ) : (
                  <Medal size={28} color={medal.icon} />
                )}
              </div>
              <img
                className="leaderboard-page__top-card-avatar"
                src={entry.petPhoto}
                alt={entry.petName}
              />
              <h3 className="leaderboard-page__top-card-name">{entry.petName}</h3>
              <p className="leaderboard-page__top-card-breed">{entry.breed}</p>
              <p className="leaderboard-page__top-card-owner">
                <Users size={12} />
                {entry.ownerName}
              </p>
              <div className="leaderboard-page__top-card-score">
                <Trophy size={16} color={medal.icon} />
                <span style={{ color: medal.icon, fontWeight: 700, fontSize: 20 }}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
              <div className="leaderboard-page__top-card-stats">
                <div className="leaderboard-page__top-card-stat">
                  <span className="leaderboard-page__top-card-stat-num">{entry.meetups}</span>
                  <span className="leaderboard-page__top-card-stat-label">见面次数</span>
                </div>
                <div className="leaderboard-page__top-card-stat">
                  <span className="leaderboard-page__top-card-stat-num">{entry.rating}</span>
                  <span className="leaderboard-page__top-card-stat-label">评分</span>
                </div>
              </div>
              <div className="leaderboard-page__top-card-stars">
                {renderStars(entry.rating)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 其余排行列表 */}
      {rest.length > 0 && (
        <div className="leaderboard-page__list">
          <div className="leaderboard-page__list-header">
            <span>排名</span>
            <span>宠物</span>
            <span>主人</span>
            <span>社交分</span>
            <span>见面</span>
            <span>评分</span>
          </div>
          {rest.map((entry, idx) => {
            const prevRank = idx + 4;
            const rankDiff = prevRank - entry.rank;
            return (
              <div key={entry.petId} className="leaderboard-page__list-row">
                <span className="leaderboard-page__list-rank">
                  <span className="leaderboard-page__list-rank-num">#{entry.rank}</span>
                  {rankDiff > 0 && (
                    <ChevronUp size={12} color="#52c41a" />
                  )}
                  {rankDiff < 0 && (
                    <ChevronDown size={12} color="#f5222d" />
                  )}
                  {rankDiff === 0 && (
                    <Minus size={12} color="#d9d4cc" />
                  )}
                </span>
                <span className="leaderboard-page__list-pet">
                  <img
                    className="avatar-sm"
                    src={entry.petPhoto}
                    alt={entry.petName}
                  />
                  <div>
                    <span className="leaderboard-page__list-pet-name">{entry.petName}</span>
                    <span className="leaderboard-page__list-pet-breed">{entry.breed}</span>
                  </div>
                </span>
                <span className="leaderboard-page__list-owner">{entry.ownerName}</span>
                <span className="leaderboard-page__list-score">
                  <Trophy size={12} />
                  {entry.score.toLocaleString()}
                </span>
                <span className="leaderboard-page__list-meet">{entry.meetups}次</span>
                <span className="leaderboard-page__list-rating">
                  {renderStars(entry.rating)}
                  <span className="leaderboard-page__list-rating-num">{entry.rating}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .leaderboard-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }

        /* Header */
        .leaderboard-page__header {
          margin-bottom: 24px;
        }
        .leaderboard-page__header h1 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .leaderboard-page__subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Tabs */
        .leaderboard-page__tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius-full);
          width: fit-content;
        }
        .leaderboard-page__tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          background: none;
          border: none;
        }
        .leaderboard-page__tab:hover {
          color: var(--text);
        }
        .leaderboard-page__tab--active {
          background: var(--bg-card);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
          font-weight: 600;
        }

        /* Top 3 Cards */
        .leaderboard-page__top3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .leaderboard-page__top-card {
          border-radius: var(--radius-lg);
          border: 2px solid;
          padding: 20px 16px;
          text-align: center;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
          position: relative;
          overflow: hidden;
        }
        .leaderboard-page__top-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .leaderboard-page__top-card-rank {
          margin-bottom: 8px;
        }
        .leaderboard-page__top-card-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow: var(--shadow-sm);
          margin: 0 auto 8px;
        }
        .leaderboard-page__top-card-name {
          font-size: 18px;
          margin-bottom: 2px;
        }
        .leaderboard-page__top-card-breed {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .leaderboard-page__top-card-owner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .leaderboard-page__top-card-score {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 12px;
        }
        .leaderboard-page__top-card-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 8px;
        }
        .leaderboard-page__top-card-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .leaderboard-page__top-card-stat-num {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }
        .leaderboard-page__top-card-stat-label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .leaderboard-page__top-card-stars {
          display: flex;
          justify-content: center;
          gap: 2px;
        }

        /* List */
        .leaderboard-page__list {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .leaderboard-page__list-header {
          display: grid;
          grid-template-columns: 60px 1fr 80px 90px 60px 120px;
          padding: 12px 20px;
          background: var(--bg-secondary);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .leaderboard-page__list-row {
          display: grid;
          grid-template-columns: 60px 1fr 80px 90px 60px 120px;
          padding: 14px 20px;
          align-items: center;
          border-bottom: 1px solid var(--border);
          transition: background var(--transition-fast);
          font-size: 14px;
        }
        .leaderboard-page__list-row:last-child {
          border-bottom: none;
        }
        .leaderboard-page__list-row:hover {
          background: var(--bg-secondary);
        }
        .leaderboard-page__list-rank {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        .leaderboard-page__list-rank-num {
          font-size: 15px;
          color: var(--text);
        }
        .leaderboard-page__list-pet {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .leaderboard-page__list-pet > div {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .leaderboard-page__list-pet-name {
          font-weight: 600;
          font-size: 14px;
        }
        .leaderboard-page__list-pet-breed {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .leaderboard-page__list-owner {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .leaderboard-page__list-score {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          font-size: 14px;
          color: var(--primary);
        }
        .leaderboard-page__list-meet {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .leaderboard-page__list-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .leaderboard-page__list-rating-num {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .leaderboard-page__top3 {
            grid-template-columns: 1fr;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
          }
          .leaderboard-page__list-header {
            display: none;
          }
          .leaderboard-page__list-row {
            grid-template-columns: 40px 1fr;
            grid-template-rows: auto auto;
            gap: 6px 12px;
            padding: 14px 16px;
          }
          .leaderboard-page__list-rank {
            grid-row: 1 / 3;
          }
          .leaderboard-page__list-pet {
            grid-column: 2;
          }
          .leaderboard-page__list-owner,
          .leaderboard-page__list-score,
          .leaderboard-page__list-meet,
          .leaderboard-page__list-rating {
            grid-column: 2;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .leaderboard-page__tabs {
            width: 100%;
          }
          .leaderboard-page__tab {
            flex: 1;
            justify-content: center;
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
