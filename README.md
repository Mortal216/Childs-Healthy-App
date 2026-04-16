# 咿呀智库微信小程序

咿呀智库是一款面向婴幼儿语言发育评估与干预的微信小程序，提供从测评、报告生成到任务推荐的完整闭环能力。

## 项目简介

本项目聚焦 0-30 个月婴幼儿语言发育支持，核心价值包括：

1. 科学测评：基于权威量表与算法，输出结构化评估结果。
2. 个性化干预：结合测评结果推荐训练任务与场景建议。
3. 全流程支持：覆盖登录建档、测评、报告、日常管理与科普学习。
4. 小程序便捷性：可随时随地完成测评与查看建议。

## 仓库组成

| 目录 / 文件 | 说明 |
|-------------|------|
| 仓库根目录 | 微信小程序前端（页面、组件、`app.json`、`project.config.json`） |
| `backend/` | 业务 API（FastAPI），MySQL 为主库 |
| `mcp-server/` | 独立 MCP 服务：MySQL 与云开发数据同步、云端分析（与小程序直连的业务 API 分离） |
| `utils/runtime-config.js` | 按微信环境版本切换 `apiBaseUrl`、`mcpServerUrl`、云环境 ID |
| `CLOUDBASE_INTEGRATION.md` | 云开发 / CloudRun 部署与配置要点 |
| `config/mcporter.json` | 注册 CloudBase 官方 MCP（`npx @cloudbase/cloudbase-mcp`） |

在微信开发者工具中需开启云能力；上线前请将 `trial`、`release` 下的域名占位符替换为实际 CloudRun 或网关地址（详见 `CLOUDBASE_INTEGRATION.md`）。

## 核心功能

### 1. 用户与档案管理

- 手机号登录与身份验证。
- 首次使用可快速完成账号创建。
- 支持宝宝信息与家长信息维护。

### 2. 测评体系

- 基础测评：
  - 0-18 个月：词汇与手势。
  - 18-30 个月：词汇与句子。
  - 抚养方式评估。
- 专项测评：
  - 对话能力评估。
  - 亲子互动评估。
  - 家庭语言环境评估。
- 报告输出：
  - 总分与分维度得分。
  - 同龄对比分析。
  - 个性化干预建议。

### 3. 干预与辅助功能

- 智能任务推荐：基于测评结果生成干预任务。
- AI 场景模拟：提供亲子互动练习与指导。
- AI 智能体对话：支持问答与辅导交互。
- 日历记录：记录成长里程碑和关键事件。

### 4. 科普与成长支持

- 推荐科普：按月龄和发育情况推送内容。
- 社区科普：家长经验交流。
- 文献资料：专业儿童语言发育文献。

### 5. 个人中心

- 个人资料与账户管理。
- 宝宝管理（支持多宝宝）。
- 测评历史报告查询。
- 我的收藏。
- 睡眠记录与建议。
- 积分系统。

## 演示流程建议

1. 登录小程序并完成验证码验证。
2. 填写宝宝和家长基础信息。
3. 进入测评模块，选择与月龄匹配的量表。
4. 提交测评并查看报告与建议。
5. 进入智能任务与 AI 场景，展示干预支持能力。
6. 展示科普与“我的”页面，说明长期使用价值。

## 后端服务启动

小程序部分能力依赖后端服务（用户认证、测评计算、任务推荐、数据存储）。

### 1. 进入后端目录

```bash
cd backend
```

### 2. 安装依赖并配置环境（首次）

```bash
pip install -r requirements.txt
cp .env.example .env
```

按需编辑 `.env` 中的数据库、Redis、第三方 API 等。

### 3. 启动 FastAPI 服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问 API 文档

- http://localhost:8000/docs

本地开发时，`develop` 环境默认请求 `http://localhost:8000/api/v1`（见 `utils/runtime-config.js`）。

## MCP 服务（可选）

用于 MySQL 与腾讯云开发同步及分析，详见 `mcp-server/README.md`。

```bash
cd mcp-server
npm install
cp .env.example .env
npm start
```

## 项目结构（节选）

```text
backend/                 # FastAPI 业务后端
  app/                   # 应用代码
  docs/                  # 后端专题文档（如 PCDI、实现状态）
  scripts/               # 初始化脚本等
  tests/                 # pytest 用例（在 backend 目录下执行）
mcp-server/              # Node MCP 服务
config/                  # 如 mcporter.json
pages/                   # 小程序页面
components/              # 小程序组件
utils/                   # 工具与请求封装（含 runtime-config.js）
Dataset/                 # 量表与数据集
CLOUDBASE_INTEGRATION.md # 云上部署说明
```

## 适用场景

- 面向家长进行婴幼儿语言发育筛查与跟踪。
- 面向研究与服务团队进行测评结果管理与分析。
- 面向教学/路演进行产品能力演示。

## 说明

本 README 用于项目介绍与快速上手。接口与模块细节见 `backend/README.md`；云与 MCP 流程见 `CLOUDBASE_INTEGRATION.md` 与 `backend/docs/` 下专题文档。
