# AI 标准化病人训练系统 (AISP)

一个基于 AI 的医学教育平台，为医学生提供沉浸式的问诊实训体验。

## ✨ 功能特点

- 🩺 **AI 标准化病人**: 与具有真实性格和病史的虚拟患者进行问诊训练
- 📊 **实时评分系统**: 多维度评估问诊能力（病史采集、临床逻辑、医患沟通等）
- 🧪 **辅助检查模拟**: 支持开具心电图、血常规等检查并获取 AI 生成的报告
- 📝 **SOAP 病历撰写**: 完整的病历书写训练模块
- 📈 **智能复盘分析**: 训练结束后获取 AI 针对性点评和学习资源推荐

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18, TypeScript, Vite, Zustand, TailwindCSS |
| **后端** | Node.js, Express, TypeScript |
| **数据库** | PostgreSQL |
| **AI** | LangChain, OpenAI Compatible API |

---

## 📦 环境要求

- **Node.js**: v18.0.0+
- **pnpm**: v8.0.0+ (推荐使用 `npm install -g pnpm` 安装)
- **PostgreSQL**: v14.0+

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd test_demo
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置数据库

请确保 PostgreSQL 服务已启动，然后创建数据库：

```bash
# 连接 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE zyj_test_demo;

# 退出 psql
\q
```

### 4. 初始化数据库表结构

```bash
# 方法一：使用项目脚本 (需要修改 package.json 中的数据库密码)
pnpm db:init

# 方法二：手动执行 SQL
psql -U postgres -d zyj_test_demo -f packages/server/src/db/schema.sql
```

### 5. 配置环境变量

在 `packages/server` 目录下创建 `.env` 文件：

```bash
cd packages/server
touch .env  # Linux/Mac
# 或 Windows: New-Item .env
```

填入以下内容：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/zyj_test_demo

# JWT 密钥 (请自行生成一个安全的随机字符串)
JWT_SECRET=your_super_secret_jwt_key_here

# 服务端口
PORT=3001

# AI 配置 (可选 - 用户也可在前端设置页面配置)
# OPENAI_API_KEY=sk-xxxxx
# OPENAI_BASE_URL=https://api.openai.com/v1
# AI_MODEL_NAME=gpt-4o-mini
```

### 6. 启动开发服务器

```bash
# 回到项目根目录
cd ../..

# 同时启动前后端
pnpm dev
```

启动成功后：
- 🌐 **前端**: http://localhost:5173
- 🔌 **后端 API**: http://localhost:3001

---

## 📁 项目结构

```
test_demo/
├── packages/
│   ├── web/                 # 前端 React 应用
│   │   ├── src/
│   │   │   ├── api/         # API 请求封装
│   │   │   ├── components/  # UI 组件
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── store/       # Zustand 状态管理
│   │   │   └── types/       # TypeScript 类型定义
│   │   └── package.json
│   └── server/              # 后端 Node.js 服务
│       ├── src/
│       │   ├── controllers/ # 路由控制器
│       │   ├── services/    # 业务逻辑
│       │   ├── db/          # 数据库相关
│       │   └── index.ts     # 应用入口
│       └── package.json
├── docs/                    # 项目文档
├── package.json             # 根 package.json (工作区配置)
└── pnpm-workspace.yaml      # pnpm 工作区配置
```

---

## 📖 用户指南

### 学生端
1. 注册账号并登录
2. 选择病例开始训练
3. 与 AI 病人进行问诊对话
4. 开具必要的辅助检查
5. 填写 SOAP 病历
6. 结束训练，查看评分和 AI 点评

### 教师端
1. 管理病例模板
2. 查看学生训练记录
3. 分析班级整体表现

---

## ⚙️ 常用命令

```bash
# 开发模式 (前后端热重载)
pnpm dev

# 仅启动前端
pnpm --filter web dev

# 仅启动后端
pnpm --filter server dev

# 生产构建
pnpm build

# 代码检查
pnpm --filter web lint
```

---

## 🔑 AI 配置说明

本系统支持 **BYOK (Bring Your Own Key)** 模式，用户可以通过前端设置页面配置自己的 AI API Key：

1. 登录后进入「设置」页面
2. 填入 API Key、Base URL（如使用代理）
3. 点击「测试连接」验证配置
4. 保存设置

支持的 AI 服务：
- OpenAI (GPT-4, GPT-4o-mini 等)
- 兼容 OpenAI API 的服务 (如 Azure OpenAI, 智谱 AI, DeepSeek 等)

---

## 🐛 常见问题

### Q: 数据库连接失败？
确保 PostgreSQL 服务正在运行，并检查 `.env` 中的连接字符串是否正确。

### Q: AI 回复是模拟消息？
说明未配置 AI API Key。请在设置页面配置，或在服务端 `.env` 中设置 `OPENAI_API_KEY`。

### Q: 端口被占用？
修改 `packages/server/.env` 中的 `PORT`，或修改 `packages/web/vite.config.ts` 中的端口配置。

---

## 📄 License

MIT License
