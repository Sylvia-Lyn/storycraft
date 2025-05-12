import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface Message {
  text: string;
  isUser: boolean;
}

export interface ScenarioOption {
  id: string;
  text: string;
}

export function useAppState() {
  // 尝试获取navigate，如果不在Router上下文中则使用一个空函数
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = (path: string) => {
      console.warn('Navigation attempted outside Router context:', path);
      window.location.href = path; // 降级为直接跳转
    };
  }
  
  // 标签状态管理
  const [selectedTab, setSelectedTab] = useState('剧本')
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本']
  
  // 处理标签点击
  const handleTabClick = (tab: string) => {
    setSelectedTab(tab)
    
    // 如果点击的是分幕标签，则导航到分幕列表页面
    if (tab === '分幕') {
      navigate('/scenes')
    }
  }
  
  // 模型选择状态管理
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude37')
  const models = ['claude37', 'claude_opus', 'gpt-4', 'gpt-4o', 'gemini-pro', 'deepseekv3']
  
  // 文风选择状态管理
  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('标准')
  const styles = ['标准', '轻松', '严肃', '幽默', '文艺', '悬疑']
  
  // 知识库选择状态管理
  const [showKnowledgeDropdown, setShowKnowledgeDropdown] = useState(false)
  const [selectedKnowledge, setSelectedKnowledge] = useState('科幻小说库')
  const knowledgeBases = ['科幻小说库', '玄幻小说库', '言情小说库']
  
  // 剧情选项管理
  const [generatingScenarios, setGeneratingScenarios] = useState(false)
  const [scenarioOptions, setScenarioOptions] = useState<ScenarioOption[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  
  // 消息状态管理
  const [optimizationText, setOptimizationText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '角色1和角色2在xxx发生了xxx而不是xxx',
      isUser: true
    },
    {
      text: '根据xxxxxxxx，为您提供以下内容选择:',
      isUser: false
    }
  ])
  
  // 生成剧情选项
  const generateScenarioOptions = (
    previousContent: string = '',
    currentContent: string = '',
    characterName: string = '主角',
    userInput: string = ''
  ) => {
    setGeneratingScenarios(true)
    
    // 构建提示词
    let prompt = '';
    
    if (previousContent) {
      prompt += `接上文：\n${previousContent}\n`;
    }
    
    prompt += `以「${characterName}」的第二人称视角，使用${selectedStyle}文风，要求符合逻辑、不能有超现实内容，并输出三种可能性的结果，继续展开以下剧情：\n`;
    
    if (currentContent) {
      prompt += `${currentContent}\n`;
    }
    
    if (userInput) {
      prompt += `补充：${userInput}`;
    }
    
    console.log('Generating scenarios with prompt:', prompt);
    console.log('Using model:', selectedModel, 'with style:', selectedStyle);
    
    // 模拟API调用，实际项目中应该调用后端
    setTimeout(() => {
      // 模拟返回的三个选项，基于选择的模型和文风
      const options = [
        {
          id: '1',
          text: `选项1 (${selectedModel}/${selectedStyle}): 你走进房间，发现桌上放着一封信。拆开后，你不敢相信自己的眼睛...`
        },
        {
          id: '2',
          text: `选项2 (${selectedModel}/${selectedStyle}): 你犹豫了一下，决定先不进入房间。直觉告诉你应该先确认周围环境...`
        },
        {
          id: '3',
          text: `选项3 (${selectedModel}/${selectedStyle}): 你深吸一口气，推开了房门。出乎意料的是，房间里空无一人，但窗户大开...`
        }
      ];
      
      setScenarioOptions(options);
      setGeneratingScenarios(false);
      
      // 添加系统消息
      setMessages(prev => [...prev, {
        text: `根据${selectedModel}模型和${selectedStyle}文风，为您提供以下剧情选择:`,
        isUser: false
      }]);
    }, 2000);
  };
  
  // 选择剧情选项
  const selectScenario = (id: string) => {
    setSelectedScenario(id);
    const selectedOption = scenarioOptions.find(option => option.id === id);
    
    if (selectedOption) {
      // 将选择添加到消息中
      setMessages(prev => [...prev, {
        text: `我选择了: ${selectedOption.text}`,
        isUser: true
      }]);
      
      // 清空选项，准备下一轮生成
      setScenarioOptions([]);
    }
  };
  
  // 消息处理逻辑
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && optimizationText.trim() !== '') {
      // 添加用户消息
      setMessages([...messages, {
        text: optimizationText,
        isUser: true
      }]);
      
      // 调用剧情生成函数
      generateScenarioOptions('', '', '主角', optimizationText);
      
      // 清空输入框
      setOptimizationText('');
    }
  };
  
  // 切换模型下拉菜单
  const toggleModelDropdown = () => setShowModelDropdown(!showModelDropdown);
  
  // 选择模型
  const selectModel = (model: string) => {
    setSelectedModel(model);
    setShowModelDropdown(false);
  };
  
  // 切换文风下拉菜单
  const toggleStyleDropdown = () => setShowStyleDropdown(!showStyleDropdown);
  
  // 选择文风
  const selectStyle = (style: string) => {
    setSelectedStyle(style);
    setShowStyleDropdown(false);
  };
  
  // 切换知识库下拉菜单
  const toggleKnowledgeDropdown = () => setShowKnowledgeDropdown(!showKnowledgeDropdown);
  
  // 选择知识库
  const selectKnowledge = (kb: string) => {
    setSelectedKnowledge(kb);
    setShowKnowledgeDropdown(false);
  };
  
  return {
    // 标签相关
    selectedTab,
    setSelectedTab: handleTabClick,
    tabs,
    
    // 模型相关
    showModelDropdown,
    toggleModelDropdown,
    selectedModel,
    selectModel,
    models,
    
    // 文风相关
    showStyleDropdown,
    toggleStyleDropdown,
    selectedStyle,
    selectStyle,
    styles,
    
    // 知识库相关
    showKnowledgeDropdown,
    toggleKnowledgeDropdown,
    selectedKnowledge,
    selectKnowledge,
    knowledgeBases,
    
    // 剧情选项相关
    generatingScenarios,
    scenarioOptions,
    selectedScenario,
    generateScenarioOptions,
    selectScenario,
    
    // 消息相关
    optimizationText,
    setOptimizationText,
    messages,
    setMessages,
    handleKeyDown
  };
} 