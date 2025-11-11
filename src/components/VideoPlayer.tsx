import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface VideoPlayerProps {
  src?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  highlightedItemId?: string | number | null;
}

export function VideoPlayer({
  src,
  autoPlay = false,
  onTimeUpdate,
  onDurationChange,
  highlightedItemId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [progress, setProgress] = useState(0);

  // 播放/暂停切换
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 时间更新 - 仅在非拖拽时更新
  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      setProgress((current / (videoRef.current.duration || 1)) * 100);
      onTimeUpdate?.(current);
    }
  };

  // 获取视频元数据
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onDurationChange?.(dur);
    }
  };

  // 进度条变化
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);

    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      setCurrentTime(newTime);
      videoRef.current.currentTime = newTime;
    }
  };

  // 拖拽开始
  const handleProgressMouseDown = () => {
    setIsSeeking(true);
  };

  // 拖拽结束
  const handleProgressMouseUp = () => {
    setIsSeeking(false);
  };

  // 触摸开始
  const handleProgressTouchStart = () => {
    setIsSeeking(true);
  };

  // 触摸结束
  const handleProgressTouchEnd = () => {
    setIsSeeking(false);
  };

  // 视频结束
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // 视频加载错误
  const handleVideoError = () => {
    console.error('视频加载失败');
  };

  // 时间格式化 - 支持小时显示
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 监听 src 变化
  useEffect(() => {
    if (src && videoRef.current) {
      videoRef.current.src = src;
      videoRef.current.load();
    }
  }, [src]);

  return (
    <div className="flex flex-col h-full">
      {/* 视频容器 */}
      <div className="flex-grow relative bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          autoPlay={autoPlay}
        >
          <source src={src} type="video/mp4" />
          你的浏览器不支持 HTML5 Video 标签
        </video>

        {/* 播放/暂停按钮覆盖层 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
          <button
            onClick={handlePlayPause}
            className="bg-black/50 text-white rounded-full p-4 hover:bg-black/70 transition-all transform hover:scale-110"
          >
            <Icon
              icon={isPlaying ? 'ri:pause-fill' : 'ri:play-fill'}
              className="w-8 h-8"
            />
          </button>
        </div>

        {/* 进度条和控制 - 位于底部 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* 时间显示 */}
          <div className="time-display mb-2">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="separator">/</span>
            <span className="duration">{formatTime(duration)}</span>
          </div>

          {/* 进度条 */}
          <div
            data-progress-bar
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            onTouchStart={handleProgressTouchStart}
            onTouchEnd={handleProgressTouchEnd}
          >
            {/* 进度条填充 */}
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>

            {/* 进度条 slider */}
            <input
              type="range"
              className="progress-slider"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
            />
          </div>
        </div>
      </div>

      {/* 控制按钮区 */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          {isPlaying ? (
            <Icon icon="ri:pause-line" className="w-4 h-4" />
          ) : (
            <Icon icon="ri:play-line" className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 ml-4 text-white text-sm">
          {Math.round(progress)}% 已播放
        </div>
      </div>
    </div>
  );
}
