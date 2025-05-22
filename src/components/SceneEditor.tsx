import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Switch,
  FormControlLabel
} from '@mui/material'
import Sidebar from './Sidebar'
import Navigation from './Navigation'
import PromptDisplay from './PromptDisplay'
import InputPanel from './InputPanel'

// 表格数据接口
interface TableData {
  id: string;
  character: string;
  timeline: string;
  keyEvent: string;
  emotionChange: string;
  relationship: string;
  characterEffect: string;
}

// 初始表格数据
const initialTableData: TableData[] = [
  {
    id: '1',
    character: '花间客',
    timeline: '长歌xx年【背景】在你的婚宴之上见到你',
    keyEvent: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主线）\n张嘉敏失去了记忆（副线）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    emotionChange: '主线：恐惧，患得患失\n副线：悲伤，残缺\n发展：自虐的爽结局：悲剧的抛弃',
    relationship: '1. 苏飞卿与父母：传统的将门子弟，父严母慈，备受期待\n2. 苏飞卿与太子：表兄弟关系，互相信任',
    characterEffect: '这些情节共同构建了一个充满政治阴谋、战争风险和美丽情感的故事背景。\n1. 展现了苏飞卿年少轻狂却重情重义的性格\n2. 凸显了问题少女身份的神秘性和复杂性'
  },
  {
    id: '2',
    character: '张嘉敏',
    timeline: '长歌xx年【背景】多年之后我在你的婚宴之上见到你',
    keyEvent: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主线）\n张嘉敏失去了记忆（副线）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    emotionChange: '主线：愧疚，迷失\n副线：痛苦，挣扎\n发展：混乱的迷失\n结局：解脱的释然',
    relationship: '1. 张嘉敏与父母：被动接受家庭安排，尝试寻找自我\n2. 张嘉敏与未婚夫：礼节性关系，缺乏真感情',
    characterEffect: '这些情节展示了张嘉敏内心的矛盾和挣扎：\n1. 表面温顺实则内心渴望自由\n2. 记忆缺失导致的身份认同危机'
  },
  {
    id: '3',
    character: '永安',
    timeline: '长歌xx年【背景】',
    keyEvent: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主线）\n张嘉敏失去了记忆（副线）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    emotionChange: '主线：占有欲，控制欲\n副线：妒忌，恼怒\n发展：愤怒的报复\n结局：偏执的坚持',
    relationship: '1. 永安与张嘉敏：表面呵护，实则控制\n2. 永安与家族：为家族利益牺牲个人情感，城府极深',
    characterEffect: '永安的角色展现了：\n1. 外表彬彬有礼下隐藏的控制欲\n2. 对权力和地位的执着追求导致的扭曲人格'
  },
  {
    id: '4',
    character: '苏飞卿',
    timeline: '长歌xx年【背景】',
    keyEvent: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主线）\n张嘉敏失去了记忆（副线）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    emotionChange: '主线：忠诚，责任感\n副线：矛盾，纠结\n发展：艰难的抉择\n结局：舍己的牺牲',
    relationship: '1. 苏飞卿与张嘉敏：一见钟情，但碍于身份无法表达\n2. 苏飞卿与永安：表面友好，实则暗中较量',
    characterEffect: '苏飞卿的角色塑造反映了：\n1. 在爱情与责任间的痛苦挣扎\n2. 忠义与个人幸福难以兼得的人生困境'
  }
];

