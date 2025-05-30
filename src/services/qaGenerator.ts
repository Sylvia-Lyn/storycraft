import config from '../config';

interface QAGeneratorConfig {
    model: string;
    temperature: number;
    maxTokens: number;
}

interface QAResponse {
    text: string;
    success: boolean;
    error?: string;
}

export class QAGenerator {
    private model: string;
    private apiKey: string;
    private apiBase: string;

    constructor(
        apiKey: string = config.DEEPSEEK_API_KEY,
        apiBase: string = config.DEEPSEEK_API_BASE,
        model: string = config.CHAT_MODEL
    ) {
        this.apiKey = apiKey;
        this.apiBase = apiBase;
        this.model = model;
    }

    async generateAnswer(
        query: string,
        context: string[],
        config: QAGeneratorConfig
    ): Promise<QAResponse> {
        try {
            const prompt = this.buildPrompt(query, context);

            const response = await fetch(`${this.apiBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的创作助手，基于提供的上下文回答问题。请确保回答准确、相关，并保持专业和友好的语气。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: config.temperature,
                    max_tokens: config.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                text: data.choices[0].message.content || '抱歉，我无法生成回答。',
                success: true
            };

        } catch (error) {
            console.error('生成回答失败:', error);
            return {
                text: '抱歉，生成回答时出现错误。',
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    }

    private buildPrompt(query: string, context: string[]): string {
        const contextText = context
            .map((text, index) => `[${index + 1}] ${text}`)
            .join('\n\n');

        return `基于以下参考内容回答问题：

参考内容：
${contextText}

问题：${query}

请基于上述参考内容提供准确、相关的回答。如果参考内容中没有相关信息，请明确说明。`;
    }
} 