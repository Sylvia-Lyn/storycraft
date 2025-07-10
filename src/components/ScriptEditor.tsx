import { useRef, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import MiddleSection from './MiddleSection'
import { useAppState } from '../hooks/useAppState'
import EditorComponent, { EditorComponentRef } from './EditorComponent'
import { Button, Select } from 'antd'
import { useWorks } from '../contexts/WorksContext'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

// 主要编辑区域组件
function ContentArea() {
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

  // 初稿内容状态
  const [editorData, setEditorData] = useState<any>(() => {
    const draft = localStorage.getItem('draft_content');
    if (draft && draft.trim()) {
      // 清空localStorage，避免下次重复
      localStorage.removeItem('draft_content');
      return {
        blocks: [{ type: 'paragraph', data: { text: draft } }]
      };
    }
    return { blocks: [{ type: 'paragraph', data: { text: '' } }] };
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // 选中文本的状态
  const [selectedText, setSelectedText] = useState("");

  // 编辑器引用
  const editorRef = useRef<EditorComponentRef>(null);

  // 当选中作品改变时，加载作品内容
  useEffect(() => {
    if (currentWork && currentWork.content) {
      setEditorData(currentWork.content);
      console.log('已加载作品内容:', currentWork.content);
    }
  }, [currentWork]);

  // 处理保存作品
  const handleSaveWork = async (content: any) => {
    if (!currentWork) {
      toast.error('请先在侧边栏选中一个作品');
      return;
    }

    try {
      await saveWorkContent(currentWork._id || currentWork.id || '', content);
      toast.success('作品已保存');
    } catch (error) {
      console.error('保存作品失败:', error);
      toast.error('保存作品失败');
    }
  };

  // 处理创建新作品
  const handleSaveAs = async (name: string, content: any) => {
    try {
      await createWork(name, content);
      toast.success('新作品已创建并保存');
    } catch (error) {
      console.error('创建新作品失败:', error);
      toast.error('创建新作品失败');
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
    link.download = `剧本_${new Date().toLocaleDateString()}.${format}`;

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

  // 处理编辑器内容变化
  const handleEditorChange = (data: any) => {
    setEditorData(data);
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
          {currentWork ? `编辑: ${currentWork.name}` : '初稿编辑'}
        </div>
        {currentWork && (
          <div className="text-sm text-gray-500">
            最后更新: {currentWork.updatedAt ? new Date(currentWork.updatedAt).toLocaleString() : '未知'}
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

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后可查看和管理您的作品</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex w-full min-h-0">
      {/* 中间操作台 */}
      <MiddleSection />
      {/* 右侧内容区域 */}
      <ContentArea />
    </div>
  );
}

export default ScriptEditor; 