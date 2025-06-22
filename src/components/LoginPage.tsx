import React from 'react';
import { Form, Input, Button, Checkbox, Typography, Card } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f2f5 0%, #e6eaf3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>欢迎登录</Title>
                    <Text type="secondary">Writer.AI 账号登录</Text>
                </div>
                <Form name="login_form" initialValues={{ remember: true }}>
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
                        <Button type="primary" htmlType="submit" block size="large">登录</Button>
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