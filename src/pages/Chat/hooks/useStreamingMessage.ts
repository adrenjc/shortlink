import { chatWithAI } from '@/services/chat';
import { useRef, useState } from 'react';
import { Message } from '../types';

interface UseStreamingMessageProps {
  onFinish?: (content: string, reasoning: string) => void;
}

export const useStreamingMessage = ({ onFinish }: UseStreamingMessageProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');

  const contentBufferRef = useRef<string>('');
  const reasoningBufferRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const batchSizeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scheduleUpdate = (content: string, reasoning: string) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const now = performance.now();
    if (now - lastUpdateTimeRef.current < 16) {
      batchSizeRef.current++;
    } else {
      batchSizeRef.current = 0;
    }

    const shouldUpdate = batchSizeRef.current < 5;

    rafIdRef.current = requestAnimationFrame(() => {
      if (shouldUpdate) {
        setStreamingContent(content);
        setStreamingReasoning(reasoning);
        lastUpdateTimeRef.current = performance.now();
      }
    });
  };

  const resetStream = () => {
    contentBufferRef.current = '';
    reasoningBufferRef.current = '';
    batchSizeRef.current = 0;
    lastUpdateTimeRef.current = 0;
    setStreamingContent('');
    setStreamingReasoning('');
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const streamMessage = async (messages: Message[], chatId: string) => {
    resetStream();
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await chatWithAI(messages, chatId, abortControllerRef.current.signal);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.includes('[DONE]')) continue;

          try {
            const jsonStr = line.replace('data: ', '').trim();
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === 'content' && parsed.content) {
              contentBufferRef.current += parsed.content;
            } else if (parsed.type === 'reasoning' && parsed.reasoning) {
              reasoningBufferRef.current += parsed.reasoning;
            }
            scheduleUpdate(contentBufferRef.current, reasoningBufferRef.current);
          } catch (e) {
            console.error('解析响应数据失败:', e);
          }
        }
      }

      onFinish?.(contentBufferRef.current, reasoningBufferRef.current);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // 处理中止请求的情况
        return;
      }
      // 重新抛出其他错误
      throw error;
    } finally {
      setIsLoading(false);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    }
  };

  return {
    isLoading,
    streamingContent,
    streamingReasoning,
    streamMessage,
    stopStreaming,
    resetStream,
  };
};
