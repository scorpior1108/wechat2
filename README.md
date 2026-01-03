# 微信聊天应用

一个模拟微信聊天界面的Web应用，集成AI男友功能，使用沈屿角色设定进行对话。

## 功能特点

- 微信风格聊天界面
- AI女友角色扮演（沈屿）
- 输入状态提示
- 消息时间显示
- 本地存储聊天记录
- 重置对话功能

## 技术栈

- 前端：HTML/CSS/JavaScript
- 后端：Node.js + Express
- AI服务：DeepSeek API
- 容器化：Docker

## 本地开发

### 环境要求

- Node.js 20+
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3333 上运行。

## Docker部署

### 使用Docker Compose

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/wechat-chat-app.git
cd wechat-chat-app
```

2. 创建环境变量文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：

```env
GITHUB_USERNAME=yourusername
AI_API_KEY=your_deepseek_api_key
```

3. 启动服务：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 使用GitHub Packages镜像

1. 登录到GitHub Container Registry：

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin
```

2. 拉取镜像：

```bash
docker pull ghcr.io/yourusername/wechat-chat-app:latest
```

3. 运行容器：

```bash
docker run -d \
  --name wechat-chat-app \
  -p 3333:3333 \
  -e AI_API_KEY=your_deepseek_api_key \
  ghcr.io/yourusername/wechat-chat-app:latest
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `GITHUB_USERNAME` | GitHub用户名（用于构建镜像名称） | `yourusername` |
| `AI_API_KEY` | DeepSeek API密钥 | 必须设置 |

## 配置说明

### AI配置

AI配置支持通过环境变量设置API密钥。在 `server/services/aiService.js` 文件中：

```javascript
const AI_CONFIG = {
  provider: {
    name: 'deepseek',
    apiKey: process.env.AI_API_KEY || 'sk-481eb6044ea0411f85843d1ac7ade922',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-reasoner',
    maxTokens: 2000,
    temperature: 0.8
  }
};
```

如需修改其他配置（如模型名称、基础URL等），请直接编辑该文件。

### 角色设定

修改 `char.txt` 文件来调整AI角色的设定。

## 自动部署

项目使用GitHub Actions进行自动构建和部署：

1. 推送到`main`分支会自动构建并推送Docker镜像
2. 创建版本标签（如`v1.0.0`）会发布对应版本的镜像
3. 镜像会推送到GitHub Container Registry

## 许可证

MIT
