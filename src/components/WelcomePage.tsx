import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useI18n } from '../contexts/I18nContext';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useI18n();

    const handleEnterApp = () => {
        navigate('/app/home');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl mx-auto text-center">
                {/* Logo/Icon 区域 */}
                <div className="mb-8">
                    <Icon 
                        icon="ph:book-open" 
                        className="w-20 h-20 text-blue-600 mx-auto mb-4" 
                    />
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        故事工坊
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        用AI助力你的创意写作之旅
                    </p>
                </div>

                {/* 主要功能介绍 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Icon icon="ph:book-open-text" className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">网文小说创作</h3>
                        <p className="text-gray-600 text-sm">
                            智能AI助手帮你创作精彩的长篇网络小说
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Icon icon="ph:video" className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">短剧剧本创作</h3>
                        <p className="text-gray-600 text-sm">
                            专业工具助你打造引人入胜的短剧剧本
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Icon icon="ph:lightning" className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">AI智能助手</h3>
                        <p className="text-gray-600 text-sm">
                            先进的AI技术提供创作灵感和写作支持
                        </p>
                    </div>
                </div>

                {/* 进入按钮 */}
                <div className="space-y-4">
                    <button
                        onClick={handleEnterApp}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        开始创作之旅
                    </button>
                    
                    <p className="text-gray-500 text-sm">
                        点击进入创作工坊，开启你的故事创作
                    </p>
                </div>

                {/* 底部信息 */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <p className="text-gray-500">
                        © 2024 故事工坊 - 让每个创意都有无限可能
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
