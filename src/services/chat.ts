import { API_URL } from './index';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
}

export interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// 获取对话列表
export async function getChats() {
  try {
    const response = await fetch(`${API_URL}/chats`, {
      headers: {
        'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Get Chats Error:', error);
    throw error;
  }
}

// 获取特定对话历史
export async function getChatHistory(chatId: string) {
  try {
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      headers: {
        'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API 返回的原始数据:', result); // 添加日志

    // 确保返回正确的数据结构
    if (!result.data || !result.data.messages) {
      throw new Error('Invalid response format');
    }

    // 确保每条消息都包含必要的字段
    const processedMessages = result.data.messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
      reasoning: msg.reasoning_content || '', // 确保 reasoning 字段存在
    }));

    return {
      ...result.data,
      messages: processedMessages,
    };
  } catch (error) {
    console.error('Get Chat History Error:', error);
    throw error;
  }
}

// 删除对话
export async function deleteChat(chatId: string) {
  try {
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete Chat Error:', error);
    throw error;
  }
}

// 修改现有的 chatWithAI 函数
export async function chatWithAI(messages: Message[], chatId?: string, signal?: AbortSignal) {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
      },
      body: JSON.stringify({ messages, chatId }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
}
