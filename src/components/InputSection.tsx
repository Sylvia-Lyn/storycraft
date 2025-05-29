import { Icon } from '@iconify/react'
import PresetPrompts from './PresetPrompts'

type InputSectionProps = {
  inputRef: React.RefObject<HTMLInputElement | null>
  feedbackText: string
  setFeedbackText: (text: string) => void
  isGenerating: boolean
  showPresetPrompts: boolean
  setShowPresetPrompts: (show: boolean) => void
  presetPrompts: string[]
  usePresetPrompt: (prompt: string) => void
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  suggestionCategory: string
  inputSuggestions: string[]
  getQuickPhrases: (input: string) => string[]
  selectSuggestion: (suggestion: string) => void
  showAutoComplete: boolean
  setShowAutoComplete: (show: boolean) => void
  autoCompleteText: string
  acceptAutoComplete: () => void
  recentInputs: string[]
  generateQuickContent: () => void
}

function InputSection({
  inputRef,
  feedbackText,
  setFeedbackText,
  isGenerating,
  showPresetPrompts,
  setShowPresetPrompts,
  presetPrompts,
  usePresetPrompt,
  showSuggestions,
  setShowSuggestions,
  suggestionCategory,
  inputSuggestions,
  getQuickPhrases,
  selectSuggestion,
  showAutoComplete,
  setShowAutoComplete,
  autoCompleteText,
  acceptAutoComplete,
  recentInputs,
  generateQuickContent
}: InputSectionProps) {
  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-end mb-2">
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
          placeholder={isGenerating 
            ? "正在生成内容..." 
            : "请输入内容..."
          }
          className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              onKeyDown={(e) => {
            if (e.key === 'Enter' && feedbackText.trim() && !isGenerating) {
              generateQuickContent();
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
              if (selStart === selEnd && selEnd === feedbackText.length) {
                acceptAutoComplete();
                e.preventDefault();
              }
            }
          }}
          onFocus={() => {
            if (feedbackText.trim() !== '' && inputSuggestions.length > 0) {
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
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${feedbackText.trim() && !isGenerating ? 'text-black' : 'text-gray-400'}`}
          onClick={() => {
            if (feedbackText.trim() && !isGenerating) {
              generateQuickContent();
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
            <PresetPrompts prompts={presetPrompts} onUsePrompt={usePresetPrompt} />
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
            {feedbackText.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1.5">快捷短语</div>
                <div className="flex flex-wrap gap-2">
                  {getQuickPhrases(feedbackText).map((phrase, idx) => (
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
              <span className="invisible">{feedbackText}</span>
              <span>{autoCompleteText.substring(feedbackText.length)}</span>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Tab 补全
              </div>
            </div>
          </div>
        )}
        
        {/* 最近使用的输入 */}
        {feedbackText === '' && recentInputs.length > 0 && (
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
}

export default InputSection; 