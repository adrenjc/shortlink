import { currentUser, login, register } from '@/services/login/';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
    animation: 'fadeIn 0.6s ease-out',

    '@media screen and (max-width: 576px)': {
      padding: '30px 20px',
    },
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#34495e',
    fontSize: '14px',
    marginLeft: '4px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    color: '#2c3e50',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: '0 0 0 2px rgba(52, 152, 219, 0.1)',

    '&:focus': {
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.3)',
    },

    '&::placeholder': {
      color: '#bdc3c7',
    },
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#e74c3c',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #ffd5d5',

    '&::before': {
      content: '"⚠"',
      fontSize: '16px',
    },
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#d9b68c',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',

    '&:hover': {
      backgroundColor: '#c69c7a',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(215, 182, 140, 0.2)',
    },

    '&:disabled': {
      backgroundColor: '#bdc3c7',
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  tabs: {
    marginBottom: '24px',
    '.ant-tabs-nav': {
      marginBottom: '24px',
      '&::before': {
        border: 'none',
      },
    },
    '.ant-tabs-tab': {
      padding: '12px 0',
      fontSize: '16px',
      '&.ant-tabs-tab-active .ant-tabs-tab-btn': {
        color: '#d9b68c',
      },
    },
    '.ant-tabs-ink-bar': {
      backgroundColor: '#d9b68c',
    },
  },
  registerForm: {
    '.ant-form-item': {
      marginBottom: '24px',
    },
  },
  passwordStrength: {
    marginTop: '4px',
    fontSize: '12px',
    '&.weak': { color: '#ff4d4f' },
    '&.medium': { color: '#faad14' },
    '&.strong': { color: '#52c41a' },
  },
}));

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const fetchUserInfo = async () => {
    const userInfo = await currentUser();
    console.log(userInfo, '看一下用户信息');
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(loginForm);
      if (result.token) {
        message.success('登录成功！');
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      setUserLoginState(result);
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!registerForm.username || !registerForm.password) {
      message.error('用户名和密码不能为空！');
      return;
    }

    if (registerForm.username.length < 3) {
      message.error('用户名至少需要3个字符！');
      return;
    }

    if (registerForm.password.length < 6) {
      message.error('密码至少需要6个字符！');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      // 调用注册接口
      const result = await register({
        username: registerForm.username,
        password: registerForm.password,
      });

      // 如果注册接口返回了token，直接保存并获取用户信息
      if (result.token) {
        localStorage.setItem('x-auth-token', result.token);
        message.success('注册成功！');

        // 获取用户信息
        await fetchUserInfo();

        // 跳转到首页或指定的重定向页面
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
      } else {
        // 如果没有返回token，切换到登录页面
        message.success('注册成功，请登录！');
        setActiveTab('login');
        // 自动填充登录表单
        setLoginForm({
          username: registerForm.username,
          password: registerForm.password,
        });
      }

      // 清空注册表单
      setRegisterForm({
        username: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = (
    <form className={styles.form} onSubmit={handleLogin}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>用户名</label>
        <input
          type="text"
          name="username"
          className={styles.input}
          placeholder="请输入用户名"
          value={loginForm.username}
          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>密码</label>
        <input
          type="password"
          name="password"
          className={styles.input}
          placeholder="请输入密码"
          value={loginForm.password}
          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          required
        />
      </div>

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );

  const RegisterForm = (
    <form className={`${styles.form} ${styles.registerForm}`} onSubmit={handleRegister}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>用户名</label>
        <input
          type="text"
          name="username"
          className={styles.input}
          placeholder="请输入用户名（至少3个字符）"
          value={registerForm.username}
          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
          required
          minLength={3}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>密码</label>
        <input
          type="password"
          name="password"
          className={styles.input}
          placeholder="请输入密码（至少6个字符）"
          value={registerForm.password}
          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          required
          minLength={6}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>确认密码</label>
        <input
          type="password"
          name="confirmPassword"
          className={styles.input}
          placeholder="请再次输入密码"
          value={registerForm.confirmPassword}
          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
          required
        />
      </div>

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  );

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {activeTab === 'login' ? '登录' : '注册'} - {Settings.title}
        </title>
      </Helmet>

      <div className={styles.loginCard}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          className={styles.tabs}
          items={[
            {
              key: 'login',
              label: '账号登录',
              children: (
                <>
                  {userLoginState.status === 'error' && (
                    <div className={styles.error}>账户或密码错误，请重试</div>
                  )}
                  {LoginForm}
                </>
              ),
            },
            {
              key: 'register',
              label: '注册账号',
              children: RegisterForm,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Login;
