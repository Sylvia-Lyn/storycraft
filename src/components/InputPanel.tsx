import { useState, useRef } from 'react'
import { Icon } from '@iconify/react'

interface InputPanelProps {
  onSubmit: (input: string) => void;
  isGenerating?: boolean;
  workingMode?: 'conversation' | 'optimization' | 'result';
  placeholderOverride?: string;
  generatedResponse?: string;
  presetPrompts?: string[];
  onPresetPromptSelect?: (prompt: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  onSubmit,
  isGenerating = false,
  workingMode = 'conversation',
  placeholderOverride,
  generatedResponse = '',
  presetPrompts = [],
  onPresetPromptSelect
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 根据模式获取输入框占位符
  const getPlaceholder = () => {
    if (placeholderOverride) return placeholderOverride;

    if (isGenerating) {
      return "正在生成内容...";
    }

    if (workingMode === "result") {
      return "对生成结果有什么看法？";
    }

    return workingMode === "conversation"
      ? "输入内容开始对话..."
      : "剧情不好？告诉我如何优化";
  };

  // 提交输入内容
  const handleSubmit = () => {
    if (!inputText.trim() || isGenerating) return;

    onSubmit(inputText);
    setInputText('');
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white relative">
      {/* 生成结果显示区域 */}
      {workingMode === 'result' && generatedResponse && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg max-h-[300px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">生成结果</span>
          </div>
          <div className="text-sm whitespace-pre-wrap">{generatedResponse}</div>
        </div>
      )}

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
            }
          }}
          disabled={isGenerating}
        />
        <button
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${inputText.trim() && !isGenerating ? 'text-black' : 'text-gray-400'}`}
          onClick={() => {
            if (inputText.trim() && !isGenerating) {
              handleSubmit();
            }
          }}
          disabled={isGenerating}
        >
          <Icon icon={isGenerating ? "mdi:loading" : "mdi:send"} className={isGenerating ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
};

export default InputPanel; 