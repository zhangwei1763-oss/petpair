import type { Message as MessageType } from '../types';

interface MessageBubbleProps {
  message: MessageType;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const isAi = message.isAi || message.type === 'ai';
  const isLoading = message.aiLoading;

  if (isLoading) {
    return (
      <div className="message-bubble message-bubble--ai">
        <div className="message-bubble__ai-avatar">
          <span>🐾</span>
        </div>
        <div className="message-bubble__ai-body">
          <div className="message-bubble__ai-name">爪爪小助手</div>
          <div className="message-bubble__content message-bubble__content--ai-loading">
            <span className="message-bubble__typing-dot" />
            <span className="message-bubble__typing-dot" />
            <span className="message-bubble__typing-dot" />
          </div>
        </div>

        <style>{getStyles()}</style>
      </div>
    );
  }

  if (isAi) {
    return (
      <div className="message-bubble message-bubble--ai">
        <div className="message-bubble__ai-avatar">
          <span>🐾</span>
        </div>
        <div className="message-bubble__ai-body">
          <div className="message-bubble__ai-name">爪爪小助手</div>
          <div className="message-bubble__content message-bubble__content--ai">
            {message.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
          <div className="message-bubble__time">
            {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <style>{getStyles()}</style>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${isMine ? 'message-bubble--mine' : 'message-bubble--other'}`}>
      <div className="message-bubble__content">
        {message.content}
      </div>
      <div className="message-bubble__time">
        {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>

      <style>{getStyles()}</style>
    </div>
  );
}

function getStyles() {
  return `
    .message-bubble {
      display: flex;
      flex-direction: column;
      max-width: 70%;
      margin-bottom: 12px;
    }
    .message-bubble--mine {
      align-self: flex-end;
      align-items: flex-end;
    }
    .message-bubble--other {
      align-self: flex-start;
      align-items: flex-start;
    }
    .message-bubble__content {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .message-bubble--mine .message-bubble__content {
      background: var(--primary);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .message-bubble--other .message-bubble__content {
      background: var(--bg-secondary);
      color: var(--text);
      border-bottom-left-radius: 4px;
    }
    .message-bubble__time {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 4px;
      padding: 0 4px;
    }

    /* ===== AI Message ===== */
    .message-bubble--ai {
      align-self: flex-start;
      flex-direction: row;
      align-items: flex-start;
      gap: 10px;
      max-width: 85%;
      animation: message-bubble__ai-appear 0.3s ease;
    }
    @keyframes message-bubble__ai-appear {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .message-bubble__ai-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
    .message-bubble__ai-body {
      flex: 1;
      min-width: 0;
    }
    .message-bubble__ai-name {
      font-size: 11px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 4px;
      padding-left: 2px;
    }
    .message-bubble__content--ai {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
      border: 1px solid rgba(102, 126, 234, 0.15);
      color: var(--text);
      border-radius: var(--radius-md);
      border-top-left-radius: 4px;
      white-space: pre-wrap;
    }
    .message-bubble--ai .message-bubble__time {
      padding-left: 2px;
    }

    /* AI Loading */
    .message-bubble__content--ai-loading {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 14px 18px;
      min-width: 80px;
    }
    .message-bubble__typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      opacity: 0.4;
      animation: message-bubble__typing 1.4s infinite;
    }
    .message-bubble__typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .message-bubble__typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes message-bubble__typing {
      0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
      30% { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 480px) {
      .message-bubble {
        max-width: 85%;
      }
      .message-bubble--ai {
        max-width: 90%;
      }
    }
  `;
}
