import { createStyles } from 'antd-style';

export const useSharedStyles = createStyles(({ token }) => ({
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  messageGroup: {
    padding: '12px 0',
  },
  messageContent: {
    maxWidth: '850px',
    margin: '0 auto',
    padding: '0 24px',
  },
  messageItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  userMessageItem: {
    flexDirection: 'row-reverse',
  },
  reasoningText: {
    color: token.colorTextSecondary,
    fontSize: '14px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  userMessageText: {
    background: 'linear-gradient(135deg, #7C4DFF 0%, #5C6BC0 100%)',
    color: '#fff',
    padding: '8px',
    borderRadius: '16px 16px 2px 16px',
  },
  assistantMessageText: {
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 2px',
  },
  stopButton: {
    marginRight: '8px',
  },
}));
