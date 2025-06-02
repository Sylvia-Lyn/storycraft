import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Marker from '@editorjs/marker';
import { Icon } from '@iconify/react';
import { useAppState } from '../hooks/useAppState';
import { toast } from 'react-hot-toast';

interface EditorComponentProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onSelect?: (selectedText: string, range: Range | null) => void;
}

export interface EditorComponentRef {
  insertText: (text: string) => Promise<void>;
}

const EditorComponent = forwardRef<EditorComponentRef, EditorComponentProps>(({ initialData, onChange, onSelect }, ref) => {
  const appState = useAppState();
  const editorRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{text: string, range: Range | null}>({text: '', range: null});
  const [showTemplates, setShowTemplates] = useState(false);
  const [editorHistory, setEditorHistory] = useState<any[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<any>(null);
  
  // 预设的模板句式
  const templateSentences = [
    "这是一个转折点，主角开始意识到自己的使命。",
    "黎明前的黑暗总是最深重的，此刻主角面临着前所未有的挑战。",
    "一个不经意的相遇，却彻底改变了两个人的命运轨迹。",
    "回忆如潮水般涌来，过往的点滴在心头激荡。",
    "环顾四周，这里的一切都变得陌生而遥远。"
  ];
  
  // 批注功能相关状态
  const [annotations, setAnnotations] = useState<Array<{id: string, text: string, blockIndex: number}>>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  
  // 初始化编辑器
  useEffect(() => {
    if (!containerRef.current) return;
    
    const editor = new EditorJS({
      holder: containerRef.current,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 3
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M',
        },
      },
      data: initialData || { blocks: [{ type: 'paragraph', data: { text: '' } }] },
      placeholder: '开始输入内容...',
      onChange: async () => {
        if (editorRef.current) {
          const savedData = await editorRef.current.save();
          
          // 将当前状态添加到历史记录中
          if (JSON.stringify(savedData) !== JSON.stringify(lastSavedData)) {
            // 如果当前不在历史记录的最后，则清除当前位置之后的所有历史
            if (currentHistoryIndex < editorHistory.length - 1) {
              setEditorHistory(prev => prev.slice(0, currentHistoryIndex + 1));
            }
            
            // 添加新的历史记录
            setEditorHistory(prev => [...prev, savedData]);
            setCurrentHistoryIndex(prev => prev + 1);
          }
          
          if (onChange) {
            onChange(savedData);
          }
        }
      }
    });
    
    editorRef.current = editor;
    
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);
  
  // 监听选中文本
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        const selectedText = selection.toString();
        setSelection({text: selectedText, range: selection.getRangeAt(0)});
        
        if (onSelect) {
          onSelect(selectedText, selection.getRangeAt(0));
        }
      } else {
        setSelection({text: '', range: null});
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelect]);
  
  // 插入模板句式
  const insertTemplate = async (template: string) => {
    if (!editorRef.current) return;
    
    try {
      // 获取当前激活的块
      const currentBlockIndex = await editorRef.current.save().then(data => {
        return data.blocks.length - 1; // 简单起见，假设光标在最后一个块
      });
      
      // 插入新块
      await editorRef.current.blocks.insert('paragraph', {
        text: template
      }, undefined, currentBlockIndex + 1, true);
    } catch (error) {
      console.error('插入模板失败:', error);
    }
  };
  
  // 删除当前段落
  const deleteCurrentParagraph = async () => {
    if (!editorRef.current) return;
    
    try {
      // 获取当前激活的块
      const currentBlockIndex = await editorRef.current.save().then(data => {
        return data.blocks.length - 1; // 简单起见，假设光标在最后一个块
      });
      
      // 删除当前块
      await editorRef.current.blocks.delete(currentBlockIndex);
      
      // 如果删除后没有块了，添加一个空段落
      const savedData = await editorRef.current.save();
      if (savedData.blocks.length === 0) {
        await editorRef.current.blocks.insert('paragraph', {
          text: ''
        });
      }
    } catch (error) {
      console.error('删除段落失败:', error);
    }
  };
  
  // 将选中文本设置为 Capilot 的上文
  const highlightSelection = () => {
    if (!selection.range || !selection.text) return;
    
    const selectedText = selection.text;
    
    // 将选中的文本传递给 Capilot 作为上文
    appState.setSelectedDraftText(selectedText);
    
    // 可选：显示一个临时的高亮效果，表示文本已被选中为上文
    const range = selection.range;
    const originalContents = range.extractContents();
    const tempHighlightNode = document.createElement('span');
    tempHighlightNode.className = 'bg-yellow-100 transition-colors duration-500';
    tempHighlightNode.appendChild(originalContents);
    range.insertNode(tempHighlightNode);
    
    // 显示提示信息
    toast.success('已将选中文本设置为 Capilot 上文');
    
    // 2秒后移除高亮效果
    setTimeout(() => {
      if (tempHighlightNode.parentNode) {
        const parent = tempHighlightNode.parentNode;
        while (tempHighlightNode.firstChild) {
          parent.insertBefore(tempHighlightNode.firstChild, tempHighlightNode);
        }
        parent.removeChild(tempHighlightNode);
      }
    }, 2000);
  };
  
  // 清除所有格式
  const clearFormat = async () => {
    if (!editorRef.current) return;
    
    try {
      const savedData = await editorRef.current.save();
      
      // 创建纯文本块
      const plainTextBlocks = savedData.blocks.map(block => {
        if (block.type === 'paragraph') {
          // 简单去除HTML标签，实际应用中可能需要更复杂的处理
          const plainText = block.data.text.replace(/<\/?[^>]+(>|$)/g, "");
          return {
            type: 'paragraph',
            data: {
              text: plainText
            }
          };
        }
        return block;
      });
      
      // 重新渲染编辑器
      await editorRef.current.render({
        blocks: plainTextBlocks
      });
    } catch (error) {
      console.error('清除格式失败:', error);
    }
  };

  // 添加批注
  const addAnnotation = async () => {
    if (!selection.text || !editorRef.current) return;
    
    try {
      // 获取当前激活的块的索引
      const currentBlockIndex = await editorRef.current.save().then(data => {
        // 简单起见，假设是最后一个块
        return data.blocks.length - 1;
      });
      
      // 创建新批注
      const newAnnotation = {
        id: Date.now().toString(),
        text: selection.text,
        blockIndex: currentBlockIndex
      };
      
      setAnnotations([...annotations, newAnnotation]);
      
      // 为选中文本添加批注样式
      if (selection.range) {
        const range = selection.range;
        const selectedText = selection.text;
        
        // 包装选中文本为批注样式的HTML
        const annotatedText = `<span class="bg-yellow-100 border-b border-yellow-400 cursor-help" title="已添加批注">${selectedText}</span>`;
        
        // 插入带批注样式的文本
        range.deleteContents();
        const annotationNode = document.createElement('span');
        annotationNode.innerHTML = annotatedText;
        range.insertNode(annotationNode);
      }
    } catch (error) {
      console.error('添加批注失败:', error);
    }
  };
  
  // 删除批注
  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(annotation => annotation.id !== id));
  };

  // 撤销操作
  const handleUndo = async () => {
    if (currentHistoryIndex > 0 && editorRef.current) {
      const prevHistoryIndex = currentHistoryIndex - 1;
      const prevData = editorHistory[prevHistoryIndex];
      
      // 更新编辑器内容
      await editorRef.current.render(prevData);
      
      // 更新历史索引
      setCurrentHistoryIndex(prevHistoryIndex);
      
      toast.success('已撤销上一步操作');
    } else {
      toast.error('没有可撤销的操作');
    }
  };
  
  // 保存操作
  const handleSave = async () => {
    if (!editorRef.current) return;
    
    try {
      setIsSaving(true);
      const savedData = await editorRef.current.save();
      
      // 这里可以添加实际的保存逻辑，例如发送到服务器
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新最后保存的数据
      setLastSavedData(savedData);
      
      toast.success('内容已保存');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 暴露API方法给父组件
  useImperativeHandle(ref, () => ({
    // 在当前位置插入文本
    insertText: async (text: string) => {
      if (!editorRef.current) return;
      
      try {
        // 获取当前激活的块
        const currentBlockIndex = await editorRef.current.save().then(data => {
          return data.blocks.length - 1; // 简单起见，假设是最后一个块
        });
        
        // 插入新块
        await editorRef.current.blocks.insert('paragraph', {
          text: text
        }, undefined, currentBlockIndex + 1, true);
      } catch (error) {
        console.error('插入文本失败:', error);
      }
    }
  }));

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-md overflow-hidden">
      {/* 自定义工具栏 */}
      <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center space-x-1">
        <div className="relative">
          <button 
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center text-sm"
            onClick={() => setShowTemplates(!showTemplates)}
            title="插入模板句式"
          >
            <Icon icon="mdi:text-box-plus-outline" className="mr-1" />
            <span>插入模板</span>
          </button>
          
          {/* 模板句式下拉菜单 */}
          {showTemplates && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-80">
              <div className="p-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-medium">选择模板句式</span>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTemplates(false)}
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {templateSentences.map((template, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => {
                      insertTemplate(template);
                      setShowTemplates(false);
                    }}
                  >
                    <div className="text-sm">{template}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center text-sm"
          onClick={deleteCurrentParagraph}
          title="删除当前段落"
        >
          <Icon icon="mdi:text-box-remove-outline" className="mr-1" />
          <span>删除段落</span>
        </button>
        
        <button 
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center text-sm"
          onClick={highlightSelection}
          title="高亮选中内容"
          disabled={!selection.text}
        >
          <Icon icon="mdi:marker" className="mr-1" />
          <span>高亮选中</span>
        </button>
        
        <button 
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center text-sm"
          onClick={handleUndo}
          title="撤销"
          disabled={currentHistoryIndex <= 0}
        >
          <Icon icon="mdi:undo" className="mr-1" />
          <span>撤销</span>
        </button>
        
        <button 
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 flex items-center text-sm"
          onClick={handleSave}
          title="保存"
          disabled={isSaving}
        >
          <Icon icon="mdi:content-save-outline" className="mr-1" />
          <span>{isSaving ? '保存中...' : '保存'}</span>
        </button>
        
        <div className="flex-1"></div>
        
        {selection.text && (
          <div className="text-xs text-gray-500">
            已选中 {selection.text.length} 个字符
          </div>
        )}
      </div>
      
      {/* 编辑器容器 */}
      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: "300px" }}
        />
        
        {/* 批注侧边栏 */}
        {showAnnotations && annotations.length > 0 && (
          <div className="w-64 border-l border-gray-200 overflow-y-auto p-2 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">批注 ({annotations.length})</h3>
              <button 
                className="text-xs text-gray-500 hover:text-red-500"
                onClick={() => setAnnotations([])}
                title="清除所有批注"
              >
                清除全部
              </button>
            </div>
            
            <div className="space-y-2">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="p-2 bg-white border border-gray-200 rounded text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">批注 #{annotation.id.slice(-4)}</div>
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      <Icon icon="mdi:close" className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-gray-700">{annotation.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default EditorComponent; 