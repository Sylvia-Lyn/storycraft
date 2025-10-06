import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Button, Select } from 'antd';

const { Option } = Select;

function ShortplayEntryPage() {
  const [activeTab, setActiveTab] = useState<string>('script');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1');
  const [progress, setProgress] = useState<number>(75); // 进度百分比
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(true); // 默认有视频
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = "/32767410413-1-192.mp4"; // 视频文件路径

  // 进度条拖拽状态
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 处理进度条拖拽
  const handleProgressMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, newProgress)));

    // 同步视频时间
    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressMove(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressMove(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 视频控制函数
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 视频加载完成后重置进度
  const handleVideoLoaded = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  // 计算当前时间
  const videoDuration = videoRef.current?.duration || 0;
  const currentTime = Math.floor((progress / 100) * videoDuration);
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 计算总时长显示
  const totalMinutes = Math.floor(videoDuration / 60);
  const totalSeconds = Math.floor(videoDuration % 60);
  const totalTimeDisplay = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-grow overflow-hidden">
        <>
          {/* 左侧面板 - 一键创作 (均分) */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 顶部Logo和标题区 */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <Icon icon="ri:star-fill" className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium text-gray-900">一键创作</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">生成楚青春婚互动短剧</span>
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                  <Icon icon="ri:user-line" className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* 4个Tab按钮 */}
            <div className="flex space-x-2">
              <Button
                type={activeTab === 'script' ? 'primary' : 'default'}
                size="small"
                className={`rounded-full px-3 ${activeTab === 'script' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('script')}
              >
                剧本
              </Button>
              <Button
                size="small"
                type={activeTab === 'audio' ? 'primary' : 'default'}
                className={`rounded-full px-3 ${activeTab === 'audio' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('audio')}
              >
                音频
              </Button>
              <Button
                size="small"
                type={activeTab === 'image' ? 'primary' : 'default'}
                className={`rounded-full px-3 ${activeTab === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('image')}
              >
                图片
              </Button>
              <Button
                size="small"
                type={activeTab === 'video' ? 'primary' : 'default'}
                className={`rounded-full px-3 ${activeTab === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('video')}
              >
                视频
              </Button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-grow p-4 overflow-auto min-h-0">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {/* 卡片内容区域 */}
              <div className="flex-grow p-4 overflow-auto">
                <div className="space-y-4">
                  {/* 画面1 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">G</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">画面：1  时长：00:00'-00:05'</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700 pl-8">
                      <div className="break-words"><span className="font-medium">• 景别：</span>特写 → 全景</div>
                      <div className="break-words"><span className="font-medium">• 运镜：</span>镜头从上往下摇</div>
                      <div className="break-words">
                        <span className="font-medium">• 画面：</span>
                        <div className="ml-4 space-y-1 mt-1 text-gray-600">
                          <div className="break-words">○ 从餐车顶部一个褪色的黄红招牌【特写】开始，招牌上"外粥·24小时"的字样残缺不全，闪烁着不稳定的红光。</div>
                          <div className="break-words">○ 镜头【下摇】，红光在逐渐暗淡的路面上洒下了一片微弱的光晕。雨丝在灯光下清晰可见。</div>
                          <div className="break-words">○ 镜头最终定格在餐车旁的金属桌椅，几张惆怅的桌椅在外面，虽然、格雷独自一人坐在餐桌角落的位置。</div>
                          <div className="break-words">○ 音效：环境雨声，远处城市交通噪音，霓虹灯"滋滋"的电流声。</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 画面2 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-800">画面：2  时长：00:05'-00:10'</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700 pl-8">
                      <div className="break-words"><span className="font-medium">• 景别：</span>中近景</div>
                      <div className="break-words"><span className="font-medium">• 运镜：</span>固定</div>
                      <div className="break-words">
                        <span className="font-medium">• 画面：</span>虽然，格雷。深灰色连帽衫的视线垂得很低，只露出尖细的下颌线。他指间握着皱巴巴的纸巾，缓慢地擦去嘴角边的汁液。面前的是早已被泪水打湿的热粥。他的动作缓慢且理。
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 卡片底部输入区域 */}
              <div className="border-t border-gray-100 p-4">
                <div className="mb-3">
                  <Select
                    value={selectedModel}
                    onChange={setSelectedModel}
                    className="w-full"
                    size="small"
                    placeholder="Gemini2.5pro"
                  >
                    <Option value="gemini-2.5pro">Gemini2.5pro</Option>
                    <Option value="deepseek-r1">DeepSeek-R1</Option>
                    <Option value="gpt-4">GPT-4</Option>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <textarea
                    className="flex-1 h-10 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="简单描述你想要的互动剧"
                  />
                  <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    一键生成
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间面板 - 剧本编辑区域 */}
        <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 剧本标题栏 */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon icon="ri:star-fill" className="w-4 h-4 text-blue-500" />
                <span className="text-base font-medium text-gray-900">剧本</span>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <span>1-2夜内</span>
                  <span>废弃工厂</span>
                  <span>(分支B)</span>
                  <Icon icon="ri:arrow-down-s-line" className="w-4 h-4" />
                </div>
              </div>
              <Icon icon="ri:add-circle-line" className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          {/* 剧本内容区域 */}
          <div className="flex-grow p-4 overflow-auto min-h-0">
            <div className="space-y-4">
              {/* 画面脚本1 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-blue-600 mb-2 font-medium">画面脚本：瞬移技术下忙中的希，用自己的外套盖在她身上，他始起身，踏上濡湿下吊与最后一丝希望。</div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-800 min-w-0">千草折 (Chigusa Inori)：</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">(急切地) 嗯！你快走！诗织她已经...</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-800 min-w-0">神谷瞬 (Kamiya Shun)：</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">(打断她，大步走向诗织) 不！我不能就这么放弃她！</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>

              {/* 画面脚本2 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-blue-600 mb-2 font-medium">画面脚本：他张开双臂，没有害怕何威胁，拥住诗织的前额。</div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-800 min-w-0">神谷瞬 (Kamiya Shun)：</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">(声音颤抖但坚大声) 诗织！看着我！我爱你！神谷瞬！你忘了我们一起在天台许的愿吗？你说要买一家全世界最好吃的蛋糕店！</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>

              {/* 画面脚本3 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-blue-600 mb-2 font-medium">画面脚本：魔化的诗织动作一顿，浑浊的眼中似乎闪过了一丝迷茫，她往后一步，仍徘徊在方向纠结。</div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-800 min-w-0">夏目诗织 (Natsume Shiori)：</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">(低语，含泪不清) ......蛋糕......好子......好像......</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>

              {/* 画面脚本4 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-blue-600 mb-2 font-medium">画面脚本：瞬着到一丝希望，眼中燃起了光芒，趁住此时，诗织的速攻被挡弹跳的可塑感载攻代。她拉她挡起出一声失魂，眼中重新的光芒闪闪烁现了。</div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-800 min-w-0">夏目诗织 (Natsume Shiori)：</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">(尖叫) 肉——！！！</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧面板 - 手机预览区域 (固定宽度340px) */}
        <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ width: '340px' }}>
          {/* 预览头部 */}
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon icon="ri:circle-fill" className="w-2 h-2 text-blue-500" />
                <span className="text-sm font-medium text-gray-800">分镜4</span>
                <Icon icon="ri:arrow-down-s-line" className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <Button size="small" type="text" className="text-xs text-blue-500 border border-blue-200 rounded">
                  <Icon icon="ri:download-line" className="w-3 h-3 mr-1" />
                  下载
                </Button>
                <Button size="small" type="text" className="text-xs text-blue-500 border border-blue-200 rounded">
                  插入选项
                </Button>
              </div>
            </div>
          </div>

          {/* 手机预览容器 */}
          <div className="flex-grow overflow-auto min-h-0 p-2.5">
            <div className="h-full flex items-center justify-center">
              <div className="relative w-full max-w-xs" style={{ height: '700px' }}>
                {/* 手机外框 - 响应式高度 */}
                <div className="w-full h-full mx-auto bg-black rounded-[2.5rem] p-2 shadow-2xl" style={{ aspectRatio: '9/16' }}>
                  {/* 手机屏幕 */}
                  <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden relative">
                    {/* 刘海屏设计 */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

                    {/* 视频播放内容 */}
                    <div className="absolute inset-0 overflow-hidden">
                      {hasVideo ? (
                        /* 真实视频播放 */
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          className="w-full h-full object-cover"
                          onClick={togglePlay}
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            if (video.duration && !isDragging) {
                              setProgress((video.currentTime / video.duration) * 100);
                            }
                          }}
                          onLoadedMetadata={handleVideoLoaded}
                        />
                      ) : (
                        <>
                          {/* 默认雪景背景 */}
                          <div className="relative w-full h-full">
                            {/* 雪景背景 - 模拟真实照片效果 */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-gray-200 to-blue-200">
                              {/* 背景纹理 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gray-300/30"></div>

                              {/* 雪花效果 - 更真实的大小和分布 */}
                              <div className="absolute inset-0">
                                {Array.from({ length: 35 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`absolute bg-white rounded-full opacity-80 ${
                                      Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1'
                                    }`}
                                    style={{
                                      left: `${Math.random() * 100}%`,
                                      top: `${Math.random() * 100}%`,
                                      boxShadow: '0 0 2px rgba(255,255,255,0.5)'
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>

                            {/* 人物照片模拟 */}
                            <div className="absolute inset-0">
                              {/* 男主角 - 前景中心位置 */}
                              <div className="absolute top-16 left-8 w-32 h-48 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-b from-amber-100 via-orange-200 to-amber-300 relative">
                                  {/* 脸部区域 */}
                                  <div className="absolute top-4 left-6 w-20 h-24 bg-gradient-to-b from-pink-200 to-orange-200 rounded-lg">
                                    {/* 眼睛 */}
                                    <div className="absolute top-6 left-3 w-2 h-1 bg-gray-700 rounded-full"></div>
                                    <div className="absolute top-6 right-3 w-2 h-1 bg-gray-700 rounded-full"></div>
                                    {/* 嘴巴 */}
                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-red-300 rounded-full"></div>
                                  </div>
                                  {/* 头发 */}
                                  <div className="absolute top-2 left-4 w-24 h-16 bg-gradient-to-b from-gray-800 to-gray-600 rounded-t-lg"></div>
                                  {/* 衣服 - 黑色外套 */}
                                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900 to-black"></div>
                                </div>
                              </div>

                              {/* 女主角 - 右侧较远位置 */}
                              <div className="absolute top-28 right-6 w-24 h-36 rounded-lg overflow-hidden opacity-90">
                                <div className="w-full h-full bg-gradient-to-b from-pink-100 via-rose-200 to-pink-300 relative">
                                  {/* 脸部区域 */}
                                  <div className="absolute top-3 left-3 w-16 h-18 bg-gradient-to-b from-pink-200 to-rose-200 rounded-lg">
                                    {/* 眼睛 */}
                                    <div className="absolute top-4 left-2 w-1.5 h-0.5 bg-gray-700 rounded-full"></div>
                                    <div className="absolute top-4 right-2 w-1.5 h-0.5 bg-gray-700 rounded-full"></div>
                                  </div>
                                  {/* 头发 */}
                                  <div className="absolute top-1 left-2 w-18 h-12 bg-gradient-to-b from-amber-800 to-amber-600 rounded-t-lg"></div>
                                  {/* 衣服 */}
                                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-gray-700 to-gray-800"></div>
                                </div>
                              </div>

                              {/* 景深模糊效果 */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                            </div>

                            {/* 字幕区域 */}
                            <div className="absolute bottom-24 left-6 right-6">
                              <div className="text-white text-base font-medium text-center leading-relaxed drop-shadow-lg">
                                她前夫要是看到这个场景
                              </div>
                            </div>
                          </div>
                        </>
                      )}


                      {/* 播放控制按钮 */}
                      {hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <button
                            onClick={togglePlay}
                            className="bg-black/50 text-white rounded-full p-4 hover:bg-black/70 transition-all transform hover:scale-110"
                          >
                            <Icon
                              icon={isPlaying ? "ri:pause-fill" : "ri:play-fill"}
                              className="w-8 h-8"
                            />
                          </button>
                        </div>
                      )}

                      <>
                        {/* 进度条 */}
                        <div className="absolute bottom-12 left-4 right-4 z-10">
                            <div className="flex items-center justify-between text-white text-xs mb-1">
                              <span>{timeDisplay}</span>
                              <span>{totalTimeDisplay}</span>
                            </div>
                            <div className="relative">
                              <div
                                className="w-full h-1 bg-white/30 rounded-full cursor-pointer select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                              >
                                <div
                                  className="h-1 bg-white rounded-full relative"
                                  style={{ width: `${progress}%` }}
                                >
                                  <div
                                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab ${isDragging ? 'cursor-grabbing scale-110' : 'hover:scale-110'} transition-transform duration-150`}
                                    onMouseDown={handleMouseDown}
                                  ></div>
                                </div>
                              </div>
                              {/* 不可见的拖拽区域，增加交互面积 */}
                              <div
                                className="absolute -top-2 -bottom-2 left-0 right-0 cursor-pointer"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                              ></div>
                            </div>
                          </div>

                          {/* 底部操作栏 */}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 flex items-center justify-around backdrop-blur-sm">
                            <div className="text-center">
                              <div className="text-white text-sm">续梦</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white text-sm">我的</div>
                            </div>
                          </div>
                        </>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

export default ShortplayEntryPage;