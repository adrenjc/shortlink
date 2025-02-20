import React from 'react';
import Markdown from 'react-markdown';
import { useSharedStyles } from '../styles/shared';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  streamingReasoning: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  streamingContent,
  streamingReasoning,
  messagesEndRef,
}) => {
  const { styles } = useSharedStyles();

  return (
    <div className={styles.messageList}>
      {messages.map((msg, index) => (
        <div key={index} className={styles.messageGroup}>
          <div className={styles.messageContent}>
            <div
              className={`${styles.messageItem} ${
                msg.role === 'user' ? styles.userMessageItem : ''
              }`}
            >
              {msg.role === 'assistant' && msg.reasoning && (
                <div className={styles.reasoningText}>
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
      ))}
      {(streamingReasoning || streamingContent) && (
        <div className={styles.messageGroup}>
          <div className={styles.messageContent}>
            {streamingReasoning && (
              <div className={styles.reasoningText}>
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
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
