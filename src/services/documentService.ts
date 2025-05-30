import { DocumentProcessor } from './documentProcessor';
import { EmbeddingManager } from './embeddingManager';
import { VectorStore } from './vectorStore';

export interface DocumentStats {
    fileName: string;
    fileSize: number;
    totalChunks: number;
    processingTime: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}

export interface ProcessingConfig {
    chunkSize: number;
    overlapSize: number;
    model: string;
}

export class DocumentService {
    private documentProcessor: DocumentProcessor;
    private embeddingManager: EmbeddingManager;
    private vectorStore: VectorStore;

    constructor() {
        this.documentProcessor = new DocumentProcessor();
        this.embeddingManager = new EmbeddingManager();
        this.vectorStore = new VectorStore();
    }

    async uploadDocument(file: File, config: ProcessingConfig): Promise<DocumentStats> {
        try {
            // 1. 验证文件
            if (!this.validateFile(file)) {
                throw new Error('不支持的文件格式');
            }

            // 2. 处理文档
            const textChunks = await this.documentProcessor.processDocument(file, {
                chunkSize: config.chunkSize,
                overlapSize: config.overlapSize
            });

            // 3. 生成向量
            const vectors = await this.embeddingManager.embedDocuments(textChunks);

            // 4. 存储到向量数据库
            await this.vectorStore.storeVectors(vectors, {
                fileName: file.name,
                chunks: textChunks
            });

            return {
                fileName: file.name,
                fileSize: file.size,
                totalChunks: textChunks.length,
                processingTime: Date.now(),
                status: 'completed'
            };

        } catch (error) {
            return {
                fileName: file.name,
                fileSize: file.size,
                totalChunks: 0,
                processingTime: Date.now(),
                status: 'error',
                error: error.message
            };
        }
    }

    private validateFile(file: File): boolean {
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        return allowedTypes.includes(file.type);
    }

    async getDocumentStats(fileName: string): Promise<DocumentStats | null> {
        return this.vectorStore.getDocumentStats(fileName);
    }

    async listDocuments(): Promise<string[]> {
        return this.vectorStore.listDocuments();
    }
} 