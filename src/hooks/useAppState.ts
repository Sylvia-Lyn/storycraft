import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateDeepSeekContent } from '../services/deepseekService'
import { generateGeminiContent } from '../services/geminiService'
import { modelChangeEventBus } from './useOptimizationResults'
import { useI18n } from '../contexts/I18nContext'

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
  const { language } = useI18n();
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
      navigate('/app/scenes')
    }
  }

  // 模型选择状态管理
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  // 从localStorage中读取保存的模型选择，如果没有则默认为Gemini
  const [selectedModel, setSelectedModel] = useState(() => {
    const savedModel = localStorage.getItem('selectedModel');
    console.log(`[useAppState] 初始化selectedModel，从localStorage读取: ${savedModel}`);
    return savedModel && ['deepseek-r1', 'Gemini'].includes(savedModel) ? savedModel : 'Gemini';
  })
  const models = ['Gemini', 'deepseek-r1']  // 支持Gemini与DeepSeek-R1

  // 添加useEffect来监控selectedModel的变化
  useEffect(() => {
    console.log(`[useAppState] selectedModel发生变化: ${selectedModel}`);
  }, [selectedModel]);

  // 文风相关状态管理
  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('简洁')
  const styles = ['简洁', '细腻', '幽默', '悬疑', '浪漫']

  // 模式状态管理
  const [selectedMode, setSelectedMode] = useState<'continue' | 'create'>('continue')

  // 剧情选项管理
  const [generatingScenarios, setGeneratingScenarios] = useState(false)
  const [scenarioOptions, setScenarioOptions] = useState<ScenarioOption[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  // 消息状态管理
  const [optimizationText, setOptimizationText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '暂无对话历史',
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

    if (previousContent || currentContent) {
      prompt += `接上文，「分幕剧情」`;
    }

    if (userInput) {
      prompt += `，补充：「${userInput}」`;
    }

    // 如果文风不为空，添加文风参考
    if (selectedStyle && selectedStyle !== '简洁') {
      prompt += `\n（参考「知识库-${selectedStyle}」的叙事节奏和内容风格）`;
    }

    prompt += `\n要求符合逻辑、不能有超现实内容，并输出三种可能性的结果：`;

    // 添加当前内容作为上下文
    if (previousContent) {
      prompt += `\n\n上文内容：\n${previousContent}`;
    }

    if (currentContent) {
      prompt += `\n\n当前剧情：\n${currentContent}`;
    }

    console.log('Generating scenarios with prompt:', prompt);
    console.log('Using model:', selectedModel, 'with style:', selectedStyle);

    try {
      // 根据选择的模型调用相应的API
      if (selectedModel === 'deepseek-r1' || selectedModel === 'Gemini') {
        // 调用相应的API
        const response = selectedModel === 'deepseek-r1'
          ? await generateDeepSeekContent(prompt, 'deepseek-chat', language)
          : await generateGeminiContent(prompt, language); // 使用Gemini API

        // 直接将AI响应添加到消息中，而不解析为选项
        setMessages(prev => [...prev, {
          text: response,
          isUser: false
        }]);

        setGeneratingScenarios(false);
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
          text: `${selectedModel}模型和${selectedStyle}文风`,
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
  const generateSceneSummaries = async (
    content: string,
    characterName: string = '主角'
  ) => {
    if (!content || content.trim().length === 0) {
      alert("请先输入初稿内容");
      return [];
    }

    if (content.length > 50000) {
      alert("初稿内容不能超过5万字");
      return [];
    }

    // 将文本分成多个段落，每段2000-5000字
    const segments: Array<{ text: string, startPos: number, endPos: number }> = [];
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

    // 根据选择的模型调用相应的API生成场景总结
    try {
      const generatedScenes = await Promise.all(segments.map(async (segment, index) => {
        // 构建分幕剧情总结的提示词
        const prompt = `根据以下「${characterName}」的文本，以「${characterName}」的视角总结剧情，要求总结为一句话，
        并且有明确原文对应，且剧情总结中要包含「${characterName}」和哪些角色在什么地方发生了什么事件，
        有什么样的情感变化和什么样的结果\n\n文本内容：${segment.text}`;

        let summary = '';

        try {
          // 根据选择的模型调用相应的API
          console.log(`使用${selectedModel}模型生成场景总结`);
          if (selectedModel === 'deepseek-r1' || selectedModel === 'Gemini') {
            const response = selectedModel === 'deepseek-r1'
              ? await generateDeepSeekContent(prompt, 'deepseek-chat', language)
              : await generateGeminiContent(prompt, language); // 使用Gemini API
            summary = response;
          } else {
            // 如果没有选择有效模型，使用模拟数据
            summary = `${characterName}在第${index + 1}段落中与其他角色发生互动，情节发展带来情感变化`;
          }
        } catch (error) {
          console.error(`生成场景总结时出错:`, error);
          // 出错时使用默认总结
          summary = `${characterName}在第${index + 1}段落中与其他角色发生互动，情节发展带来情感变化`;
        }

        return {
          id: `scene-${index + 1}`,
          summary,
          startPos: segment.startPos,
          endPos: segment.endPos
        };
      }));

      return generatedScenes;
    } catch (error) {
      console.error("生成场景总结时出错:", error);
      return [];
    }
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

    try {
      // 根据选择的模型调用相应的API
      if (selectedModel === 'deepseek-r1' || selectedModel === 'Gemini') {
        const prompt = `请使用${selectedStyle}文风来优化以下文本，使其更加生动、有趣、具有文学性，同时保持原文的意思不变：\n\n${text}`;

        // 调用相应的API
        const response = selectedModel === 'deepseek-r1'
          ? await generateDeepSeekContent(prompt, 'deepseek-chat', language)
          : await generateGeminiContent(prompt, language); // 使用Gemini API

        const result = {
          id: Date.now().toString(),
          text: response
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
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log(`[useAppState] handleKeyDown被调用，当前selectedModel: ${selectedModel}`);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const inputValue = (e.target as HTMLInputElement | HTMLTextAreaElement).value.trim();
      if (!inputValue) return;

      console.log(`[useAppState] 处理用户输入: ${inputValue}`);

      // 添加用户消息
      setMessages(prev => [...prev, {
        text: inputValue,
        isUser: true
      }]);

      // 清空输入框
      (e.target as HTMLInputElement | HTMLTextAreaElement).value = '';

      try {
        // 如果选择了DeepSeek或Gemini模型，直接调用API
        if (selectedModel === 'deepseek-r1' || selectedModel === 'Gemini') {
          console.log(`[useAppState] 准备使用${selectedModel}模型生成内容`);
          setMessages(prev => [...prev, {
            text: `${selectedModel}正在思考中...`,
            isUser: false
          }]);

          // 构建提示词，包含用户输入和文风
          const prompt = `使用${selectedStyle}文风，基于以下用户输入生成内容：\n${inputValue}`;
          console.log(`[useAppState] 当前选择的模型: ${selectedModel}`);
          console.log(`[useAppState] 准备调用API，提示词: ${prompt}`);

          // 调用相应的API
          console.log(`[useAppState] 开始调用API，使用模型: ${selectedModel}`);
          const response = selectedModel === 'deepseek-r1'
            ? await generateDeepSeekContent(prompt, 'deepseek-reasoner', language)
            : await generateGeminiContent(prompt, language);

          console.log(`[useAppState] ${selectedModel} API响应: ${response}`);

          // 更新最后一条消息为实际响应
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              text: response,
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
    console.log(`[useAppState] selectModel被调用，参数: ${model}`);
    console.log(`[useAppState] 当前selectedModel: ${selectedModel}`);
    setSelectedModel(model);
    console.log(`[useAppState] selectedModel已更新为: ${model}`);
    setShowModelDropdown(false);

    // 记录模型选择到localStorage，确保页面刷新后仍然保持选择
    localStorage.setItem('selectedModel', model);
    console.log(`[useAppState] 模型选择已保存到localStorage`);

    // 通知其他组件模型已更改
    modelChangeEventBus.notify(model);
  };

  // 切换文风下拉菜单
  const toggleStyleDropdown = () => setShowStyleDropdown(!showStyleDropdown);

  // 选择文风
  const selectStyle = (style: string) => {
    setSelectedStyle(style);
    setShowStyleDropdown(false);
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

    // 模式相关
    selectedMode,
    setSelectedMode,

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