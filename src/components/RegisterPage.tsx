import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message, Alert } from 'antd';
import { LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    phone: values.phone,
                    password: values.password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 使用认证上下文登录
                login(result.data, result.data.token);
                message.success('注册成功！');
                navigate('/');
            } else {
                message.error(result.error || '注册失败');
            }
        } catch (error) {
            console.error('Register error:', error);
            message.error('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e6eaf3]">
            <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>注册账号</Title>
                    <Text type="secondary">Writer.AI 账号注册</Text>
                </div>
                <Form name="register_form" initialValues={{ agree: true }} onFinish={onFinish}>
                    <Form.Item name="username" rules={[
                        { required: true, message: '请输入用户名!' },
                        { min: 3, message: '用户名长度至少3位!' },
                        { max: 20, message: '用户名长度不能超过20位!' },
                        {
                            pattern: /^[a-zA-Z0-9_]+$/,
                            message: '用户名只能包含字母、数字和下划线!'
                        }
                    ]}>
                        <div>
                            <Alert
                                message="用户名规范"
                                description="用户名不能重复，长度3-20个字符，只能包含字母、数字、下划线"
                                type="info"
                                showIcon
                                style={{ marginBottom: 8, fontSize: '12px' }}
                            />
                            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                        </div>
                    </Form.Item>
                    <Form.Item name="phone" rules={[
                        { required: true, message: '请输入手机号!' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式!' }
                    ]}>
                        <div>
                            <Alert
                                message="手机号规范"
                                description="请输入11位中国大陆手机号，用于账号安全验证"
                                type="info"
                                showIcon
                                style={{ marginBottom: 8, fontSize: '12px' }}
                            />
                            <Input prefix={<PhoneOutlined />} placeholder="手机号" size="large" />
                        </div>
                    </Form.Item>
                    <Form.Item name="password" rules={[
                        { required: true, message: '请输入密码!' },
                        { min: 8, message: '密码长度至少8位!' },
                        { max: 20, message: '密码长度不能超过20位!' },
                        {
                            pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
                            message: '密码必须包含字母、数字和特殊符号!'
                        }
                    ]}>
                        <div>
                            <Alert
                                message="密码规范"
                                description="密码长度8-20位，必须包含字母、数字和特殊符号"
                                type="info"
                                showIcon
                                style={{ marginBottom: 8, fontSize: '12px' }}
                            />
                            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                        </div>
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
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            注册
                        </Button>
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