// Mock implementation of EmbeddingManager
export class EmbeddingManager {
  private apiKey: string;
  private apiBase: string;
  private model: string;

  constructor(apiKey: string, apiBase: string, model: string) {
    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.model = model;
    console.log('EmbeddingManager initialized with:', {
      apiKey: this.apiKey ? '***' : 'undefined',
      apiBase: this.apiBase,
      model: this.model
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    console.log('Generating embedding for text:', text.substring(0, 50) + '...');
    // Return a mock embedding
    return new Array(1536).fill(0).map(() => Math.random());
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating embeddings for ${texts.length} texts`);
    return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }

  async embedQuery(query: string): Promise<number[]> {
    console.log('Embedding query:', query);
    return this.generateEmbedding(query);
  }

  async embedDocuments(docs: any[]): Promise<number[][]> {
    console.log(`Embedding ${docs.length} documents`);
    return Promise.all(docs.map(doc => this.generateEmbedding(JSON.stringify(doc))));
  }

  async getEmbeddingModelInfo(): Promise<{ model: string; dimensions: number }> {
    return {
      model: this.model,
      dimensions: 1536
    };
  }
}

export default new EmbeddingManager(
  process.env.DEEPSEEK_API_KEY || 'mock-api-key',
  process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com',
  process.env.EMBEDDING_MODEL || 'mock-embedding-model'
);
