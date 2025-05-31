import config from '../config';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth';

export interface ProcessedDocument {
    text: string;
    chunks: string[];
    tags: string[];
    metadata: {
        fileName: string;
        fileType: string;
        fileSize: number;
        processedAt: Date;
    };
}

export class DocumentProcessor {
    private chunkSize: number;
    private chunkOverlap: number;

    constructor(
        chunkSize: number = config.CHUNK_SIZE,
        chunkOverlap: number = config.CHUNK_OVERLAP
    ) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;

        // 初始化 PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    async processDocument(file: File): Promise<ProcessedDocument> {
        try {
            // 1. 转换文档为文本
            const text = await this.convertDocument(file);

            // 2. 分块处理
            const chunks = await this.splitText(text);

            // 3. 生成标签
            const tags = await this.generateTags(text);

            return {
                text,
                chunks,
                tags,
                metadata: {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    processedAt: new Date()
                }
            };
        } catch (error) {
            console.error('文档处理失败:', error);
            throw error;
        }
    }

    private async convertDocument(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const content = event.target?.result;
                    let text = '';

                    switch (file.type) {
                        case 'application/pdf':
                            if (content instanceof ArrayBuffer) {
                                text = await this.convertPDF(content);
                            } else {
                                throw new Error('PDF 文件读取失败');
                            }
                            break;
                        case 'application/msword':
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            if (content instanceof ArrayBuffer) {
                                text = await this.convertWord(content);
                            } else {
                                throw new Error('Word 文件读取失败');
                            }
                            break;
                        case 'text/plain':
                        case 'text/markdown':
                            if (typeof content === 'string') {
                                text = content;
                            } else {
                                throw new Error('文本文件读取失败');
                            }
                            break;
                        default:
                            throw new Error(`不支持的文件类型: ${file.type}`);
                    }

                    resolve(text);
                } catch (error: any) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            // 对于 PDF 和 Word 文件，使用 ArrayBuffer 读取
            if (file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    private async convertPDF(content: ArrayBuffer): Promise<string> {
        try {
            // 加载 PDF 文档
            const pdf = await pdfjsLib.getDocument({ data: content }).promise;
            let text = '';

            // 遍历所有页面
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();

                // 提取文本内容
                const pageText = content.items
                    .map((item: any) => item.str)
                    .join(' ');

                text += pageText + '\n\n';
            }

            return text.trim();
        } catch (error: any) {
            console.error('PDF 转换失败:', error);
            throw new Error('PDF 转换失败: ' + error.message);
        }
    }

    private async convertWord(content: ArrayBuffer): Promise<string> {
        try {
            // 使用 mammoth 转换 Word 文档
            const result = await mammoth.extractRawText({ arrayBuffer: content });
            return result.value;
        } catch (error: any) {
            console.error('Word 转换失败:', error);
            throw new Error('Word 转换失败: ' + error.message);
        }
    }

    private async splitText(text: string): Promise<string[]> {
        const chunks: string[] = [];
        let currentIndex = 0;

        while (currentIndex < text.length) {
            // 计算当前块的结束位置
            let endIndex = Math.min(
                currentIndex + this.chunkSize,
                text.length
            );

            // 如果不是最后一块，尝试在句子边界处分割
            if (endIndex < text.length) {
                const nextPeriod = text.indexOf('.', endIndex - 100);
                if (nextPeriod !== -1 && nextPeriod < endIndex + 100) {
                    endIndex = nextPeriod + 1;
                }
            }

            // 提取当前块
            const chunk = text.slice(currentIndex, endIndex).trim();
            if (chunk) {
                chunks.push(chunk);
            }

            // 更新索引，考虑重叠
            currentIndex = endIndex - this.chunkOverlap;
        }

        return chunks;
    }

    private async generateTags(text: string): Promise<string[]> {
        // 简单的标签生成逻辑
        const words = text.toLowerCase().split(/\s+/);
        const wordFreq: { [key: string]: number } = {};

        // 统计词频
        words.forEach(word => {
            if (word.length > 3) { // 忽略短词
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // 按频率排序并返回前10个词作为标签
        return Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }
} 