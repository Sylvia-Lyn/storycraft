import React, { useState, useRef, useEffect } from 'react';
import { QAGenerator } from '../services/qaGenerator';
import { VectorStore } from '../services/vectorStore';
import { EmbeddingManager } from '../services/embeddingManager';
import { toast } from 'react-hot-toast';
import config from '../config';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    references?: Array<{
        text: string;
        source: string;
        score: number;
    }>;
}

interface ChatInterfaceProps {
    knowledgeBaseName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ knowledgeBaseName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const qaGenerator = new QAGenerator();
    const vectorStore = new VectorStore();
    const embeddingManager = new EmbeddingManager(
        config.DEEPSEEK_API_KEY,
        config.DEEPSEEK_API_BASE,
        config.EMBEDDING_MODEL
    );

    // 自动滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 1. 生成查询向量
            const queryVector = await embeddingManager.embedQuery(input);

            // 2. 搜索相关文档
            const searchResults = await vectorStore.searchSimilar(queryVector);

            // 3. 提取相关文本
            const context = searchResults.map(result => result.payload.text);

            // 4. 生成回答
            const response = await qaGenerator.generateAnswer(input, context, {
                model: config.CHAT_MODEL,
                temperature: config.TEMPERATURE,
                maxTokens: config.MAX_TOKENS
            });

            if (response.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.text,
                    references: searchResults.map(result => ({
                        text: result.payload.text,
                        source: result.payload.metadata.source,
                        score: result.score
                    }))
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(response.error || '生成回答失败');
            }
        } catch (error) {
            console.error('对话生成失败:', error);
            toast.error('对话生成失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {/* 参考文档 */}
                            {message.role === 'assistant' && message.references && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-sm font-medium mb-2">参考文档：</p>
                                    <div className="space-y-2">
                                        {message.references.map((ref, idx) => (
                                            <div
                                                key={idx}
                                                className="text-sm bg-white rounded p-2 shadow-sm"
                                            >
                                                <p className="text-gray-600 mb-1">
                                                    来源：{ref.source}
                                                </p>
                                                <p className="text-gray-800">{ref.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    相关度：{(ref.score * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="输入您的问题..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                    >
                        {isLoading ? '生成中...' : '发送'}
                    </button>
                </div>
            </form>
        </div>
    );
}; 