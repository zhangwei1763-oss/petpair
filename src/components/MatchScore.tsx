import React, { useState, useEffect } from 'react';
import { getMatchLabel } from '../utils/matchEngine';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 40,
  md: 56,
  lg: 80,
};

const FONT_SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
};

const MatchScore: React.FC<MatchScoreProps> = ({ score, size = 'md' }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600; // 动画时长 ms
    const step = Math.max(1, Math.ceil(score / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const { color } = getMatchLabel(score);
  const diameter = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  return (
    <div
      className="match-score"
      style={{
        width: diameter,
        height: diameter,
        minWidth: diameter,
        borderColor: color,
        color: color,
      }}
    >
      <span style={{ fontSize }}>{displayScore}</span>
    </div>
  );
};

export default MatchScore;
