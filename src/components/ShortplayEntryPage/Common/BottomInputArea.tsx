import React from 'react';
import { Icon } from '@iconify/react';
import { useI18n } from '../../../contexts/I18nContext';
import { BottomInputAreaProps } from '../types';

export function BottomInputArea({
  activeTab,
  selectedModel,
  onModelChange,
  userInput,
  onInputChange,
  isGenerating,
  onGenerate,
  placeholder,
  generationStatus,
  // 音频tab属性
  audioType = 'voice',
  voiceType = "male",
  onVoiceTypeChange,
  // 图片tab属性
  backgroundType = "空镜/背景",
  onBackgroundTypeChange,
  style = "电影感",
  onStyleChange,
  relevanceScore = "1",
  onRelevanceScoreChange,
  // 视频tab属性
  videoLength = "2s",
  onVideoLengthChange,
  resolution = "1080p",
  onResolutionChange,
  singleGenerate = '5s',
  onSingleGenerateChange,
  videoModel = 'doubao-seedance-1.0-lite-text',
  onVideoModelChange,
  uploadedImagesCount = 0,
  onFileUpload,
  onMultipleFileUpload,
  isUploading = false,
  uploadProgress = { current: 0, total: 0 },
  uploadedImages = [],
  onRemoveImage
}: BottomInputAreaProps) {
  const { t } = useI18n();
  const [imageGenerationMode, setImageGenerationMode] = React.useState('single');
  const [progressWidth, setProgressWidth] = React.useState(0);

  // 进度条动画效果
  React.useEffect(() => {
    if (isGenerating) {
      // 重置进度
      setProgressWidth(0);

      // 模拟进度增长
      const interval = setInterval(() => {
        setProgressWidth(prev => {
          // 逐渐增长到95%，不会到100%（因为实际完成时间不确定）
          if (prev >= 95) {
            return prev;
          }
          // 前期快速增长，后期减慢
          const increment = prev < 50 ? 2 : prev < 80 ? 0.5 : 0.2;
          return Math.min(prev + increment, 95);
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // 完成时设置为100%，然后快速重置
      setProgressWidth(100);
      setTimeout(() => setProgressWidth(0), 300);
    }
  }, [isGenerating]);

  // 根据不同的tab设置不同的placeholder文案
  const getTabPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    switch (activeTab) {
      case 'script':
        return t('shortplayEntry.input.scriptPlaceholder');
      case 'audio':
        return t('shortplayEntry.input.audioPlaceholder');
      case 'image':
        return t('shortplayEntry.input.imagePlaceholder');
      case 'video':
        return t('shortplayEntry.input.videoPlaceholder');
      default:
        return t('shortplayEntry.input.placeholder');
    }
  };

  const finalPlaceholder = getTabPlaceholder();

  // 计算可用的视频生成模型
  const getAvailableVideoModels = () => {
    const imageCount = uploadedImages?.length || 0;
    if (imageCount === 0) {
      // 没有上传图片：只能用 doubao-seedance-1.0-lite-text
      return [{ value: 'doubao-seedance-1.0-lite-text', label: 'doubao-seedance-1.0-lite-text' }];
    } else if (imageCount === 1) {
      // 单张图片：可用 doubao-seedance-1.0-pro 和 doubao-seedance-1.0-lite-image
      return [
        { value: 'doubao-seedance-1.0-pro', label: 'doubao-seedance-1.0-pro' },
        { value: 'doubao-seedance-1.0-lite-image', label: 'doubao-seedance-1.0-lite-image' }
      ];
    } else {
      // 多张图片：只能用 doubao-seedance-1.0-pro
      return [{ value: 'doubao-seedance-1.0-pro', label: 'doubao-seedance-1.0-pro' }];
    }
  };

  const availableVideoModels = getAvailableVideoModels();

  // 当可用模型改变时，如果当前选中的模型不在可用列表中，则自动切换到第一个可用模型
  React.useEffect(() => {
    if (activeTab === 'video' && !availableVideoModels.find(m => m.value === videoModel)) {
      onVideoModelChange?.(availableVideoModels[0].value);
    }
  }, [availableVideoModels, videoModel, activeTab, onVideoModelChange]);

  return (
    <div className="p-4">
      {activeTab === 'script' && (
        <>
          <div className="">
            <div className="relative w-40">
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
              >
                <option value="gemini">Gemini2.5pro</option>
                <option value="deepseek">DeepSeek-R1</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 生成状态显示 */}
          {isGenerating && generationStatus && (
            <div className="mb-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-4 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors flex items-center space-x-1 ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating && (
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}</span>
            </button>
          </div>
        </>
      )}

      {activeTab === 'audio' && (
        <>
          <div className="mb-3">
            <div className="flex space-x-3">
              <div className="relative w-32">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="minmax">minmax</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-20">
                <select
                  value={voiceType}
                  onChange={(e) => onVoiceTypeChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="male">{t('shortplayEntry.audio.male')}</option>
                  <option value="female">{t('shortplayEntry.audio.female')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-4 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}
            </button>
          </div>
        </>
      )}

      {activeTab === 'image' && (
        <>
          <div>
            <div className="flex space-x-3 items-center">
              <div className="relative w-20">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="doubao-seedream-4.0">doubao-seedream-4.0</option>
                  <option value="doubao-seedream-3.0-t2i">doubao-seedream-3.0-t2i</option>
                  <option value="doubao-seededit-3.0-i2i">doubao-seededit-3.0-i2i</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 背景选择 */}
              <div className="relative h-9 flex items-center">
                <select
                  value={backgroundType}
                  onChange={(e) => onBackgroundTypeChange?.(e.target.value)}
                  className="appearance-none bg-transparent pl-0 pr-3 text-xs text-gray-700 focus:outline-none"
                  style={{ width: '70px' }}
                >
                  <option value="空镜/背景">空镜/背景</option>
                  <option value="大远景">大远景</option>
                  <option value="全景">全景</option>
                  <option value="中景">中景</option>
                  <option value="近景">近景</option>
                  <option value="特写">特写</option>
                  <option value="主观视角">主观视角</option>
                </select>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 古风选择 */}
              <div className="relative h-9 flex items-center">
                <select
                  value={style}
                  onChange={(e) => onStyleChange?.(e.target.value)}
                  className="appearance-none bg-transparent pl-0 pr-3 text-xs text-gray-700 focus:outline-none"
                  style={{ width: '70px' }}
                >
                  <option value="电影感">电影感</option>
                  <option value="写实">写实</option>
                  <option value="古风动漫">古风动漫</option>
                  <option value="古风版画">古风版画</option>
                  <option value="古风写真">古风写真</option>
                  <option value="油画风格">油画风格</option>
                  <option value="水彩/水墨风格">水彩/水墨风格</option>
                  <option value="赛博朋克">赛博朋克</option>
                  <option value="奇幻风格">奇幻风格</option>
                  <option value="蒸汽朋克">蒸汽朋克</option>
                  <option value="吉卜力动画">吉卜力动画</option>
                  <option value="怀旧日漫">怀旧日漫</option>
                  <option value="新海诚动画">新海诚动画</option>
                  <option value="复古/胶片">复古/胶片</option>
                </select>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 相关性选择 */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-700">{t('shortplayEntry.image.relevance')}</span>
                <div className="relative h-9 flex items-center">
                  <select
                    value={relevanceScore}
                    onChange={(e) => onRelevanceScoreChange?.(e.target.value)}
                    className="appearance-none bg-transparent pl-0 pr-3 text-xs text-gray-700 focus:outline-none"
                    style={{ width: '20px' }}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* <div className="relative w-20">
                <select
                  value={videoLength}
                  onChange={(e) => onVideoLengthChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="1s">1s</option>
                  <option value="2s">2s</option>
                  <option value="3s">3s</option>
                  <option value="4s">4s</option>
                  <option value="5s">5s</option>
                  <option value="6s">6s</option>
                  <option value="7s">7s</option>
                  <option value="8s">8s</option>
                  <option value="9s">9s</option>
                  <option value="10s">10s</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div> */}
            </div>
          </div>

          {/* 生成状态显示 */}
          {isGenerating && generationStatus && (
            <div className="mb-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className={`w-full h-12 py-2 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto ${
                selectedModel === 'doubao-seedream-3.0-t2i' ? 'pl-4' : 'pl-12'
              }`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <label className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 ${
              selectedModel === 'doubao-seedream-3.0-t2i' ? 'hidden' : ''
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} title={isUploading && uploadProgress.total > 0 ? `${t('shortplayEntry.generation.uploadProgress')}: ${uploadProgress.current}/${uploadProgress.total}` : t('shortplayEntry.generation.uploadImage')}>
              {isUploading ? (
                <div className="relative w-4 h-4">
                  <Icon icon="ri:loader-4-line" className="w-4 h-4 text-gray-400 animate-spin" />
                  {uploadProgress.total > 1 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center" style={{ fontSize: '6px' }}>
                      {uploadProgress.current}
                    </div>
                  )}
                </div>
              ) : (
                <Icon icon="ri:image-line" className="w-4 h-4 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                multiple={true}
                className="hidden"
                disabled={isUploading}
                onChange={async (e) => {
                  console.log('文件选择事件触发');
                  const files = Array.from(e.target.files || []);
                  console.log('选择的文件:', files);
                  console.log('当前上传状态:', isUploading);
                  console.log('onMultipleFileUpload 函数:', onMultipleFileUpload);

                  if (files.length > 0 && !isUploading) {
                    console.log('开始上传文件:', files.map(f => f.name));

                    // 使用批量上传处理
                    if (onMultipleFileUpload) {
                      console.log('调用批量上传函数');
                      await onMultipleFileUpload(files);
                    } else {
                      console.log('批量上传函数不存在');
                    }

                    // 重置input的value，允许重复选择相同文件
                    e.target.value = '';
                  } else {
                    console.log('跳过上传，原因:', {
                      filesLength: files.length,
                      isUploading
                    });
                  }
                }}
              />
            </label>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}
            </button>
          </div>

          {/* 上传图片预览 */}
          {uploadedImages && uploadedImages.length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-2">{t('shortplayEntry.generation.uploadedCount')} {uploadedImages.length} {t('shortplayEntry.generation.images')}</div>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.fileId} className="relative group">
                    <img
                      src={image.fileUrl}
                      alt={image.fileName}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      title={image.fileName}
                    />
                    <button
                      onClick={() => onRemoveImage?.(image.fileId)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title={t('shortplayEntry.generation.remove')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'video' && (
        <>
          <div>
            <div className="flex space-x-2 items-center">
              {/* 模型选择 */}
              <div className="relative w-24">
                <select
                  value={videoModel || availableVideoModels[0].value}
                  onChange={(e) => onVideoModelChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  {availableVideoModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 分辨率 */}
              {/* <div className="relative w-28">
                <select
                  value={resolution}
                  onChange={(e) => onResolutionChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="2k">2k</option>
                  <option value="4k">4k</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div> */}

              {/* 宽高比 */}
              {/* <div className="relative w-28">
                <select
                  value={videoLength}
                  onChange={(e) => onVideoLengthChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                  <option value="3:4">3:4</option>
                  <option value="9:16">9:16</option>
                  <option value="21:9">21:9</option>
                  <option value="keep_ratio">保持比例</option>
                  <option value="adaptive">自适应</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div> */}

              {/* 视频时长选择 */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-700">{t('shortplayEntry.video.videoDuration')}</span>
                <div className="relative h-9 flex items-center">
                  <select
                    value={singleGenerate || '5s'}
                    onChange={(e) => onSingleGenerateChange?.(e.target.value)}
                    className="appearance-none bg-transparent pl-0 pr-4 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="2s">2s</option>
                    <option value="3s">3s</option>
                    <option value="4s">4s</option>
                    <option value="5s">5s</option>
                    <option value="6s">6s</option>
                    <option value="7s">7s</option>
                    <option value="8s">8s</option>
                    <option value="9s">9s</option>
                    <option value="10s">10s</option>
                  </select>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 分辨率选择 */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-700">{t('shortplayEntry.video.resolution')}</span>
                <div className="relative h-9 flex items-center">
                  <select
                    value={resolution || '1080p'}
                    onChange={(e) => onResolutionChange?.(e.target.value)}
                    className="appearance-none bg-transparent pl-0 pr-4 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 图片生成模式选择 */}
              <div className="relative h-9 flex items-center">
                <select
                  value={imageGenerationMode}
                  onChange={(e) => setImageGenerationMode(e.target.value)}
                  className="appearance-none bg-transparent pl-0 pr-4 text-xs text-gray-700 focus:outline-none"
                >
                  <option value="single">单图生成</option>
                  <option value="multi">多图生成</option>
                </select>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 生成状态显示 */}
          {isGenerating && generationStatus && (
            <div className="mb-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-12 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <label className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 ${
              (activeTab === 'video' || activeTab === 'image') ? '' : 'hidden'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} title={isUploading && uploadProgress.total > 0 ? `${t('shortplayEntry.generation.uploadProgress')}: ${uploadProgress.current}/${uploadProgress.total}` : t('shortplayEntry.generation.uploadImage')}>
              {isUploading ? (
                <div className="relative w-4 h-4">
                  <Icon icon="ri:loader-4-line" className="w-4 h-4 text-gray-400 animate-spin" />
                  {uploadProgress.total > 1 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center" style={{ fontSize: '6px' }}>
                      {uploadProgress.current}
                    </div>
                  )}
                </div>
              ) : (
                <Icon icon="ri:image-line" className="w-4 h-4 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                multiple={imageGenerationMode === 'multi'}
                className="hidden"
                disabled={isUploading || (imageGenerationMode === 'single' && uploadedImages.length >= 1)}
                onChange={async (e) => {
                  console.log('文件选择事件触发');
                  const files = Array.from(e.target.files || []);
                  console.log('选择的文件:', files);
                  console.log('当前上传状态:', isUploading);
                  console.log('生成模式:', imageGenerationMode);
                  console.log('onMultipleFileUpload 函数:', onMultipleFileUpload);

                  // 单图生成模式下的验证
                  if (imageGenerationMode === 'single' && uploadedImages.length >= 1) {
                    console.log('单图生成模式：已上传图片，不允许继续上传');
                    return;
                  }

                  // 单图生成模式只允许上传一张
                  let filesToUpload = files;
                  if (imageGenerationMode === 'single' && files.length > 1) {
                    filesToUpload = files.slice(0, 1);
                    console.log('单图生成模式：只上传第一张图片');
                  }

                  if (filesToUpload.length > 0 && !isUploading) {
                    console.log('开始上传文件:', filesToUpload.map(f => f.name));

                    // 使用批量上传处理
                    if (onMultipleFileUpload) {
                      console.log('调用批量上传函数');
                      await onMultipleFileUpload(filesToUpload);
                    } else {
                      console.log('批量上传函数不存在');
                    }

                    // 重置input的value，允许重复选择相同文件
                    e.target.value = '';
                  } else {
                    console.log('跳过上传，原因:', {
                      filesLength: filesToUpload.length,
                      isUploading
                    });
                  }
                }}
              />
            </label>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}
            </button>
          </div>

          {/* 上传图片预览 */}
          {uploadedImages && uploadedImages.length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-2">{t('shortplayEntry.generation.uploadedCount')} {uploadedImages.length} {t('shortplayEntry.generation.images')}</div>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.fileId} className="relative group">
                    <img
                      src={image.fileUrl}
                      alt={image.fileName}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      title={image.fileName}
                    />
                    <button
                      onClick={() => onRemoveImage?.(image.fileId)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title={t('shortplayEntry.generation.remove')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
