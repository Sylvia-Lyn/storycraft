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

export interface Scene {
  id: string;
  summary: string;
  startPos: number;
  endPos: number;
}

export interface OptimizedResult {
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
  
  // 分幕剧情管理
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [characterName, setCharacterName] = useState("主角")
  
  // 初稿优化管理
  const [selectedDraftText, setSelectedDraftText] = useState("")
  const [optimizationPrompt, setOptimizationPrompt] = useState("请优化以下剧情，使其更加生动有趣，情节更合理：")
  const [optimizedResults, setOptimizedResults] = useState<OptimizedResult[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  
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
  
  // 生成分幕剧情总结
  const generateSceneSummaries = (
    content: string,
    characterName: string = '主角'
  ) => {
    if (!content || content.trim().length === 0) {
      alert("请先输入初稿内容");
      return;
    }

    if (content.length > 50000) {
      alert("初稿内容不能超过5万字");
      return;
    }
    
    // 将文本分成多个段落，每段2000-5000字
    const segments: Array<{text: string, startPos: number, endPos: number}> = [];
    let currentPos = 0;
    let remainingText = content;
    
    while (remainingText.length > 0) {
      // 目标段落长度
      const targetLength = Math.min(
        Math.max(2000, Math.floor(Math.random() * 3000) + 2000),
        remainingText.length
      );
      
      // 如果剩余文本小于目标长度，直接作为最后一段
      if (remainingText.length <= targetLength) {
        segments.push({
          text: remainingText,
          startPos: currentPos,
          endPos: currentPos + remainingText.length
        });
        break;
      }
      
      // 查找句号或段落结束位置，确保在合理位置断开
      let cutPosition = targetLength;
      for (let i = targetLength; i > targetLength - 500 && i > 0; i--) {
        if (remainingText[i] === '。' || remainingText[i] === '\n') {
          cutPosition = i + 1;
          break;
        }
      }
      
      // 分割文本段落
      const segment = remainingText.substring(0, cutPosition);
      segments.push({
        text: segment,
        startPos: currentPos,
        endPos: currentPos + cutPosition
      });
      
      // 更新剩余文本和位置
      remainingText = remainingText.substring(cutPosition);
      currentPos += cutPosition;
    }
    
    // 模拟API调用，根据提示词生成场景总结
    // 实际项目中应该调用后端API
    const generatedScenes = segments.map((segment, index) => {
      // 构建分幕剧情总结的提示词
      const prompt = `根据以下「${characterName}」的文本，以「${characterName}」的视角总结剧情，要求总结为一句话，
      并且有明确原文对应，且剧情总结中要包含「${characterName}」和哪些角色在什么地方发生了什么事件，
      有什么样的情感变化和什么样的结果`;
      
      // 这里模拟生成剧情总结
      // 真实项目中，这部分应该调用API，传入段落内容和角色名
      const summary = `${characterName}在第${index + 1}段落中与其他角色发生互动，情节发展带来情感变化`;
      
      return {
        id: `scene-${index + 1}`,
        summary,
        startPos: segment.startPos,
        endPos: segment.endPos
      };
    });
    
    return generatedScenes;
  };
  
  // 生成优化剧情
  const generateOptimizedText = (
    text: string,
    prompt: string = '请优化以下剧情，使其更加生动有趣，情节更合理：'
  ) => {
    setIsOptimizing(true);
    
    // 在实际应用中，这里应该调用API发送优化请求
    // 包含 text, prompt, selectedModel, selectedStyle 等参数
    
    // 模拟API调用
    setTimeout(() => {
      const results = [
        {
          id: '1',
          text: `优化版本1 (${selectedModel}/${selectedStyle}): ${text.substring(0, 20)}... 【这里是优化后的内容，使用了更生动的描写和合理的情节发展】`
        },
        {
          id: '2',
          text: `优化版本2 (${selectedModel}/${selectedStyle}): ${text.substring(0, 20)}... 【另一种优化方向，增强了角色情感和场景氛围描写】`
        },
        {
          id: '3',
          text: `优化版本3 (${selectedModel}/${selectedStyle}): ${text.substring(0, 20)}... 【第三种优化方案，调整了情节节奏和冲突设置】`
        }
      ];
      
      setOptimizedResults(results);
      setIsOptimizing(false);
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
    
    // 分幕剧情相关
    scenes,
    setScenes,
    selectedScene,
    setSelectedScene,
    characterName,
    setCharacterName,
    generateSceneSummaries,
    
    // 初稿优化相关
    selectedDraftText,
    setSelectedDraftText,
    optimizationPrompt,
    setOptimizationPrompt,
    optimizedResults,
    setOptimizedResults,
    isOptimizing,
    setIsOptimizing,
    generateOptimizedText,
    
    // 消息相关
    optimizationText,
    setOptimizationText,
    messages,
    setMessages,
    handleKeyDown
  };
} 