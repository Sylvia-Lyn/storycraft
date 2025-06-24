import React from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SuperinputPage: React.FC = () => {
    const navigate = useNavigate();
    const [draftContent, setDraftContent] = useState('');
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);

    const handleStartCreate = () => {
        if (draftContent.trim()) {
            localStorage.setItem('draft_content', draftContent);
            navigate('/editor');
        } else {
            alert('请输入初稿内容');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-gray-50">
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
                        Storycraft : 让我陪你一起创作
                    </h1>
                    <p className="text-center text-gray-500 mb-10">探索、创作、分享你的故事</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {/* Card 1: 网文小说创作 */}
                        <div
                            className={`bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'novel' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            onClick={() => setSelectedCard('novel')}
                        >
                            <Icon icon="ph:book-open-text" className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">网文小说创作</h3>
                            <p className="text-gray-500 text-sm">一键生成签约级初稿</p>
                        </div>

                        {/* Card 2: 短剧剧本创作 */}
                        <div
                            className={`bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'shortplay' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            onClick={() => setSelectedCard('shortplay')}
                        >
                            <Icon icon="ph:video" className="w-8 h-8 text-green-500 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">短剧剧本创作</h3>
                            <p className="text-gray-500 text-sm">创作50-100集短剧剧本</p>
                        </div>

                        {/* Card 3: 剧本杀剧本创作 */}
                        <div
                            className={`bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'jubensha' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            onClick={() => setSelectedCard('jubensha')}
                        >
                            <Icon icon="ph:headphones" className="w-8 h-8 text-purple-500 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">剧本杀剧本创作</h3>
                            <p className="text-gray-500 text-sm">创作50w字情感本</p>
                        </div>

                        {/* Card 4: 短剧 (Disabled) */}
                        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 cursor-not-allowed flex flex-col items-center justify-center">
                            <Icon icon="ph:lock" className="w-8 h-8 text-gray-400 mb-3" />
                            <h3 className="font-semibold text-lg text-gray-400">短剧</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <select className="bg-gray-900 text-white rounded px-2 py-1 text-xs font-semibold h-7">
                                <option>Gemini-2.5-pro</option>
                            </select>
                            <button
                                className={`px-2 py-1 border rounded text-xs h-7 ${selectedMode === 'continue' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'}`}
                                onClick={() => setSelectedMode('continue')}
                                type="button"
                            >
                                续写模式
                            </button>
                            <button
                                className={`px-2 py-1 border rounded text-xs h-7 ${selectedMode === 'create' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'}`}
                                onClick={() => setSelectedMode('create')}
                                type="button"
                            >
                                创作模式
                            </button>
                            <select className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 h-7">
                                <option>文风参考</option>
                            </select>
                            <select className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 h-7">
                                <option>提示词</option>
                            </select>
                            <select className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 h-7">
                                <option>角色</option>
                            </select>
                        </div>
                        <textarea
                            className="w-full h-40 border border-gray-200 rounded-md p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入你要续写的内容"
                            value={draftContent}
                            onChange={e => setDraftContent(e.target.value)}
                        ></textarea>
                        <button
                            className="mt-4 w-full bg-black text-white py-2 rounded-md text-lg font-semibold hover:bg-gray-900 transition-colors"
                            onClick={handleStartCreate}
                        >
                            开始创作
                        </button>
                    </div>
                </div>

                <footer className="mt-auto pt-10">
                    <p className="text-gray-500">创作者社区</p>
                </footer>
            </main>
        </div>
    );
};

export default SuperinputPage; 