import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>欢迎登录</Title>
                    <Text type="secondary">Writer.AI 账号登录</Text>
                </div>
                <Form name="login_form" initialValues={{ remember: true }} onFinish={onFinish}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="用户名/邮箱" size="large" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>记住我</Checkbox>
                            </Form.Item>
                            <a href="#" style={{ fontSize: 14 }}>忘记密码？</a>
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Text type="secondary">还没有账号？ <Link to="/register">立即注册</Link></Text>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage; 