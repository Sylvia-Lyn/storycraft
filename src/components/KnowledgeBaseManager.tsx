import React, { useState, useEffect } from 'react';
import { VectorStore } from '../services/vectorStore';
import { DocumentProcessor, ProcessedDocument } from '../services/documentProcessor';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

interface KnowledgeBase {
    name: string;
    documentCount: number;
    lastUpdated: Date;
}

export const KnowledgeBaseManager: React.FC = () => {
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
    const [selectedBase, setSelectedBase] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    const vectorStore = new VectorStore();
    const documentProcessor = new DocumentProcessor();

    useEffect(() => {
        loadKnowledgeBases();
    }, []);

    const loadKnowledgeBases = async () => {
        try {
            // TODO: 实现从后端获取知识库列表
            const bases: KnowledgeBase[] = [
                {
                    name: '默认知识库',
                    documentCount: 0,
                    lastUpdated: new Date()
                }
            ];
            setKnowledgeBases(bases);
            if (bases.length > 0) {
                setSelectedBase(bases[0].name);
            }
        } catch (error) {
            console.error('加载知识库列表失败:', error);
            toast.error('加载知识库列表失败');
        }
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (!selectedBase) {
            toast.error('请先选择知识库');
            return;
        }

        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                setProcessingProgress((i / acceptedFiles.length) * 100);

                // 处理文档
                const processedDoc = await documentProcessor.processDocument(file);

                // 存储到向量数据库
                await vectorStore.storeVectors(
                    processedDoc.chunks.map((chunk, index) => ({
                        id: `${file.name}_${index}`,
                        vector: [], // TODO: 使用 EmbeddingManager 生成向量
                        payload: {
                            text: chunk,
                            metadata: {
                                source: file.name,
                                tags: processedDoc.tags,
                                chunkIndex: index
                            }
                        }
                    }))
                );

                toast.success(`文件 ${file.name} 处理完成`);
            }

            // 更新知识库列表
            await loadKnowledgeBases();
        } catch (error) {
            console.error('处理文件失败:', error);
            toast.error('处理文件失败');
        } finally {
            setIsProcessing(false);
            setProcessingProgress(0);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md']
        }
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">知识库管理</h2>

            {/* 知识库选择 */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">选择知识库</label>
                <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    {knowledgeBases.map((base) => (
                        <option key={base.name} value={base.name}>
                            {base.name} ({base.documentCount} 个文档)
                        </option>
                    ))}
                </select>
            </div>

            {/* 文件上传区域 */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${processingProgress}%` }}
                            ></div>
                        </div>
                        <p>处理中... {Math.round(processingProgress)}%</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg mb-2">
                            {isDragActive
                                ? '放开以上传文件'
                                : '拖拽文件到此处，或点击选择文件'}
                        </p>
                        <p className="text-sm text-gray-500">
                            支持 PDF、Word、TXT、MD 格式
                        </p>
                    </div>
                )}
            </div>

            {/* 知识库统计信息 */}
            {selectedBase && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">知识库统计</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">文档数量</p>
                            <p className="text-lg font-medium">
                                {knowledgeBases.find(b => b.name === selectedBase)?.documentCount || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">最后更新</p>
                            <p className="text-lg font-medium">
                                {knowledgeBases.find(b => b.name === selectedBase)?.lastUpdated.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 