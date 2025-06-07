import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function OutlineContent() {
  // 添加状态管理
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<string[]>(['', '', '']);
  const [outlineStyle, setOutlineStyle] = useState('古风情感');
  const [keySettings, setKeySettings] = useState('逆向时空');
  const [referenceCase, setReferenceCase] = useState('《古相思曲》- 大纲  《扶剑惊风》- 大纲');
  const [selectedModel, setSelectedModel] = useState('deepseekr1');
  const [backgroundContent, setBackgroundContent] = useState('正在输入内容...');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 预设的优化建议
  const optimizationSuggestions = [
    '增加更多情感冲突',
    '角色动机不够清晰，需要调整',
    '剧情节奏太慢，希望更加紧凑',
    '增加悬疑元素',
    '强化角色关系线',
    '添加意外转折',
    '优化背景设定的逻辑性',
    '增加玩家互动性'
  ];

  // 根据输入内容生成建议
  useEffect(() => {
    if (inputText.trim() === '') {
      setShowSuggestions(false);
      return;
    }

    const input = inputText.toLowerCase();
    let matchedSuggestions: string[] = [];

    // 关键词匹配建议
    if (input.includes('角色') || input.includes('人物')) {
      matchedSuggestions = [
        '角色性格不够鲜明，需要增强个性特点',
        '角色动机不明确，需要添加背景故事',
        '角色关系过于简单，需要增加复杂性'
      ];
    } else if (input.includes('情节') || input.includes('剧情')) {
      matchedSuggestions = [
        '情节节奏太慢，需要增加紧凑感',
        '情节缺乏冲突，需要添加戏剧张力',
        '情节转折不够自然，需要更好的铺垫'
      ];
    } else if (input.includes('情感') || input.includes('感情')) {
      matchedSuggestions = [
        '情感线过于单薄，需要增加层次',
        '情感冲突不够激烈，缺乏震撼力',
        '情感发展过于快速，需要更多铺垫'
      ];
    } else if (input.length > 2) {
      // 显示通用建议
      matchedSuggestions = optimizationSuggestions.slice(0, 4);
    }

    if (matchedSuggestions.length > 0) {
      setInputSuggestions(matchedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputText]);

  // 处理输入提交
  const handleSubmit = async () => {
    if (!inputText.trim() || isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      // 直接调用生成服务
      const results = await generateContent(inputText);
      setGeneratedResults(results);
      
    } catch (error) {
      console.error('处理输入失败:', error);
      toast.error('处理失败，请重试');
    } finally {
      setIsGenerating(false);
      setInputText('');
      inputRef.current?.blur();
    }
  };

  // 构建 prompt 模板
  const buildPrompt = (userInput: string) => {
    let prompt = '';
    
    // 添加参考案例
    if (referenceCase) {
      const caseName = referenceCase.split('》')[0].substring(1);
      prompt += `参考「知识库-${caseName}」\n`;
    }
    
    prompt += '已经生成了生成一份\n';
    
    // 添加大纲风格
    if (outlineStyle) {
      prompt += `「${outlineStyle}」\n`;
    }
    
    prompt += '剧本杀情感本的大纲，\n';
    
    // 添加关键设定
    if (keySettings) {
      prompt += `要求包含「${keySettings}」等设定，\n`;
    }
    
    prompt += `大纲内容为：「${backgroundContent}」\n`;
    prompt += `根据以下要求优化背景内容，要求符合逻辑、不能有超现实内容，并输出三种可能性的结果：${userInput}`;
    
    return prompt;
  };

  // 模拟内容生成（需要替换为实际的 AI API）
  const generateContent = async (prompt: string): Promise<string[]> => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于用户输入生成更智能的回复
    const userInput = inputText;
    const baseResponses = [
      `基于"${userInput}"的优化 - 通过增强角色间的情感纠葛和误解，创造更多戏剧冲突点，让玩家在角色扮演中体验更丰富的情感层次。`,
      `针对"${userInput}"的改进 - 在现有剧情基础上融入更多悬疑推理元素，通过线索发现和真相揭露的过程，增强玩家的参与感和沉浸体验。`,
      `围绕"${userInput}"的重构 - 重新设计角色动机和背景设定，确保每个角色都有清晰的目标和合理的行为逻辑，提升整体故事的说服力。`
    ];
    
    return baseResponses;
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim() && !isGenerating) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      // 可以添加键盘导航逻辑
      e.preventDefault();
    }
  };

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 处理输入框失去焦点
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 延迟隐藏建议，允许用户点击建议
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <div className="flex flex-1">
      {/* 左侧内容生成区 */}
      <div className="w-2/5 border-r p-6 flex flex-col">
        {/* 大纲风格选择 */}
        <div className="mb-6">
          <div className="text-lg font-medium mb-2">大纲风格</div>
          <div className="flex space-x-4 mb-4">
            <div className="relative">
              <select 
                className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={outlineStyle}
                onChange={(e) => setOutlineStyle(e.target.value)}
              >
                <option>古风情感</option>
                <option>现代都市</option>
                <option>科幻未来</option>
                <option>悬疑推理</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <div className="py-2">关键设定</div>
            <div className="relative">
              <select 
                className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={keySettings}
                onChange={(e) => setKeySettings(e.target.value)}
              >
                <option>逆向时空</option>
                <option>双重身份</option>
                <option>失忆设定</option>
                <option>命运轮回</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* 参考案例 */}
          <div className="mb-6">
            <div className="text-lg font-medium mb-2">参考案例</div>
            <div className="relative">
              <select 
                className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={referenceCase}
                onChange={(e) => setReferenceCase(e.target.value)}
              >
                <option>《古相思曲》- 大纲  《扶剑惊风》- 大纲</option>
                <option>《倾城之恋》- 大纲  《花间梦》- 大纲</option>
                <option>《谍影重重》- 大纲  《夜雨声烦》- 大纲</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* 可选方案 */}
          <div className="mb-6">
            <div className="text-lg font-medium mb-2">可选方案</div>
            <div className="flex items-center space-x-2">
              <Icon icon="ri:ai-generate" className="w-5 h-5 text-blue-500" />
              <div className="relative flex-1">
                <select 
                  className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option>deepseekr1</option>
                  <option>Gemini</option>
                  <option>Claude</option>
                  <option>GPT-4</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI生成内容区 - 优化后的prompt模板 */}
        <div className="flex-1 overflow-auto space-y-4">
          {/* 当前prompt模板说明 */}
          
          {/* 生成内容框1 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800 text-sm leading-relaxed">
              {isGenerating ? (
                <span className="flex items-center">
                  <Icon icon="ri:loader-4-line" className="animate-spin mr-2" />
                  正在生成内容...
                </span>
              ) : (
                generatedResults[0] || '1. 其中有2男玩家、4女玩家、2男npc，'
              )}
            </p>
          </div>
          
          {/* 生成内容框2 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800 text-sm leading-relaxed">
              {isGenerating ? (
                <span className="flex items-center">
                  <Icon icon="ri:loader-4-line" className="animate-spin mr-2" />
                  正在生成内容...
                </span>
              ) : (
                generatedResults[1] || '输入:'
              )}
            </p>
          </div>
          
          {/* 生成内容框3 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800 text-sm leading-relaxed">
              {isGenerating ? (
                <span className="flex items-center">
                  <Icon icon="ri:loader-4-line" className="animate-spin mr-2" />
             正在生成内容...
                </span>
              ) : (
                generatedResults[2] || '正在生成内容...'
              )}
            </p>
          </div>
        </div>

        {/* 底部问答区 */}
        <div className="mt-4">
          <div className="mb-2 text-gray-700">Q: 您是想要这样的架空历史的大纲内容吗？</div>
          <div className="relative">
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
              placeholder={isGenerating ? "正在生成内容..." : "大纲不好？告诉我如何优化，如："} 
              disabled={isGenerating}
            />
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isGenerating}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                inputText.trim() && !isGenerating 
                  ? 'text-blue-500 hover:text-blue-700 cursor-pointer' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={inputText.trim() ? '点击发送或按回车键' : '请输入内容'}
            >
            <Icon 
                icon={isGenerating ? "ri:loader-4-line" : "ri:corner-down-right-fill"} 
                className={isGenerating ? "animate-spin" : ""}
              />
            </button>

            {/* 输入建议下拉框 */}
            {showSuggestions && inputSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                  <span>优化建议</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {inputSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors flex items-center text-sm"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <Icon icon="ri:lightbulb-line" className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* 右侧内容展示区 */}
      <div className="w-3/5 p-6 overflow-y-auto">
        {/* 背景内容 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">背景内容</h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">点击查看Prompt模板</div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 h-[200px] overflow-y-auto">
            <textarea
              className="w-full h-full border-none outline-none resize-none text-gray-800"
              value={backgroundContent}
              onChange={(e) => setBackgroundContent(e.target.value)}
              placeholder="请输入或编辑背景内容..."
            />
          </div>
        </div>

        {/* 角色设定 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">角色设定</h2>
            <Link to='/characters' className="text-gray-500 text-sm flex items-center hover:text-gray-700 transition-colors">
              修改详情 <Icon icon="ri:arrow-right-s-line" />
            </Link>
          </div>
          <div className="border border-gray-200 rounded-md p-4 h-[180px] overflow-y-auto">
            <div className="mb-4">
              <p className="mb-2">其中有2男玩家、4女玩家、2男npc</p>
            </div>
            <div>
              <p>2. 角色设定中包含角色MBTI</p>
              <p>3. 角色设定中包含名称，角色名称要根据角色性别生成「大纲风格」名字</p>
              <p>4. 角色设定中包含角色关键词，参考「知识库-「大纲风格」-关键词」</p>
              <p>5. 角色设定中包含角色判词，参考「知识库-「大纲风格」-角色判词」</p>
              <p>6. 角色设定中包含情感线，比如情感线类型是爱情线、事业线、亲情线</p>
              <p>7. 角色设定中包含情感原型，参考「知识库-「大纲风格」-情感原型」</p>
              <p>8. 角色设定中包含人物简介，参考「知识库-「大纲风格」-人物简介」</p>
            </div>
          </div>
        </div>

        {/* 分章剧情 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">分章剧情</h2>
            <Link to='/chapters' className="text-gray-500 text-sm flex items-center hover:text-gray-700 transition-colors">
              修改详情 <Icon icon="ri:arrow-right-s-line" />
            </Link>
          </div>
          <div className="border border-gray-200 rounded-md p-4 h-[240px] overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-medium mb-2">第一本:</h3>
              <p className="mb-2 pl-4">1. 主角苏飞卿从小被梦魇缠身，梦见一位金发女子在火海中消失</p>
              <p className="mb-2 pl-4">2. 苏飞卿奉命入京为太子陪读</p>
              <p className="mb-2 pl-4">3. 苏飞卿在燕门关遇到神秘舞女"阿鹰"并坠入爱河</p>
              <p className="mb-2 pl-4">4. 阿鹰最后突然离去，苏飞卿发现密信揭露她可能是细作</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutlineContent; 