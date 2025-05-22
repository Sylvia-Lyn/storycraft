import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

// 快捷短语生成函数类型
type QuickPhrasesGenerator = (input: string) => string[];

interface InputPanelProps {
  onSubmit: (input: string) => void;
  isGenerating?: boolean;
  workingMode?: 'conversation' | 'optimization';
  placeholderOverride?: string;
  presetPrompts?: string[];
  onPresetPromptSelect?: (prompt: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  onSubmit,
  isGenerating = false,
  workingMode = 'conversation',
  placeholderOverride,
  presetPrompts = [
    '请帮我分析这个角色的心理动机',
    '为这个场景增加更多冲突元素',
    '优化这段对话，使其更加自然流畅',
    '调整情节节奏，增加高潮部分的紧凑感',
    '为这个情节添加一个意外转折'
  ],
  onPresetPromptSelect
}) => {
  const [inputText, setInputText] = useState('');
  const [showPresetPrompts, setShowPresetPrompts] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteText, setAutoCompleteText] = useState('');
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [suggestionCategory, setSuggestionCategory] = useState('');
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 根据模式获取输入框占位符
  const getPlaceholder = () => {
    if (placeholderOverride) return placeholderOverride;
    
    if (isGenerating) {
      return "正在生成内容...";
    }
    
    return workingMode === "conversation" 
      ? "输入内容开始对话..." 
      : "剧情不好？告诉我如何优化，如";
  };

  // 提交输入内容
  const handleSubmit = () => {
    if (!inputText.trim() || isGenerating) return;
    
    onSubmit(inputText);
    
    // 保存到最近使用
    setRecentInputs(prev => {
      const newInputs = [inputText, ...prev.filter(item => item !== inputText)].slice(0, 5);
      return newInputs;
    });
    
    setInputText('');
    setShowSuggestions(false);
    setShowAutoComplete(false);
  };

  // 接受自动完成
  const acceptAutoComplete = () => {
    if (showAutoComplete && autoCompleteText) {
      setInputText(autoCompleteText);
      setShowAutoComplete(false);
    }
  };

  // 使用预设Prompt
  const usePresetPrompt = (prompt: string) => {
    setInputText(prompt);
    setShowPresetPrompts(false);
    
    if (onPresetPromptSelect) {
      onPresetPromptSelect(prompt);
    }
  };

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
    
    // 聚焦到输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 根据输入内容动态生成常用快捷短语
  const getQuickPhrases = (input: string): string[] => {
    const phrases: string[] = [];
    
    // 添加一些与当前输入相关的快捷短语
    if (input.includes('角色')) {
      phrases.push('角色性格不够鲜明', '角色动机不明确', '角色缺乏成长');
    } else if (input.includes('情节')) {
      phrases.push('情节节奏太慢', '情节缺乏冲突', '情节转折不自然');
    } else if (input.includes('对白')) {
      phrases.push('对白不够生动', '对白缺乏角色特点', '对白过于冗长');
    } else if (input.includes('场景')) {
      phrases.push('场景描写不够具体', '场景缺乏氛围感', '场景转换生硬');
    }
    
    // 如果没有特定匹配，返回通用快捷短语
    if (phrases.length === 0 && input.length > 0) {
      return ['加强戏剧冲突', '改善节奏', '增加悬念', '优化结构'];
    }
    
    return phrases;
  };

  // 监听输入变化，生成建议
  useEffect(() => {
    if (inputText.trim() === '') {
      setShowSuggestions(false);
      return;
    }
    
    // 分析输入内容，匹配相关建议
    const input = inputText.toLowerCase();
    let matchedSuggestions: string[] = [];
    let category = '';
    
    // 检查是否包含关键词，推荐相应建议
    if (input.includes('角色') || input.includes('人物') || input.includes('性格')) {
      matchedSuggestions = [
        '让角色性格更加鲜明，增加以下特点...',
        '调整角色之间的关系，使冲突更加明显',
        '增加角色的成长弧线，从内向变得更加自信'
      ];
      category = '角色相关建议';
    } else if (input.includes('情节') || input.includes('剧情') || input.includes('故事')) {
      matchedSuggestions = [
        '增加一个意外转折，让主角面临更大的挑战',
        '调整情节节奏，使高潮部分更加紧凑',
        '增加一些伏笔，为后续发展做铺垫'
      ];
      category = '情节相关建议';
    } else if (input.includes('对白') || input.includes('台词') || input.includes('说话')) {
      matchedSuggestions = [
        '让对白更加简练，突出角色个性',
        '增加潜台词，让对白层次更加丰富',
        '调整对白节奏，增加停顿和交锋'
      ];
      category = '对白相关建议';
    } else if (input.includes('场景') || input.includes('环境') || input.includes('背景')) {
      matchedSuggestions = [
        '增加场景描写，突出氛围和情绪',
        '调整场景转换，使故事流程更加流畅',
        '在关键场景增加象征性元素'
      ];
      category = '场景相关建议';
    } else if (input.length > 2) {
      // 当输入超过2个字符，但没有匹配到特定模板时，显示通用建议
      matchedSuggestions = [
        '剧情节奏太慢，希望更加紧凑',
        '角色动机不够清晰，需要调整',
        '故事缺乏高潮，需要增加戏剧冲突'
      ];
      category = '通用建议';
    }
    
    if (matchedSuggestions.length > 0) {
      setInputSuggestions(matchedSuggestions);
      setSuggestionCategory(category);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputText]);

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 text-xs rounded-full ${workingMode === "conversation" ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => onPresetPromptSelect?.('SWITCH_TO_CONVERSATION')}
          >
            对话模式
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-full ${workingMode === "optimization" ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => onPresetPromptSelect?.('SWITCH_TO_OPTIMIZATION')}
          >
            优化模式
          </button>
        </div>
        
        <button
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          onClick={() => setShowPresetPrompts(!showPresetPrompts)}
        >
          <Icon icon="mdi:lightning-bolt" className="w-4 h-4" />
          <span>预设Prompt</span>
        </button>
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={getPlaceholder()}
          className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputText.trim() && !isGenerating) {
              handleSubmit();
            } else if (e.key === 'Escape') {
              setShowSuggestions(false);
              setShowAutoComplete(false);
              setShowPresetPrompts(false);
            } else if (e.key === 'ArrowDown' && showSuggestions) {
              // 导航到建议列表
              const suggestionElements = document.querySelectorAll('.suggestion-item');
              if (suggestionElements.length > 0) {
                (suggestionElements[0] as HTMLElement).focus();
              }
              e.preventDefault();
            } else if (e.key === 'Tab' && showAutoComplete) {
              // 接受自动完成
              acceptAutoComplete();
              e.preventDefault();
            } else if (e.key === 'ArrowRight' && showAutoComplete) {
              // 也可以用右箭头接受自动完成
              const selStart = e.currentTarget.selectionStart;
              const selEnd = e.currentTarget.selectionEnd;
              
              // 只有当光标在最右侧时才接受自动完成
              if (selStart === selEnd && selEnd === inputText.length) {
                acceptAutoComplete();
                e.preventDefault();
              }
            }
          }}
          onFocus={() => {
            if (inputText.trim() !== '' && inputSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // 延迟隐藏建议，以便用户可以点击建议
            setTimeout(() => {
              // 添加安全检查，确保元素仍然存在于DOM中
              if (e.currentTarget && document.activeElement && document.body.contains(e.currentTarget) && 
                  !e.currentTarget.contains(document.activeElement)) {
                setShowSuggestions(false);
                setShowAutoComplete(false);
              }
            }, 200);
          }}
          disabled={isGenerating} // 当正在生成内容时禁用输入框
        />
        <button
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${inputText.trim() && !isGenerating ? 'text-black' : 'text-gray-400'}`}
          onClick={() => {
            if (inputText.trim() && !isGenerating) {
              handleSubmit();
            }
          }}
          disabled={isGenerating} // 当正在生成内容时禁用按钮
        >
          <Icon icon={isGenerating ? "mdi:loading" : "mdi:send"} className={isGenerating ? "animate-spin" : ""} />
        </button>
        
        {/* 预设Prompt下拉菜单 */}
        {showPresetPrompts && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between items-center">
              <span>预设Prompt</span>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowPresetPrompts(false)}
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {presetPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                  onClick={() => usePresetPrompt(prompt)}
                >
                  <div className="flex items-center">
                    <Icon icon="mdi:lightning-bolt" className="mr-2 text-gray-400 flex-shrink-0" />
                    <span>{prompt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 输入建议下拉框 */}
        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between items-center">
              <span>{suggestionCategory || '推荐建议'}</span>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowSuggestions(false)}
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            </div>
            
            {/* 快捷短语区域 */}
            {inputText.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1.5">快捷短语</div>
                <div className="flex flex-wrap gap-2">
                  {getQuickPhrases(inputText).map((phrase, idx) => (
                    <button
                      key={idx}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 transition-colors"
                      onClick={() => selectSuggestion(phrase)}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 完整建议列表 */}
            <div className="divide-y divide-gray-50">
              {inputSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors flex items-center"
                  onClick={() => selectSuggestion(suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      selectSuggestion(suggestion);
                    } else if (e.key === 'ArrowDown') {
                      const next = document.querySelectorAll('.suggestion-item')[index + 1] as HTMLElement;
                      if (next) next.focus();
                      e.preventDefault();
                    } else if (e.key === 'ArrowUp') {
                      const prev = document.querySelectorAll('.suggestion-item')[index - 1] as HTMLElement;
                      if (prev) prev.focus();
                      else if (inputRef.current) inputRef.current.focus();
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                >
                  <Icon icon="mdi:lightbulb-outline" className="mr-2 text-gray-400 flex-shrink-0" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 自动完成提示 */}
        {showAutoComplete && (
          <div className="absolute left-0 right-0 top-0 pointer-events-none">
            <div className="relative pl-3 pr-10 py-3 text-gray-400">
              <span className="invisible">{inputText}</span>
              <span>{autoCompleteText.substring(inputText.length)}</span>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Tab 补全
              </div>
            </div>
          </div>
        )}
        
        {/* 最近使用的输入 */}
        {inputText === '' && recentInputs.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
              最近使用
            </div>
            {recentInputs.map((input, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-0"
                onClick={() => selectSuggestion(input)}
              >
                <div className="flex items-center">
                  <Icon icon="mdi:history" className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{input}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel; 