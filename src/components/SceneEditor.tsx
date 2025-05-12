import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAppState, ScenarioOption } from '../hooks/useAppState'

// 分幕内容编辑区域组件
function SceneContentArea() {
  const { sceneId } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  // const [previousContent, setPreviousContent] = useState('')
  const [content, setContent] = useState(
    "分幕内容：\n\n" +
    "1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xx\n\n" +
    "2. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xx\n\n" +
    "3. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n\n" +
    "4. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxx\n\n"
  )
  
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [optimizationInput, setOptimizationInput] = useState('')
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false)
  const [scenarioOptions, setScenarioOptions] = useState<ScenarioOption[]>([])

  const {
    // 模型相关
    selectedModel,
    // 文风相关
    selectedStyle,
    // 剧情生成函数
    generateScenarioOptions
  } = useAppState();

  // 生成剧情选项
  const handleGenerateScenarioOptions = () => {
    if (!optimizationInput.trim() || selectedCell === null) return;
    
    setIsGeneratingOptions(true);
    
    // 获取当前选中单元格的内容和前一个单元格的内容（如果有）
    const contentParagraphs = content.split('\n\n');
    const currentContent = contentParagraphs[selectedCell];
    const previousParagraph = selectedCell > 0 ? contentParagraphs[selectedCell - 1] : '';
    
    // 调用useAppState中的generateScenarioOptions函数
    generateScenarioOptions(previousParagraph, currentContent, '角色', optimizationInput);
    
    // 监听生成的选项（这里是模拟实现，实际项目中应该通过状态监听或回调）
    setTimeout(() => {
      // 从全局状态获取生成的选项
      const options = [
        {
          id: '1',
          text: `选项1 (使用${selectedModel}和${selectedStyle}文风): 你走进房间，发现桌上放着一封信。拆开后，你不敢相信自己的眼睛...`
        },
        {
          id: '2',
          text: `选项2 (使用${selectedModel}和${selectedStyle}文风): 你犹豫了一下，决定先不进入房间。直觉告诉你应该先确认周围环境...`
        },
        {
          id: '3',
          text: `选项3 (使用${selectedModel}和${selectedStyle}文风): 你深吸一口气，推开了房门。出乎意料的是，房间里空无一人，但窗户大开...`
        }
      ];
      
      setScenarioOptions(options);
      setIsGeneratingOptions(false);
    }, 2000);
  };
  
  // 选择剧情选项
  const selectScenario = (option: ScenarioOption) => {
    if (selectedCell !== null) {
      // 替换选中单元格的内容
      const contentLines = content.split('\n\n');
      // 移除选项前缀，如 "选项1 (使用claude37和标准文风): "
      const cleanText = option.text.replace(/^选项\d+ \(使用.*文风\): /, '');
      contentLines[selectedCell] = cleanText;
      setContent(contentLines.join('\n\n'));
      
      // 重置状态
      setSelectedCell(null);
      setOptimizationInput('');
      setScenarioOptions([]);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-white">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="font-bold text-lg mr-2">分幕 {sceneId || '1'}</div>
            <div 
              className="flex items-center text-gray-500 cursor-pointer"
              onClick={() => navigate('/scenes')}
            >
              <span>返回列表</span>
              <Icon icon="ri:arrow-right-s-line" className="ml-1" />
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded p-4 mb-4">
          <div className="flex justify-between items-center">
            <span>分幕标题: {sceneId ? `分幕${sceneId}` : '分幕1'} - xxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>
            <button 
              className="text-blue-500 text-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? '完成编辑' : '修改内容'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mb-4">
            <textarea
              className="w-full border border-gray-300 rounded p-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              style={{ lineHeight: '1.6' }}
            />
          </div>
        ) : (
          <div className="mb-4">
            {content.split('\n\n').map((paragraph, index) => (
              <div 
                key={index}
                className={`p-4 mb-2 rounded cursor-pointer ${selectedCell === index ? 'bg-gray-100 border-2 border-black' : 'border border-gray-200 hover:border-gray-400'}`}
                onClick={() => setSelectedCell(index)}
              >
                <p className="whitespace-pre-wrap">{paragraph}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* 剧情优化部分 */}
        {selectedCell !== null && (
          <div className="bg-gray-50 p-4 rounded-lg mt-6 mb-4">
            <div className="font-medium mb-2">修改第 {selectedCell + 1} 段剧情</div>
            <p className="text-sm text-gray-600 mb-3">
              使用 <span className="font-semibold">{selectedModel}</span> 模型和 
              <span className="font-semibold"> {selectedStyle}</span> 文风
            </p>
            
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="告诉我如何优化这段剧情，如：增加更多情感描写，减少对话..."
                value={optimizationInput}
                onChange={(e) => setOptimizationInput(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-black text-white rounded-md flex items-center disabled:bg-gray-300"
                onClick={handleGenerateScenarioOptions}
                disabled={!optimizationInput.trim() || isGeneratingOptions}
              >
                {isGeneratingOptions ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Icon icon="ri:ai-generate" className="mr-1" />
                    生成优化选项
                  </>
                )}
              </button>
            </div>
            
            {/* 剧情选项 */}
            {scenarioOptions.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-500 mb-2">请选择一个优化后的剧情：</div>
                {scenarioOptions.map(option => (
                  <div 
                    key={option.id}
                    className="border border-gray-300 p-3 rounded-md cursor-pointer hover:border-gray-500 transition-colors"
                    onClick={() => selectScenario(option)}
                  >
                    <p>{option.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 分幕编辑器主组件
function SceneEditor() {
  return (
    <div className="flex h-screen bg-white">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <SceneContentArea />

      {/* 右侧空白区域用于图标 */}
      <div className="w-[100px] bg-white flex flex-col items-center pt-8 gap-4">
      </div>
    </div>
  )
}

export default SceneEditor 