import { useState, useMemo, useCallback } from 'react';
import { nearbyPets, currentUser } from '../data/mockData';
import { calculateAdvancedMatchScore, getMatchLabel, getCompatibilityAdvice } from '../utils/matchEngine';
import { generateMatchExplanation } from '../api/ai';
import {
  MapPin,
  Navigation,
  Dog,
  Cat,
  X,
  Star,
  ChevronRight,
  Sparkles,
  Heart,
  Zap,
  Search,
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
type TabType = 'map' | 'recommend';
type ReasonFilter = 'all' | 'personality' | 'energy' | 'distance';

export default function MapExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [maxDistance, setMaxDistance] = useState(15);
  const [minScore, setMinScore] = useState(0);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});

  const myPet = currentUser.pets[0];

  // === 基础筛选 ===
  const baseFiltered = useMemo(() => {
    return nearbyPets.filter((pet) => {
      if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
      const dist = distanceMap[pet.id] || 5;
      if (dist > maxDistance) return false;
      return true;
    });
  }, [speciesFilter, maxDistance]);

  // === 按最低匹配度筛选 ===
  const filteredPets = useMemo(() => {
    if (!myPet) return baseFiltered;
    return baseFiltered.filter((pet) => {
      const dist = distanceMap[pet.id] || 5;
      const result = calculateAdvancedMatchScore(myPet, pet, dist);
      return result.score >= minScore;
    });
  }, [baseFiltered, minScore, myPet]);

  // === 智能推荐列表（按匹配度排序 + 推荐理由筛选） ===
  const recommendedPets = useMemo(() => {
    if (!myPet) return [];
    let list = baseFiltered
      .map((pet) => {
        const dist = distanceMap[pet.id] || 5;
        const matchResult = calculateAdvancedMatchScore(myPet, pet, dist);
        return { pet, dist, matchResult };
      })
      .filter((item) => item.matchResult.score >= minScore);

    // 推荐理由筛选
    if (reasonFilter === 'personality') {
      list = list.filter((item) => item.matchResult.dimensions.personality >= 10);
    } else if (reasonFilter === 'energy') {
      list = list.filter((item) => item.matchResult.dimensions.energy >= 8);
    } else if (reasonFilter === 'distance') {
      list = list.filter((item) => item.matchResult.dimensions.distance >= 5);
    }

    return list.sort((a, b) => b.matchResult.score - a.matchResult.score);
  }, [baseFiltered, minScore, reasonFilter, myPet]);

  // === 选中的宠物 ===
  const selectedPet = useMemo(() => {
    if (!selectedPetId) return null;
    return nearbyPets.find((p) => p.id === selectedPetId) || null;
  }, [selectedPetId]);

  const selectedMatchScore = useMemo(() => {
    if (!selectedPet || !myPet) return null;
    const dist = distanceMap[selectedPet.id] || 5;
    return calculateAdvancedMatchScore(myPet, selectedPet, dist);
  }, [selectedPet, myPet]);

  // === 预计算所有宠物的匹配分数（用于地图标记颜色） ===
  const petMatchScores = useMemo(() => {
    const scores: Record<string, { score: number; color: string }> = {};
    if (!myPet) return scores;
    filteredPets.forEach((pet) => {
      const dist = distanceMap[pet.id] || 5;
      const result = calculateAdvancedMatchScore(myPet, pet, dist);
      scores[pet.id] = { score: result.score, color: getMatchColor(result.score) };
    });
    return scores;
  }, [filteredPets, myPet]);

  // === AI 匹配解释 ===
  const handleAiExplain = useCallback(
    async (petId: string) => {
      if (aiExplanations[petId] || !myPet) return;
      setLoadingAi((prev) => ({ ...prev, [petId]: true }));
      try {
        const pet = nearbyPets.find((p) => p.id === petId);
        if (pet) {
          const dist = distanceMap[petId] || 5;
          const matchResult = calculateAdvancedMatchScore(myPet, pet, dist);
          const explanation = await generateMatchExplanation(myPet, pet, matchResult.score);
          setAiExplanations((prev) => ({ ...prev, [petId]: explanation }));
        }
      } catch {
        setAiExplanations(
          (prev) => ({ ...prev, [petId]: 'AI 分析暂时不可用，请稍后再试。' }),
        );
      } finally {
        setLoadingAi((prev) => ({ ...prev, [petId]: false }));
      }
    },
    [myPet, aiExplanations],
  );

  // === 颜色辅助函数 ===
  function getMarkerColor(species: string) {
    return species === 'dog' ? '#c4785a' : '#7a9e7e';
  }

  function getMatchColor(score: number) {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#fa8c16';
    return '#f5222d';
  }

  function getDimPercent(dim: string, score: number) {
    const maxMap: Record<string, number> = {
      personality: 20,
      energy: 15,
      size: 10,
      distance: 10,
      health: 10,
    };
    const max = maxMap[dim] || 10;
    return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
  }

  function getDimColor(pct: number) {
    if (pct >= 80) return '#52c41a';
    if (pct >= 50) return '#1890ff';
    if (pct >= 20) return '#fa8c16';
    return '#f5222d';
  }

  const dimLabels: Record<string, string> = {
    personality: '性格',
    energy: '能量',
    size: '体型',
    distance: '距离',
    health: '健康',
  };

  // === 未添加宠物时的空状态 ===
  if (!myPet) {
    return (
      <div className="map-explore-page container">
        <div className="map-explore-page__no-pet">
          <Dog size={48} />
          <h2>请先添加宠物档案</h2>
          <p>在「个人中心」中添加您的宠物信息后，即可使用发现和匹配功能</p>
        </div>

        <style>{`
          .map-explore-page__no-pet {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            text-align: center;
            color: var(--text-secondary);
          }
          .map-explore-page__no-pet h2 {
            margin: 16px 0 8px;
            color: var(--text);
          }
          .map-explore-page__no-pet p {
            max-width: 360px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="map-explore-page container">
      {/* ====== 页面标题 ====== */}
      <div className="map-explore-page__header">
        <h1>
          <Navigation size={24} />
          {activeTab === 'map' ? '附近宠物' : '智能推荐'}
        </h1>
        <p className="map-explore-page__subtitle">
          <MapPin size={14} />
          上海市徐汇区
          {activeTab === 'recommend' && recommendedPets.length > 0 && (
            <> · 为你推荐 {recommendedPets.length} 个玩伴</>
          )}
          {activeTab === 'map' && <> · 发现 {filteredPets.length} 只附近宠物</>}
        </p>
      </div>

      {/* ====== Tab 切换 ====== */}
      <div className="map-explore-page__tabs">
        <button
          className={`map-explore-page__tab ${activeTab === 'map' ? 'map-explore-page__tab--active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Navigation size={16} />
          附近宠物
        </button>
        <button
          className={`map-explore-page__tab ${activeTab === 'recommend' ? 'map-explore-page__tab--active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          <Sparkles size={16} />
          智能推荐
        </button>
      </div>

      {/* ====== 通用筛选栏 ====== */}
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
            距离: {maxDistance}km
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

      {/* ====== 最低匹配度筛选 ====== */}
      <div className="map-explore-page__score-filter">
        <span className="map-explore-page__score-filter-label">
          <Star size={14} />
          最低匹配度: {minScore}分
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="map-explore-page__range"
        />
        <div className="map-explore-page__score-filter-quick">
          {[0, 50, 70, 90].map((v) => (
            <button
              key={v}
              className={`map-explore-page__score-quick-btn ${minScore === v ? 'map-explore-page__score-quick-btn--active' : ''}`}
              style={{ color: v === 0 ? '#999' : getMatchColor(v) }}
              onClick={() => setMinScore(v)}
            >
              {v === 0 ? '全部' : `${v}分`}
            </button>
          ))}
        </div>
      </div>

      {/* ============================== TAB: 地图模式 ============================== */}
      {activeTab === 'map' && (
        <>
          {/* 模拟地图 */}
          <div className="map-explore-page__map">
            <div className="map-explore-page__map-bg">
              <div className="map-explore-page__road map-explore-page__road--h1" />
              <div className="map-explore-page__road map-explore-page__road--h2" />
              <div className="map-explore-page__road map-explore-page__road--v1" />
              <div className="map-explore-page__road map-explore-page__road--v2" />
              <div className="map-explore-page__road map-explore-page__road--v3" />
              <div className="map-explore-page__park" />
              <div className="map-explore-page__park map-explore-page__park--2" />
              <div className="map-explore-page__building" style={{ left: '10%', top: '10%' }} />
              <div className="map-explore-page__building" style={{ left: '85%', top: '15%' }} />
              <div className="map-explore-page__building" style={{ left: '42%', top: '12%' }} />
              <div className="map-explore-page__building" style={{ left: '70%', top: '85%' }} />
              <div className="map-explore-page__my-location">
                <div className="map-explore-page__my-location-dot" />
                <div className="map-explore-page__my-location-pulse" />
              </div>

              {/* 宠物标记 - 按匹配度着色 */}
              {filteredPets.map((pet) => {
                const pos = petPositions[pet.id];
                if (!pos) return null;
                const isSelected = pet.id === selectedPetId;
                const matchInfo = petMatchScores[pet.id];
                const markerColor = matchInfo ? matchInfo.color : getMarkerColor(pet.species);
                const isHighMatch = matchInfo && matchInfo.score >= 80;
                return (
                  <button
                    key={pet.id}
                    className={`map-explore-page__marker ${
                      isSelected ? 'map-explore-page__marker--selected' : ''
                    } ${isHighMatch ? 'map-explore-page__marker--high-match' : ''}`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      '--marker-color': markerColor,
                    } as React.CSSProperties}
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <div className="map-explore-page__marker-dot" />
                    {isHighMatch && (
                      <div className="map-explore-page__marker-score">
                        {matchInfo!.score}
                      </div>
                    )}
                    <span className="map-explore-page__marker-name">{pet.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部宠物列表 */}
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
                const matchResult = calculateAdvancedMatchScore(myPet, pet, dist);
                const { label } = getMatchLabel(matchResult.score);
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
                          style={{ color: getMatchColor(matchResult.score) }}
                        >
                          <Star size={10} />
                          {matchResult.score}分
                        </span>
                      </div>
                      <span
                        className="map-explore-page__list-card-label"
                        style={{ color: getMatchColor(matchResult.score) }}
                      >
                        {label}
                      </span>
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
        </>
      )}

      {/* ========================== TAB: 智能推荐 ========================== */}
      {activeTab === 'recommend' && (
        <>
          {/* 推荐理由筛选标签 */}
          <div className="map-explore-page__reason-filters">
            {[
              { key: 'all' as ReasonFilter, label: '全部推荐', icon: <Sparkles size={14} /> },
              { key: 'personality' as ReasonFilter, label: '性格互补', icon: <Heart size={14} /> },
              { key: 'energy' as ReasonFilter, label: '能量匹配', icon: <Zap size={14} /> },
              { key: 'distance' as ReasonFilter, label: '距离较近', icon: <MapPin size={14} /> },
            ].map((item) => (
              <button
                key={item.key}
                className={`map-explore-page__reason-chip ${
                  reasonFilter === item.key ? 'map-explore-page__reason-chip--active' : ''
                }`}
                onClick={() => setReasonFilter(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* 推荐宠物列表 */}
          <div className="map-explore-page__rec-list">
            {recommendedPets.length > 0 && (
              <div className="map-explore-page__rec-count">
                已按匹配度排序，找到 {recommendedPets.length} 个匹配对象
              </div>
            )}

            {recommendedPets.map(({ pet, dist, matchResult }) => {
              const { label: matchLabel } = getMatchLabel(matchResult.score);
              const advice = getCompatibilityAdvice(matchResult.dimensions);
              return (
                <div key={pet.id} className="map-explore-page__rec-card">
                  {/* 卡片头部 */}
                  <div className="map-explore-page__rec-card-top">
                    <img
                      className="map-explore-page__rec-card-img"
                      src={pet.photos[0]}
                      alt={pet.name}
                    />
                    <div className="map-explore-page__rec-card-info">
                      <div className="map-explore-page__rec-card-row">
                        <span className="map-explore-page__rec-card-name">
                          {pet.name}
                        </span>
                        <span className="map-explore-page__rec-card-breed">
                          {pet.breed}
                        </span>
                      </div>
                      <div className="map-explore-page__rec-card-meta">
                        <span>
                          <MapPin size={11} /> {dist.toFixed(1)}km
                        </span>
                        <span>
                          {pet.gender === 'male' ? '♂' : '♀'} · {pet.age}岁
                        </span>
                      </div>
                    </div>
                    {/* 匹配度徽章 */}
                    <div
                      className="map-explore-page__score-badge"
                      style={{ borderColor: getMatchColor(matchResult.score) }}
                    >
                      <div
                        className="map-explore-page__score-badge-num"
                        style={{ color: getMatchColor(matchResult.score) }}
                      >
                        {matchResult.score}
                      </div>
                      <div
                        className="map-explore-page__score-badge-label"
                        style={{ color: getMatchColor(matchResult.score) }}
                      >
                        {matchLabel}
                      </div>
                    </div>
                  </div>

                  {/* 五维匹配度条 */}
                  <div className="map-explore-page__dims">
                    {Object.entries(matchResult.dimensions).map(([key, val]) => {
                      const pct = getDimPercent(key, val);
                      return (
                        <div key={key} className="map-explore-page__dim">
                          <span className="map-explore-page__dim-label">
                            {dimLabels[key]}
                          </span>
                          <div className="map-explore-page__dim-bar">
                            <div
                              className="map-explore-page__dim-fill"
                              style={{
                                width: `${pct}%`,
                                background: getDimColor(pct),
                              }}
                            />
                          </div>
                          <span
                            className="map-explore-page__dim-val"
                            style={{ color: getDimColor(pct) }}
                          >
                            {val > 0 ? `+${val}` : val}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 匹配建议 */}
                  <div className="map-explore-page__rec-advice">
                    {advice.slice(0, 2).map((a, i) => (
                      <span key={i} className="map-explore-page__rec-advice-item">
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* AI 匹配分析 */}
                  <div className="map-explore-page__ai-section">
                    {aiExplanations[pet.id] ? (
                      <div className="map-explore-page__ai-content">
                        <Sparkles size={14} style={{ flexShrink: 0 }} />
                        <p>{aiExplanations[pet.id]}</p>
                      </div>
                    ) : (
                      <button
                        className="map-explore-page__ai-btn"
                        onClick={() => handleAiExplain(pet.id)}
                        disabled={loadingAi[pet.id]}
                      >
                        {loadingAi[pet.id] ? (
                          <span className="map-explore-page__ai-loading">
                            AI 分析中...
                            <span className="map-explore-page__ai-dots">
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
                          </span>
                        ) : (
                          <>
                            <Sparkles size={14} /> AI 匹配分析
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="map-explore-page__rec-actions">
                    <button
                      className="map-explore-page__rec-btn map-explore-page__rec-btn--primary"
                      onClick={() => setSelectedPetId(pet.id)}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              );
            })}

            {recommendedPets.length === 0 && (
              <div className="map-explore-page__list-empty" style={{ marginTop: 20 }}>
                <Search size={32} />
                <p>没有找到符合条件的推荐宠物</p>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  试试扩大距离范围或降低匹配度要求
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================== 宠物弹窗（通用） ============================== */}
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
                <p className="map-explore-page__popup-breed">
                  {selectedPet.breed}
                </p>
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

                {/* 新增：匹配分析详情 */}
                <div className="map-explore-page__popup-reasons">
                  <strong>
                    <Star size={12} /> 匹配分析
                  </strong>
                  {selectedMatchScore.reasons.slice(0, 4).map((r, i) => (
                    <div key={i} className="map-explore-page__popup-reason">
                      {r}
                    </div>
                  ))}
                </div>

                {/* 新增：AI 匹配分析 */}
                <div className="map-explore-page__popup-ai">
                  {aiExplanations[selectedPet.id] ? (
                    <div className="map-explore-page__ai-content">
                      <Sparkles size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>AI 匹配分析</strong>
                        <p>{aiExplanations[selectedPet.id]}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="map-explore-page__ai-btn"
                      onClick={() => handleAiExplain(selectedPet.id)}
                      disabled={loadingAi[selectedPet.id]}
                    >
                      {loadingAi[selectedPet.id] ? (
                        <span className="map-explore-page__ai-loading">
                          AI 分析中...
                          <span className="map-explore-page__ai-dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </span>
                        </span>
                      ) : (
                        <>
                          <Sparkles size={14} /> AI 匹配分析
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .map-explore-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }

        /* Header */
        .map-explore-page__header {
          margin-bottom: 16px;
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

        /* ===== Tabs ===== */
        .map-explore-page__tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius-md);
        }
        .map-explore-page__tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__tab:hover {
          color: var(--text);
        }
        .map-explore-page__tab--active {
          background: var(--bg-card);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        /* Filters */
        .map-explore-page__filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
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

        /* ===== Score Filter ===== */
        .map-explore-page__score-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .map-explore-page__score-filter-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .map-explore-page__score-filter .map-explore-page__range {
          max-width: 200px;
        }
        .map-explore-page__score-filter-quick {
          display: flex;
          gap: 6px;
        }
        .map-explore-page__score-quick-btn {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-card);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__score-quick-btn:hover {
          border-color: var(--primary);
        }
        .map-explore-page__score-quick-btn--active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff !important;
        }

        /* ===== Reason Filter Chips ===== */
        .map-explore-page__reason-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .map-explore-page__reason-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__reason-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .map-explore-page__reason-chip--active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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
        /* 高匹配度标记脉动动画 */
        .map-explore-page__marker--high-match .map-explore-page__marker-dot {
          box-shadow: 0 0 0 0 var(--marker-color);
          animation: map-explore-page__marker-pulse 1.5s ease-out infinite;
        }
        @keyframes map-explore-page__marker-pulse {
          0% { box-shadow: 0 0 0 0 var(--marker-color); }
          70% { box-shadow: 0 0 0 12px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .map-explore-page__marker-score {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #fff;
          color: var(--marker-color);
          font-size: 10px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          border: 1.5px solid var(--marker-color);
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

        /* ===== Bottom List ===== */
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
          min-width: 280px;
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
        .map-explore-page__list-card-label {
          font-size: 11px;
          font-weight: 700;
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

        /* ===== Popup ===== */
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
          max-height: 85vh;
          overflow-y: auto;
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
          margin-bottom: 12px;
        }

        /* Popup: 匹配分析 */
        .map-explore-page__popup-reasons {
          margin-bottom: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }
        .map-explore-page__popup-reasons strong {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .map-explore-page__popup-reason {
          font-size: 12px;
          color: var(--text-secondary);
          padding: 4px 0 4px 12px;
          border-left: 2px solid var(--primary);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .map-explore-page__popup-reason:last-child {
          margin-bottom: 0;
        }

        /* Popup: AI section */
        .map-explore-page__popup-ai {
          margin-top: 8px;
        }

        /* ===== Recommendation List ===== */
        .map-explore-page__rec-count {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .map-explore-page__rec-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        /* Recommendation Card */
        .map-explore-page__rec-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-normal);
        }
        .map-explore-page__rec-card:hover {
          box-shadow: var(--shadow-md);
        }
        .map-explore-page__rec-card-top {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .map-explore-page__rec-card-img {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          object-fit: cover;
          flex-shrink: 0;
        }
        .map-explore-page__rec-card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
        }
        .map-explore-page__rec-card-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .map-explore-page__rec-card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
        }
        .map-explore-page__rec-card-breed {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .map-explore-page__rec-card-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .map-explore-page__rec-card-meta span {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* Score Badge */
        .map-explore-page__score-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          border: 2px solid;
          background: var(--bg-card);
          flex-shrink: 0;
          min-width: 60px;
        }
        .map-explore-page__score-badge-num {
          font-size: 22px;
          font-weight: 800;
          line-height: 1.1;
        }
        .map-explore-page__score-badge-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ===== Dimension Bars ===== */
        .map-explore-page__dims {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }
        .map-explore-page__dim {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .map-explore-page__dim-label {
          width: 36px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .map-explore-page__dim-bar {
          flex: 1;
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .map-explore-page__dim-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .map-explore-page__dim-val {
          width: 30px;
          font-size: 11px;
          font-weight: 700;
          text-align: right;
          flex-shrink: 0;
        }

        /* Compatibility Advice */
        .map-explore-page__rec-advice {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .map-explore-page__rec-advice-item {
          display: inline-block;
          font-size: 12px;
          color: var(--primary);
          background: rgba(102, 126, 234, 0.08);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          line-height: 1.4;
        }

        /* ===== AI Section ===== */
        .map-explore-page__ai-section {
          margin-bottom: 12px;
        }
        .map-explore-page__ai-content {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(102, 126, 234, 0.12);
        }
        .map-explore-page__ai-content p {
          font-size: 13px;
          color: var(--text);
          line-height: 1.6;
          margin: 4px 0 0;
        }
        .map-explore-page__ai-content strong {
          font-size: 12px;
          color: #667eea;
        }
        .map-explore-page__ai-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-sm);
          border: 1.5px dashed rgba(102, 126, 234, 0.3);
          background: rgba(102, 126, 234, 0.04);
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__ai-btn:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
        .map-explore-page__ai-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .map-explore-page__ai-loading {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .map-explore-page__ai-dots span {
          animation: map-explore-page__ai-dot 1.4s infinite;
          font-weight: 700;
        }
        .map-explore-page__ai-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .map-explore-page__ai-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes map-explore-page__ai-dot {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        /* Action Buttons */
        .map-explore-page__rec-actions {
          display: flex;
          gap: 8px;
        }
        .map-explore-page__rec-btn {
          flex: 1;
          padding: 10px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .map-explore-page__rec-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .map-explore-page__rec-btn--primary {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
        .map-explore-page__rec-btn--primary:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: #fff;
        }

        /* ===== Responsive ===== */
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
          .map-explore-page__score-filter {
            justify-content: space-between;
          }
          .map-explore-page__score-filter .map-explore-page__range {
            max-width: 120px;
          }
          .map-explore-page__rec-card-top {
            flex-wrap: wrap;
          }
          .map-explore-page__score-badge {
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .map-explore-page__map-bg {
            height: 250px;
          }
          .map-explore-page__list-card {
            min-width: 240px;
          }
          .map-explore-page__reason-filters {
            gap: 6px;
          }
          .map-explore-page__reason-chip {
            padding: 6px 12px;
            font-size: 12px;
          }
          .map-explore-page__score-filter {
            flex-direction: column;
            align-items: stretch;
          }
          .map-explore-page__score-filter .map-explore-page__range {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}