import config from '../config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface VectorDocument {
    id: string;
    vector: number[];
    payload: {
        text: string;
        metadata: {
            source: string;
            [key: string]: any;
        };
    };
}

export class VectorStore {
    private client: QdrantClient;
    private collectionName: string;
    private vectorSize: number;

    constructor(
        url: string = config.QDRANT_URL,
        apiKey: string = config.QDRANT_API_KEY,
        collectionName: string = config.COLLECTION_NAME,
        vectorSize: number = config.VECTOR_DIM
    ) {
        this.client = new QdrantClient({
            url,
            apiKey
        });
        this.collectionName = collectionName;
        this.vectorSize = vectorSize;
    }

    async initialize(): Promise<void> {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(
                (collection: any) => collection.name === this.collectionName
            );

            if (!exists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine'
                    }
                });
            }
        } catch (error) {
            console.error('初始化向量存储失败:', error);
            throw error;
        }
    }

    async storeVectors(documents: VectorDocument[]): Promise<void> {
        try {
            const points = documents.map(doc => ({
                id: doc.id,
                vector: doc.vector,
                payload: doc.payload
            }));

            await this.client.upsert(this.collectionName, {
                points
            });
        } catch (error) {
            console.error('存储向量失败:', error);
            throw error;
        }
    }

    async searchSimilar(
        vector: number[],
        limit: number = config.TOP_K,
        scoreThreshold: number = config.SCORE_THRESHOLD
    ): Promise<Array<{ id: string; score: number; payload: any }>> {
        try {
            const response = await this.client.search(this.collectionName, {
                vector,
                limit,
                score_threshold: scoreThreshold
            });

            return response.map((result: any) => ({
                id: result.id as string,
                score: result.score,
                payload: result.payload
            }));
        } catch (error) {
            console.error('搜索相似向量失败:', error);
            throw error;
        }
    }

    async deleteCollection(): Promise<void> {
        try {
            await this.client.deleteCollection(this.collectionName);
        } catch (error) {
            console.error('删除集合失败:', error);
            throw error;
        }
    }
} 