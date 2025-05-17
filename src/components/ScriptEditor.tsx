import { useRef, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Sidebar from './Sidebar'
import MiddleSection from './MiddleSection'
import { useAppState } from '../hooks/useAppState'
import EditorComponent, { EditorComponentRef } from './EditorComponent'

// 主要编辑区域组件
function ContentArea() {
  // 从应用状态中获取必要状态
  const {
    characterName,
    setCharacterName,
    generateSceneSummaries,
    setSelectedDraftText
  } = useAppState();
  
  // 初稿内容状态
  const [editorData, setEditorData] = useState<any>({ 
    blocks: [{ type: 'paragraph', data: { text: '' } }] 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 选中文本的状态
  const [selectedText, setSelectedText] = useState("");
  
  // 编辑器引用
  const editorRef = useRef<EditorComponentRef>(null);

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
          // 简单去除HTML标签，实际应用中可能需要更复杂的处理
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
    
    // 使用全局状态中的方法生成分幕剧情总结
    setTimeout(() => {
      generateSceneSummaries(plainText, characterName);
      setIsProcessing(false);
    }, 2000); // 模拟API延迟
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full p-3 bg-white">
      {/* 顶部标题和操作区 */}
      <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-lg">初稿编辑</div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="主角"
            className="border border-gray-300 rounded px-3 py-1 text-sm w-24"
          />
          <button 
            onClick={handleGenerateSceneSummaries}
            disabled={isProcessing}
            className="bg-black text-white px-5 py-1 rounded text-sm flex items-center disabled:bg-gray-400"
          >
            {isProcessing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                处理中...
              </>
            ) : (
              "生成分幕剧情"
            )}
          </button>
        </div>
      </div>

      {/* Editor.js 编辑器 */}
      <div className="flex-1 overflow-hidden">
        <EditorComponent 
          ref={editorRef}
          initialData={editorData}
          onChange={handleEditorChange}
          onSelect={handleTextSelection}
        />
        </div>

      {/* 选中文本操作区 - 我们保留这个功能，它在屏幕下方显示选中的文本信息 */}
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
    </div>
  );
}

function ScriptEditor() {
  return (
    <div className="flex h-screen bg-white">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 中间操作台 */}
      <MiddleSection />

      {/* 右侧内容区域 */}
      <ContentArea />
    </div>
  );
}

export default ScriptEditor 