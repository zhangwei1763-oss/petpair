import { useState, useMemo } from 'react';
import { nearbyPets, currentUser } from '../data/mockData';
import { calculateAdvancedMatchScore } from '../utils/matchEngine';
import {
  MapPin,
  Navigation,
  Dog,
  Cat,
  X,
  Star,
  ChevronRight,
} from 'lucide-react';

// 模拟每个宠物在地图上的位置（百分比坐标）
const petPositions: Record<string, { x: number; y: number }> = {
  pet_101: { x: 35, y: 25 },
  pet_102: { x: 62, y: 18 },
  pet_103: { x: 20, y: 55 },
  pet_104: { x: 75, y: 40 },
  pet_105: { x: 48, y: 68 },
  pet_106: { x: 15, y: 30 },
  pet_107: { x: 80, y: 72 },
  pet_108: { x: 55, y: 42 },
  pet_109: { x: 30, y: 80 },
  pet_110: { x: 68, y: 58 },
};

// 模拟距离
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
};

type SpeciesFilter = 'all' | 'dog' | 'cat';

export default function MapExplorePage() {
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [maxDistance, setMaxDistance] = useState(15);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const myPet = currentUser.pets[0];

  const filteredPets = useMemo(() => {
    return nearbyPets.filter((pet) => {
      if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
      const dist = distanceMap[pet.id] || 5;
      if (dist > maxDistance) return false;
      return true;
    });
  }, [speciesFilter, maxDistance]);

  const selectedPet = useMemo(() => {
    if (!selectedPetId) return null;
    return nearbyPets.find((p) => p.id === selectedPetId) || null;
  }, [selectedPetId]);

  const selectedMatchScore = useMemo(() => {
    if (!selectedPet || !myPet) return null;
    const dist = distanceMap[selectedPet.id] || 5;
    return calculateAdvancedMatchScore(myPet, selectedPet, dist);
  }, [selectedPet, myPet]);

  const getMarkerColor = (species: string) => {
    return species === 'dog' ? '#c4785a' : '#7a9e7e';
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#fa8c16';
    return '#f5222d';
  };

  return (
    <div className="map-explore-page container">
      {/* 页面标题 */}
      <div className="map-explore-page__header">
        <h1>
          <Navigation size={24} />
          附近宠物
        </h1>
        <p className="map-explore-page__subtitle">
          <MapPin size={14} />
          上海市徐汇区 · 发现 {filteredPets.length} 只附近宠物
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="map-explore-page__filters">
        <div className="map-explore-page__species-btns">
          {[
            { key: 'all' as SpeciesFilter, label: '全部', icon: null },
            { key: 'dog' as SpeciesFilter, label: '狗', icon: <Dog size={14} /> },
            { key: 'cat' as SpeciesFilter, label: '猫', icon: <Cat size={14} /> },
          ].map((item) => (
            <button
              key={item.key}
              className={`map-explore-page__species-btn ${
                speciesFilter === item.key ? 'map-explore-page__species-btn--active' : ''
              }`}
              onClick={() => setSpeciesFilter(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        <div className="map-explore-page__distance-filter">
          <span className="map-explore-page__distance-label">
            <MapPin size={14} />
            距离: {maxDistance}km 以内
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="map-explore-page__range"
          />
        </div>
      </div>

      {/* 模拟地图区域 */}
      <div className="map-explore-page__map">
        {/* 模拟地图背景 - 用CSS绘制 */}
        <div className="map-explore-page__map-bg">
          {/* 模拟道路 */}
          <div className="map-explore-page__road map-explore-page__road--h1" />
          <div className="map-explore-page__road map-explore-page__road--h2" />
          <div className="map-explore-page__road map-explore-page__road--v1" />
          <div className="map-explore-page__road map-explore-page__road--v2" />
          <div className="map-explore-page__road map-explore-page__road--v3" />
          {/* 模拟公园区域 */}
          <div className="map-explore-page__park" />
          <div className="map-explore-page__park map-explore-page__park--2" />
          {/* 模拟建筑 */}
          <div className="map-explore-page__building" style={{ left: '10%', top: '10%' }} />
          <div className="map-explore-page__building" style={{ left: '85%', top: '15%' }} />
          <div className="map-explore-page__building" style={{ left: '42%', top: '12%' }} />
          <div className="map-explore-page__building" style={{ left: '70%', top: '85%' }} />
          {/* 当前位置标记 */}
          <div className="map-explore-page__my-location">
            <div className="map-explore-page__my-location-dot" />
            <div className="map-explore-page__my-location-pulse" />
          </div>

          {/* 宠物标记点 */}
          {filteredPets.map((pet) => {
            const pos = petPositions[pet.id];
            if (!pos) return null;
            const isSelected = pet.id === selectedPetId;
            return (
              <button
                key={pet.id}
                className={`map-explore-page__marker ${
                  isSelected ? 'map-explore-page__marker--selected' : ''
                }`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  '--marker-color': getMarkerColor(pet.species),
                } as React.CSSProperties}
                onClick={() => setSelectedPetId(pet.id)}
              >
                <div className="map-explore-page__marker-dot" />
                <span className="map-explore-page__marker-name">{pet.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 宠物信息弹窗 */}
      {selectedPet && selectedMatchScore && (
        <div
          className="map-explore-page__popup-overlay"
          onClick={() => setSelectedPetId(null)}
        >
          <div
            className="map-explore-page__popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="map-explore-page__popup-close"
              onClick={() => setSelectedPetId(null)}
            >
              <X size={18} />
            </button>
            <div className="map-explore-page__popup-content">
              <img
                className="map-explore-page__popup-avatar"
                src={selectedPet.photos[0]}
                alt={selectedPet.name}
              />
              <div className="map-explore-page__popup-info">
                <h3>{selectedPet.name}</h3>
                <p className="map-explore-page__popup-breed">{selectedPet.breed}</p>
                <div className="map-explore-page__popup-meta">
                  <span className="map-explore-page__popup-distance">
                    <MapPin size={12} />
                    {distanceMap[selectedPet.id]?.toFixed(1) || '?'}km
                  </span>
                  <span
                    className="map-explore-page__popup-score"
                    style={{ color: getMatchColor(selectedMatchScore.score) }}
                  >
                    <Star size={12} />
                    匹配度 {selectedMatchScore.score}分
                  </span>
                </div>
                <div className="map-explore-page__popup-score-bar">
                  <div
                    className="map-explore-page__popup-score-fill"
                    style={{
                      width: `${selectedMatchScore.score}%`,
                      background: getMatchColor(selectedMatchScore.score),
                    }}
                  />
                </div>
                <div className="map-explore-page__popup-tags">
                  {selectedPet.personalityTags.map((tag) => (
                    <span key={tag} className="tag tag--sm">
                      {tag === 'lively'
                        ? '活泼'
                        : tag === 'gentle'
                        ? '温顺'
                        : tag === 'timid'
                        ? '胆小'
                        : tag === 'independent'
                        ? '独立'
                        : '粘人'}
                    </span>
                  ))}
                </div>
                <p className="map-explore-page__popup-bio">{selectedPet.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部宠物列表（横向滚动） */}
      <div className="map-explore-page__list-section">
        <h3>
          附近宠物
          <span className="badge" style={{ marginLeft: 8 }}>
            {filteredPets.length}
          </span>
        </h3>
        <div className="map-explore-page__list-scroll">
          {filteredPets.map((pet) => {
            const dist = distanceMap[pet.id] || 5;
            let score = 0;
            if (myPet) {
              score = calculateAdvancedMatchScore(myPet, pet, dist).score;
            }
            return (
              <div
                key={pet.id}
                className="map-explore-page__list-card"
                onClick={() => setSelectedPetId(pet.id)}
              >
                <img
                  className="map-explore-page__list-card-img"
                  src={pet.photos[0]}
                  alt={pet.name}
                />
                <div className="map-explore-page__list-card-info">
                  <span className="map-explore-page__list-card-name">{pet.name}</span>
                  <span className="map-explore-page__list-card-breed">{pet.breed}</span>
                  <div className="map-explore-page__list-card-stats">
                    <span className="map-explore-page__list-card-dist">
                      <MapPin size={10} />
                      {dist.toFixed(1)}km
                    </span>
                    <span
                      className="map-explore-page__list-card-score"
                      style={{ color: getMatchColor(score) }}
                    >
                      <Star size={10} />
                      {score}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="map-explore-page__list-card-arrow" />
              </div>
            );
          })}
          {filteredPets.length === 0 && (
            <div className="map-explore-page__list-empty">
              <MapPin size={32} />
              <p>附近没有找到符合条件的宠物</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .map-explore-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }

        /* Header */
        .map-explore-page__header {
          margin-bottom: 20px;
        }
        .map-explore-page__header h1 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .map-explore-page__subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Filters */
        .map-explore-page__filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .map-explore-page__species-btns {
          display: flex;
          gap: 8px;
        }
        .map-explore-page__species-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__species-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .map-explore-page__species-btn--active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
        .map-explore-page__species-btn--active:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: #fff;
        }
        .map-explore-page__distance-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 280px;
        }
        .map-explore-page__distance-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .map-explore-page__range {
          flex: 1;
          accent-color: var(--primary);
        }

        /* Map */
        .map-explore-page__map {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          margin-bottom: 24px;
          position: relative;
        }
        .map-explore-page__map-bg {
          position: relative;
          width: 100%;
          height: 400px;
          background:
            linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 20%, #e8f5e9 35%, #b3e5fc 50%, #e1f5fe 65%, #c8e6c9 80%, #dcedc8 100%);
          overflow: hidden;
        }

        /* Simulated roads */
        .map-explore-page__road {
          position: absolute;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 2px;
        }
        .map-explore-page__road--h1 {
          left: 0; right: 0; top: 30%;
          height: 6px;
        }
        .map-explore-page__road--h2 {
          left: 0; right: 0; top: 65%;
          height: 4px;
        }
        .map-explore-page__road--v1 {
          top: 0; bottom: 0; left: 25%;
          width: 6px;
        }
        .map-explore-page__road--v2 {
          top: 0; bottom: 0; left: 55%;
          width: 5px;
        }
        .map-explore-page__road--v3 {
          top: 0; bottom: 0; left: 82%;
          width: 4px;
        }

        /* Simulated parks */
        .map-explore-page__park {
          position: absolute;
          left: 38%;
          top: 35%;
          width: 120px;
          height: 80px;
          background: rgba(76, 175, 80, 0.25);
          border-radius: 40% 60% 50% 50%;
          border: 2px dashed rgba(76, 175, 80, 0.4);
        }
        .map-explore-page__park--2 {
          left: 8%;
          top: 60%;
          width: 80px;
          height: 60px;
          background: rgba(76, 175, 80, 0.2);
          border-radius: 50% 40% 60% 40%;
        }

        /* Simulated buildings */
        .map-explore-page__building {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(158, 158, 158, 0.35);
          border-radius: 4px;
          border: 1px solid rgba(158, 158, 158, 0.3);
        }

        /* My location */
        .map-explore-page__my-location {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
        }
        .map-explore-page__my-location-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1890ff;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.5);
        }
        .map-explore-page__my-location-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(24, 144, 255, 0.15);
          animation: map-explore-page__pulse 2s ease-in-out infinite;
        }
        @keyframes map-explore-page__pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        /* Markers */
        .map-explore-page__marker {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .map-explore-page__marker-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--marker-color);
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .map-explore-page__marker:hover .map-explore-page__marker-dot {
          transform: scale(1.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .map-explore-page__marker--selected .map-explore-page__marker-dot {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }
        .map-explore-page__marker-name {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #333;
          background: rgba(255, 255, 255, 0.85);
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        /* Popup Overlay */
        .map-explore-page__popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: map-explore-page__fade-in 0.2s ease;
        }
        @keyframes map-explore-page__fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .map-explore-page__popup {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 24px;
          width: 100%;
          max-width: 420px;
          position: relative;
          animation: map-explore-page__slide-up 0.25s ease;
        }
        @keyframes map-explore-page__slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .map-explore-page__popup-close {
          position: absolute;
          top: 12px;
          right: 12px;
          color: var(--text-secondary);
          padding: 4px;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }
        .map-explore-page__popup-close:hover {
          color: var(--text);
          background: var(--bg-secondary);
        }
        .map-explore-page__popup-content {
          display: flex;
          gap: 16px;
        }
        .map-explore-page__popup-avatar {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md);
          object-fit: cover;
          flex-shrink: 0;
        }
        .map-explore-page__popup-info {
          flex: 1;
          min-width: 0;
        }
        .map-explore-page__popup-info h3 {
          font-size: 18px;
          margin-bottom: 2px;
        }
        .map-explore-page__popup-breed {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .map-explore-page__popup-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }
        .map-explore-page__popup-distance,
        .map-explore-page__popup-score {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
        }
        .map-explore-page__popup-distance {
          color: var(--text-secondary);
        }
        .map-explore-page__popup-score-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .map-explore-page__popup-score-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .map-explore-page__popup-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }
        .map-explore-page__popup-bio {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 0;
        }

        /* Bottom List */
        .map-explore-page__list-section {
          margin-bottom: 20px;
        }
        .map-explore-page__list-section h3 {
          display: flex;
          align-items: center;
          font-size: 16px;
          margin-bottom: 12px;
        }
        .map-explore-page__list-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }
        .map-explore-page__list-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          min-width: 260px;
          flex-shrink: 0;
          cursor: pointer;
          transition: all var(--transition-normal);
          box-shadow: var(--shadow-sm);
        }
        .map-explore-page__list-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .map-explore-page__list-card-img {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          flex-shrink: 0;
        }
        .map-explore-page__list-card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .map-explore-page__list-card-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }
        .map-explore-page__list-card-breed {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .map-explore-page__list-card-stats {
          display: flex;
          gap: 8px;
        }
        .map-explore-page__list-card-dist,
        .map-explore-page__list-card-score {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
        }
        .map-explore-page__list-card-dist {
          color: var(--text-secondary);
        }
        .map-explore-page__list-card-arrow {
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .map-explore-page__list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px;
          color: var(--text-secondary);
          width: 100%;
        }
        .map-explore-page__list-empty p {
          margin: 0;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .map-explore-page__map-bg {
            height: 300px;
          }
          .map-explore-page__filters {
            flex-direction: column;
            align-items: stretch;
          }
          .map-explore-page__distance-filter {
            max-width: 100%;
          }
          .map-explore-page__popup-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .map-explore-page__popup-meta {
            justify-content: center;
          }
          .map-explore-page__popup-tags {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .map-explore-page__map-bg {
            height: 250px;
          }
          .map-explore-page__list-card {
            min-width: 220px;
          }
        }
      `}</style>
    </div>
  );
}
