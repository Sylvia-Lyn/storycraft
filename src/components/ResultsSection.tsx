import { Icon } from '@iconify/react'
import { RefObject } from 'react'

type ResultOption = {
  id: string;
  text: string;
}

type ResultsSectionProps = {
  isGenerating: boolean
  selectedModel: string
  optimizationResults: ResultOption[]
  resultsContainerRef: RefObject<HTMLDivElement> | React.LegacyRef<HTMLDivElement>
  applyOptimizedText: (text: string) => void
  copyToClipboard: (text: string) => void
}

function ResultsSection({
  isGenerating,
  selectedModel,
  optimizationResults,
  resultsContainerRef,
  applyOptimizedText,
  copyToClipboard
}: ResultsSectionProps) {
  return (
    <>
      {isGenerating ? (
        <div className="text-center py-4 mb-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">正在使用 {selectedModel} 生成回复...</p>
        </div>
      ) : optimizationResults.length > 0 ? (
        <div
          className="space-y-3 mb-4"
          tabIndex={0}
          ref={resultsContainerRef}
        >
          {optimizationResults.map((option) => (
            <div
              key={option.id}
              className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors overflow-hidden relative group"
              onClick={(e) => {
                // 防止点击导致焦点跳转
                e.preventDefault();
                // 仅在双击时应用文本
                if (e.detail === 2) {
                  applyOptimizedText(option.text);
                }
              }}
              onDoubleClick={() => applyOptimizedText(option.text)}
            >
              <div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    copyToClipboard(option.text);
                  }}
                  title="复制内容"
                  aria-label="复制内容"
                >
                  <Icon icon="mdi:content-copy" className="w-4 h-4" />
                </button>
              </div>
              <p
                className="whitespace-normal break-words indent-8 leading-relaxed"
                style={{ userSelect: 'text' }}
              >
                {option.text}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default ResultsSection; 