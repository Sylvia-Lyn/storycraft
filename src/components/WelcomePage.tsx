import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { Select } from 'antd';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [draftContent, setDraftContent] = useState<string>('');
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string>('storycraft');
    const [selectedGenre, setSelectedGenre] = useState<string>('古风');

    const handleFreeTrial = () => {
        navigate('/app/home');
    };

    const handleContinue = () => {
        // 收集用户选择的所有信息
        const userSelections = {
            mode: selectedMode,
            content: draftContent,
            genre: selectedGenre,
            model: 'deepseek' // 默认模型
        };
        
        console.log('[WelcomePage] handleContinue called with userSelections:', userSelections);
        
        // 通过路由状态传递数据到editor页面
        navigate('/app/editor', { 
            state: { 
                initialData: userSelections 
            } 
        });
        
        console.log('[WelcomePage] Navigation to /app/editor with state:', { initialData: userSelections });
    };

    const handleContactUs = () => {
        // 暂时不设置事件
        console.log('联系我们');
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* 顶部导航栏 */}
            <div className="w-full h-20 bg-black border-b border-gray-800">
                <div className="mx-auto pl-8 pr-8 sm:pl-12 sm:pr-12 lg:pl-16 lg:pr-16">
                    <div className="flex items-center justify-between h-20 space-x-12">
                        {/* 左侧品牌名 */}
                        <div className="flex-shrink-0">
                            <h1 className="text-white text-3xl font-bold">
                                千帆叙梦
                            </h1>
                        </div>

                        {/* 中间业务导航 */}
                        <div className="hidden lg:block">
                            <div className="flex items-center space-x-8 lg:space-x-12">
                                <span className="text-white text-lg hover:text-gray-300 cursor-pointer transition-colors">
                                    短剧创作
                                </span>
                                <span className="text-white text-lg hover:text-gray-300 cursor-pointer transition-colors">
                                    小说创作
                                </span>
                                <span className="text-white text-lg hover:text-gray-300 cursor-pointer transition-colors">
                                    批量创作
                                </span>
                                <span className="text-white text-lg hover:text-gray-300 cursor-pointer transition-colors">
                                    互动短剧
                                </span>
                            </div>
                        </div>

                        {/* 右侧按钮 */}
                        <div className="flex items-center space-x-6 sm:space-x-8">
                            <button
                                onClick={handleFreeTrial}
                                className="px-4 py-2 sm:px-5 text-lg sm:text-xl font-medium text-white bg-transparent border border-white rounded-md hover:bg-white hover:text-black transition-colors duration-200"
                            >
                                免费试用
                            </button>
                            <button
                                onClick={handleContactUs}
                                className="px-4 py-2 sm:px-5 text-lg sm:text-xl font-medium text-white bg-transparent border border-white rounded-md hover:bg-white hover:text-black transition-colors duration-200"
                            >
                                联系我们
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 背景图片与内容分层区域 */}
            <div className="relative w-full">
                {/* 独立的背景图片层（顶部贴合导航栏底部）*/}
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat"
                    style={{ backgroundImage: 'url(/img/welcomePage/welcome_page_background.png)' }}
                >
                    <div className="absolute inset-0 bg-black opacity-0 brightness-50"></div>
                </div>
                {/* 主要内容层 */}
                <div className="relative flex items-start justify-center pt-32 pb-8 z-10">
                <div className="text-center w-full px-8">
                    <h1
                        className="text-white text-[50px] leading-[100%] tracking-[0] mb-12"
                        style={{
                            fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                            fontWeight: 510,
                            lineHeight: '100%',
                            letterSpacing: '0px'
                        }}
                    >
                        千帆叙梦：打造全球化 AIGC 造梦引擎
                    </h1>
                    <p
                        className="text-white text-[25px] leading-[100%] tracking-[0] mb-24"
                        style={{
                            fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                            fontWeight: 510,
                            lineHeight: '100%',
                            letterSpacing: '0px'
                        }}
                    >
                        发现新时代最好的互动内容
                    </p>
                    
                    {/* 输入面板 */}
                    <div className="bg-black/40 backdrop-blur-sm p-8 rounded-lg border border-gray-600 w-full md:max-w-[75vw] mx-auto">
                        <div className="flex flex-wrap items-center gap-32 mb-4">
                            <Select
                                defaultValue="剧本生成"
                                options={[{ value: '剧本生成', label: '剧本生成' }]}
                                className="ml-8 rounded welcome-select"
                                size="middle"
                                bordered
                                style={{ minWidth: 160, height: 36, borderColor: '#6B7280', fontSize: 18, lineHeight: '28px' }}
                                styles={{ 
                                    root: { backgroundColor: 'transparent', color: 'white' }
                                }}
                                dropdownStyle={{ backgroundColor: 'transparent' }}
                                popupClassName="custom-select-dropdown"
                            />
                            <div className="flex items-center gap-8">
                                <button
                                    className={`px-10 py-1 h-9 border rounded text-[18px] leading-[28px] font-normal bg-black hover:border-white hover:text-white transition-colors ${selectedMode === 'continue' ? 'border-white text-white bg-gray-800' : 'border-gray-500 text-gray-300'}`}
                                    onClick={() => setSelectedMode('continue')}
                                    type="button"
                                >
                                    续写模式
                                </button>
                                <button
                                    className={`px-10 py-1 h-9 border rounded text-[18px] leading-[28px] font-normal bg-black hover:border-white hover:text-white transition-colors ${selectedMode === 'create' ? 'border-white text-white bg-gray-800' : 'border-gray-500 text-gray-300'}`}
                                    onClick={() => setSelectedMode('create')}
                                    type="button"
                                >
                                    创作模式
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg text-gray-300">
                                    题材风格
                                </span>
                                <Select
                                    value={selectedGenre}
                                    onChange={(value) => setSelectedGenre(value)}
                                    options={[
                                        { value: '古风', label: '古风' },
                                        { value: '西方奇幻', label: '西方奇幻' },
                                        { value: '浪漫言情', label: '浪漫言情' },
                                        { value: '悬疑惊悚', label: '悬疑惊悚' },
                                        { value: '粉丝同人', label: '粉丝同人' },
                                        { value: '游戏竞技', label: '游戏竞技' },
                                        { value: 'LGBTQ+', label: 'LGBTQ+' },
                                    ]}
                                    className="rounded welcome-select"
                                    size="middle"
                                    bordered
                                    style={{ minWidth: 160, height: 36, borderColor: '#6B7280', fontSize: 18, lineHeight: '28px' }}
                                    styles={{ 
                                        root: { backgroundColor: 'transparent', color: 'white' }
                                    }}
                                    dropdownStyle={{ backgroundColor: 'transparent' }}
                                    popupClassName="custom-select-dropdown"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                className="w-full h-60 border border-transparent rounded-md p-4 pr-12 resize-none focus:outline-none focus:ring-0 bg-transparent active:bg-transparent focus:bg-transparent text-white placeholder-gray-400"
                                placeholder="请输入你想要创作的剧本内容"
                                value={draftContent}
                                onChange={e => setDraftContent(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleContinue}
                                className="absolute bottom-3 right-3 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors px-4 py-2"
                                title="开始创作"
                            >
                                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            
            {/* 底部三个选项框 */}
            <div className="flex-1 flex items-center justify-center pt-56">
                <div className="flex items-center space-x-28">
                    <button 
                        onClick={() => setSelectedProduct('storycraft')}
                        className={`px-16 py-8 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors text-xl ${selectedProduct === 'storycraft' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
                    >
                        Storycraft
                    </button>
                    <button 
                        onClick={() => setSelectedProduct('todaydrama')}
                        className={`px-16 py-8 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors text-xl ${selectedProduct === 'todaydrama' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
                    >
                        TodayDrama
                    </button>
                    <button className="px-16 py-8 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors text-xl">
                        作品
                    </button>
                </div>
            </div>
            
            {/* 功能展示容器 */}
            <div className="w-full mt-20">
                {selectedProduct === 'storycraft' ? (
                    <div className="space-y-0">
                        <h3 className="text-white text-4xl font-bold mb-0 text-center">Storycraft 功能展示</h3>
                        {/* 四个全屏大小的div */}
                        <div className="w-full h-screen flex flex-col items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <img 
                                    src="/img/welcomePage/storycraft/storycraft_feature1.png" 
                                    alt="智能创作" 
                                    className="w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] h-auto object-contain rounded-lg mb-8"
                                />
                                <p className="text-white text-2xl text-center">仅需3秒，输出3万字签约级小说</p>
                            </div>
                        </div>
                        <div className="w-full h-screen flex flex-col items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <img 
                                    src="/img/welcomePage/storycraft/storycraft_feature2.png" 
                                    alt="模板库" 
                                    className="w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] h-auto object-contain rounded-lg mb-8"
                                />
                                <p className="text-white text-2xl text-center">从大纲设定到细纲生成，一站式搞定长剧本创作全流程</p>
                            </div>
                        </div>
                        <div className="w-full h-screen flex flex-col items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <img 
                                    src="/img/welcomePage/storycraft/storycraft_feature3.png" 
                                    alt="协作功能" 
                                    className="w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] h-auto object-contain rounded-lg mb-8"
                                />
                                <p className="text-white text-2xl text-center">知识库管理，一键拆解全网爆剧，自动梳理角色剧情</p>
                            </div>
                        </div>
                        <div className="w-full h-screen flex flex-col items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <img 
                                    src="/img/welcomePage/storycraft/storycraft_feature4.png" 
                                    alt="智能分析" 
                                    className="w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] h-auto object-contain rounded-lg mb-8"
                                />
                                <p className="text-white text-2xl text-center">智能扩写剧情、文风润色、续写正文，告别“码字”痛苦，拥抱创作快乐</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-0">
                        <h3 className="text-white text-4xl font-bold mb-0 text-center">TodayDrama 功能展示</h3>
                        {/* 四个全屏大小的div，图片和文本框左右布局 */}
                        <div className="w-full h-screen flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full max-w-7xl flex items-center justify-between px-8">
                                <div className="flex-1 mr-36 flex flex-row space-x-4">
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature1_1.png" 
                                        alt="视频制作1" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature1_2.png" 
                                        alt="视频制作2" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature1_3.png" 
                                        alt="视频制作3" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                </div>
                                <div className="flex-none w-80 ml-36">
                                    <div className="bg-black bg-opacity-70 p-8 rounded-lg">
                                        <h4 className="text-white text-4xl font-bold mb-24">情感陪伴</h4>
                                        <p className="text-white text-2xl">有喜怒哀乐的“活人感”角色，沉浸式视频对话，亲密动作互动，满足随时随地pia戏的多元需求</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-screen flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full max-w-6xl flex items-center justify-between px-8">
                                <div className="flex-none w-80 mr-8">
                                    <div className="bg-black bg-opacity-70 p-8 rounded-lg">
                                        <h4 className="text-white text-4xl font-bold mb-24">互动短剧</h4>
                                        <p className="text-white text-2xl">用户与剧中人一同飙戏，决定剧情发展方向，与角色产生情感羁绊</p>
                                    </div>
                                </div>
                                <div className="flex-1 ml-8 flex flex-row space-x-1">
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature2_1.png" 
                                        alt="特效编辑1" 
                                        className="flex-1 w-full h-auto max-h-[65vh] object-contain rounded-lg"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature2_2.png" 
                                        alt="特效编辑2" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-screen flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full max-w-6xl flex items-center justify-between px-8">
                                <div className="flex-1 mr-8 flex flex-row relative">
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature3_1.png" 
                                        alt="剧本管理1" 
                                        className="h-auto max-h-[60vh] w-80 object-contain rounded-lg z-10 relative"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature3_2.png" 
                                        alt="剧本管理2" 
                                        className="h-auto max-h-[60vh] w-80 object-contain rounded-lg z-20 relative -ml-48"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature3_3.png" 
                                        alt="剧本管理3" 
                                        className="h-auto max-h-[60vh] w-80 object-contain rounded-lg z-30 relative -ml-48"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature3_4.png" 
                                        alt="剧本管理4" 
                                        className="h-auto max-h-[60vh] w-80 object-contain rounded-lg z-40 relative -ml-48"
                                    />
                                </div>
                                <div className="flex-none w-80 ml-8">
                                    <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                                        <h4 className="text-white text-4xl font-bold mb-24">私人专业助理</h4>
                                        <p className="text-white text-2xl">基于角色情感及信任感，基于剧中人/定制角色为高价值用户提供日常场景的专业咨询</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-screen flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full max-w-6xl flex items-center justify-between px-8">
                                <div className="flex-none w-80 mr-8">
                                    <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                                        <h4 className="text-white text-4xl font-bold mb-24">专属私密恋人</h4>
                                        <p className="text-white text-2xl">付费解锁剧中人形象&声音定制、随机CG抽取、奢华服装更换、角色外观DIY、专属场景打造、角色直播打榜</p>
                                    </div>
                                </div>
                                <div className="flex-1 ml-8 flex flex-row space-x-1">
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature4_1.png" 
                                        alt="云端协作1" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature4_2.png" 
                                        alt="云端协作2" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                    <img 
                                        src="/img/welcomePage/TodayDrama/TodayDrama_feature4_3.png" 
                                        alt="云端协作3" 
                                        className="flex-1 w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;
