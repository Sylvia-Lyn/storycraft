import { useState } from 'react'

export interface Message {
  text: string;
  isUser: boolean;
}

export function useAppState() {
  // 标签状态管理
  const [selectedTab, setSelectedTab] = useState('剧本')
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本']
  
  // 模型选择状态管理
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude35_sonnet2')
  const models = ['claude35_sonnet2', 'claude_opus', 'gpt-4', 'gpt-4o', 'gemini-pro', 'deepseekv3']
  
  // 知识库选择状态管理
  const [showKnowledgeDropdown, setShowKnowledgeDropdown] = useState(false)
  const [selectedKnowledge, setSelectedKnowledge] = useState('科幻小说库')
  const knowledgeBases = ['科幻小说库', '玄幻小说库', '言情小说库']
  
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
  
  // 消息处理逻辑
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && optimizationText.trim() !== '') {
      // 添加用户消息
      setMessages([...messages, {
        text: optimizationText,
        isUser: true
      }]);
      
      // 模拟AI回复
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `您的问题"${optimizationText}"已收到，我们正在处理...`,
          isUser: false
        }]);
      }, 1000);
      
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
    setSelectedTab,
    tabs,
    
    // 模型相关
    showModelDropdown,
    toggleModelDropdown,
    selectedModel,
    selectModel,
    models,
    
    // 知识库相关
    showKnowledgeDropdown,
    toggleKnowledgeDropdown,
    selectedKnowledge,
    selectKnowledge,
    knowledgeBases,
    
    // 消息相关
    optimizationText,
    setOptimizationText,
    messages,
    setMessages,
    handleKeyDown
  };
} 