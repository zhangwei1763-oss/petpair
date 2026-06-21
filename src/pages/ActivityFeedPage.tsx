import { useState, useEffect } from 'react';
import type { ActivityPost } from '../types';
import { mockActivityPosts, currentUser } from '../data/mockData';
import { getPosts, toggleLike, addComment } from '../api/posts';
import { isSupabaseConfigured } from '../api/client';
import {
  Heart,
  MessageCircle,
  Send,
  Plus,
  X,
  Image as ImageIcon,
} from 'lucide-react';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function ActivityFeedPage() {
  const [posts, setPosts] = useState<ActivityPost[]>(mockActivityPosts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);

  // 从 API 加载动态列表
  useEffect(() => {
    if (isSupabaseConfigured) {
      getPosts().then(setPosts);
    }
  }, [isSupabaseConfigured]);

  const handleLike = async (postId: string) => {
    if (isSupabaseConfigured) {
      const isLiked = await toggleLike(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked,
                likes: isLiked ? post.likes + 1 : post.likes - 1,
              }
            : post
        )
      );
    } else {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    if (isSupabaseConfigured) {
      const newComment = await addComment(postId, currentUser.id, content);
      if (newComment) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    {
                      id: newComment.id,
                      userId: newComment.user_id,
                      userName: newComment.user?.name || currentUser.name,
                      userAvatar: newComment.user?.avatar || currentUser.avatar,
                      content: newComment.content,
                      createdAt: newComment.created_at,
                    },
                  ],
                }
              : post
          )
        );
      }
    } else {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    id: `comment_${Date.now()}`,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    content,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : post
        )
      );
    }
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handlePublish = () => {
    if (!newPostContent.trim()) return;
    const newPost: ActivityPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      petId: currentUser.pets[0]?.id || '',
      petName: currentUser.pets[0]?.name || '',
      petPhoto: currentUser.pets[0]?.photos[0] || '',
      content: newPostContent.trim(),
      images: newPostImages,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent('');
    setNewPostImages([]);
    setShowPublishModal(false);
  };

  return (
    <div className="activity-feed-page container">
      {/* Header */}
      <div className="activity-feed-page__header">
        <h1>社区动态</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowPublishModal(true)}
        >
          <Plus size={16} />
          发布
        </button>
      </div>

      {/* Post List */}
      <div className="activity-feed-page__list">
        {posts.map((post) => (
          <div key={post.id} className="card activity-feed-page__post">
            {/* Author Info */}
            <div className="activity-feed-page__author">
              <img
                className="avatar"
                src={post.authorAvatar}
                alt={post.authorName}
              />
              <div className="activity-feed-page__author-info">
                <span className="activity-feed-page__author-name">
                  {post.authorName}
                </span>
                <span className="activity-feed-page__author-pet">
                  <img
                    className="activity-feed-page__pet-avatar"
                    src={post.petPhoto}
                    alt={post.petName}
                  />
                  {post.petName}
                </span>
              </div>
              <span className="activity-feed-page__time">
                {formatTime(post.createdAt)}
              </span>
            </div>

            {/* Content */}
            <p className="activity-feed-page__content">{post.content}</p>

            {/* Images Grid */}
            {post.images.length > 0 && (
              <div
                className={`activity-feed-page__images activity-feed-page__images--${post.images.length}`}
              >
                {post.images.map((img, idx) => (
                  <div key={idx} className="activity-feed-page__image-wrap">
                    <img src={img} alt={`动态图片${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="activity-feed-page__actions">
              <button
                className={`activity-feed-page__action-btn ${
                  post.isLiked ? 'activity-feed-page__action-btn--liked' : ''
                }`}
                onClick={() => handleLike(post.id)}
              >
                <Heart
                  size={18}
                  fill={post.isLiked ? '#e74c3c' : 'none'}
                  stroke={post.isLiked ? '#e74c3c' : 'currentColor'}
                />
                <span>{post.likes}</span>
              </button>
              <button
                className="activity-feed-page__action-btn"
                onClick={() => toggleComments(post.id)}
              >
                <MessageCircle size={18} />
                <span>{post.comments.length}</span>
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post.id) && (
              <div className="activity-feed-page__comments">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="activity-feed-page__comment">
                    <img
                      className="avatar-sm"
                      src={comment.userAvatar}
                      alt={comment.userName}
                    />
                    <div className="activity-feed-page__comment-body">
                      <span className="activity-feed-page__comment-name">
                        {comment.userName}
                      </span>
                      <p className="activity-feed-page__comment-text">
                        {comment.content}
                      </p>
                      <span className="activity-feed-page__comment-time">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="activity-feed-page__comment-input">
                  <img
                    className="avatar-sm"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="写评论..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(post.id);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddComment(post.id)}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div
          className="activity-feed-page__modal-overlay"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="card activity-feed-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="activity-feed-page__modal-header">
              <h3>发布动态</h3>
              <button
                className="activity-feed-page__modal-close"
                onClick={() => setShowPublishModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="activity-feed-page__modal-author">
              <img
                className="avatar"
                src={currentUser.avatar}
                alt={currentUser.name}
              />
              <div>
                <span className="activity-feed-page__author-name">
                  {currentUser.name}
                </span>
                <span className="activity-feed-page__author-pet">
                  {currentUser.pets[0]?.name || ''}
                </span>
              </div>
            </div>

            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="分享你和毛孩子的日常..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="activity-feed-page__image-upload">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const demoImages = [
                    'https://picsum.photos/seed/newpost1/800/600',
                    'https://picsum.photos/seed/newpost2/800/600',
                    'https://picsum.photos/seed/newpost3/800/600',
                  ];
                  if (newPostImages.length < 3) {
                    setNewPostImages((prev) => [
                      ...prev,
                      demoImages[prev.length],
                    ]);
                  }
                }}
                disabled={newPostImages.length >= 3}
              >
                <ImageIcon size={14} />
                添加图片 ({newPostImages.length}/3)
              </button>
              {newPostImages.length > 0 && (
                <div className="activity-feed-page__preview-images">
                  {newPostImages.map((img, idx) => (
                    <div key={idx} className="activity-feed-page__preview-img">
                      <img src={img} alt={`预览${idx + 1}`} />
                      <button
                        className="activity-feed-page__preview-remove"
                        onClick={() =>
                          setNewPostImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-primary activity-feed-page__publish-btn"
              onClick={handlePublish}
              disabled={!newPostContent.trim()}
            >
              <Send size={16} />
              发布动态
            </button>
          </div>
        </div>
      )}

      <style>{`
        .activity-feed-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .activity-feed-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .activity-feed-page__header h1 {
          font-size: 1.5rem;
        }

        /* Post Card */
        .activity-feed-page__list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .activity-feed-page__post {
          padding: 20px;
        }

        /* Author */
        .activity-feed-page__author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .activity-feed-page__author-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activity-feed-page__author-name {
          font-size: 14px;
          font-weight: 600;
        }
        .activity-feed-page__author-pet {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .activity-feed-page__pet-avatar {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          object-fit: cover;
        }
        .activity-feed-page__time {
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        /* Content */
        .activity-feed-page__content {
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }

        /* Images Grid */
        .activity-feed-page__images {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .activity-feed-page__images--1 {
          grid-template-columns: 1fr;
        }
        .activity-feed-page__images--2 {
          grid-template-columns: 1fr 1fr;
        }
        .activity-feed-page__images--3 {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .activity-feed-page__image-wrap {
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: var(--radius-sm);
        }
        .activity-feed-page__image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }
        .activity-feed-page__image-wrap:hover img {
          transform: scale(1.05);
        }

        /* Actions */
        .activity-feed-page__actions {
          display: flex;
          gap: 20px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .activity-feed-page__action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          padding: 4px 0;
          transition: color var(--transition-fast);
        }
        .activity-feed-page__action-btn:hover {
          color: var(--primary);
        }
        .activity-feed-page__action-btn--liked {
          color: #e74c3c;
        }
        .activity-feed-page__action-btn--liked:hover {
          color: #c0392b;
        }

        /* Comments */
        .activity-feed-page__comments {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .activity-feed-page__comment {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .activity-feed-page__comment-body {
          flex: 1;
          min-width: 0;
        }
        .activity-feed-page__comment-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          margin-right: 8px;
        }
        .activity-feed-page__comment-text {
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
          display: inline;
        }
        .activity-feed-page__comment-time {
          font-size: 11px;
          color: var(--text-secondary);
          display: block;
          margin-top: 4px;
        }
        .activity-feed-page__comment-input {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .activity-feed-page__comment-input .form-input {
          flex: 1;
        }

        /* Modal */
        .activity-feed-page__modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .activity-feed-page__modal {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 24px;
        }
        .activity-feed-page__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .activity-feed-page__modal-header h3 {
          font-size: 1.125rem;
        }
        .activity-feed-page__modal-close {
          color: var(--text-secondary);
          padding: 4px;
        }
        .activity-feed-page__modal-close:hover {
          color: var(--text);
        }
        .activity-feed-page__modal-author {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .activity-feed-page__image-upload {
          margin-bottom: 16px;
        }
        .activity-feed-page__preview-images {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .activity-feed-page__preview-img {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .activity-feed-page__preview-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .activity-feed-page__preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .activity-feed-page__publish-btn {
          width: 100%;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .activity-feed-page__post {
            padding: 14px;
          }
          .activity-feed-page__images--3 {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
