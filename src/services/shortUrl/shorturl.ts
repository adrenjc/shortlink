// src/services/shortUrl/shorturl.ts
import { apiRequest } from '@/services/index'; // 引入封装的请求方法

// 创建短链接
export const createShortLink = async (longUrl: string): Promise<any> => {
  try {
    const response = await apiRequest.post(`/links`, { longUrl });
    return response.data;
  } catch (error) {
    console.error('创建短链接错误:', error);
    throw error; // 抛出错误以便调用者处理
  }
};

// 获取用户所有短链接
export const fetchLinks = async (params?: { [key: string]: any }): Promise<any> => {
  try {
    const response = await apiRequest.get(`/links`, { params });
    return response.data;
  } catch (error) {
    console.error('获取短链接错误:', error);
    throw error; // 抛出错误以便调用者处理
  }
};

// 删除短链接
export const deleteLink = async (id: string): Promise<void> => {
  try {
    await apiRequest.delete(`/links/${id}`);
  } catch (error) {
    console.error('删除短链接错误:', error);
    throw error; // 抛出错误以便调用者处理
  }
};

// 示例：设置请求头
// setRequestHeader('Authorization', 'Bearer your_token'); // 根据需要设置请求头
