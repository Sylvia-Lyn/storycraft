import React from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useI18n } from '../../../contexts/I18nContext';

interface Voice {
  voiceId: string;
  voiceName?: string;  // 保留用于兼容
  displayName: string;
  sampleAudioUrl?: string;
  voiceSource?: 'CUSTOM' | 'SYSTEM';
}

interface BgmItem {
  id?: string;
  prompt?: string;
  name?: string;
  title?: string;
  description?: string;
  audioUrl?: string;
}

interface AudioResourcePanelProps {
  // 音频类型
  audioType: 'voice' | 'sound';
  onAudioTypeChange: (type: 'voice' | 'sound') => void;

  // 音色相关
  configuredVoices: Voice[];
  isLoadingVoices: boolean;
  isConfiguredVoicesExpanded: boolean;
  onConfiguredVoicesExpandedChange: (expanded: boolean) => void;

  // 音色编辑
  editingVoiceId: string | null;
  editingVoiceName: string;
  onEditingVoiceNameChange: (name: string) => void;
  onStartEditVoiceName: (voiceId: string, voiceName: string) => void;
  onSaveVoiceName: () => void;
  onCancelEditVoiceName: () => void;
  onVoiceNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  // 删除音色
  onDeleteVoice?: (voiceId: string) => void;
}

export function AudioResourcePanel({
  audioType,
  onAudioTypeChange,
  configuredVoices,
  isLoadingVoices,
  isConfiguredVoicesExpanded,
  onConfiguredVoicesExpandedChange,
  editingVoiceId,
  editingVoiceName,
  onEditingVoiceNameChange,
  onStartEditVoiceName,
  onSaveVoiceName,
  onCancelEditVoiceName,
  onVoiceNameKeyDown,
  onDeleteVoice,
}: AudioResourcePanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      {/* 配音选择区域 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer" style={{ marginTop: '8px' }}>
            <input
              type="radio"
              value="voice"
              checked={audioType === 'voice'}
              onChange={(e) => onAudioTypeChange(e.target.value as 'voice' | 'sound')}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{t('shortplayEntry.audio.voice')}</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer" style={{ marginTop: '8px' }}>
            <input
              type="radio"
              value="sound"
              checked={audioType === 'sound'}
              onChange={(e) => onAudioTypeChange(e.target.value as 'voice' | 'sound')}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{t('shortplayEntry.audio.sound')}</span>
          </label>
        </div>

        {audioType === 'voice' ? (
          <>
            {/* 已设置的配音人员 */}
            {(isLoadingVoices || configuredVoices.length > 0) && (
            <div className="flex flex-col space-y-2.5">
              {/* 标题和展开/收起按钮 - 单独一行 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('shortplayEntry.audio.configured')}</span>
                <button
                  onClick={() => onConfiguredVoicesExpandedChange(!isConfiguredVoicesExpanded)}
                  className="border-none bg-transparent p-0"
                >
                  <Icon
                    icon={isConfiguredVoicesExpanded ? "ri:arrow-up-s-line" : "ri:arrow-down-s-line"}
                    className="w-4 h-4 text-gray-400"
                  />
                </button>
              </div>

              {/* 列表容器 - 在下面 */}
              <div className="space-y-2.5 max-h-[400px] overflow-auto">
                {isLoadingVoices ? (
                  <div className="flex items-center justify-center text-gray-500">
                    <Icon icon="ri:loader-4-line" className="w-4 h-4 animate-spin mr-2" />
                    {t('shortplayEntry.status.loading')}
                  </div>
                ) : (
                  configuredVoices
                    .slice(0, isConfiguredVoicesExpanded ? configuredVoices.length : 1)
                    .map((voice) => (
                      <div key={voice.voiceId} className="flex items-center space-x-3 px-2 py-1.5 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                          <img src="/img/avatar.png" alt="定制音色" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          {editingVoiceId === voice.voiceId ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingVoiceName}
                                onChange={(e) => onEditingVoiceNameChange(e.target.value)}
                                onKeyDown={onVoiceNameKeyDown}
                                className="text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ width: '120px' }}
                                autoFocus
                              />
                              <button
                                onClick={onSaveVoiceName}
                                className="text-green-600 hover:text-green-800 p-0 border-0 bg-transparent outline-none"
                              >
                                <Icon icon="ri:check-line" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={onCancelEditVoiceName}
                                className="text-red-600 hover:text-red-800 p-0 border-0 bg-transparent outline-none"
                              >
                                <Icon icon="ri:close-line" className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="text-sm text-gray-800 cursor-pointer hover:text-blue-600"
                              onClick={() => onStartEditVoiceName(voice.voiceId, voice.displayName)}
                            >
                              {voice.displayName}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-100 flex items-center space-x-1 whitespace-nowrap"
                            onClick={() => {
                              if (voice.sampleAudioUrl) {
                                const audio = new Audio(voice.sampleAudioUrl);
                                audio.play();
                              }
                            }}
                          >
                            <Icon icon="ri:play-circle-line" className="w-3 h-3" />
                            <span>{t('shortplayEntry.audio.listen')}</span>
                          </button>
                          <button
                            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-100 flex items-center space-x-1 whitespace-nowrap"
                            onClick={() => onDeleteVoice?.(voice.voiceId)}
                          >
                            <Icon icon="ri:delete-bin-line" className="w-3 h-3" />
                            <span>{t('shortplayEntry.audio.deleteVoice')}</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
