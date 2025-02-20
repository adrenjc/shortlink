import { chatWithAI, deleteChat, getChatHistory, getChats } from '@/services/chat';
import {
  ContainerOutlined,
  DeleteOutlined,
  FullscreenExitOutlined,
  SendOutlined,
  SlidersOutlined,
  WechatWorkOutlined,
} from '@ant-design/icons';
import { Button, Input, List, Modal, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import logo from '../../../../public/537.svg';
import { useStyles } from './styles';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

interface Chat {
  _id: string;
  title: string;
}

const MobileChat: React.FC = () => {
  const { styles } = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

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
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newMessage = { role: 'user' as const, content: input.trim() };
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
            try {
              const data = JSON.parse(line.substring(6));
              if (data.type === 'content') {
                fullContent += data.content;
                setStreamingContent(fullContent);
              } else if (data.type === 'reasoning') {
                fullReasoning += data.reasoning;
                setStreamingReasoning(fullReasoning);
              }
            } catch (e) {
              console.error('Parse streaming data failed:', e);
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullContent, reasoning: fullReasoning },
      ]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        message.info('已停止响应');
      } else {
        message.error(
          error instanceof Error ? `发送消息失败: ${error.message}` : '发送消息失败，请重试',
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      setStreamingReasoning('');
      if (!currentChatId) {
        const chatList = await getChats();
        setChats(chatList);
        setCurrentChatId(chatList[0]._id);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      message.success('对话已删除');
      const updatedChats = await getChats();
      setChats(updatedChats);
      if (chatId === currentChatId) {
        setCurrentChatId('');
        setMessages([]);
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
    setDeletingChatId(null);
  };

  const showDeleteConfirm = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    setIsMenuVisible(false);
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isMenuVisible ? 'visible' : ''}`}
        onClick={() => setIsMenuVisible(false)}
      />

      <aside className={`${styles.chatList} ${isMenuVisible ? styles.chatListVisible : ''}`}>
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
                key={chat._id}
                className={`${styles.chatItem} ${chat._id === currentChatId ? styles.active : ''}`}
                onClick={() => {
                  setCurrentChatId(chat._id);
                  loadChatHistory(chat._id);
                  setIsMenuVisible(false);
                }}
              >
                <div className={styles.chatItemLeft}>
                  <ContainerOutlined style={{ fontSize: '16px', opacity: 0.7, color: '#7C3AED' }} />
                  <span>{chat.title}</span>
                </div>
                <Button
                  type="text"
                  className={styles.deleteButton}
                  icon={<DeleteOutlined />}
                  onClick={(e) => showDeleteConfirm(chat._id, e)}
                />
              </div>
            )}
          />
        </div>
      </aside>

      <Modal
        title={null}
        open={!!deletingChatId}
        onCancel={() => setDeletingChatId(null)}
        footer={null}
        width={300}
        className={styles.deleteModal}
        maskStyle={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>删除对话</div>
          <div className={styles.modalText}>确定要删除这个对话吗？此操作无法撤销。</div>
          <div className={styles.modalButtons}>
            <Button onClick={() => setDeletingChatId(null)}>取消</Button>
            <Button
              type="primary"
              danger
              onClick={() => deletingChatId && handleDeleteChat(deletingChatId)}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>

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
          />
        </div>

        <div className={styles.messageContainer}>
          {messages.length === 0 && (
            <div className={styles.welcomeMessage}>
              <div className={styles.logoContainer}>
                <img src={logo} alt="logo" style={{ width: '100%', height: '100%' }} />
              </div>
              <p>Hi，我是 DeepSeek，让我们开始对话吧！</p>
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
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className={styles.textArea}
              disabled={isLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              className={styles.sendButton}
              loading={isLoading}
              disabled={!input.trim() || isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileChat;
