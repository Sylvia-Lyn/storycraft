import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Sidebar from './Sidebar'
import Navigation from './Navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface Scene {
  id: string;
  timeline: string;
  template: string;
  plot: string;
  characters: string[];
  coreRelationship: string;
  emotionDevelopment: string;
  characterRelationships: string;
  characterEffect: string;
}

// 示例数据
const demoScenes: Scene[] = [
    { 
      id: '1', 
    timeline: '长熙xx年【背景】',
    template: '多年之后我在你的婚宴之上见到你',
    plot: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主弦）\n张嘉敏失去了记忆（副弦）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    characters: ['花间客', '张嘉敏', '永安', '萱儿', '苏飞卿'],
    coreRelationship: '主弦：恐惧，患得患失\n副弦：悲伤，残缺\n发展：自虐的爽结局\n悲剧的扭曲\n隐藏：治愈升华',
    emotionDevelopment: '• 高亮: 主弦的张力很满，副弦一般，后面几个音符时看不出门道。\n• 衔接: 1，更糟糕的是……\n2，在剩下的时间里……',
    characterRelationships: '1. 苏飞卿与父母：传统的将门子弟，父严母慈，备受期待\n2. 苏飞卿与太子：表兄弟关系，互相信任',
    characterEffect: '这些情节共同构建了一个充满政治阴谋、战争威胁和美爱情的故事背景。\n1. 展现了苏飞卿年少轻狂却情重义的性格\n2. 凸显了阿鹰身份的神秘性和复杂性'
    },
    { 
      id: '2', 
    timeline: '长熙二年春',
    template: '背景模板',
    plot: '示例剧情描述',
    characters: ['角色A', '角色B'],
    coreRelationship: '核心情绪示例',
    emotionDevelopment: '情感发展示例',
    characterRelationships: '人物关系示例',
    characterEffect: '人物效果示例'
  }
];

// 列定义
const columnHelper = createColumnHelper<Scene>();

// 分幕列表页面主组件
function SceneList() {
  const [selectedTab, setSelectedTab] = useState('分幕');
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  const [isPlotView, setIsPlotView] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude35_sonnet2');
  const [userInput, setUserInput] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // AI模型列表
  const models = [
    'claude35_sonnet2',
    'claude35_haiku',
    'claude37_sonnet',
    'gpt-4o',
    'gemini-pro'
  ];
  
  // 模拟生成AI建议
  const generateSuggestions = () => {
    if (!userInput.trim()) return;
    
    // 实际项目中应调用API获取建议
    const suggestions = [
      "1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ];
    
    setAiSuggestions(suggestions);
  };

  // 处理输入框回车事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.trim()) {
      generateSuggestions();
    }
  };

  // 定义表格列
  const columns = useMemo(
    () => [
      columnHelper.accessor('timeline', {
        header: '时间线',
        cell: info => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor('template', {
        header: '原型',
        cell: info => info.getValue(),
        size: 150,
      }),
      columnHelper.accessor('plot', {
        header: '剧情',
        cell: info => <div className="max-w-[200px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 200,
      }),
      columnHelper.accessor('characters', {
        header: '角色',
        cell: info => (
          <div className="max-w-[150px] overflow-hidden">
            <ul className="list-disc pl-5">
              {info.getValue().map((char, idx) => (
                <li key={idx} className="truncate">• {char}</li>
              ))}
            </ul>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor('coreRelationship', {
        header: '核心情绪',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('emotionDevelopment', {
        header: '情感发展',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('characterRelationships', {
        header: '人物关系',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('characterEffect', {
        header: '人物效果',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: demoScenes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 150,
    },
  });

  // 处理单元格点击，模拟选择内容
  const handleCellClick = (cell: any) => {
    const content = cell.getValue();
    if (typeof content === 'string') {
      setSelectedCell(content.substring(0, 50) + '...');
    } else if (Array.isArray(content)) {
      setSelectedCell(content.join(', '));
    }
  };

  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #000;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #333;
    }
  `;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyle }} />
      
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 中间内容区域 */}
      <div className="flex-1 flex flex-col h-full max-w-[calc(100vw-300px)]">
        <div className="flex items-center px-4 pt-4">
          {/* 顶部导航 */}
          <div className="flex-1">
            <Navigation 
              tabs={tabs} 
              defaultTab="分幕" 
              onTabChange={setSelectedTab}
            />
          </div>
          
          {/* 剧情视图开关 */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-700">角色视图</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPlotView} 
                onChange={() => setIsPlotView(!isPlotView)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
            <span className="text-sm text-gray-700">剧情视图</span>
          </div>
        </div>
        
        {/* 表格区域 */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-gray-50">
                      {headerGroup.headers.map(header => (
                        <th 
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 sticky top-0 bg-gray-50"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-sm text-gray-600 border-b border-r border-gray-200"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* 底部AI交互区域 */}
        <div className="border-t border-gray-200 pt-4 pb-4 bg-white">
          {/* AI模型选择区域 */}
          <div className="px-6 py-2">
            <div className="relative inline-block">
              <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md cursor-pointer" onClick={() => setShowModelDropdown(!showModelDropdown)}>
                <Icon icon="mdi:robot-outline" className="text-gray-700 mr-2" />
                <span className="text-black font-medium">{selectedModel}</span>
                <Icon icon="mdi:chevron-down" className="ml-2 text-gray-500" />
              </div>
              
              {/* 模型下拉菜单 */}
              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-full">
                  {models.map(model => (
                    <div 
                      key={model}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedModel === model ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 聊天气泡 */}
          <div className="py-3 px-6">
            <div className="flex justify-end mb-4">
              <div className="bg-black text-white px-4 py-3 rounded-lg max-w-[80%] relative">
                <p>角色1和角色2在xxx发生了xxx而不是xxx</p>
                <div className="absolute w-3 h-3 bg-black transform rotate-45 right-[-6px] top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg max-w-[80%]">
                <p className="text-sm text-gray-700">根据xxxxxxxx, 为您提供以下内容选择:</p>
              </div>
            </div>
          </div>
          
          {/* AI建议显示区域 */}
          {aiSuggestions.length > 0 && (
            <div className="px-6 py-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                  <p className="text-gray-800 break-words">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* 输入框区域 */}
          <div className="px-6 pt-2">
            <input
              type="text"
              placeholder="这段内容不好？点击单元格，告诉我如何优化，如：xxxxxx"
              className="w-full border border-gray-300 rounded-lg p-4 text-gray-600"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>

      {/* 右侧空白区域用于图标 */}
      <div className="w-[100px] bg-white flex flex-col items-center pt-8 gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:edit-line" className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:add-line" className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:delete-bin-line" className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  )
}

export default SceneList 