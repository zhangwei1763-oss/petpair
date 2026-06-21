import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { VaccineStatus } from '../types';

interface HealthBadgeProps {
  vaccineStatus: VaccineStatus;
  neutered: boolean;
}

const vaccineLabelMap: Record<VaccineStatus, string> = {
  up_to_date: '疫苗齐全',
  partial: '部分接种',
  none: '未接种',
};

const HealthBadge: React.FC<HealthBadgeProps> = ({ vaccineStatus, neutered }) => {
  const vaccineColor = vaccineStatus === 'up_to_date' ? '#52c41a' : vaccineStatus === 'partial' ? '#fa8c16' : '#f5222d';

  return (
    <div className="health-badge">
      <div className="health-badge__item" style={{ color: vaccineColor, borderColor: vaccineColor + '40', background: vaccineColor + '10' }}>
        <ShieldCheck size={14} />
        <span>{vaccineLabelMap[vaccineStatus]}</span>
      </div>
      <div
        className="health-badge__item"
        style={{
          color: neutered ? '#52c41a' : '#8c8c8c',
          borderColor: neutered ? '#52c41a40' : '#8c8c8c40',
          background: neutered ? '#52c41a10' : '#8c8c8c10',
        }}
      >
        <ShieldCheck size={14} />
        <span>{neutered ? '已绝育' : '未绝育'}</span>
      </div>

      <style>{`
        .health-badge {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .health-badge__item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid;
        }
      `}</style>
    </div>
  );
};

export default HealthBadge;
