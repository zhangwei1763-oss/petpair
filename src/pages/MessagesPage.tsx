import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { currentUser, nearbyPets, mockMessages } from '../data/mockData';
import MessageBubble from '../components/MessageBubble';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

interface Conversation {
  userId: string;
  petName: string;
  petPhoto: string;
  messages: Message[];
  lastMessage: string;
  lastTime: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Group messages by conversation partner
    const convMap = new Map<string, Message[]>();

    mockMessages.forEach((msg) => {
      const partnerId =
        msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, []);
      }
      convMap.get(partnerId)!.push(msg);
    });

    const convs: Conversation[] = [];
    convMap.forEach((msgs, partnerId) => {
      const sorted = [...msgs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const last = sorted[sorted.length - 1];

      // Find the pet associated with this conversation
      const relatedPet = nearbyPets.find((p) => p.ownerId === partnerId);

      convs.push({
        userId: partnerId,
        petName: relatedPet?.name || '未知宠物',
        petPhoto: relatedPet?.photos[0] || 'https://picsum.photos/seed/default/200/200',
        messages: sorted,
        lastMessage: last.content,
        lastTime: last.createdAt,
      });
    });

    return convs.sort(
      (a, b) =>
        new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
    );
  });

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !activeConv || isSending) return;

    // Prevent double-send within 800ms
    setIsSending(true);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: activeConv.userId,
      content: inputText.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.userId === activeConv.userId
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMsg.content,
              lastTime: newMsg.createdAt,
            }
          : conv
      )
    );

    setInputText('');

    // Reset sending state after debounce period
    sendTimeoutRef.current = setTimeout(() => {
      setIsSending(false);
    }, 800);
  }, [inputText, activeConv, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    setIsMobileDetail(false);
    setActiveConv(null);
  };

  const currentConv = conversations.find((c) => c.userId === activeConv?.userId);

  return (
    <div className="messages-page">
      {/* Conversation List */}
      <div className={`messages-page__sidebar ${isMobileDetail ? 'messages-page__sidebar--hidden' : ''}`}>
        <div className="messages-page__sidebar-header">
          <h1>消息</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>暂无消息</h3>
            <p>发起邀约后，可以在这里与对方聊天</p>
          </div>
        ) : (
          <div className="messages-page__conv-list">
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`messages-page__conv-item ${
                  activeConv?.userId === conv.userId ? 'messages-page__conv-item--active' : ''
                }`}
                onClick={() => {
                  setActiveConv(conv);
                  setIsMobileDetail(true);
                }}
              >
                <img
                  className="avatar"
                  src={conv.petPhoto}
                  alt={conv.petName}
                />
                <div className="messages-page__conv-info">
                  <div className="messages-page__conv-top">
                    <span className="messages-page__conv-name">{conv.petName}</span>
                    <span className="messages-page__conv-time">
                      {new Date(conv.lastTime).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="messages-page__conv-preview">{conv.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={`messages-page__chat ${isMobileDetail ? 'messages-page__chat--visible' : ''}`}>
        {currentConv ? (
          <>
            {/* Chat Header */}
            <div className="messages-page__chat-header">
              <button
                className="messages-page__back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={20} />
              </button>
              <img
                className="avatar-sm"
                src={currentConv.petPhoto}
                alt={currentConv.petName}
              />
              <h3>{currentConv.petName}</h3>
            </div>

            {/* Messages */}
            <div className="messages-page__messages">
              {currentConv.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={msg.senderId === currentUser.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="messages-page__input-bar">
              <input
                className="form-input messages-page__input"
                type="text"
                placeholder="输入消息..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-primary messages-page__send-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state messages-page__empty-chat">
            <MessageCircle size={64} />
            <h3>选择一个会话</h3>
            <p>从左侧选择一个会话开始聊天</p>
          </div>
        )}
      </div>

      <style>{`
        .messages-page {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Sidebar */
        .messages-page__sidebar {
          width: 320px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          flex-shrink: 0;
        }
        .messages-page__sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .messages-page__sidebar-header h1 {
          font-size: 1.25rem;
        }
        .messages-page__conv-list {
          flex: 1;
          overflow-y: auto;
        }
        .messages-page__conv-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          cursor: pointer;
          transition: background var(--transition-fast);
          border-bottom: 1px solid var(--border);
        }
        .messages-page__conv-item:hover {
          background: var(--bg-secondary);
        }
        .messages-page__conv-item--active {
          background: var(--primary-light);
        }
        .messages-page__conv-info {
          flex: 1;
          min-width: 0;
        }
        .messages-page__conv-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .messages-page__conv-name {
          font-size: 14px;
          font-weight: 600;
        }
        .messages-page__conv-time {
          font-size: 11px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .messages-page__conv-preview {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Chat Area */
        .messages-page__chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }
        .messages-page__chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
        }
        .messages-page__chat-header h3 {
          font-size: 16px;
        }
        .messages-page__back-btn {
          display: none;
          color: var(--text);
          padding: 4px;
        }
        .messages-page__messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .messages-page__empty-chat {
          flex: 1;
        }
        .messages-page__input-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-card);
        }
        .messages-page__input {
          flex: 1;
        }
        .messages-page__send-btn {
          flex-shrink: 0;
          padding: 10px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .messages-page__sidebar {
            width: 100%;
            border-right: none;
          }
          .messages-page__sidebar--hidden {
            display: none;
          }
          .messages-page__chat {
            display: none;
          }
          .messages-page__chat--visible {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
          }
          .messages-page__back-btn {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
