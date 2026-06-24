import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { getCurrentUser, getNearbyPets, initInteractionData, getAllMessages, saveAllMessages } from '../data/mockData';
import MessageBubble from '../components/MessageBubble';
import { summonPawPal } from '../api/ai';
import { MessageCircle, Send, ArrowLeft, Sparkles } from 'lucide-react';

interface Conversation {
  userId: string;
  petName: string;
  petPhoto: string;
  messages: Message[];
  lastMessage: string;
  lastTime: string;
}

export default function MessagesPage() {
  initInteractionData();
  const currentUser = getCurrentUser();
  const nearbyPets = getNearbyPets();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Group messages by conversation partner
    const convMap = new Map<string, Message[]>();

    // 只过滤与当前用户相关的消息
    const allMessages = getAllMessages();
    const userMessages = allMessages.filter(
      (msg) => msg.senderId === currentUser.id || msg.receiverId === currentUser.id
    );

    userMessages.forEach((msg) => {
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
        petPhoto: relatedPet?.photos[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop',
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
  const [isAiActive, setIsAiActive] = useState(false);
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

    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.userId === activeConv.userId
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMsg.content,
              lastTime: newMsg.createdAt,
            }
          : conv
      );
      // 保存所有消息到 localStorage
      const allMsgs = updated.flatMap((c) => c.messages);
      saveAllMessages(allMsgs);
      return updated;
    });

    setInputText('');

    // Reset sending state after debounce period
    sendTimeoutRef.current = setTimeout(() => {
      setIsSending(false);
    }, 800);
  }, [inputText, activeConv, isSending, currentUser.id]);

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

  // === 召唤爪爪小助手 ===
  const handleSummonPawPal = useCallback(async () => {
    if (!activeConv || isAiActive) return;

    const myPet = currentUser.pets[0];
    const otherPet = nearbyPets.find((p) => p.ownerId === activeConv.userId);

    if (!myPet || !otherPet) return;

    setIsAiActive(true);

    // 1. 先插入一条 loading 消息
    const loadingMsg: Message = {
      id: `ai_loading_${Date.now()}`,
      senderId: 'pawpal',
      receiverId: currentUser.id,
      content: '',
      type: 'ai',
      createdAt: new Date().toISOString(),
      isAi: true,
      aiLoading: true,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.userId === activeConv.userId
          ? {
              ...conv,
              messages: [...conv.messages, loadingMsg],
            }
          : conv
      )
    );

    // 2. 收集聊天记录
    const chatHistory = activeConv.messages.map((m) => {
      const sender = m.senderId === currentUser.id ? '我' : activeConv.petName;
      return `${sender}: ${m.content}`;
    });

    // 3. 调用 AI
    try {
      const aiResponse = await summonPawPal({
        myPet,
        otherPet,
        chatHistory,
      });

      // 4. 替换 loading 消息为真实回复
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        senderId: 'pawpal',
        receiverId: currentUser.id,
        content: aiResponse,
        type: 'ai',
        createdAt: new Date().toISOString(),
        isAi: true,
      };

      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.userId === activeConv.userId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter((m) => !m.aiLoading),
                  aiMsg,
                ],
                lastMessage: '🐾 爪爪小助手给出了活动建议',
                lastTime: aiMsg.createdAt,
              }
            : conv
        );
        // 保存所有消息到 localStorage
        const allMsgs = updated.flatMap((c) => c.messages);
        saveAllMessages(allMsgs);
        return updated;
      });
    } catch {
      // 失败时也替换 loading
      const failMsg: Message = {
        id: `ai_${Date.now()}`,
        senderId: 'pawpal',
        receiverId: currentUser.id,
        content: '爪爪小助手暂时走神了，请稍后再试~',
        type: 'ai',
        createdAt: new Date().toISOString(),
        isAi: true,
      };

      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.userId === activeConv.userId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter((m) => !m.aiLoading),
                  failMsg,
                ],
              }
            : conv
        );
        // 保存所有消息到 localStorage
        const allMsgs = updated.flatMap((c) => c.messages);
        saveAllMessages(allMsgs);
        return updated;
      });
    } finally {
      setIsAiActive(false);
    }
  }, [activeConv, isAiActive, currentUser.id, currentUser.pets, nearbyPets]);

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

            {/* AI Summon Bar */}
            <div className="messages-page__ai-bar">
              <button
                className="messages-page__ai-btn"
                onClick={handleSummonPawPal}
                disabled={isAiActive}
              >
                <span className="messages-page__ai-btn-icon">🐾</span>
                <span className="messages-page__ai-btn-text">
                  {isAiActive ? '爪爪小助手正在思考...' : '召唤爪爪小助手'}
                </span>
                <Sparkles size={14} />
              </button>
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

        /* ===== AI Summon Bar ===== */
        .messages-page__ai-bar {
          padding: 8px 20px;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
        }
        .messages-page__ai-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          border: 1.5px solid rgba(102, 126, 234, 0.3);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%);
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .messages-page__ai-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-color: #667eea;
          box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
        }
        .messages-page__ai-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .messages-page__ai-btn-icon {
          font-size: 16px;
        }
        .messages-page__ai-btn-text {
          flex: 1;
        }

        /* Input */
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
