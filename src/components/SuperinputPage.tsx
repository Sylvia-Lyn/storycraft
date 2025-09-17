import React from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';

const SuperinputPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const handleStartCreate = () => {
        navigate('/story-settings');
    };

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-gray-50">
            <main className="flex-1 flex flex-col items-center justify-center p-8 min-h-[70vh]">
                <div className="w-full max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
                        {t('home.title')}
                    </h1>
                    <p className="text-center text-gray-500 mb-10">{t('home.subtitle')}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center gap-6 mb-10">
                        {/* Card 1: 网文小说创作 */}
                        <div
                            className={`w-full max-w-[320px] bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'novel' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            onClick={() => { setSelectedCard('novel'); navigate('/editor'); }}
                        >
                            <Icon icon="ph:book-open-text" className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">{t('home.novelCreation')}</h3>
                            <p className="text-gray-500 text-sm">{t('home.novelDesc')}</p>
                        </div>

                        {/* Card 2: 短剧剧本创作 */}
                        <div
                            className={`w-full max-w-[320px] bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'shortplay' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            onClick={() => { setSelectedCard('shortplay'); navigate('/outline'); }}
                        >
                            <Icon icon="ph:video" className="w-8 h-8 text-green-500 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">{t('home.shortPlayCreation')}</h3>
                            <p className="text-gray-500 text-sm">{t('home.shortPlayDesc')}</p>
                        </div>

                        {/* Card 3: 剧本杀剧本创作（暂时隐藏） */}
                        {false && (
                            <div
                                className={`bg-white p-6 rounded-lg border transition-shadow cursor-pointer hover:shadow-lg ${selectedCard === 'jubensha' ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
                                onClick={() => setSelectedCard('jubensha')}
                            >
                                <Icon icon="ph:headphones" className="w-8 h-8 text-purple-500 mb-3" />
                                <h3 className="font-semibold text-lg mb-1">{t('home.scriptKillCreation')}</h3>
                                <p className="text-gray-500 text-sm">{t('home.scriptKillDesc')}</p>
                            </div>
                        )}

                        {/* Card 4: 短剧 (Disabled) */}
                        <div className="w-full max-w-[320px] bg-gray-100 p-6 rounded-lg border border-gray-200 cursor-not-allowed flex flex-col items-center justify-center">
                            <Icon icon="ph:lock" className="w-8 h-8 text-gray-400 mb-3" />
                            <h3 className="font-semibold text-lg text-gray-400">{t('home.shortDrama')}</h3>
                        </div>
                    </div>

                    
                    <button
                        className="w-full bg-black text-white py-2 rounded-md text-lg font-semibold hover:bg-gray-900 transition-colors"
                        onClick={handleStartCreate}
                    >
                        {t('home.startCreation')}
                    </button>                    
                </div>

                <footer className="mt-auto pt-10">
                    <p className="text-gray-500">{t('home.creatorCommunity')}</p>
                </footer>
            </main>
        </div>
    );
};

export default SuperinputPage; 