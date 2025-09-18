import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  submitScriptGenerationTask, 
  waitForTaskCompletion, 
  formatOutlineToText, 
  formatCharactersToText, 
  formatScenesToText,
  type TaskInfo 
} from '../services/scriptGeneratorService';
import { useWorks } from '../contexts/WorksContext';

function ShortplayEntryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const { currentWork, saveWorkContent } = useWorks();

  const handleGoOutline = () => {
    navigate('/app/outline');
  };

  const handlePickFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      try {
        setIsUploading(true);
        setUploadProgress('正在解析文件...');
        
        // 检查文件类型
        const fileName = file.name.toLowerCase();
        let text: string;
        
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
          // 纯文本文件
          text = await file.text();
        } else if (fileName.endsWith('.docx')) {
          // Word 文档 - 暂时提示用户转换为文本
          alert('请将 Word 文档另存为 .txt 格式后重新上传，或复制内容到记事本保存为 .txt 文件');
          setIsUploading(false);
          return;
        } else if (fileName.endsWith('.pdf')) {
          // PDF 文档 - 暂时提示用户转换为文本
          alert('请将 PDF 文档内容复制到记事本，保存为 .txt 文件后重新上传');
          setIsUploading(false);
          return;
        } else {
          alert('不支持的文件格式，请上传 .txt 或 .md 文件');
          setIsUploading(false);
          return;
        }
        
        // 检查文本内容是否有效
        if (!text || text.trim().length < 100) {
          alert('文件内容过短，请确保文件包含足够的小说内容');
          setIsUploading(false);
          return;
        }
        
        console.log('[文件解析] 文件类型:', fileName, '内容长度:', text.length);
        
        setUploadProgress('正在提交任务...');
        
        // 提交异步任务
        const taskInfo = await submitScriptGenerationTask(text, { model: 'deepseek-r1', language: 'zh-CN' });
        setCurrentTaskId(taskInfo.task_id);
        setUploadProgress('任务已提交，正在处理中...');
        setTaskStatus('任务已提交，正在处理中...');
        setTaskProgress(0);

        // 等待任务完成，带进度回调
        const result = await waitForTaskCompletion(
          taskInfo.task_id,
          (taskInfo: TaskInfo) => {
            setTaskProgress(taskInfo.progress);
            setTaskStatus(taskInfo.message);
            setUploadProgress(`${taskInfo.message} (${taskInfo.progress}%)`);
          }
        );

        // 格式化为可写入 Outline 页面文本框的字符串
        const outlineText = formatOutlineToText(result.outline);
        const charactersText = formatCharactersToText(result.characters || []);
        const scenesText = formatScenesToText(result.scenes || []);

        setUploadProgress('正在保存结果...');
        setTaskStatus('正在保存结果...');
        
        // 将结果保存到本地存储，供 OutlineContent 读取
        const generatedData = {
          outline: outlineText,
          charactersText,
          scenesText,
          timestamp: Date.now()
        };
        
        console.log('[本地存储] 准备保存生成的数据:', {
          outlineLength: outlineText.length,
          charactersLength: charactersText.length,
          scenesLength: scenesText.length,
          timestamp: generatedData.timestamp
        });
        
        // 保存到 localStorage
        localStorage.setItem('generatedScriptData', JSON.stringify(generatedData));
        
        console.log('[本地存储] 数据已保存到 localStorage');

        setUploadProgress('处理完成！');
        setTaskStatus('处理完成！');
        setTaskProgress(100);
        
        // 延迟跳转，确保状态更新完成
        setTimeout(() => {
          console.log('[页面跳转] 准备跳转到大纲页');
          navigate('/app/outline');
        }, 1000);
      } catch (err) {
        console.error('导入并生成剧本失败:', err);
        alert('导入失败：' + (err as Error).message);
      } finally {
        setIsUploading(false);
        setUploadProgress('');
        setTaskProgress(0);
        setTaskStatus('');
        setCurrentTaskId('');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">选择创作方式</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 自主创作 */}
          <button
            className="w-full h-40 rounded-lg border border-gray-300 hover:border-black hover:shadow bg-white px-6 py-4 text-left"
            onClick={handleGoOutline}
          >
            <div className="text-lg font-semibold mb-2">自主创作</div>
            <div className="text-gray-500 text-sm">从空白大纲开始创作短剧剧本</div>
          </button>

          {/* 导入小说创作 */}
          <div className="w-full h-40 rounded-lg border border-gray-300 bg-white px-6 py-4 flex flex-col justify-between">
            <div>
              <div className="text-lg font-semibold mb-2">导入小说创作</div>
              <div className="text-gray-500 text-sm">上传你的小说文本，我们将帮助你生成大纲与分幕</div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
                onClick={handlePickFile}
                disabled={isUploading}
              >
                {isUploading ? '处理中...' : '选择文件'}
              </button>
              {selectedFileName && (
                <span className="ml-3 text-sm text-gray-600 align-middle">{selectedFileName}</span>
              )}
              {isUploading && uploadProgress && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-700 font-medium">{uploadProgress}</span>
                  </div>
                  
                  {/* 进度条 */}
                  {taskProgress > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-blue-600 mb-1">
                        <span>处理进度</span>
                        <span>{taskProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${taskProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* 任务状态 */}
                  {taskStatus && (
                    <div className="text-xs text-blue-600 mb-2">
                      状态：{taskStatus}
                    </div>
                  )}
                  
                  {/* 任务ID - 已删除显示 */}
                  {/* {currentTaskId && (
                    <div className="text-xs text-gray-500 mb-2">
                      任务ID：{currentTaskId}
                    </div>
                  )} */}
                  
                  <div className="text-xs text-blue-600">
                    💡 提示：AI处理可能需要几分钟时间，请您耐心等待
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortplayEntryPage;


