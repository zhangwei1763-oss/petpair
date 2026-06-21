import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { nearbyPets } from '../data/mockData';
import PetCard from '../components/PetCard';
import {
  Search,
  X,
  TrendingUp,
  Filter,
  PawPrint,
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
  low: '低能量',
  medium: '中能量',
  high: '高能量',
};

const hotSearchTags = [
  '金毛',
  '柯基',
  '布偶猫',
  '活泼',
  '温顺',
  '大型犬',
  '散步',
  '水上活动',
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [energyFilter, setEnergyFilter] = useState<string>('all');

  const filteredPets = useMemo(() => {
    let results = nearbyPets;

    // Keyword search
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      results = results.filter(
        (pet) =>
          pet.name.toLowerCase().includes(kw) ||
          pet.breed.toLowerCase().includes(kw) ||
          pet.personalityTags.some((tag) =>
            (personalityLabelMap[tag] || tag).toLowerCase().includes(kw)
          ) ||
          pet.bio.toLowerCase().includes(kw)
      );
    }

    // Species filter
    if (speciesFilter !== 'all') {
      results = results.filter((pet) => pet.species === speciesFilter);
    }

    // Size filter
    if (sizeFilter !== 'all') {
      results = results.filter((pet) => pet.size === sizeFilter);
    }

    // Energy filter
    if (energyFilter !== 'all') {
      results = results.filter((pet) => pet.energyLevel === energyFilter);
    }

    return results;
  }, [keyword, speciesFilter, sizeFilter, energyFilter]);

  const handleHotTagClick = (tag: string) => {
    setKeyword(tag);
  };

  const clearSearch = () => {
    setKeyword('');
    setSpeciesFilter('all');
    setSizeFilter('all');
    setEnergyFilter('all');
  };

  const hasActiveFilters =
    speciesFilter !== 'all' || sizeFilter !== 'all' || energyFilter !== 'all';

  return (
    <div className="search-page">
      {/* Fixed Search Bar */}
      <div className="search-page__bar">
        <div className="search-page__bar-inner container">
          <div className="search-page__input-wrap">
            <Search size={18} className="search-page__input-icon" />
            <input
              className="search-page__input"
              type="text"
              placeholder="搜索宠物名字、品种、性格..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
            {keyword && (
              <button
                className="search-page__input-clear"
                onClick={() => setKeyword('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="search-page__content container">
        {/* Hot Tags */}
        {!keyword.trim() && !hasActiveFilters && (
          <div className="search-page__hot">
            <div className="search-page__hot-title">
              <TrendingUp size={16} />
              <h3>热门搜索</h3>
            </div>
            <div className="search-page__hot-tags">
              {hotSearchTags.map((tag) => (
                <button
                  key={tag}
                  className="search-page__hot-tag"
                  onClick={() => handleHotTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="search-page__filters">
          <div className="search-page__filters-scroll">
            <div className="search-page__filter-group">
              <Filter size={14} />
              <span className="search-page__filter-label">物种</span>
            </div>
            <button
              className={`search-page__filter-chip ${
                speciesFilter === 'all'
                  ? 'search-page__filter-chip--active'
                  : ''
              }`}
              onClick={() => setSpeciesFilter('all')}
            >
              全部
            </button>
            <button
              className={`search-page__filter-chip ${
                speciesFilter === 'dog'
                  ? 'search-page__filter-chip--active'
                  : ''
              }`}
              onClick={() => setSpeciesFilter('dog')}
            >
              狗狗
            </button>
            <button
              className={`search-page__filter-chip ${
                speciesFilter === 'cat'
                  ? 'search-page__filter-chip--active'
                  : ''
              }`}
              onClick={() => setSpeciesFilter('cat')}
            >
              猫咪
            </button>

            <div className="search-page__filter-divider" />

            <div className="search-page__filter-group">
              <span className="search-page__filter-label">体型</span>
            </div>
            {Object.entries(sizeLabelMap).map(([k, v]) => (
              <button
                key={k}
                className={`search-page__filter-chip ${
                  sizeFilter === k ? 'search-page__filter-chip--active' : ''
                }`}
                onClick={() =>
                  setSizeFilter(sizeFilter === k ? 'all' : k)
                }
              >
                {v}
              </button>
            ))}

            <div className="search-page__filter-divider" />

            <div className="search-page__filter-group">
              <span className="search-page__filter-label">能量</span>
            </div>
            {Object.entries(energyLabelMap).map(([k, v]) => (
              <button
                key={k}
                className={`search-page__filter-chip ${
                  energyFilter === k ? 'search-page__filter-chip--active' : ''
                }`}
                onClick={() =>
                  setEnergyFilter(energyFilter === k ? 'all' : k)
                }
              >
                {v}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button className="search-page__clear-filters" onClick={clearSearch}>
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>

        {/* Search Status */}
        {(keyword.trim() || hasActiveFilters) && (
          <div className="search-page__status">
            <span className="search-page__status-text">
              找到 <strong>{filteredPets.length}</strong> 只宠物
            </span>
          </div>
        )}

        {/* Results */}
        <div className="search-page__results">
          {filteredPets.length === 0 ? (
            <div className="empty-state">
              <PawPrint size={64} />
              <h3>没有找到匹配的宠物</h3>
              <p>试试其他关键词或调整筛选条件</p>
              {keyword && (
                <button className="btn btn-primary btn-sm" onClick={clearSearch}>
                  清除搜索
                </button>
              )}
            </div>
          ) : (
            filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onClick={() => navigate(`/pet/${pet.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        .search-page {
          min-height: 100vh;
        }

        /* Fixed Search Bar */
        .search-page__bar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          padding: 12px 0;
        }
        .search-page__bar-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-page__input-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-page__input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-secondary);
          pointer-events: none;
        }
        .search-page__input {
          width: 100%;
          padding: 10px 40px 10px 42px;
          font-size: 15px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          outline: none;
          transition: all var(--transition-fast);
        }
        .search-page__input:focus {
          background: var(--bg-card);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(196, 120, 90, 0.15);
        }
        .search-page__input-clear {
          position: absolute;
          right: 12px;
          color: var(--text-secondary);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-page__input-clear:hover {
          color: var(--text);
        }

        /* Content */
        .search-page__content {
          padding-top: 20px;
          padding-bottom: 40px;
        }

        /* Hot Tags */
        .search-page__hot {
          margin-bottom: 20px;
        }
        .search-page__hot-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .search-page__hot-title h3 {
          font-size: 1rem;
        }
        .search-page__hot-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .search-page__hot-tag {
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          color: var(--text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .search-page__hot-tag:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }

        /* Filters */
        .search-page__filters {
          margin-bottom: 16px;
        }
        .search-page__filters-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }
        .search-page__filter-group {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .search-page__filter-label {
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .search-page__filter-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          flex-shrink: 0;
          margin: 0 4px;
        }
        .search-page__filter-chip {
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .search-page__filter-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .search-page__filter-chip--active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }
        .search-page__filter-chip--active:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: #fff;
        }
        .search-page__clear-filters {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 8px;
          padding: 4px 0;
        }
        .search-page__clear-filters:hover {
          color: var(--danger);
        }

        /* Status */
        .search-page__status {
          margin-bottom: 16px;
        }
        .search-page__status-text {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .search-page__status-text strong {
          color: var(--primary);
          font-weight: 700;
        }

        /* Results */
        .search-page__results {
          display: grid;
          gap: 16px;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .search-page__bar {
            padding: 8px 0;
          }
          .search-page__input {
            padding: 8px 36px 8px 38px;
            font-size: 14px;
          }
          .search-page__hot-tag {
            padding: 6px 14px;
            font-size: 12px;
          }
          .search-page__filter-chip {
            padding: 5px 10px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
