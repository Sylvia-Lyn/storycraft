interface Config {
    DEEPSEEK_API_KEY: string;
    DEEPSEEK_API_BASE: string;
    GEMINI_API_KEY: string;
    GEMINI_API_BASE: string;
    QDRANT_URL: string;
    QDRANT_API_KEY: string;
    EMBEDDING_MODEL: string;
    CHAT_MODEL: string;
    VECTOR_DIM: number;
    COLLECTION_NAME: string;
    CHUNK_SIZE: number;
    CHUNK_OVERLAP: number;
    TOP_K: number;
    SCORE_THRESHOLD: number;
    KEYWORD_WEIGHT: number;
    VECTOR_WEIGHT: number;
    MAX_CONTEXT_LENGTH: number;
    MAX_TOKENS: number;
    TEMPERATURE: number;
    STRIPE_PUBLISHABLE_KEY: string;
}

const config: Config = {
    DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-3c50dc547bcc443cbfd8f34e7ee5f138',
    DEEPSEEK_API_BASE: import.meta.env.VITE_DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCtg3qPLGvCeXGn3ixraod6MvDVxa-6SpA',
    GEMINI_API_BASE: import.meta.env.VITE_GEMINI_API_BASE || 'https://generativelanguage.googleapis.com',
    QDRANT_URL: import.meta.env.VITE_QDRANT_URL || 'https://eb24099c-54e1-4fd9-9a66-1a0dcc65d895.eu-west-2-0.aws.cloud.qdrant.io',
    QDRANT_API_KEY: import.meta.env.VITE_QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.L7WJflCWFN1-XanTthshcDqXFjD8usge2Hwfli8YYJY',
    EMBEDDING_MODEL: 'all-MiniLM-L6-v2',
    CHAT_MODEL: 'deepseek-chat',
    VECTOR_DIM: 384,
    COLLECTION_NAME: 'script_collection',
    CHUNK_SIZE: 800,
    CHUNK_OVERLAP: 200,
    TOP_K: 8,
    SCORE_THRESHOLD: 0.05,
    KEYWORD_WEIGHT: 0.4,
    VECTOR_WEIGHT: 0.6,
    MAX_CONTEXT_LENGTH: 2000,
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.6,
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key'
};

export function validateConfig(): boolean {
    const requiredFields: (keyof Config)[] = [
        'DEEPSEEK_API_KEY',
        'GEMINI_API_KEY',
        'QDRANT_URL',
        'QDRANT_API_KEY'
    ];

    return requiredFields.every(field => {
        const value = config[field];
        if (!value) {
            console.error(`缺少必要的配置项: ${field}`);
            return false;
        }
        return true;
    });
}

export default config; 