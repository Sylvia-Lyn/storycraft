import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Select, Space } from 'antd';
import { LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../cloudbase';

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

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'phone' | 'account'>('phone');
    const [countryCode, setCountryCode] = useState('+86');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verification, setVerification] = useState<any>(null);
    const [verificationTokenRes, setVerificationTokenRes] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [debugPhone, setDebugPhone] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // 在手机号输入时，实时显示格式化后的手机号
    React.useEffect(() => {
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
            const cc = countryCode.replace(/^\+/, '');
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

    // 手机号验证码登录
    const handlePhoneLogin = async () => {
        if (!phone || !code) {
            message.error('请填写完整信息');
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

            // 2. 登录
            await auth.signIn({
                username: phoneNumber,
                verification_token: verificationTokenRes.verification_token,
            });

            setMsg('登录成功');
            message.success('登录成功');

            // 登录成功后跳转
            if (login) {
                // 这里需要获取用户信息，暂时使用模拟数据
                const userInfo = {
                    user_id: 1,
                    user_name: phoneNumber,
                    user_email: '',
                    user_plan: 'free',
                    user_piont: '0'
                };
                login(userInfo, 'token');
                navigate('/');
            }
        } catch (e) {
            console.error('登录失败:', e);
            const errorMsg = e.message || '登录失败，请检查信息';
            setMsg(`登录失败: ${errorMsg}`);
            message.error(`登录失败: ${errorMsg}`);
        }
        setLoading(false);
    };

    // 用户名密码登录
    const handleAccountLogin = async () => {
        if (!username || !password) {
            message.error('请填写完整信息');
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            await auth.signIn({
                username,
                password,
            });
            setMsg('登录成功');
            message.success('登录成功');

            // 登录成功后跳转
            if (login) {
                const userInfo = {
                    user_id: 1,
                    user_name: username,
                    user_email: '',
                    user_plan: 'free',
                    user_piont: '0'
                };
                login(userInfo, 'token');
                navigate('/');
            }
        } catch (e) {
            console.error('登录失败:', e);
            const errorMsg = e.message || '登录失败，请检查账号密码';
            setMsg(`登录失败: ${errorMsg}`);
            message.error(`登录失败: ${errorMsg}`);
        }
        setLoading(false);
    };



    return (

        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card variant="outlined" style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>欢迎登录</Title>
                    <Text type="secondary">StoryCraft 账号登录</Text>
                </div>
                <div style={{ display: 'flex', marginBottom: 16 }}>
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
                        手机号验证码登录
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
                        用户名密码登录
                    </button>
                </div>
                {mode === 'phone' ? (
                    <>
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
                        <Button type="primary" block loading={loading} onClick={handlePhoneLogin} disabled={loading || !phone || !code}>
                            登录
                        </Button>
                    </>
                ) : (
                    <>
                        <Form.Item label="用户名" required>
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="请输入用户名"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item label="密码" required>
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="请输入密码"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </Form.Item>
                        <Button type="primary" block loading={loading} onClick={handleAccountLogin} disabled={loading || !username || !password}>
                            登录
                        </Button>
                    </>
                )}
                {msg && <div style={{ marginTop: 16, color: msg.includes('成功') ? 'green' : 'red' }}>{msg}</div>}
                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                    <Text type="secondary">还没有账号？ <Link to="/register">立即注册</Link></Text>
                </Form.Item>
            </Card>
        </div>
    );
};

export default LoginPage; 