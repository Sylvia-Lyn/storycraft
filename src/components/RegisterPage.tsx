import { LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Typography, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { auth } from '../cloudbase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [countryCode, setCountryCode] = useState('+86');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    // 删除 verificationInfo 相关 state
    // const [verificationInfo, setVerificationInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [debugPhone, setDebugPhone] = useState('');
    const [verification, setVerification] = useState<any>(null);
    const [verificationTokenRes, setVerificationTokenRes] = useState<any>(null);
    const [showUserExistsModal, setShowUserExistsModal] = useState(false);
    const [existingUsername, setExistingUsername] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // 在手机号输入时，实时显示格式化后的手机号
    useEffect(() => {
        setDebugPhone(formatPhoneNumber(phone, countryCode));
    }, [phone, countryCode]);

    // 获取验证码
    const handleGetCode = async () => {
        if (!phone) {
            message.error('请输入手机号');
            return;
        }

        // 验证手机号格式
        if (!validatePhoneNumber(phone, countryCode)) {
            const cc = countryCode.replace(/^ +/, '');
            const rule = phoneValidationRules[cc];
            if (rule) {
                message.error(`请输入正确的${countryCode}手机号格式（${rule.length}位数字）`);
            } else {
                message.error('请输入正确的手机号格式');
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
            message.success('验证码已发送');
        } catch (e) {
            console.error('发送验证码失败:', e);
            const errorMsg = e.message || '获取验证码失败';
            setMsg(`获取验证码失败: ${errorMsg}`);
            message.error(`获取验证码失败: ${errorMsg}`);
        }
        setLoading(false);
    };

    // 注册
    const handleRegister = async () => {
        if (!phone || !code || !password) {
            message.error('请填写完整信息');
            return;
        }

        // 验证手机号格式
        if (!validatePhoneNumber(phone, countryCode)) {
            const cc = countryCode.replace(/^ +/, '');
            const rule = phoneValidationRules[cc];
            if (rule) {
                message.error(`请输入正确的${countryCode}手机号格式（${rule.length}位数字）`);
            } else {
                message.error('请输入正确的手机号格式');
            }
            return;
        }

        if (!verification) {
            message.error('请先获取验证码');
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
                await auth.signUp({
                    phone_number: phoneNumber,
                    verification_code: code,
                    verification_token: verificationTokenRes.verification_token,
                    username: name || phoneNumber,
                    password,
                });
                setMsg('注册成功，请登录');
                message.success('注册成功，请登录');
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
            message.error(`注册/登录失败: ${errorMsg}`);
        }
        setLoading(false);
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
            message.success('登录成功');

            // 登录成功后跳转
            if (login) {
                const userInfo = {
                    user_id: 1,
                    user_name: existingUsername || phoneNumber,
                    user_email: '',
                    user_plan: 'free',
                    user_piont: '0'
                };
                login(userInfo, 'token');
                navigate('/');
            }
        } catch (e) {
            console.error('直接登录失败:', e);
            message.error('直接登录失败，请重试');
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
                    <Form.Item label="手机号" required>
                        <Space.Compact>
                            <Select
                                showSearch
                                value={countryCode}
                                style={{ width: 100 }}
                                onChange={setCountryCode}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    String(option?.children).toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                <Option value="+86">+86 中国大陆</Option>
                                <Option value="+852">+852 香港</Option>
                                <Option value="+853">+853 澳门</Option>
                                <Option value="+886">+886 台湾</Option>
                                {/* 可补充更多区号 */}
                            </Select>
                            <Input
                                style={{ width: 200 }}
                                placeholder="请输入手机号"
                                prefix={<PhoneOutlined />}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </Space.Compact>
                    </Form.Item>
                    {/* 手机号格式调试信息 */}
                    <div style={{ marginBottom: 8, color: '#888', fontSize: 12 }}>
                        格式化后手机号: <span style={{ color: '#333' }}>{debugPhone}</span>
                    </div>
                    <Form.Item label="验证码" required>
                        <Space.Compact>
                            <Input
                                style={{ width: 200 }}
                                placeholder="请输入验证码"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                            <Button style={{ width: 120 }} onClick={handleGetCode} disabled={loading || !phone} loading={loading}>
                                获取验证码
                            </Button>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="设置密码" required>
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="设置密码（8-32位，包含字母和数字）"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label="用户名" required>
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名（1-32位，包含字母和数字）"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </Form.Item>
                    <Button type="primary" block loading={loading} onClick={handleRegister} disabled={loading || !phone || !code || !password}>
                        注册
                    </Button>
                </Form>
                {msg && <div style={{ marginTop: 16, color: msg.includes('成功') ? 'green' : 'red' }}>{msg}</div>}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Text type="secondary">已有账号？ <a href="/login">立即登录</a></Text>
                </div>
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