import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  PawPrint, Home, Search, MessageCircle, User,
  MapPin, Newspaper, Bell, BarChart3, Palette,
} from 'lucide-react';

interface LayoutProps {
  user?: {
    name: string;
    avatar: string;
  };
  onLogout?: () => void;
  unreadCount?: number;
}

const navLinks = [
  { label: '首页', path: '/dashboard' },
  { label: '发现', path: '/explore' },
  { label: '社区', path: '/community' },
  { label: '排行榜', path: '/leaderboard' },
  { label: '消息', path: '/messages' },
  { label: '宠物档案', path: '/pets' },
  { label: '我的', path: '/profile' },
];

const tabs = [
  { label: '首页', icon: Home, path: '/dashboard' },
  { label: '发现', icon: MapPin, path: '/explore' },
  { label: '社区', icon: Newspaper, path: '/community' },
  { label: '消息', icon: MessageCircle, path: '/messages' },
  { label: '我的', icon: User, path: '/profile' },
];

const Layout: React.FC<LayoutProps> = ({ unreadCount = 3 }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* ====== 顶部导航栏（固定） ====== */}
      <header className="layout__navbar">
        <div className="layout__navbar-inner container flex-between">
          <Link to="/dashboard" className="layout__logo flex-center gap-sm">
            <PawPrint size={28} color="var(--primary)" />
            <span className="layout__logo-text">PetPair</span>
          </Link>
          <nav className="layout__nav">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`layout__nav-link ${isActive(link.path) ? 'layout__nav-link--active' : ''}`}
              >
                {link.label}
                {link.label === '消息' && unreadCount > 0 && (
                  <span className="badge layout__nav-badge">{unreadCount}</span>
                )}
              </Link>
            ))}
          </nav>
          {/* 右侧快捷入口 */}
          <div className="layout__nav-extra">
            <Link to="/notifications" className="layout__nav-icon-btn" title="通知">
              <Bell size={18} />
            </Link>
            <Link to="/search" className="layout__nav-icon-btn" title="搜索">
              <Search size={18} />
            </Link>
            <Link to="/stats" className="layout__nav-icon-btn" title="统计">
              <BarChart3 size={18} />
            </Link>
            <Link to="/theme" className="layout__nav-icon-btn" title="主题">
              <Palette size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* ====== 主内容区域 ====== */}
      <main className="layout__main">
        <Outlet />
      </main>

      {/* ====== 底部移动端 TabBar（仅移动端显示） ====== */}
      <nav className="layout__tabbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path + tab.label}
              to={tab.path}
              className={`layout__tab-item ${active ? 'layout__tab-item--active' : ''}`}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
              {tab.label === '消息' && unreadCount > 0 && (
                <span className="badge layout__tab-badge">{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .layout__navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }
        .layout__navbar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .layout__logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .layout__logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }
        .layout__nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }
        .layout__nav-link {
          text-decoration: none;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
          white-space: nowrap;
        }
        .layout__nav-link:hover {
          color: var(--text);
          background: var(--bg-secondary);
        }
        .layout__nav-link--active {
          color: var(--primary);
          background: var(--primary-light);
          font-weight: 600;
        }
        .layout__nav-badge {
          position: static;
          font-size: 11px;
          min-width: 18px;
          height: 18px;
          line-height: 18px;
        }

        /* Extra icon buttons */
        .layout__nav-extra {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .layout__nav-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .layout__nav-icon-btn:hover {
          color: var(--primary);
          background: var(--primary-light);
        }

        /* Main content */
        .layout__main {
          flex: 1;
          padding-top: 60px;
          padding-bottom: 24px;
        }

        /* TabBar (mobile) */
        .layout__tabbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          display: none;
          align-items: center;
          justify-content: space-around;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
        }
        .layout__tab-item {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: var(--text-secondary);
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
          position: relative;
        }
        .layout__tab-item:hover {
          color: var(--text);
        }
        .layout__tab-item--active {
          color: var(--primary);
          font-weight: 600;
        }
        .layout__tab-badge {
          position: absolute;
          top: 0;
          right: 4px;
          font-size: 10px;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .layout__nav,
          .layout__nav-extra {
            display: none;
          }
          .layout__tabbar {
            display: flex;
          }
          .layout__main {
            padding-bottom: 72px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
