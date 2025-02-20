import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    background: '#f8f9fa', // 更柔和的背景色
    position: 'relative',
    // height: '100vh',
    // paddingTop: '94px', // 44px(系统) + 50px(自定义header)
  },
  header: {
    position: 'fixed',
    top: '44px', // 保持在系统导航栏下方
    left: 0,
    right: 0,
    height: '50px', // 稍微降低高度
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 900,
  },
  menuButton: {
    border: 'none',
    padding: '8px',
    fontSize: '20px',
    color: '#7C3AED',
    background: 'transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(124, 58, 237, 0.04)',
      transform: 'scale(1.05)',
    },
  },
  chatList: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '85%',
    height: '100%',
    background: '#ffffff',
    zIndex: 1002,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
  },
  chatListVisible: {
    transform: 'translateX(0)',
  },
  chatListHeader: {
    height: '50px',
    marginTop: '44px', // 为系统状态栏预留空间
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: '#fff',
    '& span': {
      fontSize: '16px',
      fontWeight: 500,
    },
  },
  chatListContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    '-webkit-overflow-scrolling': 'touch',
    background: '#fff',
  },
  chatItem: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#333',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:active': {
      background: 'rgba(0,0,0,0.05)',
    },
    '&.active': {
      background: 'rgba(124, 58, 237, 0.08)',
      color: '#7C3AED',
      borderLeft: '3px solid #7C3AED',
    },
  },
  chatItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    overflow: 'hidden',
    '& span': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  deleteButton: {
    opacity: 0.6,
    color: '#666',
    padding: '4px 8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 1,
      color: '#ff4d4f',
      background: 'rgba(255, 77, 79, 0.1)',
    },
  },
  messageContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 12px 50px', // 修改：减小上边距，因为已经有了paddingTop
    scrollBehavior: 'smooth',
    '-webkit-overflow-scrolling': 'touch',
  },
  messageItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '12px',
    maxWidth: '80%', // 减小最大宽度
  },
  userMessage: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginLeft: 'auto', // 确保靠右对齐
    marginRight: '4px', // 添加一点右边距
  },
  messageContent: {
    padding: '10px 14px', // 减小内边距
    borderRadius: '16px',
    fontSize: '14px', // 稍微减小字体
    lineHeight: '1.4',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    '& p': {
      margin: 0,
    },
  },
  userMessageContent: {
    background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  assistantMessageContent: {
    background: '#ffffff',
    color: '#1f2937',
    borderBottomLeftRadius: '4px',
  },
  reasoningText: {
    fontSize: '13px',
    color: token.colorTextSecondary,
    marginBottom: '6px',
    padding: '8px 12px',
    background: '#f5f6f7', // 改用实色背景
    borderRadius: '8px',
    maxWidth: '95%',
    alignSelf: 'flex-start', // 确保靠左对齐
    border: '1px solid rgba(0,0,0,0.04)', // 添加细边框
  },
  inputArea: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px 12px',
    background: '#ffffff',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    maxWidth: '768px',
    margin: '0 auto',
  },
  textArea: {
    flex: 1,
    padding: '8px 12px', // 减小输入框内边距
    maxHeight: '120px',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.08)',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'none',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    '&:focus': {
      borderColor: '#7C3AED',
      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.08)',
    },
    '&::placeholder': {
      color: 'rgba(0,0,0,0.35)',
    },
  },
  sendButton: {
    height: '42px',
    width: '42px',
    minWidth: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    transition: 'all 0.3s ease',
    background: '#7C3AED',
    '&:hover': {
      background: '#6D28D9',
      transform: 'scale(1.05)',
    },
  },
  welcomeMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 220px)', // 调整欢迎消息的位置
    textAlign: 'center',
    color: token.colorTextSecondary,
    '& p': {
      marginTop: '16px',
      fontSize: '16px',
      fontWeight: 500,
    },
  },
  logoContainer: {
    width: '64px',
    height: '64px',
    padding: '12px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1001,
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s ease',
    '&.visible': {
      opacity: 1,
      visibility: 'visible',
    },
  },
  deleteModal: {
    '.ant-modal-content': {
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
  },
  modalContent: {
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#1f2937',
  },
  modalText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    '& .ant-btn': {
      minWidth: '100px',
      borderRadius: '8px',
      height: '36px',
    },
  },
}));
