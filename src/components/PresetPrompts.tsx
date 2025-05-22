import React from 'react';
import { Icon } from '@iconify/react';

export const defaultPrompts = [
  "请帮我分析这个角色的心理动机",
  "为这个场景增加更多冲突元素",
  "优化这段对话，使其更加自然流畅",
  "调整情节节奏，增加高潮部分的紧凑感",
  "为这个情节添加一个意外转折"
];

type PresetPromptsProps = {
  prompts?: string[];
  onUsePrompt: (prompt: string) => void;
};

function PresetPrompts({ prompts = defaultPrompts, onUsePrompt }: PresetPromptsProps) {
  return (
    <div className="divide-y divide-gray-50">
      {prompts.map((prompt, index) => (
        <div
          key={index}
          className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
          onClick={() => onUsePrompt(prompt)}
        >
          <div className="flex items-center">
            <Icon icon="mdi:lightning-bolt" className="mr-2 text-gray-400 flex-shrink-0" />
            <span>{prompt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PresetPrompts; 