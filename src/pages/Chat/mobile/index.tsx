import { chatWithAI, getChatHistory, getChats } from '@/services/chat';
import {
  FullscreenExitOutlined,
  SendOutlined,
  SlidersOutlined,
  WechatWorkOutlined,
} from '@ant-design/icons';
import { Button, Input, List, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import logo from '../../../../public/537.svg';
import { useStyles } from './styles';

const MobileChat: React.FC = () => {
  const { styles } = useStyles();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const loadChats = async () => {
    try {
      const chatList = await getChats();
      setChats(chatList);
    } catch (error) {
      message.error('加载对话列表失败');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, streamingReasoning]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChatHistory = async (chatId: string) => {
    try {
      const history = await getChatHistory(chatId);
      setMessages(history.messages);
    } catch (error) {
      message.error('加载对话历史失败');
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setStreamingContent('');
    setStreamingReasoning('');
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setStreamingContent('');
    setStreamingReasoning('');
    setInput('');

    try {
      const response = await chatWithAI([...messages, newMessage], currentChatId || '');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let fullContent = '';
      let fullReasoning = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            if (data.type === 'content') {
              fullContent += data.content;
              setStreamingContent(fullContent);
            } else if (data.type === 'reasoning') {
              fullReasoning += data.reasoning;
              setStreamingReasoning(fullReasoning);
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullContent, reasoning: fullReasoning },
      ]);
      setStreamingContent('');
      setStreamingReasoning('');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        message.info('已停止响应');
      } else {
        if (error instanceof Error) {
          message.error(`发送消息失败: ${error.message}`);
        } else {
          message.error('发送消息失败，请重试');
        }
      }
    } finally {
      loadChats();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Button
          type="text"
          icon={<SlidersOutlined />}
          onClick={() => setIsMenuVisible(!isMenuVisible)}
          className={styles.menuButton}
        />
        <Button
          type="text"
          icon={<WechatWorkOutlined />}
          onClick={handleNewChat}
          className={styles.menuButton}
        ></Button>
      </div>

      <div className={`${styles.chatList} ${isMenuVisible ? styles.chatListVisible : ''}`}>
        <div className={styles.chatListHeader}>
          <span>对话列表</span>
          <Button
            type="text"
            icon={<FullscreenExitOutlined />}
            onClick={() => setIsMenuVisible(false)}
          />
        </div>
        <div className={styles.chatListContent}>
          <List
            dataSource={chats}
            renderItem={(chat) => (
              <div
                className={styles.chatItem}
                onClick={() => {
                  setCurrentChatId(chat._id);
                  loadChatHistory(chat._id);
                  setIsMenuVisible(false); // 关闭遮罩
                }}
              >
                <span>{chat.title}</span>
              </div>
            )}
          />
        </div>
      </div>

      <div className={styles.messageContainer}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <img className={styles.logoContainer} src={logo} alt="logo" />
            <p>我是 DeepSeek，很高兴见到你！</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageItem} ${msg.role === 'user' ? styles.userMessage : ''}`}
          >
            {msg.reasoning && (
              <div className={styles.reasoningText}>
                <Markdown>{msg.reasoning}</Markdown>
              </div>
            )}
            <div
              className={`${styles.messageContent} ${
                msg.role === 'user' ? styles.userMessageContent : styles.assistantMessageContent
              }`}
            >
              <Markdown>{msg.content}</Markdown>
            </div>
          </div>
        ))}
        {streamingReasoning && (
          <div className={styles.reasoningText}>
            <Markdown>{streamingReasoning}</Markdown>
          </div>
        )}

        {streamingContent && (
          <div className={`${styles.messageItem}`}>
            <div className={styles.assistantMessageContent}>
              <Markdown>{streamingContent}</Markdown>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className={styles.textArea}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            className={styles.sendButton}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileChat;
