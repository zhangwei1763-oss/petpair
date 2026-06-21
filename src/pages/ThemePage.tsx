import { useState, useEffect, useCallback } from 'react';
import {
  Moon,
  Sun,
  Palette,
  Type,
  Check,
  RotateCcw,
  Eye,
} from 'lucide-react';

type FontSize = 'small' | 'medium' | 'large';

interface ThemeSettings {
  darkMode: boolean;
  primaryColor: string;
  fontSize: FontSize;
}

const PRIMARY_COLORS = [
  { key: 'warm-orange', label: '暖橙', color: '#c4785a', darkBg: '#a85d42' },
  { key: 'forest-green', label: '森林绿', color: '#4a8c5c', darkBg: '#3a7048' },
  { key: 'sky-blue', label: '天空蓝', color: '#4a90d9', darkBg: '#3a72b0' },
  { key: 'lavender', label: '薰衣草紫', color: '#8e6fbf', darkBg: '#7258a0' },
  { key: 'rose-pink', label: '玫瑰粉', color: '#d4728c', darkBg: '#b05a72' },
  { key: 'graphite', label: '石墨灰', color: '#6b7b8d', darkBg: '#556070' },
];

const FONT_SIZES: { key: FontSize; label: string; size: string }[] = [
  { key: 'small', label: '小', size: '14px' },
  { key: 'medium', label: '中', size: '16px' },
  { key: 'large', label: '大', size: '18px' },
];

const DEFAULT_SETTINGS: ThemeSettings = {
  darkMode: false,
  primaryColor: '#c4785a',
  fontSize: 'medium',
};

