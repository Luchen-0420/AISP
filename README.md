# AI 标准化病人训练系统 (AISP)

**AISP (AI Standardized Patient)** 是一个基于大语言模型的医学教育实训平台，旨在通过高拟真的虚拟病人交互，解决传统医学教育中标准化病人（SP）资源稀缺、成本高昂、反馈滞后的痛点。

系统完全模拟客观结构化临床考试 (OSCE) 流程，支持从**病史采集**、**辅助检查**到**SOAP 病历书写**的全流程训练，并提供基于循证医学的实时 AI 评分与反馈。

---

## ✨ 核心功能

### 👨‍⚕️ 学生端功能

#### 1. 沉浸式 AI 问诊
- **自然语言交互**：与具备真实性格、情绪和完整病史的 AI 病人进行语音/文字对话。
- **动态病情演变**：病人状态会根据问诊过程动态变化（如情绪安抚后更配合）。
- **医学检查模拟**：支持开具各类辅助检查（血常规、心电图、CT 等），并即时获取由 AI 生成或预设的检查报告。

#### 2. 全维度能力评估
系统根据 OSCE 标准进行多维度自动评分：
- **OPQRST 覆盖率**：自动检测是否完整询问了发病诱因、加重缓解因素、性质、放射、程度、时间等关键要素。
- **临床思维 (Logic)**：评估问诊逻辑条理性与诊断方向的准确性。
- **人文关怀 (Empathy)**：识别对话中的共情表达与沟通技巧。
- **SOAP 病历撰写**：内置标准 SOAP 格式（Subjective, Objective, Assessment, Plan）记录工具。

#### 3. 智能反馈与推荐
- **个性化弱项分析**：系统自动分析历史训练数据，识别学生在“共情能力”或“临床逻辑”上的短板。
- **智能病例推荐**：基于弱项分析算法，自动推荐适合的针对性强化病例（如逻辑薄弱推荐高难度复杂病例，共情薄弱推荐情绪化病人）。
- **OSCE 报告导出**：支持一键导出包含雷达图得分、失分项详解的 CSV 格式成绩单，由于教学归档。

#### 4. 复盘与回溯
- **完整会话回放**：支持按时间轴回看完整的问诊对话记录。
- **AI 逐句点评**：AI 针对每一轮关键对话提供改进建议。

### 👩‍🏫 教师端功能

- **病例库管理**：可视化创建和编辑病例模板，设定病人画像、既往史、核心体征及诊断标准。
- **班级数据看板**：实时监控全班学生的训练进度、平均分分布及高频失分点。
- **教学管理**：管理学生名单、分配训练任务。

---

## 🛠️ 技术架构

本项目采用 Monorepo 架构，前后端分离设计：

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| **Frontend** | React 18, TypeScript, Vite | UI 框架与构建工具 |
| **State** | Zustand | 轻量级全局状态管理 |
| **Styling** | TailwindCSS | 原子化 CSS 样式方案 |
| **Backend** | Node.js, Express, TypeScript | RESTful API 服务端 |
| **Database** | PostgreSQL | 关系型数据存储 |
| **AI Engine** | LangChain, OpenAI API | LLM 编排与调用 |

---

## 🚀 快速上手指南

### 环境准备
- Node.js v18+
- pnpm v8+
- PostgreSQL v14+

### 1. 安装与初始化

```bash
# 克隆项目
git clone https://github.com/Luchen-0420/AISP.git
cd AISP

# 安装依赖
pnpm install

# 初始化数据库结构
# 确保本地 PostgreSQL 已启动并创建了数据库
pnpm db:init
```

### 2. 配置环境变量

在 `packages/server` 目录下创建 `.env` 文件：

```env
# 核心服务配置
PORT=3001
JWT_SECRET=your_secure_jwt_secret

# 数据库连接
DATABASE_URL=postgresql://postgres:password@localhost:5432/zyj_test_demo

# AI 服务配置 (支持 OpenAI 及兼容接口)
# OPENAI_API_KEY=sk-xxxxxx
# OPENAI_BASE_URL=https://api.openai.com/v1
# AI_MODEL_NAME=gpt-4-turbo
```

> **注意**：本平台支持 **BYOK (Bring Your Own Key)** 模式。如果未在环境变量中配置 AI Key，用户也可以在前端「设置」页面输入自己的 Key 进行使用。

### 3. 启动开发环境

```bash
# 在根目录运行，将同时启动前端与后端服务
pnpm dev
```

- 前端地址: `http://localhost:5173`
- 后端地址: `http://localhost:3001`

---

## 📖 使用流程示例

### 学生训练流程
1.  **登录系统**：使用分配的学号或注册账号登录。
2.  **选择病例**：在首页“推荐练习”或“全部病例”中选择一个待训练病例。
3.  **开始问诊**：
    *   点击麦克风图标或输入文字与病人对话。
    *   点击右侧“辅助检查”按钮开具检查单。
4.  **撰写病历**：问诊结束后，填写右侧 SOAP 表单。
5.  **提交与反馈**：点击提交，系统即时生成雷达图评分与 AI 详细点评。
6.  **查看报告**：在“历史记录”中查看本次训练详情，并可点击“导出 OSCE 报告”下载。

### 教师管理流程
1.  **创建病例**：进入“病例库”，点击“新建病例”，填写病人设定与医学信息。
2.  **发布任务**：将病例分配给指定班级。
3.  **查看学情**：进入“班级分析”，查看学生的平均分走势与训练活跃度。

---

## 📂 目录结构

```
root/
├── docs/                   # 项目文档与资源
├── packages/
│   ├── web/                # 前端工程
│   │   ├── src/
│   │   │   ├── components/ # 通用组件 (UI, Layouts)
│   │   │   ├── pages/      # 页面视图 (Student, Teacher, Training)
│   │   │   ├── store/      # Zustand store (User, TrainingState)
│   │   │   └── utils/      # 工具函数
│   └── server/             # 后端工程
│       ├── src/
│       │   ├── controllers/# 业务逻辑控制器 (Training, AI, Case)
│       │   ├── db/         # 数据库连接与 Schema
│       │   └── services/   # 核心服务 (AIService, CaseService)
```

## 📄 License

MIT License
