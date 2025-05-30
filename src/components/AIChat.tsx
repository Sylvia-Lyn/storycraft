import React, { useState, useRef, useEffect } from 'react';
import { ChatService, ChatMessage, DocumentReference, ChatConfig } from '../services/chatService';

interface AIChatProps {
    knowledgeBaseId?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ knowledgeBaseId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedReference, setSelectedReference] = useState<DocumentReference | null>(null);
    const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatService = new ChatService();

    useEffect(() => {
        loadKnowledgeBases();
        if (knowledgeBaseId) {
            chatService.selectKnowledgeBase(knowledgeBaseId);
        }
    }, [knowledgeBaseId]);

    const loadKnowledgeBases = async () => {
        const bases = await chatService.listKnowledgeBases();
        setAvailableKnowledgeBases(bases);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setLoading(true);

        try {
            const config: ChatConfig = {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000,
                topK: 3,
                scoreThreshold: 0.7
            };

            const response = await chatService.sendMessage(userMessage, config);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('发送消息失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReferenceClick = (reference: DocumentReference) => {
        setSelectedReference(reference);
    };

    return (
        <div className="flex flex-col h-full">
            {/* 知识库选择器 */}
            <div className="p-4 border-b">
                <select
                    className="w-full p-2 border rounded"
                    value={knowledgeBaseId || ''}
                    onChange={(e) => chatService.selectKnowledgeBase(e.target.value)}
                >
                    <option value="">选择知识库</option>
                    {availableKnowledgeBases.map(base => (
                        <option key={base} value={base}>{base}</option>
                    ))}
                </select>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            <div className="whitespace-pre-wrap">{message.content}</div>

                            {/* 引用按钮 */}
                            {message.references && message.references.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {message.references.map((ref) => (
                                        <button
                                            key={ref.id}
                                            onClick={() => handleReferenceClick(ref)}
                                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            [{ref.id}]
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 引用内容显示 */}
            {selectedReference && (
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">引用内容</h3>
                        <button
                            onClick={() => setSelectedReference(null)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            关闭
                        </button>
                    </div>
                    <div className="text-sm text-gray-600">
                        <p className="mb-2">来源: {selectedReference.source}</p>
                        <p className="mb-2">相似度: {(selectedReference.score * 100).toFixed(1)}%</p>
                        <div className="bg-white p-3 rounded border">
                            {selectedReference.text}
                        </div>
                    </div>
                </div>
            )}

            {/* 输入区域 */}
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        className="flex-1 p-2 border rounded-lg resize-none"
                        rows={3}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`px-4 py-2 rounded-lg ${loading || !input.trim()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {loading ? '发送中...' : '发送'}
                    </button>
                </div>
            </div>
        </div>
    );
}; 