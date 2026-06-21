import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: '' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || '',
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <div className="error-boundary__icon">
              <AlertTriangle size={48} />
            </div>
            <h1>页面出错了</h1>
            <p className="error-boundary__desc">
              抱歉，应用遇到了意外错误。您可以尝试刷新页面或返回首页。
            </p>
            {this.state.error && (
              <div className="error-boundary__details">
                <details>
                  <summary>查看错误详情（用于调试）</summary>
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre className="error-boundary__stack">{this.state.errorInfo}</pre>
                  )}
                </details>
              </div>
            )}
            <div className="error-boundary__actions">
              <button
                className="btn btn-primary"
                onClick={this.handleReload}
              >
                <RefreshCw size={16} />
                刷新页面
              </button>
              <button
                className="btn btn-outline"
                onClick={this.handleGoHome}
              >
                <Home size={16} />
                返回首页
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              background: var(--bg, #faf8f5);
            }
            .error-boundary__card {
              max-width: 520px;
              width: 100%;
              text-align: center;
              padding: 48px 32px;
              background: var(--card-bg, #fff);
              border-radius: 16px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            }
            .error-boundary__icon {
              color: #e8b94b;
              margin-bottom: 20px;
            }
            .error-boundary__card h1 {
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 12px;
              color: var(--ink, #2c2a26);
            }
            .error-boundary__desc {
              font-size: 14px;
              color: var(--muted, #8a847a);
              margin-bottom: 24px;
              line-height: 1.6;
            }
            .error-boundary__details {
              text-align: left;
              margin-bottom: 24px;
            }
            .error-boundary__details details {
              background: var(--bg2, #f0ece6);
              border-radius: 8px;
              padding: 12px 16px;
            }
            .error-boundary__details summary {
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              color: var(--ink, #2c2a26);
            }
            .error-boundary__details pre {
              margin-top: 12px;
              font-size: 12px;
              color: #e74c3c;
              white-space: pre-wrap;
              word-break: break-all;
              overflow-x: auto;
            }
            .error-boundary__stack {
              margin-top: 8px;
              color: var(--muted, #8a847a) !important;
            }
            .error-boundary__actions {
              display: flex;
              gap: 12px;
              justify-content: center;
            }
            .error-boundary__actions .btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            @media (max-width: 480px) {
              .error-boundary__actions {
                flex-direction: column;
              }
              .error-boundary__actions .btn {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
