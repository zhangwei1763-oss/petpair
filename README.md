# PetPair - AI 驱动的宠物社交匹配平台

> 🐾 为你的宠物找到最合适的玩伴
>
> TRAE AI 创造力大赛参赛作品 | 生活娱乐赛道

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-orange)](https://petpair.zhangwei1763.workers.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)

---

## 在线体验

🔗 **https://petpair.zhangwei1763.workers.dev**

> 使用微信登录即可体验全部功能（无需真实微信账号，自动进入 Mock 模式）

---

## 项目简介

PetPair 是一个基于 AI 技术的宠物社交匹配平台。通过多维度智能算法和 AI 辅助功能，帮助宠物主人为自家毛孩子找到性格合拍、能量匹配的玩伴，并提供从线上匹配到线下约会的完整闭环体验。

### 核心创意

传统宠物社交依赖主人主观判断，而 PetPair 创新性地引入 **AI 多模态分析** 和 **智能匹配引擎**：

- **AI 照片性格分析** — 上传宠物照片，AI 自动分析性格标签、能量水平、推荐活动
- **五维度匹配算法** — 性格 / 能量 / 体型 / 距离 / 健康，科学计算匹配度
- **爪爪小助手** — 聊天中召唤 AI 助手，根据双方宠物信息和聊天记录策划约会
- **智能推荐列表** — 按匹配度排序，五维雷达图直观展示兼容程度

---

## 功能特性

### V1.0 - 核心匹配（已完成）

| 功能 | 描述 |
|------|------|
| 用户认证 | 邮箱登录 / 微信登录（Mock 模式自动降级） |
| 宠物档案 | 增删改查宠物信息，支持多宠物管理 |
| AI 性格分析 | 上传照片，AI 分析性格、能量、推荐活动 |
| 智能匹配 | 五维度评分算法，匹配度 0-100 分 |
| 邀约系统 | 发送 / 接受 / 拒绝 / 完成邀约 |
| 即时消息 | 一对一聊天，支持文本消息 |
| 评价系统 | 双向评价 + 星级评分 |
| 安全机制 | 黑名单 / 举报 / 健康认证徽章 |

### V1.5 - 社区扩展（已完成）

| 功能 | 描述 |
|------|------|
| 社区动态 | 发布 / 点赞 / 评论宠物日常 |
| 通知中心 | 实时消息推送（邀约 / 评价 / 系统通知） |
| 搜索发现 | 按品种 / 性格 / 距离筛选宠物 |

### V2.0 - 智能升级（已完成）

| 功能 | 描述 |
|------|------|
| 地图探索 | 真实地图展示附近宠物，头像标记点 |
| 智能推荐 | Tab 切换：附近宠物 / AI 智能推荐 |
| 排行榜 | 总榜 / 本月 / 新人三榜切换 |
| 数据统计 | 可视化图表展示用户活跃度 |
| 主题定制 | 暗黑模式 / 6 种主色 / 3 级字体 |

### AI 功能矩阵

| AI 功能 | 触发场景 | 技术实现 |
|---------|---------|---------|
| 照片性格分析 | 宠物档案页点击「AI 分析」 | 多模态 LLM（图片 + 文本） |
| 匹配解释生成 | 发现页查看宠物详情 | LLM 分析双方宠物信息 |
| 养宠助手对话 | 全局 AI 助手入口 | 上下文感知的问答系统 |
| 爪爪小助手 | 聊天页点击召唤按钮 | 综合分析宠物信息 + 聊天记录 |

---

## 技术架构

### 前端

- **React 19** + **TypeScript** + **Vite 6**
- **React Router v7** 客户端路由
- **Lucide React** 图标库
- 纯 CSS 自定义设计系统（CSS 变量 + 响应式）

### 后端

- **Supabase**（PostgreSQL + Auth + Storage + Realtime）
- **Row Level Security** 数据库权限控制
- 完整数据库 Schema + 触发器 + 种子数据

### AI

- **jiying.work API**（GPT-5.5 模型）
- 多模态输入支持（图片 Base64 + 文本）
- 结构化 JSON 输出解析

### 部署

- **Cloudflare Pages** 静态托管
- **GitHub** 自动触发构建部署
- 双模式运行：Supabase 真实后端 / Mock 数据 Fallback

---

## 项目结构

```
petpair-mvp/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API 客户端层
│   │   ├── ai.ts           # AI 功能封装（性格分析 / 匹配解释 / 养宠助手 / 爪爪小助手）
│   │   ├── auth.ts         # 认证 API
│   │   ├── client.ts       # Supabase 客户端
│   │   ├── pets.ts         # 宠物 CRUD
│   │   ├── posts.ts        # 社区动态
│   │   └── storage.ts      # 文件存储
│   ├── components/          # 可复用组件
│   │   ├── AIPersonalityAnalyzer.tsx
│   │   ├── Layout.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── ...
│   ├── data/                # Mock 数据
│   │   └── mockData.ts     # 完整模拟数据集
│   ├── pages/               # 页面组件（16 个）
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MapExplorePage.tsx
│   │   ├── MessagesPage.tsx
│   │   └── ...
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   └── matchEngine.ts  # 核心匹配算法
│   ├── App.tsx              # 根组件 + 路由
│   └── main.tsx             # 入口文件
├── supabase/
│   └── migrations/          # 数据库迁移
│       └── 001_initial_schema.sql
├── .env                     # 环境变量（Supabase + AI API）
├── .env.example             # 环境变量模板
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 本地运行

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`，填写你的配置：

```bash
# Supabase（可选，不填则自动使用 Mock 模式）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API（可选，不填则 AI 功能显示未配置）
VITE_AI_BASE_URL=https://www.jiying.work/v1
VITE_AI_API_KEY=your_api_key
VITE_AI_MODEL=gpt-5.5
```

> 不配置 Supabase 时，系统会自动使用 Mock 数据运行，所有功能均可正常体验。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

---

## 核心算法说明

### 五维度匹配算法

```
匹配分数 = 基础分(50) + 性格分 + 能量分 + 体型分 + 距离分 + 健康分

- 性格分：基于性格兼容矩阵（兼容 +15，互补 +20，冲突 -20）
- 能量分：能量等级差距（一致 +15，接近 +8，差距大 -5）
- 体型分：体型等级差距（相同 +10，接近 +5，差距大 -10/-25）
- 距离分：物理距离（近 +10，远 -20）
- 健康分：疫苗 + 绝育认证（双方齐全 +10）
```

### AI 提示工程

- **照片性格分析**：System Prompt 定义专业宠物行为分析师角色，要求严格 JSON 输出
- **爪爪小助手**：综合分析双方宠物档案 + 聊天记录上下文，生成结构化约会建议

---

## 迭代历程

| 版本 | 时间 | 核心内容 |
|------|------|---------|
| MVP | Week 1 | 登录、Dashboard、宠物档案、邀约、消息、评价 |
| V1.0 | Week 2 | 照片上传、健康认证、举报、反馈、高级匹配算法 |
| V1.5 | Week 3 | 社区动态、通知中心、宠物详情、搜索 |
| V2.0 | Week 4 | 地图探索、排行榜、统计、主题设置 |
| AI 集成 | Week 5 | 接入 jiying.work API，实现 AI 性格分析 + 爪爪小助手 |
| 优化 | Week 6 | 智能推荐融入发现模块、地图头像标记、注册页、真实地图 |

---

## 参赛信息

- **赛事**：TRAE AI 创造力大赛 2026
- **赛道**：生活娱乐 / 造点新花样
- **主题**：世界很大，放手去造
- **作品状态**：已部署上线，可完整体验

---

## 致谢

本项目使用 [TRAE](https://www.trae.cn/) IDE 开发，借助 AI 辅助编程完成全部代码。

---

## License

MIT License
