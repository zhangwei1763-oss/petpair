import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
}) => {
  const handleClick = (starIndex: number) => {
    if (readonly || !onChange) return;
    onChange(starIndex + 1);
  };

  return (
    <div className="star-rating">
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = index < value;
        return (
          <button
            key={index}
            type="button"
            className={`star-rating__star ${filled ? 'star-rating__star--filled' : 'star-rating__star--empty'}`}
            onClick={() => handleClick(index)}
            disabled={readonly}
            aria-label={`${index + 1} 星`}
          >
            <Star
              size={24}
              fill={filled ? 'var(--accent)' : 'none'}
              stroke={filled ? 'var(--accent)' : 'var(--border)'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
