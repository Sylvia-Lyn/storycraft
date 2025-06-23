import React, { useState } from 'react';
import { Icon } from '@iconify/react';

type PlanType = 'yearly' | 'quarterly' | 'monthly';

const planConfigs = [
    {
        key: 'monthly',
        label: '连续包月',
        discount: '4.5折',
        highlight: 'bg-gray-200 text-gray-800',
        tagClass: 'bg-blue-100 text-blue-600',
        desc: '首月低至4.5折',
        trial: '7天免费试用，包月可随时取消',
    },
    {
        key: 'quarterly',
        label: '连续包季',
        discount: '4折',
        highlight: 'bg-black text-white',
        tagClass: 'bg-red-500 text-white',
        desc: '首季低至4折',
        trial: '7天免费试用，包季可随时取消',
    },
    {
        key: 'yearly',
        label: '连续包年',
        discount: '3.5折',
        highlight: 'bg-blue-600 text-white',
        tagClass: 'bg-red-100 text-red-600',
        desc: '首年低至3.5折',
        trial: '15天免费试用，包年可随时取消',
    },

];

const planDurations = {
    yearly: '年',
    quarterly: '季',
    monthly: '月',
};

const pricingData = {
    yearly: {
        chinese: { price: 849, original: 2388, discount: '3.5折', renew: 1299 },
        multilingual: { price: 1049, original: 2988, discount: '3.5折', renew: 1599 },
    },
    quarterly: {
        chinese: { price: 229, original: 597, discount: '4折', renew: 299 },
        multilingual: { price: 289, original: 747, discount: '4折', renew: 379 },
    },
    monthly: {
        chinese: { price: 89, original: 199, discount: '4.5折', renew: 99 },
        multilingual: { price: 109, original: 249, discount: '4.5折', renew: 129 },
    },
};

const VipPage: React.FC = () => {
    const [plan, setPlan] = useState<PlanType>('yearly');
    const selectedPricing = pricingData[plan];
    const planConfig = planConfigs.find(p => p.key === plan)!;

    const FeatureItem: React.FC<{ children: React.ReactNode; checked?: boolean, locked?: boolean }> = ({ children, checked = true, locked = false }) => (
        <li className="flex items-start">
            {locked
                ? <Icon icon="ri:lock-line" className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                : <Icon icon="ri:check-line" className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            }
            <span>{children}</span>
        </li>
    );

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 h-screen overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto">
                <div className="absolute top-8 right-8">
                    <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold">
                        免费版 | 积分: 30000
                    </button>
                </div>

                {/* 选择套餐类型 */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border flex items-center space-x-2">
                        {planConfigs.map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPlan(p.key as PlanType)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${plan === p.key ? p.highlight : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {p.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${p.tagClass}`}>{p.discount}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* 免费版 */}
                    <div className="bg-white rounded-2xl p-8 border h-fit">
                        <h3 className="text-2xl font-semibold mb-2">免费版</h3>
                        <p className="text-4xl font-bold mb-1">0 <span className="text-lg font-normal text-gray-500">元/{planDurations[plan]}</span></p>
                        <p className="text-gray-400 mb-6 text-sm">永久</p>
                        <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 text-base">免费</button>
                        <ul className="mt-8 space-y-4 text-gray-600 text-sm">
                            <FeatureItem>每日登录送2000积分</FeatureItem>
                            <FeatureItem>AI辅助创作大纲、角色设定</FeatureItem>
                            <FeatureItem>AI辅助续写网文、剧本</FeatureItem>
                            <FeatureItem>海量最新通用AI大模型</FeatureItem>
                            <FeatureItem>每日推荐创作提示词</FeatureItem>
                        </ul>
                    </div>

                    {/* 中文专业版 */}
                    <div className="bg-black text-white rounded-2xl p-8 transform scale-105 shadow-2xl relative">
                        <div className="absolute -top-3 right-8 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">{planConfig.desc}</div>
                        <h3 className="text-2xl font-semibold mb-2">中文专业版</h3>
                        <p className="text-4xl font-bold mb-1">{selectedPricing.chinese.price} <span className="text-lg font-normal text-gray-400">元/{planDurations[plan]}</span></p>
                        <p className="text-gray-400 mb-2 text-sm">下{planDurations[plan]}续费: {selectedPricing.chinese.renew}元 [5折]</p>
                        <p className="text-gray-400 mb-6 text-sm">{planConfig.trial}</p>
                        <button className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 text-base">购买</button>
                        <ul className="mt-8 space-y-4 text-sm">
                            <FeatureItem>每日登录送<strong className="mx-1">1万</strong>积分</FeatureItem>
                            <FeatureItem>一键生成商用级网文、剧本</FeatureItem>
                            <FeatureItem>一键续写、润色深度润色网文、剧本</FeatureItem>
                            <FeatureItem>精选专业级、海量通用AI大模型</FeatureItem>
                            <FeatureItem>支持AI拆书，自定义创作知识库</FeatureItem>
                            <FeatureItem>免费使用专业创作提示词</FeatureItem>
                            <FeatureItem locked>专业创作课程试听</FeatureItem>
                        </ul>
                    </div>

                    {/* 多语言专业版 */}
                    <div className="bg-white rounded-2xl p-8 border h-fit relative">
                        <div className="absolute -top-3 right-8 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">{planConfig.desc}</div>
                        <h3 className="text-2xl font-semibold mb-2">多语言专业版</h3>
                        <p className="text-4xl font-bold mb-1">{selectedPricing.multilingual.price} <span className="text-lg font-normal text-gray-500">元/{planDurations[plan]}</span></p>
                        <p className="text-gray-400 mb-2 text-sm">下{planDurations[plan]}续费: {selectedPricing.multilingual.renew}元 [5折]</p>
                        <p className="text-gray-400 mb-6 text-sm">{planConfig.trial}</p>
                        <button className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black text-base">购买</button>
                        <ul className="mt-8 space-y-4 text-gray-600 text-sm">
                            <FeatureItem>每日登录送<strong className="mx-1">1万</strong>积分</FeatureItem>
                            <FeatureItem>一键生成商用级多语言网文、剧本</FeatureItem>
                            <FeatureItem>一键续写、润色多语言网文、剧本</FeatureItem>
                            <FeatureItem>精选专业级、海量通用AI大模型</FeatureItem>
                            <FeatureItem>支持AI拆书，自定义创作知识库</FeatureItem>
                            <FeatureItem>免费使用专业创作提示词</FeatureItem>
                            <FeatureItem>专业创作课程试听</FeatureItem>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VipPage; 