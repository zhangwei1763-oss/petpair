import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Users, UserPlus, Search, CalendarCheck } from 'lucide-react';

const features = [
  {
    icon: <Heart size={32} />,
    title: '智能匹配',
    description: '基于性格、体型、能量值多维度匹配，为你的宠物找到最合拍的玩伴。',
  },
  {
    icon: <Shield size={32} />,
    title: '安全可靠',
    description: '疫苗认证、评价系统、黑名单机制，全方位保障宠物社交安全。',
  },
  {
    icon: <Users size={32} />,
    title: '社区互动',
    description: '发起活动、分享日常、认识宠友，打造温暖的宠物社交圈。',
  },
];

const steps = [
  {
    icon: <UserPlus size={28} />,
    title: '创建档案',
    description: '为你的宠物创建详细的个人档案',
  },
  {
    icon: <Search size={28} />,
    title: '智能匹配',
    description: '系统自动为你推荐最合适的玩伴',
  },
  {
    icon: <CalendarCheck size={28} />,
    title: '约见玩伴',
    description: '发起邀约，安排线下见面活动',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__content container">
          <h1 className="home-hero__title">为你的宠物找到最合适的玩伴</h1>
          <p className="home-hero__subtitle">
            PetPair 通过智能算法，根据宠物的性格、体型和运动习惯，精准匹配最合拍的玩伴。
            让每一次相遇都充满快乐！
          </p>
          <button
            className="btn btn-primary btn-lg home-hero__cta"
            onClick={() => navigate('/dashboard')}
          >
            <Search size={20} />
            开始匹配
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features container">
        <h2 className="home-section__title">为什么选择 PetPair</h2>
        <div className="home-features__grid">
          {features.map((feature) => (
            <div className="card home-feature-card" key={feature.title}>
              <div className="home-feature-card__icon">{feature.icon}</div>
              <h3 className="home-feature-card__title">{feature.title}</h3>
              <p className="home-feature-card__desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-steps container">
        <h2 className="home-section__title">如何使用</h2>
        <div className="home-steps__list">
          {steps.map((step, index) => (
            <div className="home-step" key={step.title}>
              <div className="home-step__number">{index + 1}</div>
              <div className="home-step__icon">{step.icon}</div>
              <h3 className="home-step__title">{step.title}</h3>
              <p className="home-step__desc">{step.description}</p>
              {index < steps.length - 1 && <div className="home-step__connector" />}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        /* Hero */
        .home-hero {
          background: linear-gradient(135deg, #f0d4c4 0%, #c4785a 50%, #a85d42 100%);
          padding: 80px 0 60px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .home-hero {
            padding: 48px 0 40px;
          }
        }
        .home-hero__content {
          max-width: 640px;
        }
        .home-hero__title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .home-hero__subtitle {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 32px;
          line-height: 1.7;
        }
        .home-hero__cta {
          background: #fff;
          color: var(--primary-dark);
          border-color: #fff;
          font-size: 18px;
          padding: 16px 40px;
        }
        .home-hero__cta:hover:not(:disabled) {
          background: var(--bg-secondary);
          border-color: var(--bg-secondary);
          box-shadow: var(--shadow-md);
        }

        /* Section Title */
        .home-section__title {
          text-align: center;
          font-size: 1.75rem;
          margin-bottom: 40px;
          color: var(--text);
        }

        /* Features */
        .home-features {
          padding: 60px 20px;
        }
        .home-features__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .home-features__grid {
            grid-template-columns: 1fr;
          }
        }
        .home-feature-card {
          text-align: center;
          padding: 32px 24px;
        }
        .home-feature-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--primary-light);
          color: var(--primary);
          margin-bottom: 16px;
        }
        .home-feature-card__title {
          font-size: 1.125rem;
          margin-bottom: 8px;
        }
        .home-feature-card__desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
          line-height: 1.6;
        }

        /* Steps */
        .home-steps {
          padding: 60px 20px 80px;
        }
        .home-steps__list {
          display: flex;
          justify-content: center;
          gap: 48px;
          position: relative;
        }
        @media (max-width: 768px) {
          .home-steps__list {
            flex-direction: column;
            align-items: center;
            gap: 32px;
          }
        }
        .home-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 200px;
          position: relative;
        }
        .home-step__number {
          position: absolute;
          top: -8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .home-step__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-secondary);
          color: var(--primary);
          margin-bottom: 16px;
        }
        .home-step__title {
          font-size: 1rem;
          margin-bottom: 6px;
        }
        .home-step__desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        .home-step__connector {
          display: none;
        }
        @media (min-width: 769px) {
          .home-step__connector {
            display: block;
            position: absolute;
            top: 28px;
            left: calc(100% + 12px);
            width: 24px;
            height: 2px;
            background: var(--border);
          }
          .home-step:last-child .home-step__connector {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
