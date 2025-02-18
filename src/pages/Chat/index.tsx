import { Chat, Message, chatWithAI, deleteChat, getChatHistory, getChats } from '@/services/chat';
import { CloseOutlined, DeleteOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, List, Modal, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import logo from '../../../public/537.svg';

const useStyles = createStyles(({ token }) => ({
  pageContainer: {
    display: 'flex',
    height: `calc(100vh - 126px)`,
    backgroundColor: '#f0f2f5',
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  chatItem: {
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
  },
  chatItemActive: {
    backgroundColor: token.colorPrimaryBg,
    '&:hover': {
      backgroundColor: token.colorPrimaryBg,
    },
  },
  newChatButton: {
    margin: '12px',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.2)',
      },
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  },
  messageGroup: {
    padding: '16px 0',
    '&:first-child': {
      marginTop: 'auto',
    },
  },
  messageContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  },
  messageItem: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  userMessageItem: {
    flexDirection: 'row-reverse',
    gap: '0',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: token.colorPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '16px',
    flexShrink: 0,
    marginRight: '12px',
  },
  messageText: {
    flex: '0 1 auto',
    fontSize: '16px',
    lineHeight: 1.6,
    maxWidth: '60%',
  },
  userMessageText: {
    backgroundColor: token.colorPrimary,
    color: '#fff',
    padding: '8px',
    borderRadius: '12px',
    marginLeft: 'auto',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    '& p': {
      margin: 0,
    },
  },
  assistantMessageText: {
    backgroundColor: '#f4f6f8',
    padding: '8px',
    borderRadius: '12px',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    '& p': {
      margin: 0,
    },
  },
  reasoningText: {
    color: token.colorTextSecondary,
    fontSize: '14px',
    fontStyle: 'italic',
    padding: '8px 12px',
    backgroundColor: 'rgba(247,247,248,0.8)',
    borderRadius: '6px',
    marginBottom: '12px',
    borderLeft: `3px solid ${token.colorPrimary}`,
    maxWidth: '100%',
    '& p': {
      margin: 0,
    },
  },
  inputArea: {
    borderTop: '1px solid rgba(0,0,0,0.1)',
    padding: '24px',
    position: 'relative',
    backgroundColor: '#fff',
  },
  inputContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  },
  textArea: {
    padding: '12px 16px',
    paddingRight: '48px',
    resize: 'none',
    borderRadius: '12px',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    fontSize: '16px',
    lineHeight: '24px',
    '&:focus': {
      boxShadow: `0 0 0 1px ${token.colorPrimary}`,
    },
  },
  sendButton: {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: '8px',
  },
  stopButtonContainer: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '30px',
    zIndex: 100,
  },
  stopButton: {
    borderRadius: '24px',
    padding: '6px 24px',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    color: token.colorTextSecondary,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      color: token.colorText,
    },
  },
  stopIcon: {
    fontSize: '16px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '18px',
    marginRight: '10px',
    width: '50px',
    height: '50px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  },
  welcomeMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '24px',
    fontWeight: 'bold',
    color: token.colorTextSecondary,
  },
}));

const ChatPage: React.FC = () => {
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
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingReasoning('');

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatWithAI(
        [...messages, userMessage],
        currentChatId || '',
        abortControllerRef.current.signal,
      );
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let fullContent = '';
      let fullReasoning = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.includes('[DONE]')) continue;

          try {
            const jsonStr = line.replace('data: ', '').trim();
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === 'reasoning' && parsed.reasoning) {
              fullReasoning += parsed.reasoning;
              setStreamingReasoning(fullReasoning);
            } else if (parsed.type === 'content' && parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch (e) {
            console.error('解析响应数据失败:', e, line);
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fullContent,
          reasoning: fullReasoning,
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
      loadChats();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <Button
          type="primary"
          icon={<MessageOutlined />}
          className={styles.newChatButton}
          onClick={handleNewChat}
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
                        思考过程：
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
                        思考过程：
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

export default ChatPage;
