import React, { useEffect, useState } from 'react'
import { generateDeepSeekContent } from '../services/deepseekService'
import { Icon } from '@iconify/react'
import { useI18n } from '../contexts/I18nContext'

const StorySettingsPage = () => {
  const { t, language } = useI18n()
  const [selectedTarget, setSelectedTarget] = useState('女频')
  const [selectedPerspective, setSelectedPerspective] = useState('第二人称')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [customSettings, setCustomSettings] = useState('')
  const [storyContent, setStoryContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const DRAFT_STORAGE_KEY = 'story_settings_draft'

  // 加载草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft.selectedTarget) setSelectedTarget(draft.selectedTarget)
      if (draft.selectedPerspective) setSelectedPerspective(draft.selectedPerspective)
      if (Array.isArray(draft.selectedTags)) setSelectedTags(draft.selectedTags)
      if (Array.isArray(draft.selectedTime)) setSelectedTime(draft.selectedTime)
      if (Array.isArray(draft.selectedEmotions)) setSelectedEmotions(draft.selectedEmotions)
      if (typeof draft.customSettings === 'string') setCustomSettings(draft.customSettings)
      if (typeof draft.storyContent === 'string') setStoryContent(draft.storyContent)
      setSaveMessage(t('storySettings.draftLoaded'))
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (e) {
      console.warn('载入草稿失败:', e)
    }
  }, [])

  const handleSaveDraft = () => {
    try {
      const payload = {
        selectedTarget,
        selectedPerspective,
        selectedTags,
        selectedTime,
        selectedEmotions,
        customSettings,
        storyContent,
        savedAt: Date.now()
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
      setSaveMessage(t('storySettings.draftSaved'))
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (e) {
      console.error('保存草稿失败:', e)
      setSaveMessage(t('storySettings.saveFailed'))
      setTimeout(() => setSaveMessage(null), 2000)
    }
  }

  const handleGenerateStory = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const prompt = `你是一名优秀的网文作家，请根据以下设定生成一段故事开篇（800-1200字），语言生动，有画面感，并自然埋下悬念：\n\n` +
        `${t('storySettings.targetAudience')}：${selectedTarget}\n` +
        `视角：${selectedPerspective}\n` +
        `${t('storySettings.genre')}：${selectedTags.join('、') || t('storySettings.unlimited')}\n` +
        `${t('storySettings.timeSpace')}：${selectedTime.join('、') || t('storySettings.unlimited')}\n` +
        `情节元素：${selectedEmotions.join('、') || t('storySettings.unlimited')}\n` +
        `自定义设定：${customSettings || t('storySettings.none')}\n`;

      const result = await generateDeepSeekContent(prompt, 'deepseek-reasoner', language)
      setStoryContent(result)
    } catch (err) {
      console.error('生成故事失败:', err)
      setStoryContent(t('storySettings.generationFailed'))
    } finally {
      setIsGenerating(false)
    }
  }

  const targetOptions = [
    { id: '女频', label: t('storySettings.femaleAudience') },
    { id: '男频', label: t('storySettings.maleAudience') }
  ]

  const perspectiveOptions = [
    { id: '第一人称', label: t('storySettings.firstPerson') },
    { id: '第二人称', label: t('storySettings.secondPerson') }
  ]

  const tagOptions = [
    t('storySettings.romance'), t('storySettings.realisticEmotion'), t('storySettings.socialCase'), t('storySettings.suspense'), t('storySettings.thriller'),
    t('storySettings.fantasy'), t('storySettings.militaryHistory'), t('storySettings.technology'), t('storySettings.urban')
  ]

  const timeOptions = [
    t('storySettings.modern'), t('storySettings.ancient'), t('storySettings.modernEra'), t('storySettings.future'), t('storySettings.alternate')
  ]

  const emotionOptions = [
    t('storySettings.timeTravel'), t('storySettings.palaceIntrigue'), t('storySettings.revenge'), t('storySettings.crime'), t('storySettings.republicEra'),
    t('storySettings.counterattack'), t('storySettings.faceSlap'), t('storySettings.family'), t('storySettings.affair'), t('storySettings.loveMarriage')
  ]

  const handleTagToggle = (tag: string, category: 'tags' | 'time' | 'emotions') => {
    if (category === 'tags') {
      setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      )
    } else if (category === 'time') {
      setSelectedTime(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      )
    } else if (category === 'emotions') {
      setSelectedEmotions(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      )
    }
  }

  const renderTagGroup = (title: string, options: string[], selected: string[], category: 'tags' | 'time' | 'emotions') => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => handleTagToggle(option, category)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selected.includes(option)
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧故事设定 */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center mb-6">
          <Icon icon="ri:settings-3-line" className="w-5 h-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">{t('storySettings.title')}</h2>
        </div>

        {/* 目标读者 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('storySettings.targetAudience')}</h3>
          <div className="flex gap-4">
            {targetOptions.map(option => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name="target"
                  value={option.id}
                  checked={selectedTarget === option.id}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-4 h-4 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 故事视角 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('storySettings.storyPerspective')}</h3>
          <div className="flex gap-4">
            {perspectiveOptions.map(option => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name="perspective"
                  value={option.id}
                  checked={selectedPerspective === option.id}
                  onChange={(e) => setSelectedPerspective(e.target.value)}
                  className="w-4 h-4 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 热门元素 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('storySettings.popularElements')}</h3>
          <p className="text-xs text-gray-500 mb-3">{t('storySettings.popularElementsDescription')}</p>

          {/* 题材 */}
          {renderTagGroup(t('storySettings.genre'), tagOptions, selectedTags, 'tags')}

          {/* 时空 */}
          {renderTagGroup(t('storySettings.timeSpace'), timeOptions, selectedTime, 'time')}

          {/* 情节 */}
          {renderTagGroup(t('storySettings.plot'), emotionOptions, selectedEmotions, 'emotions')}
        </div>

        {/* 自定义故事设定 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('storySettings.customStorySettings')}</h3>
          <textarea
            value={customSettings}
            onChange={(e) => setCustomSettings(e.target.value)}
            placeholder={t('storySettings.customStorySettingsPlaceholder')}
            className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">{customSettings.length}/500</span>
          </div>
        </div>
      </div>

      {/* 右侧内容输入 */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">{t('storySettings.storyContent')}</h2>
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handleSaveDraft}
            >
              {t('storySettings.saveDraft')}
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md text-white ${isGenerating ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={handleGenerateStory}
              disabled={isGenerating}
            >
              {isGenerating ? t('storySettings.generating') : t('storySettings.generateStory')}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
          <textarea
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            placeholder={t('storySettings.storyContentPlaceholder')}
            className="w-full h-full resize-none focus:outline-none text-gray-700 leading-relaxed"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />
        </div>

        <div className="flex justify-end mt-4">
          <span className="text-sm text-gray-400">
            {storyContent.length >= 1000 
              ? t('storySettings.charactersCount', { count: storyContent.length })
              : t('storySettings.charactersProgress', { count: storyContent.length })
            }
          </span>
        </div>

        {saveMessage && (
          <div className="fixed bottom-6 right-6 bg-black text-white text-sm rounded-md px-3 py-2 opacity-90 shadow">
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default StorySettingsPage 