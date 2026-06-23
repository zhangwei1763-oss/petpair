import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, LogIn, Mail } from 'lucide-react';
import { signInWithEmail } from '../api/auth';
import { isSupabaseConfigured } from '../api/client';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  // Supabase 邮箱+密码登录/注册
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 获取验证码倒计时
  const handleSendCode = () => {
    if (phone.length < 11) {
      setError('请先输入正确的手机号');
      return;
    }
    setError('');
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);
    // 模拟网络请求延迟
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    // Mock 模式：保存用户信息到 localStorage
    localStorage.setItem('petpair_registered_user', JSON.stringify({ name: '', email: '', phone }));

    // 通知 App.tsx 登录成功
    onLogin();
    navigate('/dashboard');
  };

  const handleWechatLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onLogin();
    navigate('/dashboard');
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
          /* Mock 手机号+验证码登录表单 */
          <form className="login-page__form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>手机号</label>
              <div className="login-page__input-wrapper">
                <Phone size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  maxLength={11}
                />
              </div>
            </div>

            <div className="form-group">
              <label>验证码</label>
              <div className="login-page__input-wrapper">
                <Lock size={18} className="login-page__input-icon" />
                <input
                  className="form-input login-page__input"
                  type="text"
                  placeholder="请输入6位验证码"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  maxLength={6}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm login-page__code-btn"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
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
      `}</style>
    </div>
  );
}
