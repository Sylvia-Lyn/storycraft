import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message, Select, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../cloudbase';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'phone' | 'account'>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [countryCode, setCountryCode] = useState('+86');
    const [verificationInfo, setVerificationInfo] = useState<any>(null);

    // 获取验证码
    const handleGetCode = async () => {
        if (!phone) {
            message.error('请输入手机号');
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            // 格式化手机号：确保格式为 "+国家代码 手机号"
            let phoneNumber = phone.trim();

            // 如果用户只输入了手机号，需要添加国家代码和空格
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = `${countryCode} ${phoneNumber}`;
            } else {
                // 如果用户输入了完整手机号，确保格式正确
                phoneNumber = phoneNumber.replace('+86', '+86 ');
            }

            console.log('发送验证码到:', phoneNumber);

            // 使用正确的腾讯云开发API - 发送短信验证码
            const verificationInfo = await auth.getVerification({
                phone_number: phoneNumber,
            });
            console.log('验证码发送结果:', verificationInfo);
            setVerificationInfo(verificationInfo);
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

        if (!verificationInfo) {
            message.error('请先获取验证码');
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            // 格式化手机号：确保格式为 "+国家代码 手机号"
            let phoneNumber = phone.trim();

            // 如果用户只输入了手机号，需要添加国家代码和空格
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = `${countryCode} ${phoneNumber}`;
            } else {
                // 如果用户输入了完整手机号，确保格式正确
                phoneNumber = phoneNumber.replace('+86', '+86 ');
            }

            console.log('登录信息:', { phoneNumber, code });

            // 使用正确的登录API
            const res = await auth.signInWithSms({
                verificationInfo,
                verificationCode: code,
                phoneNumber: phoneNumber,
            });
            console.log('登录结果:', res);
            setMsg('登录成功');
            message.success('登录成功');

            // 登录成功后跳转
            if (login) {
                login(res.user, res.token);
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

    // 账号密码登录
    const handleAccountLogin = async () => {
        setLoading(true);
        setMsg('');
        try {
            await auth.signIn({
                username,
                password,
            });
            setMsg('登录成功');
        } catch (e) {
            setMsg('登录失败，请检查账号密码');
        }
        setLoading(false);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 使用认证上下文登录
                login(result.data, result.data.token);
                message.success('登录成功！');
                navigate('/');
            } else {
                message.error(result.error || '登录失败');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // function handleLogin() {
    //     app.auth().signInWithRedirect();
    // }

    return (

        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card variant="outlined" style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>欢迎登录</Title>
                    <Text type="secondary">Writer.AI 账号登录</Text>
                </div>
                <div style={{ display: 'flex', marginBottom: 16 }}>
                    <button onClick={() => setMode('phone')} style={{ flex: 1, background: mode === 'phone' ? '#1890ff' : '#eee', color: mode === 'phone' ? '#fff' : '#333' }}>手机号验证码登录</button>
                    <button onClick={() => setMode('account')} style={{ flex: 1, background: mode === 'account' ? '#1890ff' : '#eee', color: mode === 'account' ? '#fff' : '#333' }}>账号密码登录</button>
                </div>
                {mode === 'phone' ? (
                    <>
                        <Form.Item name="countryCode" rules={[{ required: true, message: '请选择国家区号!' }]}>
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="国家区号"
                                size="large"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号!' }]}>
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="手机号"
                                size="large"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading} onClick={handleGetCode} disabled={loading || !phone}>
                                获取验证码
                            </Button>
                        </Form.Item>
                        <Form.Item name="code" rules={[{ required: true, message: '请输入验证码!' }]}>
                            <Input
                                placeholder="验证码"
                                size="large"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading} onClick={handlePhoneLogin} disabled={loading || !phone || !code}>
                                登录
                            </Button>
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="账号/手机号/邮箱"
                                size="large"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="密码"
                                size="large"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading} onClick={handleAccountLogin} disabled={loading || !username || !password}>
                                登录
                            </Button>
                        </Form.Item>
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