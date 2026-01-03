const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 读取AI配置和角色设定
const aiConfigPath = path.join(__dirname, '../../AI info.txt');
const charConfigPath = path.join(__dirname, '../../char.txt');

// AI配置，使用环境变量配置API key
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

// 读取角色设定
const charContent = fs.readFileSync(charConfigPath, 'utf8');

// 构建系统提示词
const buildSystemPrompt = () => {
  return `你是沈屿，24岁，请严格按照以下角色设定进行对话：

${charContent}

请记住：
1. 提问后常紧跟自我贬低或给对方"出路"的话
2. 不要开启以自己为中心的话题
3. 不要使用括号描述动作或心理
4. 保持微信聊天样式，回复不要过长
5. 不要直接复制人设档案内容

现在开始，你就是沈屿，用符合上述设定的方式与我进行微信风格的对话。你的开场应该是主动的、关心的、且卑微的提问。`;
};

// 获取AI回复
const getAIResponse = async (message, conversationHistory = []) => {
  try {
    // 检查是否是重置对话命令
    if (message === '[RESET_CONVERSATION]') {
      // 重置对话时，只发送系统提示词，不包含任何历史记录
      const messages = [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: '请重新开始我们的对话，用你的角色设定向我打个招呼。' }
      ];
      
      const response = await axios.post(
        `${AI_CONFIG.provider.baseURL}/chat/completions`,
        {
          model: AI_CONFIG.provider.model,
          messages: messages,
          max_tokens: AI_CONFIG.provider.maxTokens,
          temperature: AI_CONFIG.provider.temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${AI_CONFIG.provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const reply = response.data.choices[0]?.message?.content || '那个…你好，我们重新开始吧？';
      return reply;
    }
    
    // 构建消息历史
    const messages = [
      { role: 'system', content: buildSystemPrompt() }
    ];

    // 添加对话历史（最近5轮对话）
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(item => {
      messages.push({ role: item.role, content: item.content });
    });

    // 添加当前用户消息
    messages.push({ role: 'user', content: message });

    // 调用DeepSeek API
    const response = await axios.post(
      `${AI_CONFIG.provider.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.provider.model,
        messages: messages,
        max_tokens: AI_CONFIG.provider.maxTokens,
        temperature: AI_CONFIG.provider.temperature,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0]?.message?.content || '抱歉，我现在有点忙，晚点回复你。';
    
    // 确保回复符合角色设定（短句、简洁）
    if (reply.length > 100) {
      return reply.substring(0, 100) + '...';
    }
    
    return reply;
  } catch (error) {
    console.error('AI服务错误:', error);
    
    // 根据错误类型返回不同的回复
    if (error.response?.status === 429) {
      return '消息发得太快了，等一下再发吧。';
    } else if (error.code === 'ECONNABORTED') {
      return '网络有点问题，再发一次试试？';
    } else {
      return '现在有点忙，晚点聊。';
    }
  }
};

module.exports = {
  getAIResponse
};