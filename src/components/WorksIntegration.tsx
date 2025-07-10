import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import worksService, { Work } from '../services/worksService';
import EditorComponent, { EditorComponentRef } from './EditorComponent';
import Sidebar from './Sidebar';

const WorksIntegration: React.FC = () => {
    const [currentWork, setCurrentWork] = useState<Work | null>(null);
    const [editorRef, setEditorRef] = useState<EditorComponentRef | null>(null);

    // 处理作品选择
    const handleWorkSelect = async (workId: string) => {
        try {
            const work = await worksService.getWork(workId);
            setCurrentWork(work);

            // 如果有编辑器引用，可以加载内容
            if (editorRef && work.content) {
                // 这里可以设置编辑器的初始内容
                console.log('加载作品内容:', work.content);
            }
        } catch (error) {
            console.error('加载作品失败:', error);
            toast.error('加载作品失败');
        }
    };

    // 处理保存作品
    const handleSaveWork = async (content: any) => {
        if (!currentWork) {
            toast.error('没有选中的作品');
            return;
        }

        try {
            await worksService.saveWorkContent({
                id: currentWork._id || currentWork.id || '',
                content,
                isAutoSave: false
            });

            toast.success('作品保存成功');
        } catch (error) {
            console.error('保存作品失败:', error);
            toast.error('保存作品失败');
        }
    };

    // 处理创建新作品
    const handleSaveAs = async (name: string, content: any) => {
        try {
            const newWork = await worksService.createWork({
                name,
                content,
                type: 'script'
            });

            setCurrentWork(newWork);
            toast.success('新作品创建成功');
        } catch (error) {
            console.error('创建新作品失败:', error);
            toast.error('创建新作品失败');
        }
    };

    return (
        <div className="flex h-screen">
            {/* 侧边栏 */}
            <div className="w-80 border-r border-gray-200">
                <Sidebar />
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col">
                {/* 顶部工具栏 */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {currentWork ? currentWork.name : '未选择作品'}
                        </h1>
                        {currentWork && (
                            <span className="text-sm text-gray-500">
                                最后更新: {currentWork.updatedAt ? new Date(currentWork.updatedAt).toLocaleString() : '未知'}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {currentWork && (
                            <button
                                onClick={() => {
                                    if (editorRef) {
                                        // 这里可以触发编辑器保存
                                        console.log('触发编辑器保存');
                                    }
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                保存
                            </button>
                        )}
                    </div>
                </div>

                {/* 编辑器区域 */}
                <div className="flex-1 p-6">
                    <EditorComponent
                        ref={setEditorRef}
                        currentWorkId={currentWork?._id || currentWork?.id || null}
                        onSave={handleSaveWork}
                        onSaveAs={handleSaveAs}
                        initialData={currentWork?.content}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorksIntegration; 