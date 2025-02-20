import { Message } from '../types';

export const processStreamingResponse = (
  line: string,
  contentBuffer: string,
  reasoningBuffer: string,
) => {
  try {
    const jsonStr = line.replace('data: ', '').trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.type === 'content' && parsed.content) {
      return { content: contentBuffer + parsed.content, reasoning: reasoningBuffer };
    } else if (parsed.type === 'reasoning' && parsed.reasoning) {
      return { content: contentBuffer, reasoning: reasoningBuffer + parsed.reasoning };
    }
  } catch (e) {
    console.error('解析响应数据失败:', e);
  }
  return { content: contentBuffer, reasoning: reasoningBuffer };
};

export const createAssistantMessage = (content: string, reasoning: string): Message => ({
  role: 'assistant',
  content,
  reasoning,
});
