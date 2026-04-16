# 咿呀智库 - 后端项目

## 项目简介

这是「咿呀智库」的后端服务，基于 FastAPI，提供用户认证、测评、干预任务推荐、大模型与 Coze 智能体转发等能力。

## 技术栈

- **Web 框架**: FastAPI 0.104.1
- **数据库**: MySQL 8.0+（SQLAlchemy 2.x，异步 aiomysql）
- **缓存 / 任务**: Redis、Celery（依赖已纳入 `requirements.txt`，按业务逐步接入）
- **认证**: JWT（python-jose）
- **AI/ML**: scikit-learn、PyTorch、transformers；对话能力另可通过 DeepSeek API 与 Coze 编排

## 项目结构

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── auth.py           # 认证（注册、登录、密码相关）
│   │   ├── assessment.py     # 测评提交与查询
│   │   ├── tasks.py          # 任务列表、推荐、开始/完成
│   │   ├── llm.py            # DeepSeek 对话、场景、智能体风格接口
│   │   ├── coze.py           # Coze 智能体转发
│   │   └── router.py         # 路由聚合
│   ├── models/               # ORM 模型（user、baby、assessment、scale、task 等）
│   ├── schemas/              # Pydantic（含 coze 等）
│   ├── services/             # 业务逻辑（user、assessment、task、coze 等）
│   ├── algorithms/           # 评分、建议、任务推荐、PCDI 相关计分、问卷计分等
│   ├── core/
│   │   ├── database.py       # 异步数据库会话
│   │   ├── security.py       # 密码与 JWT
│   │   └── cloudbase_db.py   # 云开发相关能力（与配置联动）
│   ├── config.py
│   └── main.py
├── scripts/
│   └── init_db.py
├── docs/                     # 后端专题文档
├── tests/                    # pytest（见下文「测试」）
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：至少配置 `DATABASE_URL`、`REDIS_URL`（若使用）、`SECRET_KEY`；大模型与 Coze 见 `.env.example` 中 `DEEPSEEK_*`、`COZE_*` 等说明。

### 3. 初始化数据库

```bash
python scripts/init_db.py
```

### 4. 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 访问 API 文档

http://localhost:8000/docs

## API 接口（前缀 `/api/v1`）

### 认证 `/auth`

- `POST /auth/register` — 用户注册
- `POST /auth/login` — 登录（返回 JWT；业务上与小程序宽松登录策略对齐）
- `POST /auth/reset-password` — 重置密码
- `POST /auth/update-password` — 修改密码（需 Bearer Token）

### 测评 `/assessment`

- `POST /assessment/submit` — 提交测评
- `GET /assessment/history/{user_id}` — 测评历史
- `GET /assessment/{assessment_id}` — 测评详情

### 任务 `/tasks`

- `GET /tasks` — 任务列表
- `GET /tasks/{task_id}` — 任务详情
- `POST /tasks/recommend` — 推荐任务
- `POST /tasks/start` — 开始任务
- `POST /tasks/complete` — 完成任务
- `GET /tasks/user/{user_id}/baby/{baby_id}` — 用户在某宝宝下的任务

### 大模型 `/llm`（DeepSeek，需配置 `DEEPSEEK_API_KEY`）

- `POST /llm/chat` — 通用对话
- `POST /llm/scene` — 场景亲子对话模拟
- `POST /llm/agent` — 多轮智能体风格回复

### Coze `/coze`

- `POST /coze/chat` — 转发 Coze 智能体（Token 等仅在后端环境变量中配置）

完整路径均以 `/api/v1` 为前缀（与小程序 `runtime-config` 中的 `apiBaseUrl` 一致）。

## 核心功能模块

### 用户认证

- 注册、登录、密码更新；JWT 鉴权依赖 `get_current_user` 等。

### 测评

- 标准量表与 PCDI 等计分、维度与等级、建议生成（算法见 `app/algorithms/`）。

### 干预任务

- 基于测评结果推荐任务、状态流转与评价。

## 算法模块（节选）

- `scoring.py` — 标准量表评分与等级
- `suggestion.py` — 个性化建议
- `task_recommendation.py` — 任务推荐
- `pcdi_scoring.py`、`pcdi_scoring_v2.py`、`pcdi_18_30_scoring.py` — PCDI 相关
- `questionnaire_scoring.py` — 问卷计分

更多说明见 `docs/PCDI量表集成说明.md`。

## 开发说明

新增 API：在 `app/api/v1/` 增加路由文件，定义 `schemas` 与 `services`，并在 `router.py` 中 `include_router`。

## 测试

在 **`backend` 目录**下执行（保证 `app` 包可被解析）：

```bash
cd backend
pytest tests/
```

当前包含算法与 PCDI 等单测；API 层可按需补充集成测试。

## 部署

### Docker

```bash
cd backend
docker build -t yiya-backend .
docker run -p 8000:8000 yiya-backend
```

可与腾讯云开发 CloudRun 等配合使用，参见仓库根目录 `CLOUDBASE_INTEGRATION.md`。

### 进程托管示例

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 常见问题

**数据库连接失败**：检查 `.env` 中 `DATABASE_URL`。

**端口占用**：`uvicorn app.main:app --reload --port 8001`

## 后续方向（可选）

以下能力在代码或依赖中已有部分基础，可按产品优先级迭代：

- 将 Redis / Celery 全面用于缓存与异步任务
- 扩展独立 `baby` / `scale` 管理类 API（若前端需要与当前内嵌流程解耦）
- 语音识别、情感分析等重能力多为新依赖与管线，需单独设计与评测
- 提高 `tests/` 中 API 与服务的覆盖率

实现状态的可视化摘要见 `docs/后端实现状态报告.md`（会随版本更新）。

## 联系方式

如有问题，请联系开发团队。
