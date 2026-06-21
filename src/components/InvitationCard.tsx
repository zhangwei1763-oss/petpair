import type { Invitation, PetProfile } from '../types';
import { MapPin, Clock, Check, X } from 'lucide-react';

interface InvitationCardProps {
  invitation: Invitation;
  fromPet?: PetProfile;
  toPet?: PetProfile;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusLabelMap: Record<string, string> = {
  pending: '待回应',
  accepted: '已接受',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColorMap: Record<string, string> = {
  pending: 'var(--accent)',
  accepted: 'var(--success)',
  rejected: 'var(--danger)',
  completed: 'var(--secondary)',
  cancelled: 'var(--text-secondary)',
};

const activityLabelMap: Record<string, string> = {
  outdoor_run: '户外跑步',
  walk: '散步',
  indoor_play: '室内玩耍',
  water: '水上活动',
  hiking: '徒步',
};

export default function InvitationCard({
  invitation,
  fromPet,
  toPet,
  onAccept,
  onReject,
}: InvitationCardProps) {
  const isPending = invitation.status === 'pending';

  return (
    <div className="card invitation-card">
      <div className="invitation-card__header">
        <div className="invitation-card__pets">
          {fromPet && (
            <div className="invitation-card__pet">
              <img
                className="avatar"
                src={fromPet.photos[0]}
                alt={fromPet.name}
              />
              <span className="invitation-card__pet-name">{fromPet.name}</span>
            </div>
          )}
          <span className="invitation-card__arrow">&rarr;</span>
          {toPet && (
            <div className="invitation-card__pet">
              <img
                className="avatar"
                src={toPet.photos[0]}
                alt={toPet.name}
              />
              <span className="invitation-card__pet-name">{toPet.name}</span>
            </div>
          )}
        </div>
        <span
          className="invitation-card__status"
          style={{
            color: statusColorMap[invitation.status],
            background: statusColorMap[invitation.status] + '18',
            borderColor: statusColorMap[invitation.status] + '40',
          }}
        >
          {statusLabelMap[invitation.status]}
        </span>
      </div>

      <div className="invitation-card__details">
        <div className="invitation-card__detail">
          <Clock size={14} />
          <span>
            {new Date(invitation.proposedTime).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="invitation-card__detail">
          <MapPin size={14} />
          <span>{invitation.proposedLocation}</span>
        </div>
        <div className="invitation-card__detail">
          <span className="tag">
            {activityLabelMap[invitation.activityType] || invitation.activityType}
          </span>
        </div>
      </div>

      {invitation.message && (
        <p className="invitation-card__message">{invitation.message}</p>
      )}

      {isPending && onAccept && onReject && (
        <div className="invitation-card__actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onAccept(invitation.id)}
          >
            <Check size={14} />
            接受
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onReject(invitation.id)}
          >
            <X size={14} />
            拒绝
          </button>
        </div>
      )}

      <style>{`
        .invitation-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .invitation-card__pets {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .invitation-card__pet {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .invitation-card__pet-name {
          font-size: 14px;
          font-weight: 600;
        }
        .invitation-card__arrow {
          font-size: 18px;
          color: var(--text-secondary);
        }
        .invitation-card__status {
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }
        .invitation-card__details {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 10px;
        }
        .invitation-card__detail {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .invitation-card__message {
          font-size: 13px;
          color: var(--text);
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 0;
        }
        .invitation-card__actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
