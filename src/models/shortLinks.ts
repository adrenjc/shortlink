import { message } from 'antd';
import { deleteLink as apiDeleteLink, createShortLink } from '../services/shortUrl/shorturl'; // 引入 API 方法

export default function useShortLinks() {
  const addLink = async (values: any) => {
    const response = await createShortLink(values); // 调用创建短链接的 API
    if (response) {
      message.success('创建成功');
      return true;
    }
    return false;
  };

  const deleteLink = async (id: string) => {
    await apiDeleteLink(id); // 调用删除短链接的 API
    message.success('删除成功');
    return true;
  };

  return { addLink, deleteLink };
}
