import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Select, Space } from 'antd';
import { LockOutlined, UserOutlined, PhoneOutlined, MailOutlined} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCloudbaseAuth, getAuthHeader } from '../cloudbase';
import { paymentService } from '../services/paymentService';
import { useI18n } from '../contexts/I18nContext';
import AuthService from '../services/authService';
import { setCurrentUserId } from '../services/shortplayService';
import { log } from 'console';

const { Title, Text } = Typography;
const { Option } = Select;

// 手机号验证规则配置
const phoneValidationRules = {
    '86': { length: 11, pattern: /^1[3-9]\d{9}$/ }, // 中国大陆
    '852': { length: 8, pattern: /^[5-9]\d{7}$/ }, // 香港
    '853': { length: 8, pattern: /^6\d{7}$/ }, // 澳门
    '886': { length: 9, pattern: /^9\d{8}$/ }, // 台湾
};

// 验证手机号是否符合对应国家/地区的格式
function validatePhoneNumber(phone, countryCode) {
    const cc = countryCode.replace(/^\+/, '');
    const rule = phoneValidationRules[cc];

    if (!rule) {
        // 对于未配置的国家，使用通用规则
        return /^[0-9]{4,20}$/.test(phone);
    }

    return phone.length === rule.length && rule.pattern.test(phone);
}

// 手机号格式化函数，严格按照 ^\+[1-9]\d{0,3}\s\d{4,20}$ 规则
function formatPhoneNumber(phone, countryCode = '+86') {
    let p = phone.trim().replace(/\s+/g, '');

    // 提取纯数字手机号
    if (/^[0-9]{4,20}$/.test(p)) {
        // 处理区号：移除+号和空格，验证格式
        let cc = countryCode.trim().replace(/\s+/g, '').replace(/^\+/, '');
        // 区号只允许1-4位数字，且首位不能为0
        if (!/^[1-9]\d{0,3}$/.test(cc)) {
            cc = '86'; // 默认中国大陆
        }
        return `+${cc} ${p}`;
    }

    // +区号手机号（无空格），插入空格
    if (/^\+[1-9]\d{0,3}[0-9]{4,20}$/.test(p)) {
        return p.replace(/^(\+[1-9]\d{0,3})([0-9]{4,20})$/, '$1 $2');
    }

    // 已经是正确格式
    if (/^\+[1-9]\d{0,3}\s[0-9]{4,20}$/.test(p)) {
        return p;
    }

    // 兜底：如果都不匹配，返回原始输入
    return p;
}

