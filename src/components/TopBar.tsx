import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, CrownOutlined, LoginOutlined, LogoutOutlined, DownOutlined, GlobalOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Avatar } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useI18n, languageNames, Language } from '../contexts/I18nContext';

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, refreshUserInfo } = useAuth();
    const { language, setLanguage, t } = useI18n();
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    // 获取显示的用户名
    const getDisplayUserName = () => {
        // 首先尝试从 sessionStorage 获取保存的用户名（最准确）
        const savedUserName = sessionStorage.getItem('userName');
        if (savedUserName && savedUserName !== '用户') {
            return savedUserName;
        }

        if (!user) {
            return '用户';
        }

        // 使用 user 对象中的用户名
        if (user.user_name && user.user_name !== '用户') {
            return user.user_name;
        }
        if (user.user_email) {
            return user.user_email;
        }
        if (user.user_id) {
            return `User ${user.user_id}`;
        }
        if (user.userId) {
            return `User ${user.userId}`;
        }
        return '用户';
    };

    // 获取会员状态显示文本
    const getMemberStatusText = () => {
        if (!isAuthenticated || !user) {
            return t('topbar.vip');
        }

        const planText = user.user_plan === 'free' 
            ? t('vip.freePlan')
            : user.user_plan === 'chinese' 
            ? t('vip.chinesePlan')
            : t('vip.multilingualPlan');
        
        return `${planText} (${user.user_point || '0'}${t('topbar.points')})`;
    };

    // 当用户登录状态改变时刷新用户信息
    React.useEffect(() => {
        if (isAuthenticated) {
            refreshUserInfo();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/app/login');
    };

    const userMenu = (
        <Menu>
            {/* 个人资料 - 已隐藏 */}
            {/* <Menu.Item key="profile" onClick={() => navigate('/app/profile')}>
                <UserOutlined /> {t('topbar.profile')}
            </Menu.Item> */}
            {/* 会员中心 - 已隐藏 */}
            {/* <Menu.Item key="vip" onClick={() => navigate('/app/vip')}>
                <CrownOutlined /> {t('topbar.memberCenter')}
            </Menu.Item>
            <Menu.Divider /> */}
            <Menu.Item key="logout" onClick={handleLogout}>
                <LogoutOutlined /> {t('topbar.logout')}
            </Menu.Item>
        </Menu>
    );

    const handleLanguageClick = (lang: Language) => {
        // 允许所有用户改变语言
        setLanguage(lang);
    };

    const languageMenu = (
        <Menu>
            {Object.entries(languageNames).map(([lang, name]) => {
                const isCurrent = language === lang;

                return (
                    <Menu.Item
                        key={lang}
                        onClick={() => handleLanguageClick(lang as Language)}
                        className={isCurrent ? 'bg-blue-50' : ''}
                    >
                        <span>{name}</span>
                    </Menu.Item>
                );
            })}
        </Menu>
    );

    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/app/home')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title={t('topbar.home')}
                >
                    <HomeOutlined className="text-xl text-gray-600" />
                </button>
                <span className="text-xl font-bold tracking-wide select-none">Storycraft</span>
            </div>
            <div className="flex items-center space-x-3">
                <Dropdown overlay={languageMenu} trigger={['click']} placement="bottomRight">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 flex items-center">
                        <GlobalOutlined className="mr-1" />
                        {languageNames[language]}
                        <DownOutlined className="ml-1 text-xs" />
                    </button>
                </Dropdown>
                {/* 会员入口 - 已隐藏 */}
                {/* <button
                    onClick={() => navigate('/app/vip')}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center"
                >
                    <CrownOutlined className="mr-1" />{getMemberStatusText()}
                </button> */}
                {isAuthenticated && user ? (
                    <Dropdown overlay={userMenu} trigger={['click']} onVisibleChange={setUserMenuVisible}>
                        <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <Avatar size="small" icon={<UserOutlined />} />
                            <span className="text-sm font-medium text-gray-700">
                                {getDisplayUserName()}
                            </span>
                            <DownOutlined className="text-xs text-gray-500" />
                        </div>
                    </Dropdown>
                ) : (
                    <button
                        onClick={() => navigate('/app/login')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
                    >
                        <LoginOutlined className="mr-1" />{t('topbar.login')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopBar; 