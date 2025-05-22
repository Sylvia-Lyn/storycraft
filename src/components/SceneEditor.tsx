import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Collapse, Input, Button, Spin } from 'antd'
import Sidebar from './Sidebar'
import { useAppState, ScenarioOption } from '../hooks/useAppState'

const { Panel } = Collapse
const { TextArea } = Input

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
  const [activeKey, setActiveKey] = useState<string[]>(['1']) // 控制面板展开状态

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

  // 处理面板展开变化
  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(Array.isArray(key) ? key : [key]);
  };

  return (
    <div className="flex-1 overflow-auto bg-white flex flex-col">
      <div className="p-4 flex-none">
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
      </div>
      
      {/* 使用 antd Collapse 组件创建垂直面板 */}
      <Collapse 
        className="flex-1 overflow-auto"
        activeKey={activeKey}
        onChange={handleCollapseChange}
        bordered={false}
      >
        {/* 上面板：内容区域 */}
        <Panel 
          header={<div className="font-medium">分幕内容</div>} 
          key="1"
          className="overflow-auto"
        >
          <div className="overflow-auto pb-4">
            {isEditing ? (
              <div className="mb-4">
                <TextArea
                  className="w-full"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  style={{ lineHeight: '1.6' }}
                />
              </div>
            ) : (
              <div>
                {content.split('\n\n').map((paragraph, index) => (
                  <div 
                    key={index}
                    className={`p-4 mb-2 rounded cursor-pointer ${selectedCell === index ? 'bg-gray-100 border-2 border-black' : 'border border-gray-200 hover:border-gray-400'}`}
                    onClick={() => {
                      setSelectedCell(index);
                      // 当选择单元格时自动展开底部面板
                      if (!activeKey.includes('2')) {
                        setActiveKey(['1', '2']);
                      }
                    }}
                  >
                    <p className="whitespace-pre-wrap">{paragraph}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
        
        {/* 下面板：AI 生成区域 */}
        <Panel 
          header={
            <div className="font-medium">
              AI 辅助生成
              {selectedCell !== null && <span className="ml-2 text-gray-500">（当前选中第 {selectedCell + 1} 段）</span>}
            </div>
          } 
          key="2"
          className="overflow-auto"
        >
          <div className="p-4 bg-white">
            {selectedCell !== null ? (
              <>
                <div className="mb-3">
                  <div className="font-medium mb-2">角色1和角色2在xxx发生了xxx而不是xxx</div>
                  <p className="text-sm text-gray-500">
                    使用 <span className="font-semibold">{selectedModel}</span> 模型和 
                    <span className="font-semibold"> {selectedStyle}</span> 文风
                  </p>
                </div>
                
                {scenarioOptions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    <div className="text-sm text-gray-500 mb-2">请选择一个优化后的剧情：</div>
                    {scenarioOptions.map(option => (
                      <div 
                        key={option.id}
                        className="border border-gray-300 p-3 rounded-md cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors"
                        onClick={() => selectScenario(option)}
                      >
                        <p>{option.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md mb-4 text-gray-500">
                    <p>这段内容不好？请在输入框中告诉我如何优化，如：增加更多情感描写，减少对话...</p>
                  </div>
                )}
                
                <div className="flex items-center">
                  <TextArea
                    className="flex-1"
                    placeholder="告诉我如何优化这段剧情..."
                    value={optimizationInput}
                    onChange={(e) => setOptimizationInput(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                  />
                  <Button 
                    type="primary"
                    className="ml-3"
                    onClick={handleGenerateScenarioOptions}
                    disabled={!optimizationInput.trim() || isGeneratingOptions}
                    icon={isGeneratingOptions ? <Spin size="small" /> : <Icon icon="ri:ai-generate" />}
                  >
                    生成
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                请先在上方选择一个段落进行编辑
              </div>
            )}
          </div>
        </Panel>
      </Collapse>
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