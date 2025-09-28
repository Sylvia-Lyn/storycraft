import { useRef, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useLocation } from 'react-router-dom'
import MiddleSection from './MiddleSection'
import { useAppState } from '../hooks/useAppState'
import EditorComponent, { EditorComponentRef } from './EditorComponent'
import { Button, Select } from 'antd'
import { useWorks } from '../contexts/WorksContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { toast } from 'react-hot-toast'

// 主要编辑区域组件
function ContentArea({ initialData }: { initialData?: any }) {
  // 从应用状态中获取必要状态
  const {
    characterName,
    setCharacterName,
    generateSceneSummaries,
    setSelectedDraftText
  } = useAppState();

  // 从WorksContext获取作品管理功能
  const { currentWork, saveWorkContent, createWork } = useWorks();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  // 初稿内容状态 - 初始化为空内容
  const [editorData, setEditorData] = useState<any>({ 
    time: Date.now(),
    blocks: [],
    version: '2.31.0'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // 选中文本的状态
  const [selectedText, setSelectedText] = useState("");

  // 编辑器引用
  const editorRef = useRef<EditorComponentRef>(null);
  
  // 用于跟踪当前编辑的内容，用于自动保存
  const [currentEditingContent, setCurrentEditingContent] = useState<any>(null);

  // 用于跟踪上一个作品，用于自动保存
  const [previousWork, setPreviousWork] = useState<any>(null);

  // 处理从路由传递的初始数据
  useEffect(() => {
    if (initialData && initialData.content) {
      console.log('ScriptEditor: 处理初始数据:', initialData);
      
      // 将初始内容转换为 EditorJS 格式
      const editorContent = {
        time: Date.now(),
        blocks: initialData.content.trim() ? 
          [{ type: 'paragraph', data: { text: initialData.content } }] : 
          [],
        version: '2.31.0'
      };
      
      console.log('ScriptEditor: 设置初始编辑器内容:', editorContent);
      setEditorData(editorContent);
      setCurrentEditingContent(editorContent);
    }
  }, [initialData]);

  // 当选中作品改变时，先保存上一个作品的内容，然后加载新作品内容
  useEffect(() => {
    // 如果有上一个作品且有编辑内容，自动保存
    if (previousWork && currentEditingContent && previousWork._id !== currentWork?._id) {
      console.log('自动保存上一个作品内容:', previousWork.name);
      handleSaveWork(currentEditingContent, previousWork._id || previousWork.id).catch(error => {
        console.error('自动保存失败:', error);
      });
    }

    // 加载新作品内容
    console.log('ScriptEditor: 作品切换，当前作品:', currentWork?.name, '内容:', currentWork?.content);
    
    if (currentWork) {
      if (currentWork.content) {
        // 处理字符串类型的 content
        let editorContent;
        if (typeof currentWork.content === 'string') {
          // 如果是字符串，转换为 EditorJS 格式
          editorContent = {
            time: Date.now(),
            blocks: currentWork.content.trim() ? 
              [{ type: 'paragraph', data: { text: currentWork.content } }] : 
              [],
            version: '2.31.0'
          };
        } else {
          // 如果是对象，直接使用
          editorContent = currentWork.content;
        }
        
        console.log('ScriptEditor: 设置编辑器内容:', editorContent);
        setEditorData(editorContent);
        setCurrentEditingContent(editorContent);
      } else {
        // 如果作品没有内容，清空编辑器
        const emptyContent = { 
          time: Date.now(),
          blocks: [],
          version: '2.31.0'
        };
        console.log('ScriptEditor: 作品无内容，设置空内容:', emptyContent);
        setEditorData(emptyContent);
        setCurrentEditingContent(emptyContent);
      }
    } else {
      // 如果没有选中作品，清空编辑器
      const emptyContent = { 
        time: Date.now(),
        blocks: [],
        version: '2.31.0'
      };
      console.log('ScriptEditor: 未选中作品，设置空内容:', emptyContent);
      setEditorData(emptyContent);
      setCurrentEditingContent(emptyContent);
    }

    // 更新上一个作品引用
    setPreviousWork(currentWork);
  }, [currentWork]);

  // 处理保存作品
  const handleSaveWork = async (content: any, workId?: string) => {
    const targetWorkId = workId || currentWork?._id || currentWork?.id;
    const isAutoSave = !!workId; // 如果传入了workId，说明是自动保存
    
    // 保存作品内容
    
    if (!targetWorkId) {
      if (!isAutoSave) {
        toast.error(t('common.pleaseSelectWork'));
      }
      return;
    }

    try {
      await saveWorkContent(targetWorkId, content, isAutoSave);
      if (!isAutoSave) { // 只有在手动保存时才显示成功提示
        toast.success(t('common.workSaved'));
      }
    } catch (error) {
      console.error('保存作品失败:', error);
      if (!isAutoSave) { // 只有在手动保存时才显示错误提示
        toast.error(t('common.workSaveFailed'));
      }
    }
  };

  // 处理创建新作品
  const handleSaveAs = async (name: string, content: any) => {
    try {
      await createWork(name, content);
      toast.success(t('common.workCreated'));
    } catch (error) {
      console.error('创建新作品失败:', error);
      toast.error(t('common.workCreateFailed'));
    }
  };

  // 导出文件函数
  const exportFile = (format: 'txt' | 'md' | 'docx') => {
    if (!editorData || !editorData.blocks) return;

    // 将编辑器数据转换为纯文本
    const plainText = editorData.blocks
      .map((block: any) => {
        if (block.type === 'paragraph') {
          return block.data.text.replace(/<\/?[^>]+(>|$)/g, "");
        }
        return "";
      })
      .join("\n\n");

    // 创建 Blob 对象
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t('common.workTypes.script')}_${new Date().toLocaleDateString(t('common.dateFormat.locale'), t('common.dateFormat.options') as Intl.DateTimeFormatOptions)}.${format}`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // 监听从中间操作台传来的优化文本
  useEffect(() => {
    const handleOptimizedText = (event: CustomEvent) => {
      if (event.detail && event.detail.text && editorRef.current) {
        // 使用编辑器的API插入优化文本
        editorRef.current.insertText(event.detail.text)
          .then(() => {
            // 插入成功后清除选中状态
            setSelectedText("");
            setSelectedDraftText("");
          })
          .catch(error => {
            console.error("插入优化文本失败:", error);
            // 失败时显示提示，让用户手动处理
            alert(`无法自动插入优化文本: ${event.detail.text}\n\n请手动复制并粘贴到编辑器中。`);
          });
      }
    };

    // 注册自定义事件监听
    window.addEventListener('optimizedTextReady' as any, handleOptimizedText);

    return () => {
      window.removeEventListener('optimizedTextReady' as any, handleOptimizedText);
    };
  }, []);

  // 处理编辑器内容变化 - 只更新当前编辑内容，不更新 editorData
  const handleEditorChange = (data: any) => {
    // 只更新当前编辑内容，用于自动保存
    setCurrentEditingContent(data);
    // 不再实时更新 editorData，只在作品切换时更新
  };

  // 处理文本选择
  const handleTextSelection = (text: string, _range: Range | null) => {
    if (text) {
      setSelectedText(text);
      setSelectedDraftText(text);

      // 触发自定义事件，将选中的文本发送到中间操作台
      const event = new CustomEvent('draftTextSelected', {
        detail: { text }
      });
      window.dispatchEvent(event);
    } else {
      setSelectedText("");
      setSelectedDraftText("");
    }
  };

  // 生成分幕剧情总结
  const handleGenerateSceneSummaries = async () => {
    if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
      alert("请先输入初稿内容");
      return;
    }

    // 将编辑器数据转换为纯文本
    const plainText = editorData.blocks
      .map((block: any) => {
        if (block.type === 'paragraph') {
          return block.data.text.replace(/<\/?[^>]+(>|$)/g, "");
        }
        return "";
      })
      .join("\n\n");

    if (plainText.length > 50000) {
      alert("初稿内容不能超过5万字");
      return;
    }

    setIsProcessing(true);

    try {
      await generateSceneSummaries(plainText, characterName);
    } catch (error) {
      console.error("生成分幕剧情失败:", error);
      alert("生成分幕剧情失败，请稍后重试");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 bg-white max-h-full min-h-0 h-full">
      {/* 顶部操作区 - 按原型图重构 */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-lg">
          {currentWork ? (
            <>
              {t(`common.workTypes.${currentWork.type}`)}编辑: {currentWork.name}
            </>
          ) : t('editor.draftEditing')}
        </div>
        {currentWork && (
          <div className="text-sm text-gray-500">
            {t('editor.lastUpdated', { date: currentWork.updatedAt ? new Date(currentWork.updatedAt).toLocaleString() : t('editor.unknown') })}
          </div>
        )}
      </div>

      {/* Editor.js 编辑器 - 添加固定高度和滚动控制 */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto min-h-0">
          <EditorComponent
            ref={editorRef}
            initialData={editorData}
            onChange={handleEditorChange}
            onSelect={handleTextSelection}
            currentWorkId={currentWork?._id || currentWork?.id || null}
            onSave={handleSaveWork}
            onSaveAs={handleSaveAs}
          />
        </div>
      </div>

      {/* 选中文本操作区 - 暂时注释掉UI显示
      {selectedText && (
        <div className="mt-3 p-2 border border-gray-300 rounded bg-gray-50">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm">已选中文本</div>
            <button
              onClick={() => {
                setSelectedText("");
                setSelectedDraftText("");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon icon="ri:close-line" />
            </button>
          </div>
          <div className="text-xs text-gray-600 mb-1 line-clamp-2">
            {selectedText.length > 100 ? selectedText.substring(0, 100) + "..." : selectedText}
          </div>
        </div>
      )}
      */}
    </div>
  );
}

function ScriptEditor() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  
  // 获取从HomePage传递的初始数据
  const initialData = location.state?.initialData;
  
  console.log('[ScriptEditor] Component mounted with location.state:', location.state);
  console.log('[ScriptEditor] Extracted initialData:', initialData);

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('editor.pleaseLoginFirst')}</h2>
          <p className="text-gray-600 mb-4">{t('editor.loginToViewWorks')}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('editor.goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex w-full min-h-0">
      {/* 中间操作台 */}
      <MiddleSection initialData={initialData} />
      {/* 右侧内容区域 */}
      <ContentArea initialData={initialData} />
    </div>
  );
}

export default ScriptEditor; 