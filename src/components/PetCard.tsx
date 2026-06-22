import type { PetProfile, MatchResult } from '../types';
import { getMatchLabel } from '../utils/matchEngine';
import { MapPin } from 'lucide-react';

interface PetCardProps {
  pet: PetProfile;
  matchResult?: MatchResult;
  showMatchInfo?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

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

export default function PetCard({
  pet,
  matchResult,
  showMatchInfo = false,
  onClick,
  selected = false,
}: PetCardProps) {
  const matchInfo = matchResult
    ? getMatchLabel(matchResult.score)
    : null;

  return (
    <div
      className={`card pet-card ${selected ? 'pet-card--selected' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="pet-card__header">
        <img
          className="avatar-lg"
          src={pet.photos[0] || 'https://placehold.co/200x200/c4785a/ffffff?text=默认'}
          alt={pet.name}
        />
        <div className="pet-card__info">
          <h4 className="pet-card__name">{pet.name}</h4>
          <p className="pet-card__breed">
            {pet.breed} · {pet.gender === 'male' ? '♂' : '♀'} · {pet.age}岁
          </p>
          <div className="pet-card__tags">
            {pet.personalityTags.map((tag) => (
              <span className="tag" key={tag}>
                {personalityLabelMap[tag] || tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showMatchInfo && matchResult && matchInfo && (
        <div className="pet-card__match">
          <div
            className="pet-card__match-score"
            style={{ color: matchInfo.color }}
          >
            {matchResult.score}分
          </div>
          <div
            className="pet-card__match-label"
            style={{
              background: matchInfo.color + '18',
              color: matchInfo.color,
              borderColor: matchInfo.color + '40',
            }}
          >
            {matchInfo.label}
          </div>
          <div className="pet-card__match-distance">
            <MapPin size={14} />
            <span>{matchResult.distanceKm.toFixed(1)}km</span>
          </div>
        </div>
      )}

      <div className="pet-card__meta">
        <span className="pet-card__meta-item">
          {sizeLabelMap[pet.size]}
        </span>
        <span className="pet-card__meta-item">
          {energyLabelMap[pet.energyLevel]}
        </span>
        <span className="pet-card__meta-item">
          {pet.weight}kg
        </span>
      </div>

      <p className="pet-card__bio">{pet.bio}</p>

      <style>{`
        .pet-card--selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-light);
        }
        .pet-card__header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .pet-card__info {
          flex: 1;
          min-width: 0;
        }
        .pet-card__name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .pet-card__breed {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .pet-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .pet-card__match {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          margin-bottom: 8px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .pet-card__match-score {
          font-size: 20px;
          font-weight: 700;
        }
        .pet-card__match-label {
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }
        .pet-card__match-distance {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-left: auto;
        }
        .pet-card__meta {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }
        .pet-card__meta-item {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .pet-card__bio {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
