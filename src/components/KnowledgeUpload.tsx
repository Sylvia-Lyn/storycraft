import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentService, DocumentStats, ProcessingConfig } from '../services/documentService';

interface KnowledgeUploadProps {
    onUploadComplete?: (stats: DocumentStats) => void;
}

export const KnowledgeUpload: React.FC<KnowledgeUploadProps> = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState<DocumentStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const documentService = new DocumentService();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        setError(null);

        try {
            const config: ProcessingConfig = {
                chunkSize: 1000,
                overlapSize: 200,
                model: 'gpt-3.5-turbo'
            };

            for (const file of acceptedFiles) {
                const result = await documentService.uploadDocument(file, config);
                setStats(result);

                if (result.status === 'error') {
                    setError(result.error || '上传失败');
                } else if (onUploadComplete) {
                    onUploadComplete(result);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-gray-600">正在处理文档...</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg text-gray-600 mb-2">
                            {isDragActive ? '放开以上传文件' : '拖拽文件到这里，或点击选择文件'}
                        </p>
                        <p className="text-sm text-gray-500">
                            支持 PDF、TXT、MD、DOC、DOCX 格式
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {stats && stats.status === 'completed' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 mb-2">上传成功</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-green-600">
                            文件名：{stats.fileName}
                        </p>
                        <p className="text-sm text-green-600">
                            文件大小：{(stats.fileSize / 1024).toFixed(2)} KB
                        </p>
                        <p className="text-sm text-green-600">
                            文本块数：{stats.totalChunks}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}; 