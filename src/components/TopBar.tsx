import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, CrownOutlined, LoginOutlined } from '@ant-design/icons';

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    // TODO: 登录状态判断，暂用false
    const isLoggedIn = false;
    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="回到主页"
                >
                    <HomeOutlined className="text-xl text-gray-600" />
                </button>
                <span className="text-xl font-bold tracking-wide select-none">Storycraft</span>
            </div>
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/vip')}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center"
                >
                    <CrownOutlined className="mr-1" />会员
                </button>
                {isLoggedIn ? (
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        {/* 这里可替换为用户头像 */}
                        <UserOutlined className="text-xl text-gray-600" />
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
                    >
                        <LoginOutlined className="mr-1" />登录
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopBar; 