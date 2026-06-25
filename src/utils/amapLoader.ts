// 硬编码高德地图 Key（Cloudflare Pages 部署时环境变量丢失）
const AMAP_KEY = 'dd4e874c461aa15507662ec2576d2839';
const AMAP_SECRET = 'ce5cedc1d4a5efd80d0945b3a3361912';

let loadPromise: Promise<void> | null = null;

/**
 * 动态加载高德地图 JS API
 */
export function loadAMapAPI(): Promise<void> {
  if (loadPromise) return loadPromise;

  if (!AMAP_KEY) {
    return Promise.reject(new Error('高德地图 Key 未配置'));
  }

  // 检查是否已加载
  if ((window as any).AMap) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    // 设置安全密钥
    (window as any)._AMapSecurityConfig = {
      securityJsCode: AMAP_SECRET,
    };

    // 超时处理
    const timeout = setTimeout(() => {
      loadPromise = null;
      reject(new Error('高德地图加载超时（10秒），请检查网络连接'));
    }, 10000);

    try {
      // 创建 script 标签加载 JS API Loader
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/loader.js`;
      script.async = true;

      const cleanup = () => {
        clearTimeout(timeout);
      };

      script.onload = () => {
        // 使用 AMapLoader 加载 JS API 2.0
        if (!(window as any).AMapLoader) {
          cleanup();
          loadPromise = null;
          reject(new Error('AMapLoader 未正确加载'));
          return;
        }
        (window as any).AMapLoader.load({
          key: AMAP_KEY,
          version: '2.0',
          plugins: ['AMap.Scale', 'AMap.ToolBar'],
        }).then(() => {
          cleanup();
          resolve();
        }).catch((err: any) => {
          cleanup();
          loadPromise = null;
          reject(new Error(`高德地图加载失败: ${err}`));
        });
      };

      script.onerror = () => {
        cleanup();
        loadPromise = null;
        reject(new Error('高德地图 JS 脚本加载失败，请检查网络'));
      };

      document.head.appendChild(script);
    } catch (err) {
      clearTimeout(timeout);
      loadPromise = null;
      reject(err);
    }
  });

  return loadPromise;
}

/**
 * 检查高德地图是否已配置
 */
export function isAMapConfigured(): boolean {
  return !!AMAP_KEY && AMAP_KEY.length > 0;
}
