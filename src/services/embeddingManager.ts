// Mock implementation of EmbeddingManager
export class EmbeddingManager {
  async generateEmbedding(text: string): Promise<number[]> {
    console.log('Generating embedding for text:', text.substring(0, 50) + '...');
    // Return a mock embedding
    return new Array(1536).fill(0).map(() => Math.random());
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Generating embeddings for ${texts.length} texts`);
    return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }

  async getEmbeddingModelInfo(): Promise<{ model: string; dimensions: number }> {
    return {
      model: 'mock-embedding-model',
      dimensions: 1536
    };
  }
}

export default new EmbeddingManager();
