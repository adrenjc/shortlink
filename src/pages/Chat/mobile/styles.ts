import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    // height: 'calc(100vh - 126px)',
    background: '#fff',
    padding: '12px',
    // paddingTop: '46px', // 为系统导航栏预留空间
  },
  header: {
    position: 'fixed',
    top: '56px', // 确保在系统导航栏下方
    left: 0,
    right: 0,
    height: '44px',
    background: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    zIndex: 100,
  },
  menuButton: {
    border: 'none',
    padding: '6px',
    fontSize: '18px',
  },
  chatList: {
    position: 'fixed',
    top: '100px', // 56px + 44px
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fff',
    zIndex: 99,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  chatListVisible: {
    transform: 'translateX(0)',
  },
  chatListHeader: {
    height: '44px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
  },
  chatListContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  chatItem: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  messageContainer: {
    flex: 1,
    overflowY: 'hidden',
    // marginTop: '44px',
    // marginBottom: '46px',
    WebkitOverflowScrolling: 'touch',
    // paddingTop: '56px', // 为系统导航预留空间
  },
  welcomeMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 100px)',
    textAlign: 'center',
    color: token.colorTextSecondary,
  },
  logoContainer: {
    width: '48px',
    height: '48px',
    marginBottom: '12px',
  },
  messageItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    maxWidth: '100%',
    marginBottom: '12px',
  },
  userMessage: {
    alignItems: 'flex-end',
    '& p': {
      margin: 0,
    },
  },
  messageContent: {
    padding: '8px 12px',
    borderRadius: '12px',
    wordBreak: 'break-word',
    background: '#f4f4f5',
    color: '#000',
    '& p': {
      margin: 0,
    },
  },
  userMessageContent: {
    background: token.colorPrimary,
    color: '#fff',
    '& p': {
      margin: 0,
    },
  },
  assistantMessageContent: {
    background: '#f4f4f5',
    color: '#000',
    '& p': {
      margin: 0,
    },
  },
  reasoningText: {
    fontSize: '12px',
    color: token.colorTextSecondary,
    marginBottom: '4px',
    padding: '8px',
    background: 'rgba(0,0,0,0.02)',
    borderRadius: '8px',
    alignSelf: 'stretch',
  },
  inputArea: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px 12px',
    background: '#fff',
    borderTop: '1px solid rgba(0,0,0,0.1)',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  textArea: {
    flex: 1,
    padding: '7px 12px',
    maxHeight: '120px',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '14px',
    lineHeight: '20px',
    resize: 'none',
    background: '#f4f4f5',
    '&::placeholder': {
      fontSize: '14px',
    },
  },
  sendButton: {
    padding: 0,
    height: '36px',
    width: '36px',
    minWidth: '36px',
    borderRadius: '50%',
  },
}));
