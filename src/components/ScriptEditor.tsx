import React, { useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Sidebar from './Sidebar'
import MiddleSection from './MiddleSection'
import { useAppState } from '../hooks/useAppState'
import TextEditorArea, { TextEditorAreaRef } from './TextEditorArea'

// 分幕剧情组件
function SceneBreakdown({ 
  scenes, 
  selectedScene, 
  onSceneSelect, 
  characterName 
}: { 
  scenes: Array<{id: string, summary: string, startPos: number, endPos: number}>, 
  selectedScene: string | null, 
  onSceneSelect: (id: string) => void,
  characterName: string
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-sm">分幕剧情总结</h2>
        <div className="text-xs text-gray-500">以「{characterName}」的视角</div>
      </div>
      <div className="space-y-1.5">
        {scenes.map((scene) => (
          <div 
            key={scene.id}
            className={`p-2 border rounded-md cursor-pointer text-sm ${selectedScene === scene.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => onSceneSelect(scene.id)}
          >
            {scene.summary}
          </div>
        ))}
      </div>
    </div>
  );
}

// 主要编辑区域组件
function ContentArea() {
  // 从应用状态中获取分幕剧情和初稿优化相关状态
  const {
    scenes,
    setScenes,
    selectedScene,
    setSelectedScene,
    characterName,
    setCharacterName,
    generateSceneSummaries,
    setSelectedDraftText
  } = useAppState();
  
  // 初稿文本状态，不使用全局状态管理，因为它只在此组件中使用
  const [draftContent, setDraftContent] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // 选中文本的状态
  const [selectedText, setSelectedText] = React.useState("");
  const [selectionRange, setSelectionRange] = React.useState<{start: number, end: number} | null>(null);
  
  // 文本区域的引用
  const textareaRef = useRef<TextEditorAreaRef>(null);

  // 监听从中间操作台传来的优化文本
  useEffect(() => {
    const handleOptimizedText = (event: CustomEvent) => {
      if (event.detail && event.detail.text && selectionRange) {
        replaceSelectedText(event.detail.text);
      }
    };
    
    // 注册自定义事件监听
    window.addEventListener('optimizedTextReady' as any, handleOptimizedText);
    
    return () => {
      window.removeEventListener('optimizedTextReady' as any, handleOptimizedText);
    };
  }, [selectionRange]); // 依赖于selectionRange，确保在选中范围变化时重新订阅

  // 处理文本选择
  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    if (start !== end) {
      const selected = draftContent.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
      
      // 同时更新全局应用状态中的选中文本
      setSelectedDraftText(selected);
      
      // 触发自定义事件，将选中的文本发送到中间操作台
      const event = new CustomEvent('draftTextSelected', {
        detail: { text: selected }
      });
      window.dispatchEvent(event);
    } else {
      setSelectedText("");
      setSelectionRange(null);
      setSelectedDraftText("");
    }
  };

  // 处理文本替换
  const replaceSelectedText = (newText: string) => {
    if (selectionRange) {
      const newContent = 
        draftContent.substring(0, selectionRange.start) + 
        newText + 
        draftContent.substring(selectionRange.end);
      
      setDraftContent(newContent);
      
      // 更新后将光标放在替换文本的末尾
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const textareaElement = textareaRef.current.getTextarea();
          if (textareaElement) {
            const newPosition = selectionRange.start + newText.length;
            textareaElement.setSelectionRange(newPosition, newPosition);
          }
        }
      }, 0);
      
      // 清除选中状态
      setSelectedText("");
      setSelectionRange(null);
      setSelectedDraftText("");
    }
  };

  // 滚动到指定场景位置
  const scrollToScene = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene && textareaRef.current) {
      setSelectedScene(sceneId);
      textareaRef.current.focus();
      
      const textareaElement = textareaRef.current.getTextarea();
      if (textareaElement) {
        textareaElement.setSelectionRange(scene.startPos, scene.endPos);
        
        // 计算滚动位置
        const lineHeight = 24; // 估计的行高
        const textBeforeScene = draftContent.substring(0, scene.startPos);
        const linesBeforeScene = textBeforeScene.split('\n').length;
        const scrollPosition = linesBeforeScene * lineHeight;
        
        textareaElement.scrollTop = scrollPosition;
      }
    }
  };

  // 生成分幕剧情总结
  const handleGenerateSceneSummaries = async () => {
    if (!draftContent || draftContent.trim().length === 0) {
      alert("请先输入初稿内容");
      return;
    }

    if (draftContent.length > 50000) {
      alert("初稿内容不能超过5万字");
      return;
    }

    setIsProcessing(true);
    
    // 使用全局状态中的方法生成分幕剧情总结
    setTimeout(() => {
      const generatedScenes = generateSceneSummaries(draftContent, characterName);
      if (generatedScenes) {
        setScenes(generatedScenes);
        
        // 默认选择第一个场景
        if (generatedScenes.length > 0) {
          setSelectedScene(generatedScenes[0].id);
        }
      }
      setIsProcessing(false);
    }, 2000); // 模拟API延迟
  };

  // 处理发送文本到中间操作台
  const sendToMiddleSection = () => {
    if (selectedText) {
      // 更新全局状态中的选中文本
      setSelectedDraftText(selectedText);
      
      // 触发自定义事件，将选中的文本发送到中间操作台
      const event = new CustomEvent('draftTextSelected', {
        detail: { text: selectedText }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-3 bg-white flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
          <div className="font-bold text-lg">初稿编辑</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="角色名称"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button 
            onClick={handleGenerateSceneSummaries}
            disabled={isProcessing}
            className="bg-black text-white px-3 py-1 rounded text-sm flex items-center disabled:bg-gray-400"
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

      <div className="flex flex-grow h-full gap-3">
        {/* 左侧：初稿编辑区 */}
        <TextEditorArea
          ref={textareaRef}
          content={draftContent}
          onChange={setDraftContent}
          onSelect={handleTextSelection}
          style={{ lineHeight: '1.6' }}
          className="flex-grow w-full"
        />
        
        {/* 右侧：分幕剧情区 */}
        <div className="w-52 min-w-52 overflow-y-auto">
          {scenes.length > 0 && (
            <SceneBreakdown 
              scenes={scenes} 
              selectedScene={selectedScene} 
              onSceneSelect={(id) => scrollToScene(id)}
              characterName={characterName}
            />
          )}
          
          {isProcessing && (
            <div className="text-center p-4">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600">正在处理文本...</p>
            </div>
          )}
          </div>
        </div>

        {/* 选中文本操作区 */}
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
            <button 
              onClick={sendToMiddleSection}
              className="bg-black text-white px-3 py-1 rounded text-sm"
            >
              发送到中间操作台优化
            </button>
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