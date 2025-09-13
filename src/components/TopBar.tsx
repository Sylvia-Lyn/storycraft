import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, CrownOutlined, LoginOutlined, LogoutOutlined, DownOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Avatar } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useI18n, languageNames, Language } from '../contexts/I18nContext';

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { language, setLanguage, t, canChangeLanguage } = useI18n();
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => navigate('/profile')}>
                <UserOutlined /> {t('topbar.profile')}
            </Menu.Item>
            <Menu.Item key="vip" onClick={() => navigate('/vip')}>
                <CrownOutlined /> {t('topbar.memberCenter')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" onClick={handleLogout}>
                <LogoutOutlined /> {t('topbar.logout')}
            </Menu.Item>
        </Menu>
    );

    const handleLanguageClick = (lang: Language) => {
        if (lang === 'zh-CN' || canChangeLanguage) {
            setLanguage(lang);
        } else {
            // 显示需要会员的提示
            const confirmUpgrade = window.confirm('多语言功能需要会员权限，是否前往升级页面？');
            if (confirmUpgrade) {
                navigate('/vip');
            }
        }
    };

    const languageMenu = (
        <Menu>
            {Object.entries(languageNames).map(([lang, name]) => {
                const isLocked = lang !== 'zh-CN' && !canChangeLanguage;
                const isCurrent = language === lang;
                
                return (
                    <Menu.Item 
                        key={lang} 
                        onClick={() => handleLanguageClick(lang as Language)}
                        className={isCurrent ? 'bg-blue-50' : ''}
                        style={{ 
                            opacity: isLocked ? 0.6 : 1,
                            cursor: isLocked ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span>{name}</span>
                            {isLocked && <LockOutlined className="text-gray-400" />}
                        </div>
                    </Menu.Item>
                );
            })}
        </Menu>
    );

    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/')}
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
                <button
                    onClick={() => navigate('/vip')}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center"
                >
                    <CrownOutlined className="mr-1" />{t('topbar.vip')}
                </button>
                {isAuthenticated && user ? (
                    <Dropdown overlay={userMenu} trigger={['click']} onVisibleChange={setUserMenuVisible}>
                        <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <Avatar size="small" icon={<UserOutlined />} />
                            <span className="text-sm font-medium text-gray-700">{user.user_name}</span>
                            <DownOutlined className="text-xs text-gray-500" />
                        </div>
                    </Dropdown>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
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