function loadSettings(): ThemeSettings {
  try {
    const saved = localStorage.getItem('petpair-theme-settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ThemeSettings) {
  try {
    localStorage.setItem('petpair-theme-settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;
  const color = settings.primaryColor;

  if (settings.darkMode) {
    root.style.setProperty('--bg', '#1a1a2e');
    root.style.setProperty('--bg-card', '#252540');
    root.style.setProperty('--bg-secondary', '#1e1e36');
    root.style.setProperty('--text', '#e8e6e3');
    root.style.setProperty('--text-secondary', '#9a97a0');
    root.style.setProperty('--border', '#3a3a5c');
    root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.2)');
    root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.3)');
    root.style.setProperty('--shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.4)');
    root.style.setProperty('--primary-light', color + '30');
  } else {
    root.style.setProperty('--bg', '#faf8f5');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f0ece6');
    root.style.setProperty('--text', '#2c2a26');
    root.style.setProperty('--text-secondary', '#8a847a');
    root.style.setProperty('--border', '#d9d4cc');
    root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--primary-light', color + '25');
  }

  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-dark', settings.darkMode ? color : adjustColor(color, -20));

  const fontSize = FONT_SIZES.find((f) => f.key === settings.fontSize)?.size || '16px';
  root.style.fontSize = fontSize;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function ThemePage() {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

  useEffect(() => {
    applyTheme(settings);
    saveSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="theme-page container">
      {/* 页面标题 */}
      <div className="theme-page__header">
        <h1>
          <Palette size={24} />
          主题设置
        </h1>
        <p className="theme-page__subtitle">
          自定义你的 PetPair 体验
        </p>
      </div>

      {/* 深色模式开关 */}
      <div className="theme-page__section card">
        <div className="theme-page__section-header">
          <Moon size={18} />
          <h3>深色模式</h3>
        </div>
        <div className="theme-page__toggle-row">
          <div className="theme-page__toggle-info">
            <Sun size={18} />
            <span>浅色</span>
          </div>
          <button
            className={`theme-page__toggle ${
              settings.darkMode ? 'theme-page__toggle--active' : ''
            }`}
            onClick={() => updateSetting('darkMode', !settings.darkMode)}
            aria-label="切换深色模式"
          >
            <span className="theme-page__toggle-slider" />
          </button>
          <div className="theme-page__toggle-info">
            <Moon size={18} />
            <span>深色</span>
          </div>
        </div>
        <p className="theme-page__toggle-hint">
          <Eye size={12} />
          切换后页面将立即更新预览效果
        </p>
      </div>

      {/* 主题色选择 */}
      <div className="theme-page__section card">
        <div className="theme-page__section-header">
          <Palette size={18} />
          <h3>主题色</h3>
        </div>
        <div className="theme-page__colors">
          {PRIMARY_COLORS.map((item) => (
            <button
              key={item.key}
              className={`theme-page__color-btn ${
                settings.primaryColor === item.color ? 'theme-page__color-btn--active' : ''
              }`}
              onClick={() => updateSetting('primaryColor', item.color)}
              title={item.label}
            >
              <span
                className="theme-page__color-circle"
                style={{ background: item.color }}
              />
              <span className="theme-page__color-label">{item.label}</span>
              {settings.primaryColor === item.color && (
                <Check size={14} className="theme-page__color-check" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 字体大小调节 */}
      <div className="theme-page__section card">
        <div className="theme-page__section-header">
          <Type size={18} />
          <h3>字体大小</h3>
        </div>
        <div className="theme-page__font-sizes">
          {FONT_SIZES.map((item) => (
            <button
              key={item.key}
              className={`theme-page__font-btn ${
                settings.fontSize === item.key ? 'theme-page__font-btn--active' : ''
              }`}
              onClick={() => updateSetting('fontSize', item.key)}
            >
              <span
                className="theme-page__font-preview"
                style={{ fontSize: item.size }}
              >
                Aa
              </span>
              <span className="theme-page__font-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 预览区域 */}
      <div className="theme-page__section card theme-page__preview">
        <div className="theme-page__section-header">
          <Eye size={18} />
          <h3>效果预览</h3>
        </div>
        <div className="theme-page__preview-content">
          <div className="theme-page__preview-btns">
            <button className="btn btn-primary">主要按钮</button>
            <button className="btn btn-outline">次要按钮</button>
            <button className="btn btn-secondary">辅助按钮</button>
          </div>
          <div className="theme-page__preview-tags">
            <span className="tag">标签样式</span>
            <span className="badge">徽章样式</span>
            <span className="badge badge--success">成功</span>
            <span className="badge badge--danger">危险</span>
          </div>
          <div className="theme-page__preview-text">
            <h4>标题文字预览</h4>
            <p>这是一段正文内容预览，用于查看字体大小和颜色效果。PetPair 让你的宠物找到最好的玩伴。</p>
          </div>
          <div className="theme-page__preview-card-row">
            <div className="theme-page__preview-mini-card">
              <span className="theme-page__preview-mini-label">背景色</span>
              <span className="theme-page__preview-mini-value">var(--bg)</span>
            </div>
            <div className="theme-page__preview-mini-card">
              <span className="theme-page__preview-mini-label">卡片色</span>
              <span className="theme-page__preview-mini-value">var(--bg-card)</span>
            </div>
            <div className="theme-page__preview-mini-card">
              <span className="theme-page__preview-mini-label">主题色</span>
              <span
                className="theme-page__preview-mini-swatch"
                style={{ background: settings.primaryColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 重置按钮 */}
      <div className="theme-page__reset">
        <button className="btn btn-outline" onClick={handleReset}>
          <RotateCcw size={14} />
          恢复默认设置
        </button>
      </div>

      <style>{`
        .theme-page {
          padding-top: 24px;
          padding-bottom: 40px;
          max-width: 640px;
        }

        /* Header */
        .theme-page__header {
          margin-bottom: 24px;
        }
        .theme-page__header h1 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .theme-page__subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Section */
        .theme-page__section {
          margin-bottom: 20px;
        }
        .theme-page__section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .theme-page__section-header h3 {
          font-size: 16px;
        }

        /* Toggle */
        .theme-page__toggle-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .theme-page__toggle-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .theme-page__toggle {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 30px;
          background: var(--border);
          border-radius: 15px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background var(--transition-fast);
        }
        .theme-page__toggle-slider {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 24px;
          height: 24px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        .theme-page__toggle--active {
          background: var(--primary);
        }
        .theme-page__toggle--active .theme-page__toggle-slider {
          transform: translateX(26px);
        }
        .theme-page__toggle-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        /* Colors */
        .theme-page__colors {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .theme-page__color-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          min-width: 80px;
        }
        .theme-page__color-btn:hover {
          border-color: var(--primary);
        }
        .theme-page__color-btn--active {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .theme-page__color-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .theme-page__color-btn:hover .theme-page__color-circle {
          transform: scale(1.1);
        }
        .theme-page__color-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
        }
        .theme-page__color-check {
          position: absolute;
          top: 6px;
          right: 6px;
          color: var(--primary);
        }

        /* Font Sizes */
        .theme-page__font-sizes {
          display: flex;
          gap: 12px;
        }
        .theme-page__font-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .theme-page__font-btn:hover {
          border-color: var(--primary);
        }
        .theme-page__font-btn--active {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .theme-page__font-preview {
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }
        .theme-page__font-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* Preview */
        .theme-page__preview {
          overflow: hidden;
        }
        .theme-page__preview-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .theme-page__preview-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .theme-page__preview-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .theme-page__preview-text h4 {
          font-size: 16px;
          margin-bottom: 6px;
        }
        .theme-page__preview-text p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        .theme-page__preview-card-row {
          display: flex;
          gap: 12px;
        }
        .theme-page__preview-mini-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg);
        }
        .theme-page__preview-mini-label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .theme-page__preview-mini-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          font-family: monospace;
        }
        .theme-page__preview-mini-swatch {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
        }

        /* Reset */
        .theme-page__reset {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .theme-page__colors {
            gap: 8px;
          }
          .theme-page__color-btn {
            min-width: 64px;
            padding: 10px 8px;
          }
          .theme-page__color-circle {
            width: 32px;
            height: 32px;
          }
          .theme-page__preview-card-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
