import { apiRequest } from '@/services/index';

// 获取域名列表
export const fetchDomains = async () => {
  try {
    const response = await apiRequest.get('/domains');
    return response.data;
  } catch (error) {
    console.error('获取域名列表失败:', error);
    throw error;
  }
};

// 添加域名
export const addDomain = async (domain: string) => {
  try {
    const response = await apiRequest.post('/domains', { domain });
    return response.data;
  } catch (error) {
    console.error('添加域名失败:', error);
    throw error;
  }
};

// 验证域名
export const verifyDomain = async (domain: string) => {
  try {
    const response = await apiRequest.post(`/domains/${domain}/verify`);
    return response.data;
  } catch (error) {
    console.error('验证域名失败:', error);
    throw error;
  }
};

// 删除域名
export const deleteDomain = async (domain: string) => {
  try {
    const response = await apiRequest.delete(`/domains/${domain}`);
    return response.data;
  } catch (error) {
    console.error('删除域名失败:', error);
    throw error;
  }
};

// 导出类型定义
export interface DomainResponse {
  success: boolean;
  data?: any;
  message?: string;
  total?: number;
}

export interface DomainItem {
  _id: string;
  domain: string;
  verified: boolean;
  verificationCode: string;
  createdAt: string;
}
