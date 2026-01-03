// DOM元素
const chatContent = document.getElementById('chatContent');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const resetButton = document.getElementById('resetButton');
const confirmDialog = document.getElementById('confirmDialog');
const cancelButton = document.getElementById('cancelButton');
const confirmButton = document.getElementById('confirmButton');

// 聊天历史记录
let conversationHistory = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 从本地存储加载聊天历史
    loadChatHistory();
    
    // 绑定事件监听器
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 重置按钮事件
    resetButton.addEventListener('click', showResetDialog);
    cancelButton.addEventListener('click', hideResetDialog);
    confirmButton.addEventListener('click', resetChat);
    
    // 显示初始消息
    if (conversationHistory.length === 0) {
        addAIMessage('那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？');
        conversationHistory.push({ role: 'assistant', content: '那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？' });
        saveChatHistory();
    }
    
    // 滚动到底部
    scrollToBottom();
});

// 发送消息
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // 清空输入框
    messageInput.value = '';
    
    // 添加用户消息到界面
    addUserMessage(message);
    
    // 保存到历史记录
    conversationHistory.push({ role: 'user', content: message });
    
    // 保存到本地存储
    saveChatHistory();
    
    // 显示输入状态提示
    showTypingIndicator();
    
    // 禁用发送按钮
    sendButton.disabled = true;
    
    try {
        // 发送消息到后端API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        
        const data = await response.json();
        
        // 隐藏输入状态提示
        hideTypingIndicator();
        
        // 添加AI回复
        addAIMessage(data.reply);
        
        // 保存AI回复到历史记录
        conversationHistory.push({ role: 'assistant', content: data.reply });
        
        // 保存到本地存储
        saveChatHistory();
        
    } catch (error) {
        console.error('发送消息错误:', error);
        
        // 隐藏输入状态提示
        hideTypingIndicator();
        
        // 显示错误消息
        addAIMessage('网络有点问题，再发一次试试？');
        
        // 从历史记录中移除用户消息（因为发送失败）
        conversationHistory.pop();
    } finally {
        // 重新启用发送按钮
        sendButton.disabled = false;
        
        // 滚动到底部
        scrollToBottom();
    }
}

// 添加用户消息到界面
function addUserMessage(message) {
    const messageElement = createMessageElement('user', message);
    chatContent.appendChild(messageElement);
    scrollToBottom();
}

// 添加AI消息到界面
function addAIMessage(message) {
    const messageElement = createMessageElement('ai', message);
    chatContent.appendChild(messageElement);
    scrollToBottom();
}

// 创建消息元素
function createMessageElement(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    // 创建头像
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const img = document.createElement('img');
    img.src = type === 'ai' ? 'images/boy.png' : 'images/girl.png';
    img.alt = type === 'ai' ? '沈屿' : '我';
    
    avatarDiv.appendChild(img);
    
    // 创建消息内容
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = message;
    
    // 创建时间
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getCurrentTime();
    
    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timeDiv);
    
    // 组装消息
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
}

// 显示输入状态提示
function showTypingIndicator() {
    typingIndicator.classList.add('active');
    scrollToBottom();
}

// 隐藏输入状态提示
function hideTypingIndicator() {
    typingIndicator.classList.remove('active');
}

// 滚动到底部
function scrollToBottom() {
    setTimeout(() => {
        chatContent.scrollTop = chatContent.scrollHeight;
    }, 100);
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 保存聊天历史到本地存储
function saveChatHistory() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
    } catch (error) {
        console.error('保存聊天历史失败:', error);
    }
}

// 从本地存储加载聊天历史
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            
            // 重建聊天界面
            conversationHistory.forEach(item => {
                if (item.role === 'user') {
                    addUserMessage(item.content);
                } else if (item.role === 'assistant') {
                    addAIMessage(item.content);
                }
            });
        }
    } catch (error) {
        console.error('加载聊天历史失败:', error);
        conversationHistory = [];
    }
}

// 清空聊天历史
function clearChatHistory() {
    if (confirm('确定要清空聊天记录吗？')) {
        conversationHistory = [];
        localStorage.removeItem('chatHistory');
        chatContent.innerHTML = '';
        
        // 重新显示初始消息
        addAIMessage('早。客户又让我改第三稿，困。');
        conversationHistory.push({ role: 'assistant', content: '早。客户又让我改第三稿，困。' });
        saveChatHistory();
    }
}

// 显示重置对话框
function showResetDialog() {
    confirmDialog.classList.add('active');
}

// 隐藏重置对话框
function hideResetDialog() {
    confirmDialog.classList.remove('active');
}

// 重置聊天对话
async function resetChat() {
    // 隐藏对话框
    hideResetDialog();
    
    // 清空聊天历史
    conversationHistory = [];
    localStorage.removeItem('chatHistory');
    
    // 清空聊天界面
    chatContent.innerHTML = '';
    
    // 向AI API发送重置命令
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '[RESET_CONVERSATION]',
                conversationHistory: []
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // 使用AI的回复作为新的初始消息
            addAIMessage(data.reply);
            conversationHistory.push({ role: 'assistant', content: data.reply });
            saveChatHistory();
        } else {
            // 如果API调用失败，使用默认初始消息
            addAIMessage('那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？');
            conversationHistory.push({ role: 'assistant', content: '那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？' });
            saveChatHistory();
        }
    } catch (error) {
        console.error('重置对话API调用失败:', error);
        // 如果API调用失败，使用默认初始消息
        addAIMessage('那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？');
        conversationHistory.push({ role: 'assistant', content: '那个…早上好。今天天气好像有点凉，你…出门多穿件衣服了吗？' });
        saveChatHistory();
    }
    
    // 聚焦输入框
    messageInput.focus();
}

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // Esc 键关闭对话框或清空输入框
    if (e.key === 'Escape') {
        if (confirmDialog.classList.contains('active')) {
            hideResetDialog();
        } else {
            messageInput.value = '';
            messageInput.focus();
        }
    }
    
    // 在对话框中按Enter确认
    if (e.key === 'Enter' && confirmDialog.classList.contains('active')) {
        resetChat();
    }
});