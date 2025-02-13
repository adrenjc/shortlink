// @ts-ignore
/* eslint-disable */
import { apiRequest } from '@/services/index'; // 引入封装的请求方法
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser() {
  // return request<{
  //   data: API.CurrentUser;
  // }>('/api/currentUser', {
  //   method: 'GET',
  //   ...(options || {}),
  // });

  try {
    const response = await apiRequest.get(`/user`);
    return response;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error; // 抛出错误以便调用者处理
  }
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login */
export async function login(body: API.LoginParams) {
  apiRequest;
  try {
    const response = await apiRequest.post(`/login`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    const token = response.token;
    if (token) {
      localStorage.setItem('x-auth-token', token);
    }

    return response;
  } catch (error) {
    console.error('登录失败:', error);
    throw error; // 抛出错误以便调用者处理
  }
}
