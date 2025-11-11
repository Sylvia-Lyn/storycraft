import React from 'react';

interface TimeRangeInputProps {
  startMinutes: string;
  startSeconds: string;
  endMinutes: string;
  endSeconds: string;
  onStartMinutesChange: (value: string) => void;
  onStartSecondsChange: (value: string) => void;
  onEndMinutesChange: (value: string) => void;
  onEndSecondsChange: (value: string) => void;
}

export function TimeRangeInput({
  startMinutes,
  startSeconds,
  endMinutes,
  endSeconds,
  onStartMinutesChange,
  onStartSecondsChange,
  onEndMinutesChange,
  onEndSecondsChange
}: TimeRangeInputProps) {
  const handleNumberInputChange = (value: string, setter: (value: string) => void) => {
    const numValue = Math.max(0, Math.min(59, parseInt(value) || 0));
    setter(numValue.toString());
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-400">
      {/* 开始时间编辑 - 分钟 */}
      <input
        type="number"
        min="0"
        max="59"
        value={startMinutes}
        onChange={(e) => handleNumberInputChange(e.target.value, onStartMinutesChange)}
        className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
      />
      <span>:</span>
      {/* 开始时间编辑 - 秒 */}
      <input
        type="number"
        min="0"
        max="59"
        value={startSeconds}
        onChange={(e) => handleNumberInputChange(e.target.value, onStartSecondsChange)}
        className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
      />
      <span>-</span>
      {/* 结束时间编辑 - 分钟 */}
      <input
        type="number"
        min="0"
        max="59"
        value={endMinutes}
        onChange={(e) => handleNumberInputChange(e.target.value, onEndMinutesChange)}
        className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
      />
      <span>:</span>
      {/* 结束时间编辑 - 秒 */}
      <input
        type="number"
        min="0"
        max="59"
        value={endSeconds}
        onChange={(e) => handleNumberInputChange(e.target.value, onEndSecondsChange)}
        className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
