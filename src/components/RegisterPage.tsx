import React from 'react';
import { Form, Input, Button, Checkbox, Typography, Card } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f2f5 0%, #e6eaf3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>注册账号</Title>
                    <Text type="secondary">Writer.AI 账号注册</Text>
                </div>
                <Form name="register_form" initialValues={{ agree: true }}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                    </Form.Item>
                    <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱!' }, { type: 'email', message: '邮箱格式不正确!' }]}>
                        <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                    </Form.Item>
                    <Form.Item name="confirm" dependencies={["password"]} rules={[
                        { required: true, message: '请确认密码!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致!'));
                            },
                        }),
                    ]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
                    </Form.Item>
                    <Form.Item name="agree" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('请同意服务条款') }]}
                        style={{ marginBottom: 8 }}>
                        <Checkbox>我已阅读并同意 <a href="#">服务条款</a></Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">注册</Button>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Text type="secondary">已有账号？ <Link to="/login">立即登录</Link></Text>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage; 