// 分幕编辑器主组件
function SceneEditor() {
  const { sceneId } = useParams();
  const [isCharacterView, setIsCharacterView] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>(initialTableData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workingMode, setWorkingMode] = useState<'conversation' | 'optimization'>('conversation');
  
  // 处理表格数据更新
  const handleUpdateTableData = (id: string, field: keyof TableData, value: string) => {
    setTableData(prevData => 
      prevData.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // 处理视图切换
  const handleViewToggle = () => {
    setIsCharacterView(!isCharacterView);
  };

  // 处理输入提交
  const handleInputSubmit = (input: string) => {
    console.log("提交输入:", input);
    // 这里可以实现与AI交互的逻辑
    setIsGenerating(true);
    
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
      // 更新表格数据或显示优化结果
    }, 2000);
  };

  // 处理预设Prompt选择
  const handlePresetPromptSelect = (prompt: string) => {
    if (prompt === 'SWITCH_TO_CONVERSATION') {
      setWorkingMode('conversation');
    } else if (prompt === 'SWITCH_TO_OPTIMIZATION') {
      setWorkingMode('optimization');
    } else {
      console.log("选择预设Prompt:", prompt);
    }
  };

  // 使用 useEffect 添加样式来隐藏全局输入框
  useEffect(() => {
    // 创建一个新的样式元素
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* 隐藏全局输入框 */
      body > div:last-child > div:last-child {
        display: none !important;
      }
      #root > div:last-child > div:last-child {
        display: none !important;
      }
      [placeholder="输入内容开始对话，按回车发送..."] {
        display: none !important;
      }
      [placeholder*="输入内容开始对话"] {
        display: none !important;
      }
      .app > div:last-child > div:last-child {
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // 组件卸载时移除样式
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // 渲染角色视图表格
  const renderCharacterTable = () => {
    return (
      <TableContainer component={Paper} sx={{ height: 'calc(100vh - 290px)', overflow: 'auto' }}>
        <Table stickyHeader aria-label="character table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 100 }}>角色</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 150 }}>时间线</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 250 }}>关键事件</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 200 }}>情感变化</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 200 }}>人物关系</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 200 }}>人物塑造效果</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <PromptDisplay 
                    type="character" 
                    content={row.character} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'character', value)}
                  />
                </TableCell>
                <TableCell>
                  <PromptDisplay 
                    type="timeline" 
                    content={row.timeline} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'timeline', value)}
                  />
                </TableCell>
                <TableCell>
                  <PromptDisplay 
                    type="event" 
                    content={row.keyEvent} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'keyEvent', value)}
                  />
                </TableCell>
                <TableCell>
                  <PromptDisplay 
                    type="emotion" 
                    content={row.emotionChange} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'emotionChange', value)}
                  />
                </TableCell>
                <TableCell>
                  <PromptDisplay 
                    type="relationship" 
                    content={row.relationship} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'relationship', value)}
                  />
                </TableCell>
                <TableCell>
                  <PromptDisplay 
                    type="character-effect" 
                    content={row.characterEffect} 
                    onEdit={(value: string) => handleUpdateTableData(row.id, 'characterEffect', value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // 剧情视图内容
  const renderStoryView = () => {
    return (
      <div className="p-4 overflow-auto h-full pb-20">
        <div className="mb-4">
          <div className="border border-gray-300 rounded p-4 mb-4">
            <div className="flex justify-between items-center">
              <span>分幕标题: {sceneId ? `分幕${sceneId}` : '分幕1'} - 花间客在订婚宴上重逢前爱人</span>
              <button 
                className="text-blue-500 text-sm"
              >
                修改内容
              </button>
            </div>
          </div>

          <div>
            {tableData.map((row) => (
              <div 
                key={row.id}
                className="p-4 mb-2 rounded cursor-pointer border border-gray-200 hover:border-gray-400"
              >
                <div className="font-medium mb-2">{row.character}：</div>
                <p className="whitespace-pre-wrap text-sm">{row.keyEvent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white scene-editor-container">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col h-screen">
        {/* 顶部导航栏 */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <Navigation 
            tabs={['分幕', '剧本', '大纲', '角色', '关系', '章节']} 
            defaultTab="分幕"
            onTabChange={() => {}}
          />
        </div>

        {/* 视图切换 */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="font-medium">
            分幕 {sceneId || '1'}: 花间客在订婚宴上重逢前爱人
          </div>
          <FormControlLabel
            control={
              <Switch
                checked={isCharacterView}
                onChange={handleViewToggle}
                color="primary"
              />
            }
            label={isCharacterView ? "角色视图" : "剧情视图"}
          />
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-auto">
          {isCharacterView ? renderCharacterTable() : renderStoryView()}
        </div>

        {/* 底部输入面板 */}
        <InputPanel 
          onSubmit={handleInputSubmit}
          isGenerating={isGenerating}
          workingMode={workingMode}
          placeholderOverride="输入内容优化建议，如：希望花间客能更加犹豫不决..."
          presetPrompts={[
            '优化角色性格描写，让角色更加立体',
            '调整情节节奏，使故事更加紧凑',
            '增加场景描写，提升沉浸感',
            '改进对话内容，突出角色个性',
            '添加冲突元素，增强戏剧性'
          ]}
          onPresetPromptSelect={handlePresetPromptSelect}
        />
      </div>
    </div>
  );
}

export default SceneEditor; 