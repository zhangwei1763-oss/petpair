import type { Message as MessageType } from '../types';

interface MessageBubbleProps {
  message: MessageType;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
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

      <style>{`
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
        @media (max-width: 480px) {
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
}
