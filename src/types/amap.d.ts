// 高德地图 JS API 类型声明
declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions);
    destroy(): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    setCenter(center: LngLat | [number, number]): void;
    getCenter(): LngLat;
    setFitView(overlayList?: any[]): void;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    add(overlay: any): void;
    remove(overlay: any): void;
    clearMap(): void;
    addControl(control: any): void;
    removeControl(control: any): void;
  }

  class LngLat {
    constructor(lng: number, lat: number);
    getLng(): number;
    getLat(): number;
  }

  class Pixel {
    constructor(x: number, y: number);
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setPosition(position: LngLat | [number, number]): void;
    setContent(content: string | HTMLElement): void;
    setLabel(label: any): void;
    on(event: string, handler: (...args: any[]) => void): void;
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    setContent(content: string | HTMLElement): void;
    open(map: Map, position: LngLat | [number, number]): void;
    close(): void;
    setPosition(position: LngLat | [number, number]): void;
  }

  class Scale {
    constructor(options?: any);
  }

  class ToolBar {
    constructor(options?: { position?: string });
  }

  interface MapOptions {
    zoom?: number;
    center?: LngLat | [number, number];
    viewMode?: '2D' | '3D';
    mapStyle?: string;
    resizeEnable?: boolean;
  }

  interface MarkerOptions {
    position?: LngLat | [number, number];
    content?: string | HTMLElement;
    offset?: Pixel;
    title?: string;
    clickable?: boolean;
    label?: any;
    zIndex?: number;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    offset?: Pixel;
    isCustom?: boolean;
    autoMove?: boolean;
    closeWhenClickMap?: boolean;
  }

  function plugin(names: string[], callback: () => void): void;
}

declare const AMap: typeof AMap;

// AMapLoader 类型声明
declare namespace AMapLoader {
  function load(options: {
    key: string;
    version: string;
    plugins?: string[];
  }): Promise<typeof AMap>;
}

declare const AMapLoader: typeof AMapLoader;
