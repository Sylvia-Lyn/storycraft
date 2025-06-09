import React, { useState } from 'react'
import { Icon } from '@iconify/react'

const StorySettingsPage = () => {
  const [selectedTarget, setSelectedTarget] = useState('女频')
  const [selectedPerspective, setSelectedPerspective] = useState('第二人称')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [customSettings, setCustomSettings] = useState('')
  const [storyContent, setStoryContent] = useState('')

  const targetOptions = [
    { id: '女频', label: '女频' },
    { id: '男频', label: '男频' }
  ]

  const perspectiveOptions = [
    { id: '第一人称', label: '第一人称' },
    { id: '第二人称', label: '第二人称' }
  ]

  const tagOptions = [
    '言情', '现实情感', '社会案件', '悬疑', '惊悚',
    '玄幻', '军事与历史', '科技', '都市'
  ]

  const timeOptions = [
    '现代', '古代', '近代', '未来', '架空'
  ]

  const emotionOptions = [
    '穿越重生', '宫斗宅斗', '复仇', '犯罪', '民国奇文',
    '逆袭', '打脸', '家庭', '出轨', '恋爱婚姻'
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
          <h2 className="text-lg font-bold text-gray-800">故事设定</h2>
        </div>

        {/* 目标读者 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">目标读者</h3>
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
          <h3 className="text-sm font-medium text-gray-700 mb-3">故事视角</h3>
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
          <h3 className="text-sm font-medium text-gray-700 mb-3">热门元素</h3>
          <p className="text-xs text-gray-500 mb-3">选择合适的题材标签，将惊艳"大模型"生成与"读者情节"的内容生成。</p>

          {/* 题材 */}
          {renderTagGroup('题材', tagOptions, selectedTags, 'tags')}

          {/* 时空 */}
          {renderTagGroup('时空', timeOptions, selectedTime, 'time')}

          {/* 情节 */}
          {renderTagGroup('情节', emotionOptions, selectedEmotions, 'emotions')}
        </div>

        {/* 自定义故事设定 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">自定义故事设定</h3>
          <textarea
            value={customSettings}
            onChange={(e) => setCustomSettings(e.target.value)}
            placeholder="描述你的故事设定与故事元素"
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
          <h2 className="text-lg font-bold text-gray-800">故事内容</h2>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              保存草稿
            </button>
            <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
              生成故事
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
          <textarea
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            placeholder="在左侧完成故事设定后，点击“生成故事”按钮，系统将在这里为您生成内容"
            className="w-full h-full resize-none focus:outline-none text-gray-700 leading-relaxed"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />
        </div>

        <div className="flex justify-end mt-4">
          <span className="text-sm text-gray-400">
            {storyContent.length >= 1000 
              ? `${storyContent.length}字` 
              : `${storyContent.length}/1000字`
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default StorySettingsPage 