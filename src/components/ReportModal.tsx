import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  petName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const reportReasons = [
  '虚假信息',
  '不文明行为',
  '骚扰或不当言论',
  '宠物健康问题未如实告知',
  '其他',
];

const ReportModal: React.FC<ReportModalProps> = ({ petName, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = selectedReason + (detail ? `：${detail}` : '');
    onSubmit(reason);
    onClose();
  };

  return (
    <div className="report-modal__overlay" onClick={onClose}>
      <div className="card report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="report-modal__close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="report-modal__header">
          <AlertTriangle size={20} color="#f5222d" />
          <h3>举报 {petName}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="report-modal__reasons">
            {reportReasons.map((reason) => (
              <label key={reason} className="report-modal__reason-item">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  required
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div className="form-group">
            <label>补充说明（选填）</label>
            <textarea
              className="form-textarea"
              placeholder="请描述具体情况..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
          </div>

          <div className="report-modal__actions">
            <button type="submit" className="btn btn-danger" disabled={!selectedReason}>
              提交举报
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .report-modal__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 20px;
        }
        .report-modal {
          width: 100%;
          max-width: 440px;
          position: relative;
          padding: 24px;
        }
        .report-modal__close {
          position: absolute;
          top: 12px;
          right: 12px;
          color: var(--text-secondary);
          padding: 4px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .report-modal__close:hover {
          color: var(--text);
        }
        .report-modal__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .report-modal__header h3 {
          font-size: 16px;
          margin: 0;
        }
        .report-modal__reasons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .report-modal__reason-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .report-modal__reason-item:hover {
          background: var(--bg-secondary);
        }
        .report-modal__reason-item input[type="radio"] {
          accent-color: var(--primary);
        }
        .report-modal__actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .btn-danger {
          background: #f5222d;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-danger:hover {
          opacity: 0.85;
        }
        .btn-danger:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ReportModal;
