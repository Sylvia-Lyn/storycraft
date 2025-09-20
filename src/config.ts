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
    SCRIPT_API_URL: string;
    SCRIPT_API_KEY: string;
    CLOUDBASE_API_BASE: string;
    PROMPT_API_URL: string;
}

const config: Config = {
    DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
    DEEPSEEK_API_BASE: import.meta.env.VITE_DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    GEMINI_API_BASE: import.meta.env.VITE_GEMINI_API_BASE || 'https://generativelanguage.googleapis.com',
    QDRANT_URL: import.meta.env.VITE_QDRANT_URL || '',
    QDRANT_API_KEY: import.meta.env.VITE_QDRANT_API_KEY || '',
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
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    SCRIPT_API_URL: import.meta.env.VITE_SCRIPT_API_URL || '',
    SCRIPT_API_KEY: import.meta.env.VITE_SCRIPT_API_KEY || '',
    CLOUDBASE_API_BASE: import.meta.env.VITE_CLOUDBASE_API_BASE || 'https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com',
    PROMPT_API_URL: import.meta.env.VITE_PROMPT_API_URL || 'https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/prompt_manager'
};

export function validateConfig(): boolean {
    const requiredFields: (keyof Config)[] = [
        'DEEPSEEK_API_KEY',
        'GEMINI_API_KEY',
        'QDRANT_URL',
        'QDRANT_API_KEY',
        'SCRIPT_API_URL'
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