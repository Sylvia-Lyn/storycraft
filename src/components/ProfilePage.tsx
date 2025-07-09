import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Typography, Tag, Space, message, Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined, PhoneOutlined, MailOutlined, CrownOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface UserProfile {
    user_id: number;
    user_name: string;
    user_email: string;
    user_phonenumber: string;
    user_plan: string;
    user_piont: string;
    created_at: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setProfile(result.data);
            } else {
                message.error('获取用户信息失败');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            message.error('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVipStatus = (plan: string) => {
        switch (plan) {
            case 'vip':
                return { text: 'VIP会员', color: 'gold' };
            case 'premium':
                return { text: '高级会员', color: 'purple' };
            default:
                return { text: '免费用户', color: 'default' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Text type="secondary">无法加载用户信息</Text>
            </div>
        );
    }

    const vipStatus = getVipStatus(profile.user_plan);

    return (
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="max-w-4xl mx-auto">
                <Title level={2} className="mb-6">我的资料</Title>

                <Card className="mb-6">
                    <Descriptions title="基本信息" bordered column={2}>
                        <Descriptions.Item label="用户ID" span={1}>
                            <Text code>{profile.user_id}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="用户名" span={1}>
                            <Space>
                                <UserOutlined />
                                <Text strong>{profile.user_name}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="会员状态" span={1}>
                            <Tag color={vipStatus.color} icon={<CrownOutlined />}>
                                {vipStatus.text}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="积分" span={1}>
                            <Space>
                                <GiftOutlined />
                                <Text strong>{profile.user_piont || '0'}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="注册时间" span={2}>
                            <Space>
                                <CalendarOutlined />
                                <Text>{formatDate(profile.created_at)}</Text>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card className="mb-6">
                    <Descriptions title="联系方式" bordered column={2}>
                        <Descriptions.Item label="手机号" span={1}>
                            {profile.user_phonenumber ? (
                                <Space>
                                    <PhoneOutlined />
                                    <Text>{profile.user_phonenumber}</Text>
                                </Space>
                            ) : (
                                <Text type="secondary">暂未开通手机验证，请妥善保存账号密码</Text>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="邮箱" span={1}>
                            {profile.user_email ? (
                                <Space>
                                    <MailOutlined />
                                    <Text>{profile.user_email}</Text>
                                </Space>
                            ) : (
                                <Text type="secondary">暂未开通邮箱验证，请妥善保存账号密码</Text>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card>
                    <Descriptions title="账号安全" bordered column={1}>
                        <Descriptions.Item label="密码">
                            <Space>
                                <Text type="secondary">
                                    {showPassword ? '••••••••' : '••••••••••••••••'}
                                </Text>
                                <Button
                                    type="text"
                                    icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={() => setShowPassword(!showPassword)}
                                    size="small"
                                >
                                    {showPassword ? '隐藏' : '显示'}
                                </Button>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage; 