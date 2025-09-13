import { LockOutlined, PhoneOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Typography, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { auth } from '../cloudbase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { useI18n } from '../contexts/I18nContext';

const { Title, Text } = Typography;
const { Option } = Select;

const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
};

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
    const p = phone.trim().replace(/\s+/g, '');

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

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [countryCode, setCountryCode] = useState('+86');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    // 删除 verificationInfo 相关 state
    // const [verificationInfo, setVerificationInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useI18n();
    const [msg, setMsg] = useState('');
    const [debugPhone, setDebugPhone] = useState('');
    const [verification, setVerification] = useState<any>(null);
    const [verificationTokenRes, setVerificationTokenRes] = useState<any>(null);
    const [showUserExistsModal, setShowUserExistsModal] = useState(false);
    const [existingUsername, setExistingUsername] = useState('');
    const [isEmailMode, setIsEmailMode] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // 创建用户记录到users集合
    const createUserRecord = async (userId: string, username: string, email?: string, phone?: string) => {
        try {
            const result = await userService.createUser({
                userId,
                username,
                email,
                phone
            });
            
            if (result.success) {
                console.log('用户记录创建成功:', result.data);
            } else {
                console.warn('用户记录创建失败:', result.error);
                // 不阻止注册流程，只是记录警告
            }
        } catch (error) {
            console.error('创建用户记录时出错:', error);
            // 不阻止注册流程，只是记录错误
        }
    };

    // 在手机号输入时，实时显示格式化后的手机号
    useEffect(() => {
        setDebugPhone(formatPhoneNumber(phone, countryCode));
    }, [phone, countryCode]);

    // 获取验证码
    const handleGetCode = async () => {
        if (isEmailMode) {
            if (!validateEmail(email)) {
                message.error(t('common.pleaseEnterValidEmail'));
                return;
            }
            // 邮箱验证码获取逻辑（模拟）
            setLoading(true);
            setMsg('');
            try {
                const verification = await auth.getVerification({ email });
                setVerification(verification);
                setMsg('验证码已发送，请查收邮箱');
                message.success(t('login.codeSent'));
            } catch (e) {
                console.error('发送验证码失败:', e);
                message.error(t('login.getCodeFailed'));
            }
            setLoading(false);
        } else {
            if (!phone) {
                message.error(t('login.phoneRequired'));
                return;
            }

            // 验证手机号格式
            if (!validatePhoneNumber(phone, countryCode)) {
                const cc = countryCode.replace(/^ +/, '');
                const rule = phoneValidationRules[cc];
                if (rule) {
                    message.error(t('common.pleaseEnterValidPhone'));
                } else {
                    message.error(t('common.pleaseEnterValidPhone'));
                }
                return;
            }

            setLoading(true);
            setMsg('');
            try {
                const phoneNumber = formatPhoneNumber(phone, countryCode);
                console.log('发送验证码到:', phoneNumber);
                const verification = await auth.getVerification({ phone_number: phoneNumber });
                setVerification(verification);
                setMsg('验证码已发送，请查收短信');
                message.success(t('login.codeSent'));
            } catch (e) {
                console.error('发送验证码失败:', e);
                const errorMsg = e.message || '获取验证码失败';
                setMsg(`获取验证码失败: ${errorMsg}`);
                message.error(`${t('login.getCodeFailed')}: ${errorMsg}`);
            }
            setLoading(false);
        }
    };

    const handlePhoneRegister = async () => {
        if (!phone || !code || !password || !name) {
            message.error(t('common.pleaseFillCompleteInfo'));
            return;
        }

        // 验证手机号格式
        if (!validatePhoneNumber(phone, countryCode)) {
            const cc = countryCode.replace(/^ +/, '');
            const rule = phoneValidationRules[cc];
            if (rule) {
                message.error(t('common.pleaseEnterValidPhone'));
            } else {
                message.error(t('common.pleaseEnterValidPhone'));
            }
            return;
        }

        if (!/^[a-z][0-9a-z_-]{5,31}$/.test(name)) {
            message.error(t('common.pleaseEnterValidUsername'));
            return;
        }

        if (!verification) {
            message.error(t('common.pleaseGetCodeFirst'));
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            const phoneNumber = formatPhoneNumber(phone, countryCode);
            // 1. 校验验证码
            const verificationTokenRes = await auth.verify({
                verification_id: verification.verification_id,
                verification_code: code,
            });
            setVerificationTokenRes(verificationTokenRes);
            // 2. 判断用户是否已存在
            if (verification.is_user) {
                // 用户已存在，显示弹窗
                setExistingUsername(verification.username || phoneNumber);
                setShowUserExistsModal(true);
                setLoading(false);
                return;
            } else {
                // 不存在，注册
                const signUpResult = await auth.signUp({
                    phone_number: phoneNumber,
                    verification_code: code,
                    verification_token: verificationTokenRes.verification_token,
                    username: name || phoneNumber,
                    password,
                });
                
                // 注册成功后创建用户记录
                if (signUpResult && signUpResult.user) {
                    const userId = signUpResult.user.uid;
                    await createUserRecord(userId, name || phoneNumber, undefined, phoneNumber);
                }
                
                setMsg('注册成功，请登录');
                message.success(t('common.registerSuccess'));
                setPhone('');
                setCode('');
                setPassword('');
                setName('');
                setVerification(null);
                setVerificationTokenRes(null);
            }
        } catch (e) {
            console.error('注册/登录失败:', e);
            const errorMsg = e.message || '注册/登录失败，请检查信息';
            setMsg(`注册/登录失败: ${errorMsg}`);
            message.error(`${t('common.registerFailed')}: ${errorMsg}`);
        }
        setLoading(false);
    
    };

    const handleEmailRegister = async () => {
        if (!email || !code || !password || !name) {
            message.error(t('common.pleaseFillCompleteInfo'));
            return;
        }
    
        // 验证邮箱格式
        if (!validateEmail(email)) {
            message.error(t('common.pleaseEnterValidEmail'));
            return;
        }
    
        if (!/^[a-z][0-9a-z_-]{5,31}$/.test(name)) {
            message.error(t('common.pleaseEnterValidUsername'));
            return;
        }
    
        if (!verification) {
            message.error(t('common.pleaseGetCodeFirst'));
            return;
        }
    
        setLoading(true);
        setMsg('');
        try {
            // 校验邮箱验证码
            const verificationTokenRes = await auth.verify({
                verification_id: verification.verification_id,
                verification_code: code,
            });
            setVerificationTokenRes(verificationTokenRes);
            // 判断用户是否已存在
            if (verification.is_user) {
                // 用户已存在，显示弹窗
                setExistingUsername(verification.username || email);
                setShowUserExistsModal(true);
                setLoading(false);
                return;
            } else {
                // 不存在，注册
                const signUpResult = await auth.signUp({
                    email: email,
                    verification_code: code,
                    verification_token: verificationTokenRes.verification_token,
                    username: name || email,
                    password,
                });
                
                // 注册成功后创建用户记录
                if (signUpResult && signUpResult.user) {
                    const userId = signUpResult.user.uid;
                    await createUserRecord(userId, name || email, email);
                }
                
                setMsg('注册成功，请登录');
                message.success(t('common.registerSuccess'));
                // 清空表单
                setEmail('');
                setCode('');
                setPassword('');
                setName('');
                setVerification(null);
                setVerificationTokenRes(null);
            }
        } catch (e) {
            console.error('注册/登录失败:', e);
            const errorMsg = e.message || '注册/登录失败，请检查信息';
            setMsg(`注册/登录失败: ${errorMsg}`);
            message.error(`${t('common.registerFailed')}: ${errorMsg}`);
        }
        setLoading(false);
    };

    // 注册
    const handleRegister = async () => {
        if(isEmailMode){
            handleEmailRegister();
        }else{
            handlePhoneRegister();
        }
        
    };

    // 直接登录
    const handleDirectLogin = async () => {
        setLoading(true);
        try {
            const phoneNumber = formatPhoneNumber(phone, countryCode);
            await auth.signIn({
                username: phoneNumber,
                verification_token: verificationTokenRes.verification_token,
            });
            message.success(t('common.loginSuccess'));

            // 登录成功后跳转
            if (login) {
                const userInfo = {
                    user_id: 1,
                    user_name: existingUsername || phoneNumber,
                    user_email: '',
                    user_plan: 'free' as 'free' | 'chinese' | 'multilingual',
                    user_piont: '0'
                };
                login(userInfo, 'token');
                navigate('/');
            }
        } catch (e) {
            console.error('直接登录失败:', e);
            message.error(t('common.directLoginFailed'));
        }
        setLoading(false);
        setShowUserExistsModal(false);
    };

    // 换号注册
    const handleChangePhone = () => {
        setPhone('');
        setCode('');
        setPassword('');
        setName('');
        setVerification(null);
        setVerificationTokenRes(null);
        setShowUserExistsModal(false);
        setMsg('');
    };

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card variant="outlined" style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>注册账号</Title>
                    <Text type="secondary">StoryCraft 账号注册</Text>
                </div>
                <Form form={form} layout="vertical">
                    <Form.Item label={isEmailMode ? "邮箱" : "手机号"} required>
                        <Space.Compact style={{ width: '100%' }}>
                            {isEmailMode ? (
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="请输入邮箱"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            ) : (
                                <>
                                    <Select
                                        showSearch
                                        value={countryCode}
                                        style={{ width: 100 }}
                                        onChange={setCountryCode}
                                    >
                                        <Option value="+86">+86 中国大陆</Option>
                                        <Option value="+852">+852 香港</Option>
                                        <Option value="+853">+853 澳门</Option>
                                        <Option value="+886">+886 台湾</Option>
                                    </Select>
                                    <Input
                                        style={{ width: 200 }}
                                        placeholder="请输入手机号"
                                        prefix={<PhoneOutlined />}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </>
                            )}
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="验证码" required>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                style={{ width: 200 }}
                                placeholder="请输入验证码"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                            <Button
                                style={{ width: 120 }}
                                onClick={handleGetCode}
                                disabled={loading || (!phone && !email)}
                                loading={loading}
                            >
                                获取验证码
                            </Button>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="密码" required>
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入密码"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label="用户名" required>
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入用户名"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        block
                        loading={loading}
                        onClick={handleRegister}
                        disabled={loading || (!phone && !email) || !code || !password || !name}
                    >
                        {isEmailMode ? "邮箱注册" : "手机号注册"}
                    </Button>
                    <Button
                        block
                        style={{ marginTop: 16 }}
                        onClick={() => setIsEmailMode(!isEmailMode)}
                    >
                        {isEmailMode ? "切换到手机号注册" : "切换到邮箱注册"}
                    </Button>
                </Form>
            </Card>

            {/* 用户已存在弹窗 */}
            <Modal
                title="用户已存在"
                open={showUserExistsModal}
                onCancel={() => setShowUserExistsModal(false)}
                footer={[
                    <Button key="change" onClick={handleChangePhone}>
                        换号注册
                    </Button>,
                    <Button key="login" type="primary" loading={loading} onClick={handleDirectLogin}>
                        直接登录
                    </Button>,
                ]}
            >
                <p>该手机号已注册，用户名为 <strong>{existingUsername}</strong>，是否直接登录？</p>
            </Modal>
            </div>
    );
};

export default RegisterPage; 