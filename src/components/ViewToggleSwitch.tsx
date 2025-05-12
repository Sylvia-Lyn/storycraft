interface ViewToggleSwitchProps {
  isEnabled: boolean;
  onChange: (isEnabled: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
}

function ViewToggleSwitch({ 
  isEnabled, 
  onChange, 
  leftLabel = "角色视图", 
  rightLabel = "剧情视图" 
}: ViewToggleSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{leftLabel}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={isEnabled} 
          onChange={() => onChange(!isEnabled)} 
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
      </label>
      <span className="text-sm text-gray-700">{rightLabel}</span>
    </div>
  );
}

export default ViewToggleSwitch; 