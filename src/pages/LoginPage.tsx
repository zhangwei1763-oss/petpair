import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, LogIn, Mail, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail } from '../api/auth';
import { isSupabaseConfigured } from '../api/client';
import { getAllUsers, setCurrentUser } from '../data/mockData';

interface LoginPageProps {
  onLogin: (userData?: { name: string; email: string }, selectedUserId?: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Supabase 邮箱+密码登录/注册
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Mock 模式用户名密码
  const [mockUsername, setMockUsername] = useState('');
  const [mockPassword, setMockPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const mockUsers = getAllUsers();

  // 预置用户邮箱密码映射
  const mockCredentials: Record<string, string> = {
    'linxiaomeng@petpair.com': 'user_001',
    'chendawei@petpair.com': 'user_002',
    'wangxiaoya@petpair.com': 'user_003',
  };

  // Supabase 邮箱+密码登录/注册
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured) {
      onLogin();
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWechatLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onLogin();
    navigate('/dashboard');
  };

  // Mock 模式用户名密码登录
  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailInput = mockUsername.trim().toLowerCase();
    const pwd = mockPassword.trim();

    if (!emailInput || !pwd) {
      setError('请输入邮箱和密码');
      return;
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError('请输入正确的邮箱格式');
      return;
    }

    // 验证邮箱是否存在
    const userId = mockCredentials[emailInput];
    if (!userId) {
      setError('账号不存在');
      return;
    }

    // 密码统一为 123456
    if (pwd !== '123456') {
      setError('密码错误');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentUser(userId);
      onLogin(undefined, userId);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__header">
          <div className="login-page__logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
              <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
              <path d="M8 14v.5" />
              <path d="M16 14v.5" />
              <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
              <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
            </svg>
          </div>
          <h1 className="login-page__title">欢迎回来</h1>
          <p className="login-page__subtitle">登录 PetPair，为宠物找玩伴</p>
        </div>

        {isSupabaseConfigured ? (
          /* Supabase 邮箱+密码登录/注册表单 */
          <form className="login-page__form" onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>邮箱</label>
              <div className="login-page__input-wrapper">
                <Mail size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>密码</label>
              <div className="login-page__input-wrapper">
                <Lock size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="login-page__error">{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg login-page__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-page__loading" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? '处理中...' : '登录'}
            </button>
          </form>
        ) : (
          /* Mock 模式：邮箱密码登录 */
          <form className="login-page__form" onSubmit={handleMockLogin}>
            <div className="form-group">
              <label>邮箱</label>
              <div className="login-page__input-wrapper">
                <Mail size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type="email"
                  placeholder="请输入邮箱"
                  value={mockUsername}
                  onChange={(e) => {
                    setMockUsername(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>密码</label>
              <div className="login-page__input-wrapper">
                <Lock size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={mockPassword}
                  onChange={(e) => {
                    setMockPassword(e.target.value);
                    if (error) setError('');
                  }}
                />
                <button
                  type="button"
                  className="login-page__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-page__error">{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg login-page__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-page__loading" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? '登录中...' : '登录'}
            </button>

            <div className="login-page__demo-accounts">
              <p className="login-page__demo-title">演示账号</p>
              <div className="login-page__demo-list">
                {mockUsers.map((user) => (
                  <div
                    key={user.id}
                    className="login-page__demo-item"
                    onClick={() => {
                      const emailMap: Record<string, string> = {
                        'user_001': 'linxiaomeng@petpair.com',
                        'user_002': 'chendawei@petpair.com',
                        'user_003': 'wangxiaoya@petpair.com',
                      };
                      setMockUsername(emailMap[user.id] || '');
                      setMockPassword('123456');
                      if (error) setError('');
                    }}
                  >
                    <img className="login-page__demo-avatar" src={user.avatar} alt={user.name} />
                    <div className="login-page__demo-info">
                      <span className="login-page__demo-name">{user.name}</span>
                      <span className="login-page__demo-cred">
                        {user.id === 'user_001' ? 'linxiaomeng@petpair.com' : user.id === 'user_002' ? 'chendawei@petpair.com' : 'wangxiaoya@petpair.com'} / 123456
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}

        <div className="login-page__divider">
          <span>或</span>
        </div>

        <button
          className="btn btn-outline btn-lg login-page__wechat"
          onClick={handleWechatLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.2 4.986c-3.797 0-6.874 2.605-6.874 5.82 0 3.215 3.077 5.82 6.874 5.82.726 0 1.428-.098 2.086-.272a.723.723 0 0 1 .598.082l1.578.924a.27.27 0 0 0 .14.045.244.244 0 0 0 .24-.245c0-.06-.024-.118-.04-.177l-.323-1.227a.49.49 0 0 1 .177-.552C21.855 19.832 23 18.074 23 16.797c0-3.215-3.077-5.82-6.874-5.82h-.328zm-2.614 3.282c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.943 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
          </svg>
          使用微信登录
        </button>

        <div className="login-page__footer">
          <span>还没有账号？</span>
          <Link to="/register" className="login-page__register-link">
            注册新账号
          </Link>
        </div>

        <p className="login-page__hint">
          登录即表示同意 <a href="#">用户协议</a> 和 <a href="#">隐私政策</a>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg-secondary) 100%);
          padding: 20px;
        }
        .login-page__container {
          width: 100%;
          max-width: 400px;
        }
        .login-page__header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-page__logo {
          margin-bottom: 16px;
        }
        .login-page__title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .login-page__subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        .login-page__form {
          margin-bottom: 20px;
        }
        .login-page__input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-page__input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-secondary);
          pointer-events: none;
          flex-shrink: 0;
          z-index: 1;
        }
        .login-page__input {
          padding-left: 40px !important;
        }
        .login-page__code-btn {
          position: absolute;
          right: 4px;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 100px;
          font-size: 12px !important;
        }
        .login-page__code-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .login-page__error {
          color: var(--danger);
          font-size: 13px;
          margin-bottom: 12px;
          text-align: center;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .login-page__submit {
          width: 100%;
          margin-top: 8px;
        }
        .login-page__submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-page__loading {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-page__divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .login-page__divider::before,
        .login-page__divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .login-page__wechat {
          width: 100%;
          color: #07c160;
          border-color: #07c160;
        }
        .login-page__wechat:hover:not(:disabled) {
          background: #07c160;
          color: #fff;
        }
        .login-page__wechat:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-page__footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .login-page__register-link {
          color: var(--primary);
          font-weight: 600;
          margin-left: 4px;
          text-decoration: none;
        }
        .login-page__register-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
        .login-page__hint {
          text-align: center;
          margin-top: 32px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .login-page__hint a {
          color: var(--primary);
          text-decoration: none;
        }
        .login-page__hint a:hover {
          text-decoration: underline;
        }

        /* ===== 演示账号样式 ===== */
        .login-page__eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-page__eye-btn:hover {
          color: var(--text);
        }
        .login-page__demo-accounts {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .login-page__demo-title {
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 12px;
        }
        .login-page__demo-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .login-page__demo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .login-page__demo-item:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .login-page__demo-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .login-page__demo-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .login-page__demo-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .login-page__demo-cred {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
