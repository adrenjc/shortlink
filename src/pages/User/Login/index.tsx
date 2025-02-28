import { currentUser, login } from '@/services/ant-design-pro/api';
import { Helmet, history, useModel } from '@umijs/max';
import { message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => {
  return {
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
  };
});

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>登录 - {Settings.title}</title>
      </Helmet>

      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>请登录您的账户继续访问</p>

        {userLoginState.status === 'error' && (
          <div className={styles.error}>账户或密码错误，请重试</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>用户名</label>
            <input
              type="text"
              name="username"
              className={styles.input}
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
