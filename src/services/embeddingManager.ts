import OpenAI from 'openai';

export class EmbeddingManager {
    private openai: OpenAI;
    private model: string;

    constructor(apiKey: string = '', apiBase: string = '', model: string = 'text-embedding-3-small') {
        this.openai = new OpenAI({
            apiKey,
            baseURL: apiBase
        });
        this.model = model;
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: texts
            });

            return response.data.map(item => item.embedding);
        } catch (error) {
            console.error('生成文档向量失败:', error);
            throw error;
        }
    }

    async embedQuery(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: text
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('生成查询向量失败:', error);
            throw error;
        }
    }
} 