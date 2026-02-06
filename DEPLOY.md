# 🐳 Docker 部署指南

本指南将指导你如何使用 Docker 和 Docker Compose 快速部署 AISP 系统。

## 前置要求

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (包含 Docker Compose) 已安装并在运行中。

---

## 🚀 一键启动

在项目根目录下，运行以下命令：

```bash
docker-compose up -d --build
```

### 命令说明：
*   `up`: 启动服务。
*   `-d`: 后台运行 (Detached mode)。
*   `--build`: 强制重新构建镜像（首次运行或代码更新后推荐使用）。

---

## 🔍 验证部署

启动完成后，你可以通过以下地址访问服务：

1.  **Web 前端**: [http://localhost](http://localhost) (默认 80 端口)
2.  **后端 API**: [http://localhost:3001](http://localhost:3001)
3.  **数据库**: 运行在容器内部，端口 5432 (仅内部网络访问)

---

## ⚙️ 环境变量配置

你可以在根目录创建 `.env` 文件来覆盖默认配置：

```env
# 安全配置
JWT_SECRET=your_production_secret_key

# AI 配置 (可选，也可以在前端设置页面配置)
OPENAI_API_KEY=sk-xxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL_NAME=gpt-4-turbo
```

---

## 🛠️ 常用维护命令

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志 (如 server)
docker-compose logs -f server
```

### 停止服务
```bash
docker-compose down
```

### 停止并删除数据卷 (**警告：这将清空数据库**)
```bash
docker-compose down -v
```

### 进入容器内部
```bash
# 进入 server 容器
docker-compose exec server sh

# 进入 db 容器 (连接数据库)
docker-compose exec db psql -U postgres -d zyj_test_demo
```
