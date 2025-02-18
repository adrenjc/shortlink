import axios from 'axios';

// 环境配置
const API_ENV = process.env.UMI_APP_ENV || 'dev'; // 默认开发环境

// 环境映射配置
const ENV_CONFIG = {
  dev: {
    apiUrl: 'http://localhost:5000/api', // 开发环境
  },
  test: {
    apiUrl: 'http://47.107.251.45/api', // 测试环境
  },
  pre: {
    apiUrl: 'http://47.107.251.45/api', // 预发环境
  },
  prod: {
    apiUrl: 'http://47.107.251.45/api', // 生产环境
  },
};

// 获取当前环境配置
const currentEnv = ENV_CONFIG[API_ENV as keyof typeof ENV_CONFIG] || ENV_CONFIG.dev;

export const API_URL = currentEnv.apiUrl;

// 初始化 axios 实例
const apiClient = axios.create({
  baseURL: API_URL, // 使用动态配置的 API 地址
  timeout: 10000, // 建议适当延长超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config: any) => {
    console.log(process.env);
    // 在发送请求之前做些什么
    config.headers['x-auth-token'] = localStorage.getItem('x-auth-token') || '';
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  },
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response;
  },
  (error) => {
    console.log(error);
    // 对响应错误做点什么
    if (error.response && error.response.status === 401) {
      // 如果响应状态码是 401，表示 token 过期或未授权
      localStorage.removeItem('x-auth-token'); // 清除本地存储中的 token
      // history.replace('/user/login'); // 使用 history 对象进行重定向
    }
    return Promise.reject(error);
  },
);

// 设置请求头的函数
export const setRequestHeader = (key: string, value: string) => {
  apiClient.defaults.headers.common[key] = value;
};

// 封装的网络请求方法
export const apiRequest = {
  get: async (endpoint: string, params = {}, headers = {}) => {
    try {
      const response = await apiClient.get(endpoint, { params, headers });
      return response.data;
    } catch (error) {
      console.error('GET 请求失败:', error);
      throw error;
    }
  },

  post: async (endpoint: string, data = {}, headers = {}) => {
    try {
      const response = await apiClient.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error('POST 请求失败:', error);
      throw error;
    }
  },

  put: async (endpoint: string, data = {}, headers = {}) => {
    try {
      const response = await apiClient.put(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error('PUT 请求失败:', error);
      throw error;
    }
  },

  delete: async (endpoint: string, headers = {}) => {
    try {
      const response = await apiClient.delete(endpoint, { headers });
      return response.data;
    } catch (error) {
      console.error('DELETE 请求失败:', error);
      throw error;
    }
  },
};

// 示例调用
// apiRequest.get('/your-endpoint', { key: 'value' }, { 'Custom-Header': 'value' });
// apiRequest.post('/your-endpoint', { key: 'value' }, { 'Custom-Header': 'value' });
// apiRequest.put('/your-endpoint', { key: 'value' }, { 'Custom-Header': 'value' });
// apiRequest.delete('/your-endpoint', { 'Custom-Header': 'value' });
