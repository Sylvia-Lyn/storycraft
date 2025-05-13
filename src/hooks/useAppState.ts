import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateDeepSeekContent } from '../services/deepseekService'

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
  const [selectedModel, setSelectedModel] = useState('deepseekr1')
  const models = ['deepseekr1']
  
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
      text: '角色1和角色2在不同场景下的互动',
      isUser: true
    },
    {
      text: '根据您的需求，为您提供以下内容选择:',
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
  const generateScenarioOptions = async (
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
    
    try {
      // 如果选择了DeepSeek模型
      if (selectedModel === 'deepseekr1') {
        const deepseekResponse = await generateDeepSeekContent(prompt);
        
        // 解析DeepSeek响应为三个选项
        const lines = deepseekResponse.split('\n');
        const options = [];
        
        let currentOption = { id: '', text: '' };
        for (const line of lines) {
          if (line.startsWith('选项') || line.startsWith('Option')) {
            if (currentOption.id) {
              options.push(currentOption);
              if (options.length >= 3) break;
            }
            currentOption = { 
              id: options.length + 1 + '', 
              text: line
            };
          } else if (currentOption.id && line.trim()) {
            currentOption.text += ' ' + line.trim();
          }
        }
        
        // 如果还有最后一个选项没添加
        if (currentOption.id && options.length < 3) {
          options.push(currentOption);
        }
        
        // 如果选项少于3个，补充到3个
        while (options.length < 3) {
          options.push({
            id: (options.length + 1) + '',
            text: `选项${options.length + 1}: DeepSeek生成的额外选项...`
          });
        }
        
        setScenarioOptions(options);
        setGeneratingScenarios(false);
        
        // 添加系统消息
        setMessages(prev => [...prev, {
          text: `根据DeepSeek模型和${selectedStyle}文风，为您提供以下剧情选择:`,
          isUser: false
        }]);
        return;
      }
      
      // 其他模型的逻辑不变
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
    } catch (error) {
      console.error("生成剧情选项时出错:", error);
      setGeneratingScenarios(false);
      
      // 添加错误消息
      setMessages(prev => [...prev, {
        text: `生成剧情选项时发生错误，请稍后重试。`,
        isUser: false
      }]);
    }
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
      // const prompt = `根据以下「${characterName}」的文本，以「${characterName}」的视角总结剧情，要求总结为一句话，
      // 并且有明确原文对应，且剧情总结中要包含「${characterName}」和哪些角色在什么地方发生了什么事件，
      // 有什么样的情感变化和什么样的结果`;
      
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
  
  // 生成优化文本
  const generateOptimizedText = async (
    text: string,
  ) => {
    if (!text || text.trim().length === 0) {
      alert("请选择需要优化的文本");
      return;
    }
    
    setIsOptimizing(true);
    
    const prompt = `${optimizationPrompt}\n\n${text}`;
    
    try {
      // 如果选择了DeepSeek模型
      if (selectedModel === 'deepseekr1') {
        const deepseekResponse = await generateDeepSeekContent(prompt);
        
        const result = {
          id: Date.now().toString(),
          text: deepseekResponse
        };
        
        setOptimizedResults(prev => [...prev, result]);
        setIsOptimizing(false);
        return;
      }
      
      // 其他模型的模拟逻辑不变
      setTimeout(() => {
        const optimizedText = `【${selectedModel}优化结果】这是一段使用${selectedStyle}文风优化的文本示例。它不仅保留了原文的核心内容，还增加了更多的细节描写和情感表达，使故事更加生动。\n\n${text}\n\n这里是延伸和丰富后的内容...`;
        
        const result = {
          id: Date.now().toString(),
          text: optimizedText
        };
        
        setOptimizedResults(prev => [...prev, result]);
        setIsOptimizing(false);
      }, 2000);
    } catch (error) {
      console.error("生成优化文本时出错:", error);
      setIsOptimizing(false);
      alert("生成优化文本时发生错误，请稍后重试");
    }
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
  
  // 处理用户输入的键盘事件
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.currentTarget as HTMLInputElement).value) {
      const inputValue = (e.currentTarget as HTMLInputElement).value;
      
      // 添加用户消息
      setMessages(prev => [...prev, {
        text: inputValue,
        isUser: true
      }]);
      
      // 清空输入框
      setOptimizationText('');
      
      try {
        // 如果选择了DeepSeek模型，直接调用API
        if (selectedModel === 'deepseekr1') {
          setMessages(prev => [...prev, {
            text: "DeepSeek正在思考中...",
            isUser: false
          }]);
          
          const deepseekResponse = await generateDeepSeekContent(inputValue);
          
          // 更新最后一条消息为实际响应
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              text: deepseekResponse,
              isUser: false
            };
            return updatedMessages;
          });
          
          return;
        }
        
        // 对于其他模型，使用模拟响应
        setMessages(prev => [...prev, {
          text: `这是来自${selectedModel}的模拟响应，基于您的输入："${inputValue}"`,
          isUser: false
        }]);
      } catch (error) {
        console.error("处理用户输入时出错:", error);
        setMessages(prev => [...prev, {
          text: "处理您的请求时发生错误，请稍后重试。",
          isUser: false
        }]);
      }
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
    generateOptimizedText,
    
    // 消息相关
    optimizationText,
    setOptimizationText,
    messages,
    setMessages,
    handleKeyDown
  };
} 