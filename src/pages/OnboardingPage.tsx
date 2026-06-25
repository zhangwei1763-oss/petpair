import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PawPrint,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Dog,
  Cat,
  Rabbit,
  Ruler,
  Clock,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { createPet } from '../api/pets';
import { isSupabaseConfigured } from '../api/client';
import type { PetType, Gender, SizeType } from '../types';

interface OnboardingPageProps {
  userName?: string;
}

const SPECIES_OPTIONS: { value: PetType; label: string; icon: React.ReactNode }[] = [
  { value: 'dog', label: '狗', icon: <Dog size={20} /> },
  { value: 'cat', label: '猫', icon: <Cat size={20} /> },
  { value: 'other', label: '其他', icon: <Rabbit size={20} /> },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
];

const SIZE_OPTIONS: { value: SizeType; label: string }[] = [
  { value: 'small', label: '小型' },
  { value: 'medium', label: '中型' },
  { value: 'large', label: '大型' },
  { value: 'giant', label: '巨型' },
];

export default function OnboardingPage({ userName }: OnboardingPageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'form' | 'done'>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 简化版宠物表单字段
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState<Gender>('male');
  const [size, setSize] = useState<SizeType>('medium');

  const handleAddNow = () => {
    setStep('form');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleSubmitPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!petName.trim()) {
      setError('请输入宠物名字');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Supabase 模式：调用 createPet API
        await createPet({
          name: petName.trim(),
          species,
          breed: breed.trim(),
          age,
          gender,
          size,
        });
      } else {
        // Mock 模式：存储到 localStorage
        const newPet = {
          id: `pet_${Date.now()}`,
          ownerId: 'registered_user',
          name: petName.trim(),
          species,
          breed: breed.trim() || '未知品种',
          age,
          gender,
          size,
          weight: 0,
          neutered: false,
          personalityTags: [] as string[],
          energyLevel: 'medium' as const,
          activityPreferences: [] as string[],
          socialPreferences: [] as string[],
          vaccineStatus: 'partial' as const,
          photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'],
          bio: '',
        };

        const existingPets = JSON.parse(localStorage.getItem('petpair_pets') || '[]');
        existingPets.push(newPet);
        localStorage.setItem('petpair_pets', JSON.stringify(existingPets));
      }

      setStep('done');
    } catch (err: any) {
      setError(err.message || '添加宠物失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  // 步骤 1：欢迎页
  if (step === 'welcome') {
    return (
      <div className="onboarding-page">
        <div className="onboarding-page__card">
          <div className="onboarding-page__icon-wrap">
            <Sparkles size={28} className="onboarding-page__sparkle" />
            <PawPrint size={48} className="onboarding-page__paw" />
          </div>

          <h1 className="onboarding-page__title">
            {userName ? `${userName}，欢迎加入 PetPair！` : '欢迎加入 PetPair！'}
          </h1>
          <p className="onboarding-page__desc">
            为你的宠物创建档案，找到最合适的玩伴。只需几步就能完成！
          </p>

          <div className="onboarding-page__features">
            <div className="onboarding-page__feature">
              <PawPrint size={18} />
              <span>智能匹配附近宠物</span>
            </div>
            <div className="onboarding-page__feature">
              <Heart size={18} />
              <span>安全可靠的社交环境</span>
            </div>
            <div className="onboarding-page__feature">
              <Clock size={18} />
              <span>轻松预约线下遛宠</span>
            </div>
          </div>

          <div className="onboarding-page__actions">
            <button
              className="btn btn-primary btn-lg onboarding-page__btn-primary"
              onClick={handleAddNow}
            >
              <PawPrint size={18} />
              立即添加宠物
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-outline btn-lg onboarding-page__btn-secondary"
              onClick={handleSkip}
            >
              稍后再说
            </button>
          </div>
        </div>

        <style>{getStyles()}</style>
      </div>
    );
  }

  // 步骤 2：简化宠物表单
  if (step === 'form') {
    return (
      <div className="onboarding-page">
        <div className="onboarding-page__card onboarding-page__card--form">
          <div className="onboarding-page__form-header">
            <button
              className="onboarding-page__back-btn"
              onClick={() => setStep('welcome')}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="onboarding-page__form-title-wrap">
              <PawPrint size={24} className="onboarding-page__form-icon" />
              <h2>创建宠物档案</h2>
            </div>
            <p className="onboarding-page__form-subtitle">
              填写基本信息，之后可以随时补充完善
            </p>
          </div>

          <form className="onboarding-page__form" onSubmit={handleSubmitPet}>
            {error && (
              <div className="onboarding-page__error">{error}</div>
            )}

            {/* 宠物名 */}
            <div className="form-group">
              <label className="form-label">
                <PawPrint size={16} />
                宠物名字 *
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="你的宠物叫什么？"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>

            {/* 物种 */}
            <div className="form-group">
              <label className="form-label">物种</label>
              <div className="onboarding-page__btn-group">
                {SPECIES_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`onboarding-page__chip ${species === opt.value ? 'onboarding-page__chip--active' : ''}`}
                    onClick={() => setSpecies(opt.value)}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 品种 */}
            <div className="form-group">
              <label className="form-label">
                品种
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="如：金毛、布偶猫"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>

            {/* 年龄 */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                年龄（岁）
              </label>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={age || ''}
                onChange={(e) => setAge(Number(e.target.value))}
                min={0}
                max={30}
              />
            </div>

            {/* 性别 */}
            <div className="form-group">
              <label className="form-label">性别</label>
              <div className="onboarding-page__btn-group">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`onboarding-page__chip ${gender === opt.value ? 'onboarding-page__chip--active' : ''}`}
                    onClick={() => setGender(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 体型 */}
            <div className="form-group">
              <label className="form-label">
                <Ruler size={16} />
                体型
              </label>
              <div className="onboarding-page__btn-group">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`onboarding-page__chip onboarding-page__chip--size ${size === opt.value ? 'onboarding-page__chip--active' : ''}`}
                    onClick={() => setSize(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg onboarding-page__submit"
              disabled={loading}
            >
              {loading ? '保存中...' : '完成，开始使用 PetPair'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <style>{getStyles()}</style>
      </div>
    );
  }

  // 步骤 3：完成
  return (
    <div className="onboarding-page">
      <div className="onboarding-page__card onboarding-page__card--done">
        <div className="onboarding-page__done">
          <CheckCircle size={64} className="onboarding-page__done-icon" />
          <h2>宠物档案创建成功！</h2>
          <p>
            {petName}的档案已保存。现在你可以浏览附近的宠物，找到最合适的玩伴！
          </p>
          <button
            className="btn btn-primary btn-lg onboarding-page__done-btn"
            onClick={handleFinish}
          >
            进入首页
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style>{getStyles()}</style>
    </div>
  );
}

function getStyles() {
  return `
    .onboarding-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%);
    }

    .onboarding-page__card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 40px 32px;
      text-align: center;
    }

    .onboarding-page__card--form {
      max-width: 520px;
      text-align: left;
      padding: 32px;
    }

    .onboarding-page__card--done {
      max-width: 420px;
    }

    /* Welcome Step */
    .onboarding-page__icon-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .onboarding-page__sparkle {
      position: absolute;
      top: -4px;
      right: -4px;
      color: #faad14;
    }
    .onboarding-page__paw {
      color: var(--primary);
    }

    .onboarding-page__title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .onboarding-page__desc {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .onboarding-page__features {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    .onboarding-page__feature {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      font-size: 14px;
      color: var(--text);
      text-align: left;
    }

    .onboarding-page__feature svg {
      color: var(--primary);
      flex-shrink: 0;
    }

    .onboarding-page__actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .onboarding-page__btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
    }

    .onboarding-page__btn-secondary {
      width: 100%;
    }

    /* Form Step */
    .onboarding-page__form-header {
      text-align: center;
      margin-bottom: 24px;
      position: relative;
    }

    .onboarding-page__back-btn {
      position: absolute;
      left: 0;
      top: 0;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: color var(--transition-fast);
    }
    .onboarding-page__back-btn:hover {
      color: var(--text);
    }

    .onboarding-page__form-title-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .onboarding-page__form-icon {
      color: var(--primary);
    }
    .onboarding-page__form-title-wrap h2 {
      font-size: 1.35rem;
      margin: 0;
    }

    .onboarding-page__form-subtitle {
      color: var(--text-secondary);
      font-size: 13px;
      margin: 0;
    }

    .onboarding-page__form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .onboarding-page__error {
      padding: 10px 14px;
      background: rgba(245, 34, 45, 0.08);
      border: 1px solid rgba(245, 34, 45, 0.2);
      border-radius: var(--radius-sm);
      color: #f5222d;
      font-size: 13px;
    }

    .onboarding-page__btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .onboarding-page__chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .onboarding-page__chip:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .onboarding-page__chip--active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .onboarding-page__chip--active:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
      color: #fff;
    }

    .onboarding-page__chip--size {
      min-width: 60px;
      justify-content: center;
    }

    .onboarding-page__submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 8px;
    }

    /* Done Step */
    .onboarding-page__done {
      padding: 20px 0;
    }
    .onboarding-page__done-icon {
      color: #52c41a;
      margin-bottom: 16px;
    }
    .onboarding-page__done h2 {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
    .onboarding-page__done p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .onboarding-page__done-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .onboarding-page__card {
        padding: 28px 20px;
      }
      .onboarding-page__card--form {
        padding: 24px 16px;
      }
      .onboarding-page__title {
        font-size: 1.25rem;
      }
      .onboarding-page__chip {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
  `;
}
