import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { signUpWithEmail } from '../api/auth';
import { isSupabaseConfigured } from '../api/client';

interface RegisterPageProps {
  onLogin: (userData?: { name: string; email: string }) => void;
}

export default function RegisterPage({ onLogin }: RegisterPageProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) return '请输入昵称';
    if (name.trim().length < 2) return '昵称至少2个字符';
    if (!email.trim()) return '请输入邮箱';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '请输入有效的邮箱地址';
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码至少6位';
    if (password !== confirmPassword) return '两次输入的密码不一致';
    if (!agreeTerms) return '请同意用户协议和隐私政策';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        await signUpWithEmail(email, password, name.trim());
        // Supabase 模式：注册成功后跳转到 onboarding
        const userData = { name: name.trim(), email: email.trim() };
        localStorage.setItem('petpair_registered_user', JSON.stringify(userData));
        onLogin(userData);
        navigate('/onboarding');
      } else {
        // Mock 模式：模拟注册成功
        setTimeout(() => {
          const userData = { name: name.trim(), email: email.trim() };
          localStorage.setItem('petpair_registered_user', JSON.stringify(userData));
          onLogin(userData);
          navigate('/onboarding');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__card">
        {/* Header */}
        <div className="register-page__header">
          <Link to="/" className="register-page__back">
            <ArrowLeft size={20} />
          </Link>
          <div className="register-page__logo">
            <UserPlus size={32} />
          </div>
          <h1>创建账号</h1>
          <p>加入 PetPair，为宠物找到最佳玩伴</p>
        </div>

        {/* Form */}
        <form className="register-page__form" onSubmit={handleSubmit}>
          {error && (
            <div className="register-page__error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              昵称
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="怎么称呼你？"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              邮箱
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              密码
            </label>
            <input
              className="form-input"
              type="password"
              placeholder="至少6位字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              确认密码
            </label>
            <input
              className="form-input"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="register-page__terms">
            <label className="register-page__terms-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                我已阅读并同意
                <Link to="#">用户协议</Link>
                和
                <Link to="#">隐私政策</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary register-page__submit"
            disabled={loading}
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        {/* Footer */}
        <div className="register-page__footer">
          <p>
            已有账号？
            <Link to="/login">立即登录</Link>
          </p>
        </div>
      </div>

      <style>{getStyles()}</style>
    </div>
  );
}

function getStyles() {
  return `
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%);
    }

    .register-page__card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 32px;
      position: relative;
    }

    /* Header */
    .register-page__header {
      text-align: center;
      margin-bottom: 28px;
      position: relative;
    }
    .register-page__back {
      position: absolute;
      left: 0;
      top: 0;
      color: var(--text-secondary);
      padding: 4px;
      transition: color var(--transition-fast);
    }
    .register-page__back:hover {
      color: var(--text);
    }
    .register-page__logo {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .register-page__header h1 {
      font-size: 1.5rem;
      margin-bottom: 6px;
    }
    .register-page__header p {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 0;
    }

    /* Form */
    .register-page__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .register-page__error {
      padding: 10px 14px;
      background: rgba(245, 34, 45, 0.08);
      border: 1px solid rgba(245, 34, 45, 0.2);
      border-radius: var(--radius-sm);
      color: #f5222d;
      font-size: 13px;
    }

    /* Terms */
    .register-page__terms {
      margin-top: 4px;
    }
    .register-page__terms-label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1.5;
    }
    .register-page__terms-label input {
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: var(--primary);
    }
    .register-page__terms-label a {
      color: var(--primary);
      text-decoration: none;
      margin: 0 2px;
    }
    .register-page__terms-label a:hover {
      text-decoration: underline;
    }

    /* Submit */
    .register-page__submit {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      font-weight: 600;
      margin-top: 4px;
    }

    /* Footer */
    .register-page__footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .register-page__footer p {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 0;
    }
    .register-page__footer a {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }
    .register-page__footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .register-page__card {
        padding: 24px 20px;
      }
      .register-page__header h1 {
        font-size: 1.25rem;
      }
    }
  `;
}
