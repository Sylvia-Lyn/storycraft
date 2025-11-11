import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { getCloudbaseAuth, getAuthHeader } from '../cloudbase';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { useI18n } from '../contexts/I18nContext';
import AuthService from '../services/authService';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useI18n();
    const [msg, setMsg] = useState('');
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

    // 用户名密码注册处理函数
    const handleAccountRegister = async () => {
        if (!name || !password || !confirmPassword) {
            message.error(t('common.pleaseFillCompleteInfo'));
            return;
        }

        // 验证两个密码是否一致
        if (password !== confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        setMsg('');
        try {
            // 调用统一的API端点注册
            const response = await AuthService.register(name, password, confirmPassword);

            // 注册成功，重定向到登陆页面
            message.success('注册成功，请登陆');

            // 清空表单
            setPassword('');
            setConfirmPassword('');
            setName('');

            // 导航到登陆页面
            navigate('/app/login');
        } catch (e) {
            console.error('注册失败:', e);
            const errorMsg = e instanceof Error ? e.message : '注册失败，请检查信息';
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
                    <Form.Item label="用户名" required>
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入用户名"
                            value={name}
                            onChange={e => setName(e.target.value)}
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
                    <Form.Item label="确认密码" required>
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请再次输入密码"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        block
                        loading={loading}
                        onClick={handleAccountRegister}
                        disabled={loading || !name || !password || !confirmPassword}
                    >
                        注册
                    </Button>
                </Form>
                {msg && <div style={{ marginTop: 16, color: msg.includes('成功') ? 'green' : 'red' }}>{msg}</div>}
                <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">已有账户? <a href="/app/login">立即登录</a></Text>
                </Form.Item>
            </Card>
            </div>
    );
};

export default RegisterPage; 