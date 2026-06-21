import { mockUserStats } from '../data/mockData';
import {
  Handshake,
  Heart,
  Send,
  Star,
  TrendingUp,
  PawPrint,
  Target,
  BarChart3,
} from 'lucide-react';

const stats = mockUserStats;

const statCards = [
  {
    label: '总见面次数',
    value: stats.totalMeetups,
    icon: <Handshake size={24} />,
    color: '#1890ff',
    bg: '#e6f7ff',
  },
  {
    label: '总匹配数',
    value: stats.totalMatches,
    icon: <Heart size={24} />,
    color: '#f5222d',
    bg: '#fff1f0',
  },
  {
    label: '总邀约数',
    value: stats.totalInvitations,
    icon: <Send size={24} />,
    color: '#722ed1',
    bg: '#f9f0ff',
  },
  {
    label: '平均评分',
    value: stats.avgRating,
    icon: <Star size={24} />,
    color: '#fa8c16',
    bg: '#fff7e6',
    suffix: '分',
  },
];

export default function StatsPage() {
  const monthlyPercent = Math.round((stats.thisMonthMeetups / 10) * 100);
  const maxWeeklyCount = Math.max(...stats.weeklyTrend.map((d) => d.meetups));

  return (
    <div className="stats-page container">
      {/* 页面标题 */}
      <div className="stats-page__header">
        <h1>
          <BarChart3 size={24} />
          数据统计
        </h1>
        <p className="stats-page__subtitle">
          <TrendingUp size={14} />
          追踪你和宠物的社交数据
        </p>
      </div>

      {/* 4个数据卡片 2x2 网格 */}
      <div className="stats-page__cards">
        {statCards.map((card) => (
          <div key={card.label} className="stats-page__card">
            <div
              className="stats-page__card-icon"
              style={{ background: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="stats-page__card-content">
              <span className="stats-page__card-value">
                {card.value}
                {card.suffix || ''}
              </span>
              <span className="stats-page__card-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 本月见面次数进度条 */}
      <div className="stats-page__section card">
        <div className="stats-page__section-header">
          <Target size={18} />
          <h3>本月见面目标</h3>
        </div>
        <div className="stats-page__progress-info">
          <span className="stats-page__progress-current">
            {stats.thisMonthMeetups} 次
          </span>
          <span className="stats-page__progress-goal">
            目标 10 次
          </span>
        </div>
        <div className="stats-page__progress-bar">
          <div
            className="stats-page__progress-fill"
            style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
          />
        </div>
        <div className="stats-page__progress-percent">
          {monthlyPercent}%
          {monthlyPercent >= 100 && (
            <span className="stats-page__progress-done"> 已达标!</span>
          )}
        </div>
      </div>

      {/* 热门宠物列表 */}
      <div className="stats-page__section card">
        <div className="stats-page__section-header">
          <PawPrint size={18} />
          <h3>热门宠物</h3>
        </div>
        <div className="stats-page__top-pets">
          {stats.popularPets.map((pet, idx) => (
            <div key={pet.petName} className="stats-page__top-pet">
              <span className="stats-page__top-pet-rank">#{idx + 1}</span>
              <div className="stats-page__top-pet-info">
                <span className="stats-page__top-pet-name">{pet.petName}</span>
                <span className="stats-page__top-pet-count">
                  见面 {pet.meetups} 次
                </span>
              </div>
              <div className="stats-page__top-pet-bar-wrap">
                <div
                  className="stats-page__top-pet-bar"
                  style={{
                    width: `${(pet.meetups / stats.totalMeetups) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 周趋势图（CSS柱状图） */}
      <div className="stats-page__section card">
        <div className="stats-page__section-header">
          <TrendingUp size={18} />
          <h3>本周见面趋势</h3>
        </div>
        <div className="stats-page__chart">
          <div className="stats-page__chart-bars">
            {stats.weeklyTrend.map((day) => {
              const heightPercent = maxWeeklyCount > 0 ? (day.meetups / maxWeeklyCount) * 100 : 0;
              return (
                <div key={day.week} className="stats-page__chart-col">
                  <span className="stats-page__chart-value">{day.meetups}</span>
                  <div className="stats-page__chart-bar-wrap">
                    <div
                      className="stats-page__chart-bar"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="stats-page__chart-label">{day.week}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .stats-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }

        /* Header */
        .stats-page__header {
          margin-bottom: 24px;
        }
        .stats-page__header h1 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .stats-page__subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Cards Grid */
        .stats-page__cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stats-page__card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }
        .stats-page__card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .stats-page__card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .stats-page__card-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stats-page__card-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
        }
        .stats-page__card-label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* Section */
        .stats-page__section {
          margin-bottom: 20px;
        }
        .stats-page__section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .stats-page__section-header h3 {
          font-size: 16px;
        }

        /* Progress */
        .stats-page__progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .stats-page__progress-current {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }
        .stats-page__progress-goal {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .stats-page__progress-bar {
          height: 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .stats-page__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 6px;
          transition: width 0.5s ease;
        }
        .stats-page__progress-percent {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .stats-page__progress-done {
          font-size: 12px;
          color: var(--success);
          margin-left: 8px;
          font-weight: 500;
        }

        /* Top Pets */
        .stats-page__top-pets {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stats-page__top-pet {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stats-page__top-pet-rank {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-secondary);
          min-width: 28px;
        }
        .stats-page__top-pet-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 60px;
        }
        .stats-page__top-pet-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .stats-page__top-pet-count {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .stats-page__top-pet-bar-wrap {
          flex: 1;
          height: 10px;
          background: var(--bg-secondary);
          border-radius: 5px;
          overflow: hidden;
        }
        .stats-page__top-pet-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        /* Chart */
        .stats-page__chart {
          padding: 8px 0;
        }
        .stats-page__chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          height: 200px;
          padding: 0 8px;
        }
        .stats-page__chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
        }
        .stats-page__chart-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }
        .stats-page__chart-bar-wrap {
          flex: 1;
          width: 100%;
          max-width: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .stats-page__chart-bar {
          width: 100%;
          min-height: 4px;
          background: linear-gradient(180deg, var(--primary), var(--primary-dark));
          border-radius: 6px 6px 2px 2px;
          transition: height 0.5s ease;
        }
        .stats-page__chart-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-page__cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .stats-page__card {
            padding: 16px;
            gap: 12px;
          }
          .stats-page__card-icon {
            width: 44px;
            height: 44px;
          }
          .stats-page__card-icon svg {
            width: 20px;
            height: 20px;
          }
          .stats-page__card-value {
            font-size: 22px;
          }
          .stats-page__chart-bars {
            height: 160px;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .stats-page__cards {
            grid-template-columns: 1fr;
          }
          .stats-page__chart-bars {
            height: 140px;
          }
          .stats-page__chart-value {
            font-size: 11px;
          }
          .stats-page__chart-label {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
