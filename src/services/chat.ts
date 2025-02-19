import { API_URL, apiRequest } from './index';

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

/**
 * 获取所有对话
 * @returns {Promise<Chat[]>} 返回用户的所有对话
 * @throws {Error} 如果请求失败或响应格式不正确
 */
export async function getChats(): Promise<Chat[]> {
  try {
    const response = await apiRequest.get(`/chats`);
    // const response = await fetch(`${API_URL}/chats`, {
    //   headers: {
    //     'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
    //   },
    // });

    if (!response.data.success) {
      throw new Error(`HTTP error! status: ${response.data.message}`);
    }

    const result = await response.data;
    return result.data;
  } catch (error) {
    console.error('Get Chats Error:', error);
    throw error;
  }
}

/**
 * 获取特定对话的历史记录
 * @param {string} chatId - 对话的唯一标识符
 * @returns {Promise<{ messages: Message[] }>} 返回指定对话的历史记录
 * @throws {Error} 如果请求失败或响应格式不正确
 */
export async function getChatHistory(chatId: string): Promise<{ messages: Message[] }> {
  // console.log(response1, 'response1');
  try {
    const response = await apiRequest.get(`/chats/${chatId}`);
    const result = response.data;

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

/**
 * 删除特定对话
 * @param {string} chatId - 对话的唯一标识符
 * @returns {Promise<{ success: boolean, message: string }>} 返回删除结果
 * @throws {Error} 如果请求失败或响应格式不正确
 */
export async function deleteChat(chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest.delete(`/chats/${chatId}`);
    // const response = await fetch(`${API_URL}/chats/${chatId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'x-auth-token': `${localStorage.getItem('x-auth-token')}`,
    //   },
    // });

    if (!response.data.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.data;
  } catch (error) {
    console.error('Delete Chat Error:', error);
    throw error;
  }
}

/**
 * 流式聊天
 * @param {Message[]} messages - 包含聊天消息的数组，每个消息应包含 role 和 content 字段
 * @param {string} [chatId] - 如果存在，更新现有对话
 * @param {AbortSignal} [signal] - 可选的中止信号
 * @returns {Promise<Response>} 返回流式响应
 * @throws {Error} 如果请求失败或响应格式不正确
 */
export async function chatWithAI(
  messages: Message[],
  chatId?: string,
  signal?: AbortSignal,
): Promise<Response> {
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
