import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Typography, Tag, Space, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, CrownOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { useI18n } from '../contexts/I18nContext';

const { Title, Text } = Typography;

interface UserProfile {
    userId: string;
    user_name: string;
    user_email: string;
    user_plan: 'free' | 'chinese' | 'multilingual';
    user_point: string;
    subscription_expires_at?: string | null;
    subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
    password?: string; // 添加密码字段
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const result = await paymentService.getUserInfo();
            if (result.success && result.data) {
                setProfile(result.data);
            } else {
                message.error(result.error || t('common.getInfoFailed'));
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            message.error(t('common.networkError'));
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
            case 'chinese':
                return { text: t('profile.chinesePro'), color: 'blue' };
            case 'multilingual':
                return { text: t('profile.multilingualPro'), color: 'purple' };
            default:
                return { text: t('profile.freeUser'), color: 'default' };
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
                <Text type="secondary">{t('profile.cannotLoadInfo')}</Text>
            </div>
        );
    }

    const vipStatus = getVipStatus(profile.user_plan);

    return (
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="max-w-4xl mx-auto">
                <Title level={2} className="mb-6">{t('profile.title')}</Title>

                <Card className="mb-6">
                    <Descriptions title={t('profile.basicInfo')} bordered column={2} labelStyle={{ width: '120px' }}>
                        <Descriptions.Item label={t('profile.userId')} span={1}>
                            <Text code>{profile.userId}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('profile.username')} span={1}>
                            <Space>
                                <UserOutlined />
                                <Text strong>{profile.user_name}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('profile.plan')} span={1}>
                            <Tag color={vipStatus.color} icon={<CrownOutlined />}>
                                {vipStatus.text}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('profile.points')} span={1}>
                            <Space>
                                <GiftOutlined />
                                <Text strong>{profile.user_point || '0'}</Text>
                            </Space>
                        </Descriptions.Item>
                        {profile.subscription_expires_at && (
                            <Descriptions.Item label={t('profile.subscriptionExpiry')} span={1}>
                                <Space>
                                    <CalendarOutlined />
                                    <Text>{formatDate(profile.subscription_expires_at)}</Text>
                                </Space>
                            </Descriptions.Item>
                        )}
                        {profile.createdAt && (
                            <Descriptions.Item label={t('profile.registrationTime')} span={1}>
                                <Space>
                                    <CalendarOutlined />
                                    <Text>{formatDate(profile.createdAt)}</Text>
                                </Space>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                <Card className="mb-6">
                    <Descriptions title={t('profile.contactInfo')} bordered column={2} labelStyle={{ width: '120px' }}>
                        <Descriptions.Item label={t('profile.email')} span={2}>
                            {profile.user_email ? (
                                <Space>
                                    <MailOutlined />
                                    <Text>{profile.user_email}</Text>
                                </Space>
                            ) : (
                                <Text type="secondary">{t('profile.emailNotBound')}</Text>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card>
                    <Descriptions title={t('profile.accountSecurity')} bordered column={1} labelStyle={{ width: '120px' }}>
                        <Descriptions.Item label={t('profile.passwordStatus')}>
                            <Space>
                                <Text type="secondary">{t('profile.passwordSet')}</Text>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                        message.info(t('profile.passwordChangeInDevelopment'));
                                    }}
                                >
                                    {t('profile.changePassword')}
                                </Button>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('profile.loginStatus')}>
                            <Space>
                                <Text type="success">{t('profile.loggedIn')}</Text>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage; 