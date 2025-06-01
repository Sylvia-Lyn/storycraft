import { VectorStore } from './vectorStore';
import { EmbeddingManager } from './embeddingManager';
import { QAGenerator } from './qaGenerator';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    references?: DocumentReference[];
}

export interface DocumentReference {
    id: number;
    text: string;
    score: number;
    source: string;
}

export interface ChatConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    topK: number;
    scoreThreshold: number;
}

export class ChatService {
    private vectorStore: VectorStore;
    private embeddingManager: EmbeddingManager;
    private qaGenerator: QAGenerator;
    private chatHistory: ChatMessage[] = [];

    constructor() {
        this.vectorStore = new VectorStore();
        this.embeddingManager = new EmbeddingManager();
        this.qaGenerator = new QAGenerator();
    }

    async sendMessage(message: string, config: ChatConfig): Promise<ChatMessage> {
        try {
            // 1. 生成查询向量
            const queryVector = await this.embeddingManager.embedQuery(message);

            // 2. 检索相关文档
            const relevantDocs = await this.vectorStore.searchSimilar(
                queryVector,
                config.topK,
                config.scoreThreshold
            );

            // 3. 生成回答
            const answer = await this.qaGenerator.generateAnswer(
                message,
                relevantDocs,
                {
                    model: config.model,
                    temperature: config.temperature,
                    maxTokens: config.maxTokens
                }
            );

            // 4. 创建回复消息
            const response: ChatMessage = {
                role: 'assistant',
                content: answer.text,
                timestamp: Date.now(),
                references: relevantDocs.map((doc, index) => ({
                    id: index + 1,
                    text: doc.payload?.text || '未知内容',
                    score: doc.score,
                    source: doc.payload?.metadata?.source || '未知来源'
                }))
            };

            // 5. 更新对话历史
            this.chatHistory.push(
                { role: 'user', content: message, timestamp: Date.now() },
                response
            );

            return response;

        } catch (error) {
            throw new Error(`对话生成失败: ${error.message}`);
        }
    }

    getChatHistory(): ChatMessage[] {
        return this.chatHistory;
    }

    clearChatHistory(): void {
        this.chatHistory = [];
    }

    async selectKnowledgeBase(knowledgeBaseId: string): Promise<void> {
        await this.vectorStore.setActiveCollection(knowledgeBaseId);
    }

    async listKnowledgeBases(): Promise<string[]> {
        return this.vectorStore.listCollections();
    }
} 