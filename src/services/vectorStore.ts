// Mock implementation of VectorStore
export class VectorStore {
  async search(query: string, limit: number = 5): Promise<any[]> {
    console.log(`Searching for: ${query} with limit: ${limit}`);
    return [];
  }

  async addDocument(doc: any): Promise<void> {
    console.log('Adding document:', doc);
  }

  async deleteDocument(docId: string): Promise<void> {
    console.log('Deleting document:', docId);
  }

  async listDocuments(): Promise<any[]> {
    console.log('Listing documents');
    return [];
  }

  async clear(): Promise<void> {
    console.log('Clearing vector store');
  }
}

export default new VectorStore();
