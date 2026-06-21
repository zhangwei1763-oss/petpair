import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

const feedbackTypes = [
  { value: 'suggestion', label: '建议' },
  { value: 'bug', label: 'Bug反馈' },
  { value: 'complaint', label: '投诉' },
  { value: 'other', label: '其他' },
];

const satisfactionOptions = [
  { value: 1, label: '很差' },
  { value: 2, label: '不好' },
  { value: 3, label: '一般' },
  { value: 4, label: '满意' },
  { value: 5, label: '非常满意' },
];

export default function FeedbackWidget({ position = 'bottom-right' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedbackType || !satisfaction || !description.trim()) return;

    // Simulate submit
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackType('');
      setSatisfaction(null);
      setDescription('');
      setIsOpen(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const positionStyle: React.CSSProperties =
    position === 'bottom-right'
      ? { right: 24, bottom: 24 }
      : { left: 24, bottom: 24 };

  const panelPositionStyle: React.CSSProperties =
    position === 'bottom-right'
      ? { right: 0 }
      : { left: 0 };

  return (
    <>
      {/* Floating Button */}
      <button
        className="feedback-widget__trigger"
        style={positionStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="用户反馈"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="feedback-widget__panel" style={panelPositionStyle}>
          <div className="feedback-widget__panel-inner">
            <div className="feedback-widget__header">
              <h4>用户反馈</h4>
              <button className="feedback-widget__close" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="feedback-widget__success">
                <CheckCircle size={36} color="var(--success)" />
                <p>感谢反馈！</p>
                <span>我们会认真处理您的反馈</span>
              </div>
            ) : (
              <>
                <div className="feedback-widget__body">
                  {/* Feedback Type */}
                  <div className="feedback-widget__field">
                    <label className="feedback-widget__label">反馈类型</label>
                    <div className="feedback-widget__type-group">
                      {feedbackTypes.map((ft) => (
                        <button
                          key={ft.value}
                          className={`feedback-widget__type-btn ${feedbackType === ft.value ? 'feedback-widget__type-btn--active' : ''}`}
                          onClick={() => setFeedbackType(ft.value)}
                        >
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Satisfaction */}
                  <div className="feedback-widget__field">
                    <label className="feedback-widget__label">满意度评分</label>
                    <div className="feedback-widget__satisfaction-group">
                      {satisfactionOptions.map((opt) => (
                        <button
                          key={opt.value}
                          className={`feedback-widget__satisfaction-btn ${satisfaction === opt.value ? 'feedback-widget__satisfaction-btn--active' : ''}`}
                          onClick={() => setSatisfaction(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="feedback-widget__field">
                    <label className="feedback-widget__label">详细描述</label>
                    <textarea
                      className="feedback-widget__textarea"
                      placeholder="请描述您的反馈..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="feedback-widget__footer">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmit}
                    disabled={!feedbackType || !satisfaction || !description.trim()}
                  >
                    <Send size={14} />
                    提交反馈
                  </button>
                </div>
              </>
            )}
          </div>

          <style>{`
            .feedback-widget__trigger {
              position: fixed;
              z-index: 999;
              width: 52px;
              height: 52px;
              border-radius: 50%;
              background: var(--primary);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: var(--shadow-md);
              border: none;
              cursor: pointer;
              transition: all var(--transition-normal);
            }
            .feedback-widget__trigger:hover {
              background: var(--primary-dark);
              transform: scale(1.08);
            }
            .feedback-widget__panel {
              position: fixed;
              bottom: 88px;
              z-index: 999;
              width: 340px;
              animation: slideUp var(--transition-normal) ease forwards;
            }
            .feedback-widget__panel-inner {
              background: var(--bg-card);
              border-radius: var(--radius-lg);
              box-shadow: var(--shadow-lg);
              border: 1px solid var(--border);
              overflow: hidden;
            }
            .feedback-widget__header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 16px 20px 12px;
              border-bottom: 1px solid var(--border);
            }
            .feedback-widget__header h4 {
              font-size: 15px;
              font-weight: 600;
            }
            .feedback-widget__close {
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              color: var(--text-secondary);
              transition: all var(--transition-fast);
            }
            .feedback-widget__close:hover {
              background: var(--bg-secondary);
              color: var(--text);
            }
            .feedback-widget__body {
              padding: 16px 20px;
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .feedback-widget__field {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .feedback-widget__label {
              font-size: 13px;
              font-weight: 500;
              color: var(--text);
            }
            .feedback-widget__type-group {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
            }
            .feedback-widget__type-btn {
              padding: 5px 14px;
              font-size: 12px;
              font-weight: 500;
              border-radius: var(--radius-full);
              border: 1.5px solid var(--border);
              background: var(--bg-card);
              color: var(--text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
            }
            .feedback-widget__type-btn:hover {
              border-color: var(--primary);
              color: var(--primary);
            }
            .feedback-widget__type-btn--active {
              background: var(--primary);
              border-color: var(--primary);
              color: #ffffff;
            }
            .feedback-widget__type-btn--active:hover {
              background: var(--primary-dark);
              border-color: var(--primary-dark);
              color: #ffffff;
            }
            .feedback-widget__satisfaction-group {
              display: flex;
              gap: 4px;
            }
            .feedback-widget__satisfaction-btn {
              flex: 1;
              padding: 6px 4px;
              font-size: 11px;
              font-weight: 500;
              border-radius: var(--radius-sm);
              border: 1.5px solid var(--border);
              background: var(--bg-card);
              color: var(--text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
              white-space: nowrap;
            }
            .feedback-widget__satisfaction-btn:hover {
              border-color: var(--primary);
              color: var(--primary);
            }
            .feedback-widget__satisfaction-btn--active {
              background: var(--primary);
              border-color: var(--primary);
              color: #ffffff;
            }
            .feedback-widget__satisfaction-btn--active:hover {
              background: var(--primary-dark);
              border-color: var(--primary-dark);
              color: #ffffff;
            }
            .feedback-widget__textarea {
              width: 100%;
              padding: 8px 12px;
              font-size: 13px;
              line-height: 1.5;
              color: var(--text);
              background: var(--bg-card);
              border: 1.5px solid var(--border);
              border-radius: var(--radius-sm);
              outline: none;
              resize: vertical;
              min-height: 72px;
              font-family: inherit;
              transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
            }
            .feedback-widget__textarea:focus {
              border-color: var(--primary);
              box-shadow: 0 0 0 3px rgba(196, 120, 90, 0.15);
            }
            .feedback-widget__textarea::placeholder {
              color: var(--text-secondary);
              opacity: 0.7;
            }
            .feedback-widget__footer {
              padding: 12px 20px 16px;
              border-top: 1px solid var(--border);
              display: flex;
              justify-content: flex-end;
            }
            .feedback-widget__success {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 40px 20px;
              text-align: center;
            }
            .feedback-widget__success p {
              font-size: 16px;
              font-weight: 600;
              color: var(--text);
              margin-bottom: 0;
            }
            .feedback-widget__success span {
              font-size: 13px;
              color: var(--text-secondary);
            }
          `}</style>
        </div>
      )}
    </>
  );
}
