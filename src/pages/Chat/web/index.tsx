import { chatWithAI, deleteChat, getChatHistory, getChats } from '@/services/chat';
import { CloseOutlined, DeleteOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, List, Modal, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import logo from '../../../../public/537.svg';
import { Chat, Message } from '../types';
import { useStyles } from './styles';

const WebChat: React.FC = () => {
  const { styles } = useStyles();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentBufferRef = useRef<string>('');
  const reasoningBufferRef = useRef<string>('');
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const batchSizeRef = useRef<number>(0);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        if (isAtBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const loadChats = async () => {
    try {
      const chatList = await getChats();

      setChats(chatList);
    } catch (error) {
      message.error('加载对话列表失败');
    }
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      const history = await getChatHistory(chatId);
      console.log('加载的历史记录:', history);

      if (!history.messages || !Array.isArray(history.messages)) {
        console.error('历史记录格式错误:', history);
        message.error('加载对话历史失败：数据格式错误');
        return;
      }

      const messagesWithReasoning = history.messages.map((msg: any) => {
        console.log('处理消息:', msg);
        return {
          ...msg,
          reasoning: msg.reasoning || '',
        };
      });

      console.log('处理后的消息:', messagesWithReasoning);
      setMessages(messagesWithReasoning);
    } catch (error) {
      console.error('加载对话历史失败:', error);
      message.error('加载对话历史失败');
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, streamingReasoning]);

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setLoading(false);
    }

    setCurrentChatId(null);
    setMessages([]);
    setInput('');
    setStreamingContent('');
    setStreamingReasoning('');
  };

  const handleDeleteChat = async (chatId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个对话吗？',
      onOk: async () => {
        try {
          await deleteChat(chatId);
          if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
          }
          await loadChats();
          message.success('对话已删除');
        } catch (error) {
          message.error('删除对话失败');
        }
      },
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setLoading(false);
    }
  };

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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingReasoning('');

    contentBufferRef.current = '';
    reasoningBufferRef.current = '';
    batchSizeRef.current = 0;
    lastUpdateTimeRef.current = 0;

    abortControllerRef.current = new AbortController();

    try {
      let chatId = currentChatId;
      const decoder = new TextDecoder();
      let buffer = '';

      const response = await chatWithAI(
        [...messages, userMessage],
        chatId || '',
        abortControllerRef.current.signal,
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

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

            if (parsed.type === 'reasoning' && parsed.reasoning) {
              reasoningBufferRef.current += parsed.reasoning;
            } else if (parsed.type === 'content' && parsed.content) {
              contentBufferRef.current += parsed.content;
            }

            scheduleUpdate(contentBufferRef.current, reasoningBufferRef.current);
          } catch (e) {
            console.error('解析响应数据失败:', e, line);
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: contentBufferRef.current,
          reasoning: reasoningBufferRef.current,
        },
      ]);
      setStreamingContent('');
      setStreamingReasoning('');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        message.info('已停止响应');
      } else {
        console.error('发送消息失败:', error);
        if (error instanceof Error) {
          message.error(`发送消息失败: ${error.message}`);
        } else {
          message.error('发送消息失败，请重试');
        }
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      if (!currentChatId) {
        const chatList = await getChats();
        setChats(chatList);
        setCurrentChatId(chatList[0]._id);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <Button
          type="primary"
          icon={<MessageOutlined />}
          className={styles.newChatButton}
          onClick={handleNewChat}
          disabled={loading || isStreaming}
        >
          新建对话
        </Button>
        <div className={styles.chatList}>
          <List
            dataSource={chats}
            renderItem={(chat) => (
              <div
                className={`${styles.chatItem} ${
                  currentChatId === chat._id ? styles.chatItemActive : ''
                }`}
                onClick={() => setCurrentChatId(chat._id)}
              >
                <div>{chat.title}</div>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat._id);
                  }}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className={styles.chatContainer}>
        {messages.length === 0 && !isStreaming && (
          <div className={styles.welcomeMessage}>
            <img className={styles.logoContainer} src={logo} alt="logo" />
            <p>我是 DeepSeek，很高兴见到你！</p>
          </div>
        )}
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div key={index} className={styles.messageGroup}>
              <div className={styles.messageContent}>
                <div
                  className={`${styles.messageItem} ${
                    msg.role === 'user' ? styles.userMessageItem : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <img className={styles.avatar} src={logo} alt="logo" />
                  )}
                  <div className={styles.messageText}>
                    {msg.role === 'assistant' && msg.reasoning && (
                      <div className={styles.reasoningText}>
                        <div style={{ marginBottom: '4px', fontWeight: 500, color: '#666' }}>
                          思考过程
                        </div>
                        <Markdown>{msg.reasoning}</Markdown>
                      </div>
                    )}
                    <div
                      className={
                        msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                      }
                    >
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(streamingReasoning || streamingContent) && (
            <div className={styles.messageGroup}>
              <div className={styles.messageContent}>
                <div className={styles.messageItem}>
                  <img className={styles.avatar} src={logo} alt="logo" />
                  <div className={styles.messageText}>
                    {streamingReasoning && (
                      <div className={styles.reasoningText}>
                        <div style={{ marginBottom: '4px', fontWeight: 500, color: '#666' }}>
                          思考过程
                        </div>
                        <Markdown>{streamingReasoning}</Markdown>
                      </div>
                    )}
                    {streamingContent && (
                      <div className={styles.assistantMessageText}>
                        <Markdown>{streamingContent}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            {isStreaming && (
              <div className={styles.stopButtonContainer}>
                <Button
                  icon={<CloseOutlined className={styles.stopIcon} />}
                  onClick={handleStop}
                  className={styles.stopButton}
                >
                  停止生成
                </Button>
              </div>
            )}
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入消息，Shift + Enter 换行，Enter 发送"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              className={styles.textArea}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              className={styles.sendButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebChat;