const emailValidationRules = {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // 简单的邮箱正则表达式
};

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'phone' | 'account' | 'email'>('account');
    const [countryCode, setCountryCode] = useState('+86');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verification, setVerification] = useState<any>(null);
    const [verificationTokenRes, setVerificationTokenRes] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [debugPhone, setDebugPhone] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useI18n();

    // 获取用户信息并更新AuthContext
    const fetchAndUpdateUserInfo = async (authHeader: string) => {
        try {
            const userInfoResult = await paymentService.getUserInfo();
            if (userInfoResult.success && userInfoResult.data) {
                const userData = userInfoResult.data;
                // 将云函数返回的用户数据转换为AuthContext期望的格式
                const authUserData = {
                    user_id: userData.user_id || 0,
                    user_name: userData.user_name || '用户',
                    user_email: userData.user_email || '',
                    user_plan: userData.user_plan || 'free',
                    user_point: userData.user_point || '0',
                    subscription_expires_at: userData.subscription_expires_at,
                    subscription_status: userData.subscription_status,
                    userId: userData.userId || userData.user_id || 0  // 确保userId存在
                };
                // 提取纯token，去掉Bearer前缀
                const token = authHeader ? authHeader.replace('Bearer ', '') : null;
                await login(authUserData, token || '');
                return true;
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
        return false;
    };

    // 在手机号输入时，实时显示格式化后的手机号
    React.useEffect(() => {
        setDebugPhone(formatPhoneNumber(phone, countryCode));
    }, [phone, countryCode]);

    const validateEmail = (email: string) => {
        return emailValidationRules.pattern.test(email);
    };

    // 获取验证码
    const handleGetCode = async () => {
        if (!phone) {
            message.error(t('login.phoneRequired'));
            return;
        }

        // 验证手机号格式
        if (!validatePhoneNumber(phone, countryCode)) {
            const cc = countryCode.replace(/^\+/, '');
            const rule = phoneValidationRules[cc];
            if (rule) {
                message.error(t('login.pleaseEnterValidPhone'));
            } else {
                message.error(t('login.pleaseEnterValidPhone'));
            }
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            const phoneNumber = formatPhoneNumber(phone, countryCode);
            console.log('发送验证码到:', phoneNumber);
            const verification = await getCloudbaseAuth().getVerification({ phone_number: phoneNumber });
            setVerification(verification);
            setMsg(t('login.codeSentMessage'));
            message.success(t('login.codeSent'));
        } catch (e) {
            console.error('发送验证码失败:', e);
            const errorMsg = e.message || t('login.getCodeFailed');
            setMsg(`${t('login.getCodeFailed')}: ${errorMsg}`);
            message.error(`${t('login.getCodeFailed')}: ${errorMsg}`);
        }
        setLoading(false);
    };

    // 手机号验证码登录
    const handlePhoneLogin = async () => {
        if (!phone || !code) {
            message.error(t('login.pleaseFillCompleteInfo'));
            return;
        }

        if (!verification) {
            message.error(t('login.pleaseGetCodeFirst'));
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            const phoneNumber = formatPhoneNumber(phone, countryCode);

            // 1. 校验验证码
            const verificationTokenRes = await getCloudbaseAuth().verify({
                verification_id: verification.verification_id,
                verification_code: code,
            });
            setVerificationTokenRes(verificationTokenRes);

            // 2. 登录
            await getCloudbaseAuth().signIn({
                username: phoneNumber,
                verification_token: verificationTokenRes.verification_token,
            });

            setMsg(t('login.loginSuccess'));
            // message.success(t('login.loginSuccess')); // 去掉登录成功的toast提示
            const authHeader = getAuthHeader();
            // 提取纯token，去掉Bearer前缀
            const token = authHeader ? authHeader.replace('Bearer ', '') : null;
            
            // 获取用户信息并更新AuthContext
            const userInfoUpdated = await fetchAndUpdateUserInfo(authHeader);

            // 获取返回路径
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            const finalRedirectPath = (redirectPath && redirectPath !== '/app/login') ? redirectPath : '/app/home';

            if (userInfoUpdated) {
                if (redirectPath && redirectPath !== '/app/login') {
                    sessionStorage.removeItem('redirectAfterLogin');
                }
                navigate(finalRedirectPath);
            } else {
                // 如果获取用户信息失败，使用默认信息
                const userInfo = {
                    user_id: 1,
                    user_name: phoneNumber,
                    user_email: '',
                    user_plan: 'free' as const,
                    user_point: '0',
                    userId: 1  // 使用默认userId
                };
                console.log('手机号登录 - 使用默认用户信息:', userInfo);
                await login(userInfo, token || '');
                if (redirectPath && redirectPath !== '/app/login') {
                    sessionStorage.removeItem('redirectAfterLogin');
                }
                navigate(finalRedirectPath);
            }
        } catch (e) {
            console.error('登录失败:', e);
            const errorMsg = e.message || t('common.loginFailed');
            setMsg(`${t('common.loginFailed')}: ${errorMsg}`);
            message.error(`${t('common.loginFailed')}: ${errorMsg}`);
        }
        setLoading(false);
    };

    // 用户名密码登录
    const handleAccountLogin = async () => {
        if (!username || !password) {
            message.error(t('common.pleaseFillCompleteInfo'));
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            // 调用统一的API端点登录
            const response = await AuthService.login(username, password);

            if (response.data && response.data.userId) {
                // 使用username作为token（后端不返回JWT token）
                const token = response.data.username;
                const userId = response.data.userId;

                // 构建用户信息，确保包含userId字段供后续API调用使用
                const userInfo = {
                    user_id: parseInt(String(userId)) || 1,
                    user_name: response.data.username || username,
                    user_email: '',
                    user_plan: 'free' as const,
                    user_point: '0',
                    userId: userId  // 重要：需要这个字段用于API调用
                };

                // 保存userId和userName到sessionStorage（仅当前标签页有效）
                sessionStorage.setItem('userId', String(userId));
                sessionStorage.setItem('userName', response.data.username || username);
                console.log('💾 [LoginPage] userId已保存到sessionStorage:', userId);
                console.log('💾 [LoginPage] userName已保存到sessionStorage:', response.data.username || username);

                // 设置userId到shortplayService（基于session，不持久化）
                setCurrentUserId(userId);

                setMsg(t('common.loginSuccess'));
                // message.success(t('common.loginSuccess')); // 去掉登录成功的toast提示
                console.log('用户名密码登录成功:', userInfo);

                // 更新AuthContext
                await login(userInfo, token);

                // 检查是否有保存的返回路径，有则返回原页面，否则返回首页
                const redirectPath = sessionStorage.getItem('redirectAfterLogin');
                if (redirectPath && redirectPath !== '/app/login') {
                    sessionStorage.removeItem('redirectAfterLogin');
                    navigate(redirectPath);
                } else {
                    navigate('/app/home');
                }
            }
        } catch (e) {
            console.error('登录失败:', e);
            const errorMsg = e instanceof Error ? e.message : t('common.loginFailed');
            setMsg(`${t('common.loginFailed')}: ${errorMsg}`);
            message.error(`${t('common.loginFailed')}: ${errorMsg}`);
        }
        setLoading(false);
    };
    const handleEmailLogin = async () => {
        if (!email || !password) {
            message.error(t('common.pleaseFillCompleteInfo'));
            return;
        }

        if (!validateEmail(email)) {
            message.error(t('common.pleaseEnterValidEmail'));
            return;
        }

        setLoading(true);
        try {
            await getCloudbaseAuth().signIn({
                username: email,
                password,
            });
            // message.success(t('common.loginSuccess')); // 去掉登录成功的toast提示
            const authHeader = getAuthHeader();
            // 提取纯token，去掉Bearer前缀
            const token = authHeader ? authHeader.replace('Bearer ', '') : null;
            
            // 获取用户信息并更新AuthContext
            const userInfoUpdated = await fetchAndUpdateUserInfo(authHeader);

            // 获取返回路径
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            const finalRedirectPath = (redirectPath && redirectPath !== '/app/login') ? redirectPath : '/app/home';

            if (userInfoUpdated) {
                if (redirectPath && redirectPath !== '/app/login') {
                    sessionStorage.removeItem('redirectAfterLogin');
                }
                navigate(finalRedirectPath);
            } else {
                // 如果获取用户信息失败，使用默认信息
                const userInfo = {
                    user_id: 1,
                    user_name: email,
                    user_email: email,
                    user_plan: 'free' as const,
                    user_point: '0',
                    userId: 1  // 使用默认userId
                };
                console.log('邮箱登录 - 使用默认用户信息:', userInfo);
                await login(userInfo, token || '');
                if (redirectPath && redirectPath !== '/app/login') {
                    sessionStorage.removeItem('redirectAfterLogin');
                }
                navigate(finalRedirectPath);
            }
        } catch (e) {
            console.error('登录失败:', e);
            message.error(t('common.loginFailed'));
        }
        setLoading(false);
    };



    return (

        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card variant="outlined" style={{ width: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>{t('login.welcomeTitle')}</Title>
                    <Text type="secondary">{t('login.subtitle')}</Text>
                </div>
                {/* 登录方式切换 - 仅保留用户名密码登录 */}
                {/* <div style={{ display: 'flex', marginBottom: 16 }}>
                    <button
                        onClick={() => setMode('phone')}
                        style={{
                            flex: 1,
                            background: mode === 'phone' ? '#1890ff' : '#eee',
                            color: mode === 'phone' ? '#fff' : '#333',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {t('login.phoneLogin')}
                    </button>
                    <button
                        onClick={() => setMode('account')}
                        style={{
                            flex: 1,
                            background: mode === 'account' ? '#1890ff' : '#eee',
                            color: mode === 'account' ? '#fff' : '#333',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {t('login.accountLogin')}
                    </button>
                    <button
                        onClick={() => setMode('email')} // 增加邮箱登录按钮
                        style={{
                            flex: 1,
                            background: mode === 'email' ? '#1890ff' : '#eee',
                            color: mode === 'email' ? '#fff' : '#333',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {t('login.emailLogin')}
                    </button>
                </div> */}
                {/* 仅保留用户名密码登录表单 */}
                <>
                    <Form.Item label={t('login.username')} required>
                        <Input
                            prefix={<UserOutlined />}
                            placeholder={t('login.enterUsername')}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label={t('login.password')} required>
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder={t('login.enterPassword')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Form.Item>
                    <Button type="primary" block loading={loading} onClick={handleAccountLogin} disabled={loading || !username || !password}>
                        {t('login.login')}
                    </Button>
                </>
                {/* 隐藏的登录方式
                {mode === 'phone' ? (
                    ...手机号登录表单...
                ) :  mode === 'account' ? (
                    ...用户名密码登录表单...
                ) : (
                    ...邮箱登录表单...
                )
                */}
                {msg && <div style={{ marginTop: 16, color: msg.includes('成功') ? 'green' : 'red' }}>{msg}</div>}
                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                    <Text type="secondary">{t('login.noAccount')} <Link to="/app/register">{t('login.registerNow')}</Link></Text>
                </Form.Item>
            </Card>
        </div>
    );
};

export default LoginPage; 