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
  const [userInput, setUserInput] = useState<string>(''); // 用户输入内容
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // 生成状态
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

  // 一键生成API调用
  const handleGenerate = async () => {
    if (!userInput.trim()) {
      alert('请输入您想要的互动剧描述');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/episode-api/series/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "use123",
          seriesName: "修仙恋爱记",
          seriesDescription: "修仙背景的爱情故事",
          userInput: userInput.trim(),
          prompt: userInput.trim(),
          status: "DRAFT",
          episodes: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('生成成功:', result);

        // 检查返回的code是否为0表示成功
        if (result.code === 0) {
          const { seriesId, episodeId, message } = result.data;
          alert(`${message}\n剧集ID: ${seriesId}\n剧集ID: ${episodeId}`);
          setUserInput(''); // 清空输入
        } else {
          throw new Error(result.message || '生成失败');
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-grow overflow-hidden">
        <>
          {/* 左侧面板 - 一键创作 (均分) */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 顶部Logo和标题区 */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg width="40" height="36" viewBox="0 0 56 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 边框 */}
                  <rect width="56" height="51" rx="10" fill="#3E83F6"/>
                  {/* Logo内容 - 星星 */}
                  <g transform="translate(28, 25.5) scale(0.7, 0.7) translate(-19, -19)">
                    <path d="M34.8333 15.3109C34.7333 15.0213 34.5515 14.767 34.3098 14.5787C34.0681 14.3904 33.7769 14.2762 33.4717 14.2501L24.4625 12.9359L20.425 4.75011C20.2954 4.48241 20.0929 4.25665 19.8409 4.09868C19.5889 3.94072 19.2974 3.85693 19 3.85693C18.7026 3.85693 18.4111 3.94072 18.1591 4.09868C17.9071 4.25665 17.7047 4.48241 17.575 4.75011L13.5375 12.9201L4.52834 14.2501C4.2353 14.2918 3.9598 14.4147 3.73311 14.605C3.50642 14.7953 3.33761 15.0454 3.24584 15.3268C3.16183 15.6018 3.1543 15.8944 3.22403 16.1734C3.29377 16.4523 3.43815 16.707 3.64167 16.9101L10.1808 23.2434L8.59751 32.2368C8.54098 32.5336 8.57058 32.8404 8.6828 33.121C8.79503 33.4015 8.98519 33.6441 9.23084 33.8201C9.47027 33.9913 9.75266 34.0923 10.0463 34.1119C10.34 34.1315 10.6333 34.0688 10.8933 33.9309L19 29.7034L27.075 33.9468C27.2972 34.0721 27.5482 34.1376 27.8033 34.1368C28.1387 34.138 28.4658 34.0326 28.7375 33.8359C28.9832 33.66 29.1733 33.4174 29.2855 33.1368C29.3978 32.8563 29.4274 32.5494 29.3708 32.2526L27.7875 23.2593L34.3267 16.9259C34.5553 16.7323 34.7242 16.4777 34.8139 16.1918C34.9036 15.9059 34.9103 15.6005 34.8333 15.3109ZM25.0958 21.6443C24.9102 21.8239 24.7712 22.0462 24.6912 22.2918C24.6112 22.5374 24.5924 22.7989 24.6367 23.0534L25.7767 29.6876L19.8233 26.5209C19.5943 26.399 19.3387 26.3352 19.0792 26.3352C18.8196 26.3352 18.5641 26.399 18.335 26.5209L12.3817 29.6876L13.5217 23.0534C13.5659 22.7989 13.5472 22.5374 13.4671 22.2918C13.3871 22.0462 13.2482 21.8239 13.0625 21.6443L8.31251 16.8943L14.9783 15.9284C15.2348 15.8928 15.4787 15.7947 15.6885 15.6429C15.8983 15.4911 16.0676 15.2901 16.1817 15.0576L19 9.02511L21.9767 15.0734C22.0907 15.3059 22.2601 15.5069 22.4699 15.6587C22.6797 15.8105 22.9235 15.9086 23.18 15.9443L29.8458 16.9101L25.0958 21.6443Z" fill="white"/>
                  </g>
                </svg>
                <span className="text-base font-medium text-gray-900">一键创作</span>
              </div>

              {/* Tab切换按钮组 */}
              <div className="flex items-center bg-gray-100 border" style={{ height: '36px', width: '268px', borderRadius: '100px', borderColor: '#3e83f6' }}>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'script'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('script')}
                >
                  剧本
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'audio'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('audio')}
                >
                  音频
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'image'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('image')}
                >
                  图片
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'video'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('video')}
                >
                  视频
                </button>
              </div>
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
                  <div className="relative w-40">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="gemini-2.5pro">Gemini2.5pro</option>
                      <option value="deepseek-r1">DeepSeek-R1</option>
                      <option value="gpt-4">GPT-4</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full h-10 pl-4 pr-4 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="简单描述你想要的互动剧"
                      disabled={isGenerating}
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !userInput.trim()}
                    className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                      isGenerating || !userInput.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isGenerating && (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{isGenerating ? '生成中...' : '一键生成'}</span>
                  </button>
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