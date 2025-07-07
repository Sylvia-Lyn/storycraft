import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, Select, Space, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { auth } from '../cloudbase';

const { Title, Text } = Typography;
const { Option } = Select;

// 手机号格式化函数，确保严格符合腾讯云要求
function formatPhoneNumber(phone, countryCode = '+86') {
    let p = phone.trim().replace(/\s+/g, '');
    // 纯数字，拼接国家码
    if (/^[0-9]{4,20}$/.test(p)) {
        return `${countryCode} ${p}`;
    }
    // +86开头且无空格，插入空格
    if (/^\+\d{1,4}[0-9]{4,20}$/.test(p)) {
        return p.replace(/^(\+\d{1,4})([0-9]{4,20})$/, '$1 $2');
    }
    // 已经是正确格式
    if (/^\+\d{1,4}\s[0-9]{4,20}$/.test(p)) {
        return p;
    }
    // 兜底
    return p;
}

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [countryCode, setCountryCode] = useState('+86');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [verificationInfo, setVerificationInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [debugPhone, setDebugPhone] = useState('');

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

        setLoading(true);
        setMsg('');
        try {
            // 使用统一格式化函数
            const phoneNumber = formatPhoneNumber(phone, countryCode);
            console.log('发送验证码到:', phoneNumber);
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

    // 注册
    const handleRegister = async () => {
        if (!phone || !code || !password) {
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
            // 使用统一格式化函数
            const phoneNumber = formatPhoneNumber(phone, countryCode);
            console.log('注册信息:', { phoneNumber, code, password, name });
            const res = await auth.signInWithSms({
                verificationInfo,
                verificationCode: code,
                phoneNumber: phoneNumber,
            });
            console.log('注册结果:', res);
            setMsg('注册成功，请登录');
            message.success('注册成功，请登录');
            setPhone('');
            setCode('');
            setPassword('');
            setName('');
            setVerificationInfo(null);
        } catch (e) {
            console.error('注册失败:', e);
            const errorMsg = e.message || '注册失败，请检查信息';
            setMsg(`注册失败: ${errorMsg}`);
            message.error(`注册失败: ${errorMsg}`);
        }
        setLoading(false);
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
                                <Option value="+1">+1 美国/加拿大</Option>
                                <Option value="+81">+81 日本</Option>
                                <Option value="+44">+44 英国</Option>
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
                    <Form.Item label="昵称（可选）">
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="昵称"
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
        </div>
    );
};

export default RegisterPage; 