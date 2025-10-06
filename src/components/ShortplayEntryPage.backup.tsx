import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button, Select, Upload, Progress, message } from 'antd';
import {
  submitScriptGenerationTask,
  waitForTaskCompletion,
  formatOutlineToText,
  formatCharactersToText,
  formatScenesToText,
  type TaskInfo
} from '../services/scriptGeneratorService';
import { useWorks } from '../contexts/WorksContext';
import { useI18n } from '../contexts/I18nContext';
import mammoth from 'mammoth';

const { Option } = Select;

function ShortplayEntryPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('现代都市');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1');
  const [activeTab, setActiveTab] = useState<string>('script'); // 'script', 'audio', 'image', 'video'
  const { currentWork, saveWorkContent } = useWorks();

  // 文件转换函数
  const convertFileToText = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return await file.text();
    } else if (fileName.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('不支持的文件格式，请上传 .txt、.md 或 .docx 文件');
    }
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFileName(file.name);
    try {
      setIsProcessing(true);
      setTaskStatus('正在解析文件...');

      const text = await convertFileToText(file);

      if (!text || text.trim().length < 100) {
        message.error('文件内容过短，请确保文件包含足够的小说内容');
        setIsProcessing(false);
        return false;
      }

      setTaskStatus('正在提交任务...');

      const taskInfo = await submitScriptGenerationTask(text, {
        model: selectedModel,
        language: 'zh-CN',
        style: selectedGenre
      });

      setTaskStatus('AI正在创作中...');
      setTaskProgress(0);

      const result = await waitForTaskCompletion(
        taskInfo.task_id,
        (taskInfo: TaskInfo) => {
          setTaskProgress(taskInfo.progress);
          setTaskStatus(taskInfo.message);
        }
      );

      const outlineText = formatOutlineToText(result.outline);
      const charactersText = formatCharactersToText(result.characters || []);
      const scenesText = formatScenesToText(result.scenes || []);

      const generatedData = {
        outline: outlineText,
        charactersText,
        scenesText,
        timestamp: Date.now()
      };

      localStorage.setItem('generatedScriptData', JSON.stringify(generatedData));

      setTaskStatus('创作完成！');
      setTaskProgress(100);

      setTimeout(() => {
        navigate('/app/outline');
      }, 1000);

      return false; // 阻止默认上传行为
    } catch (err) {
      console.error('导入并生成剧本失败:', err);
      message.error('创作失败：' + (err as Error).message);
      setIsProcessing(false);
      return false;
    }
  };

  // 剧本内容组件
  const ScriptContent = () => (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 space-y-4">
          <Icon icon="ri:file-text-line" className="w-16 h-16 mx-auto text-gray-300" />
          <div>中间区域已清空</div>
          <div className="text-sm">等待重新编写</div>
        </div>
      </div>
    </div>
  );

  // 音频内容组件
  const AudioContent = () => (
    <div className="space-y-4">
      {/* 音频轨道 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center p-3 bg-gray-50 border-b">
          <Icon icon="ri:music-2-line" className="w-4 h-4 text-blue-500 mr-2" />
          <span className="font-medium text-sm">音频轨道</span>
          <div className="ml-auto flex items-center space-x-2">
            <Button size="small" type="text">
              <Icon icon="ri:volume-up-line" className="w-3 h-3" />
            </Button>
            <Button size="small" type="text">
              <Icon icon="ri:add-line" className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-blue-700">男声1</div>
              <div className="text-xs text-blue-600 mt-1">BGM: 温馨</div>
            </div>
            <div className="bg-green-100 border border-green-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-green-700">女声1</div>
              <div className="text-xs text-green-600 mt-1">对话: 甜美</div>
            </div>
          </div>
        </div>
      </div>

      {/* 音频合成控制面板 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-blue-800">音频合成控制</span>
          <Button size="small" type="primary" className="bg-blue-500">
            <Icon icon="ri:voice-recognition-line" className="w-3 h-3 mr-1" />
            生成语音
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">语音角色</label>
            <Select className="w-full" size="small" defaultValue="male1">
              <Option value="male1">男声-温和</Option>
              <Option value="male2">男声-磁性</Option>
              <Option value="female1">女声-甜美</Option>
              <Option value="female2">女声-知性</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">情感调节</label>
            <Select className="w-full" size="small" defaultValue="normal">
              <Option value="happy">开心</Option>
              <Option value="normal">正常</Option>
              <Option value="sad">悲伤</Option>
              <Option value="excited">兴奋</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">语速: 1.0x</label>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="w-1/2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">音调: 0</label>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="w-1/2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* BGM 选择 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">背景音乐</label>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <Icon icon="ri:music-2-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-center">温馨</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <Icon icon="ri:music-2-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-center">激昂</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <Icon icon="ri:music-2-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-center">悲伤</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 图片内容组件
  const ImageContent = () => (
    <div className="space-y-4">
      {/* 视觉轨道 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center p-3 bg-gray-50 border-b">
          <Icon icon="ri:image-line" className="w-4 h-4 text-green-500 mr-2" />
          <span className="font-medium text-sm">图片轨道</span>
          <div className="ml-auto flex items-center space-x-2">
            <Button size="small" type="text">
              <Icon icon="ri:image-add-line" className="w-3 h-3" />
            </Button>
            <Button size="small" type="text">
              <Icon icon="ri:magic-line" className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-green-100 border border-green-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-green-700">背景1</div>
              <div className="text-xs text-green-600 mt-1">现代都市</div>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-yellow-700">人物1</div>
              <div className="text-xs text-yellow-600 mt-1">男主角</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 图片生成 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-green-800">AI 图片生成</span>
          <Button size="small" type="primary" className="bg-green-500">
            <Icon icon="ri:image-add-line" className="w-3 h-3 mr-1" />
            生成图片
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">画面描述</label>
            <textarea
              className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="描述你想要生成的画面，例如：一个现代都市的夜景，霓虹灯闪烁..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画面风格</label>
              <Select className="w-full" size="small" defaultValue="realistic">
                <Option value="realistic">写实风格</Option>
                <Option value="anime">动漫风格</Option>
                <Option value="oil-painting">油画风格</Option>
                <Option value="watercolor">水彩风格</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">图片尺寸</label>
              <Select className="w-full" size="small" defaultValue="16:9">
                <Option value="16:9">16:9 (横屏)</Option>
                <Option value="9:16">9:16 (竖屏)</Option>
                <Option value="1:1">1:1 (方形)</Option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 图片素材库 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">素材库</label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 flex items-center justify-center">
              <Icon icon="ri:image-line" className="w-6 h-6 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 视频内容组件
  const VideoContent = () => (
    <div className="space-y-4">
      {/* 视频轨道 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center p-3 bg-gray-50 border-b">
          <Icon icon="ri:video-line" className="w-4 h-4 text-orange-500 mr-2" />
          <span className="font-medium text-sm">视频轨道</span>
          <div className="ml-auto flex items-center space-x-2">
            <Button size="small" type="text">
              <Icon icon="ri:video-add-line" className="w-3 h-3" />
            </Button>
            <Button size="small" type="text">
              <Icon icon="ri:magic-line" className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-orange-100 border border-orange-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-orange-700">片段1</div>
              <div className="text-xs text-orange-600 mt-1">开场</div>
            </div>
            <div className="bg-pink-100 border border-pink-300 rounded p-2 cursor-pointer">
              <div className="text-xs font-medium text-pink-700">片段2</div>
              <div className="text-xs text-pink-600 mt-1">对话</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 视频生成 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-orange-800">AI 视频生成</span>
          <Button size="small" type="primary" className="bg-orange-500">
            <Icon icon="ri:video-add-line" className="w-3 h-3 mr-1" />
            生成视频
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">视频描述</label>
            <textarea
              className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="描述你想要生成的视频内容，例如：一个人在咖啡店里思考的镜头..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">视频时长</label>
              <Select className="w-full" size="small" defaultValue="5s">
                <Option value="3s">3秒</Option>
                <Option value="5s">5秒</Option>
                <Option value="10s">10秒</Option>
                <Option value="15s">15秒</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">镜头运动</label>
              <Select className="w-full" size="small" defaultValue="static">
                <Option value="static">静态</Option>
                <Option value="zoom-in">推近</Option>
                <Option value="zoom-out">拉远</Option>
                <Option value="pan">平移</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画质</label>
              <Select className="w-full" size="small" defaultValue="hd">
                <Option value="sd">标清</Option>
                <Option value="hd">高清</Option>
                <Option value="4k">4K</Option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 转场效果 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">转场效果</label>
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-center">
            <Icon icon="ri:scissors-cut-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs">直切</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-center">
            <Icon icon="ri:contrast-drop-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs">淡入淡出</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-center">
            <Icon icon="ri:slideshare-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs">滑动</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-center">
            <Icon icon="ri:focus-2-line" className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs">缩放</div>
          </div>
        </div>
      </div>

      {/* 视频导出设置 */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">导出设置</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">分辨率</label>
            <Select className="w-full" size="small" defaultValue="1080p">
              <Option value="720p">720p</Option>
              <Option value="1080p">1080p</Option>
              <Option value="4k">4K</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">帧率</label>
            <Select className="w-full" size="small" defaultValue="30fps">
              <Option value="24fps">24fps</Option>
              <Option value="30fps">30fps</Option>
              <Option value="60fps">60fps</Option>
            </Select>
          </div>
        </div>
        <Button type="primary" className="w-full mt-3 bg-orange-500">
          <Icon icon="ri:download-line" className="w-4 h-4 mr-1" />
          导出视频
        </Button>
      </div>
    </div>
  );

  // 根据当前活跃 tab 渲染对应内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'script':
        return <ScriptContent />;
      case 'audio':
        return <AudioContent />;
      case 'image':
        return <ImageContent />;
      case 'video':
        return <VideoContent />;
      default:
        return <ScriptContent />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-grow overflow-hidden">
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
          <div className="flex-grow p-4 overflow-auto">
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
                    disabled={isProcessing}
                    onClick={handleFileUpload}
                  >
                    一键生成
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间面板 - 剧本编辑区域 (均分) */}
        <div className="flex-1 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 剧本标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <Icon icon="ri:star-fill" className="w-3 h-3 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900">剧本 1-2 夜 内 废弃工厂（分支B）</span>
              <Icon icon="ri:arrow-down-s-line" className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Icon icon="ri:add-circle-line" className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500" />
            </div>
          </div>

          {/* 剧本内容区域 */}
          <div className="flex-grow p-4 overflow-auto">
            <div className="space-y-4">
              {/* 画面脚本块 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-blue-600 text-sm font-medium mb-2">画面脚本：</div>
                    <div className="text-gray-800 text-sm leading-relaxed break-words">
                      瞬时轻收放下杯中的茶，用自己的外套盖在她身上。他站起身，脸上满是不甘与最后一丝希望。
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3 mt-1" />
                </div>
              </div>

              {/* 对话块 */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800 text-sm leading-relaxed break-words">
                        <span className="font-medium">千草折 (Chigusa Inori)：</span>
                        <span className="ml-2">（急切地）喂！你快走！诗织神谷瞬！</span>
                      </div>
                    </div>
                    <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3" />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800 text-sm leading-relaxed">
                        <span className="font-medium">神谷瞬 (Kamiya Shun)：</span>
                        <span className="ml-2">（打断她，大步走向诗织）不！我不能就这么放弃她！</span>
                      </div>
                    </div>
                    <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3" />
                  </div>
                </div>
              </div>

              {/* 画面脚本块 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-blue-600 text-sm font-medium mb-2">画面脚本：</div>
                    <div className="text-gray-800 text-sm leading-relaxed">
                      他张开双臂，没有拿任何武器，挡在诗织面前。
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3 mt-1" />
                </div>
              </div>

              {/* 对话块 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm leading-relaxed">
                      <span className="font-medium">神谷瞬 (Kamiya Shun)：</span>
                      <span className="ml-2">（声音颤抖但大声）请住！看着我！我是诗织！你忘了我们一起在天台许的愿吗？你说要开一家全世界最好吃的蛋糕店！</span>
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3" />
                </div>
              </div>

              {/* 画面脚本块 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-blue-600 text-sm font-medium mb-2">画面脚本：</div>
                    <div className="text-gray-800 text-sm leading-relaxed">
                      魔化的诗织停顿了一瞬，淡漠的眼中似乎闪过一丝光芒。她停住脚步，仿佛在努力回忆。
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3 mt-1" />
                </div>
              </div>

              {/* 对话块 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm leading-relaxed">
                      <span className="font-medium">夏目 诗织 (Natsume Shiori)：</span>
                      <span className="ml-2">（低语，含混不清）......蛋糕......好香......肚子......好饿......</span>
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3" />
                </div>
              </div>

              {/* 画面脚本块 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-blue-600 text-sm font-medium mb-2">画面脚本：</div>
                    <div className="text-gray-800 text-sm leading-relaxed">
                      瞬看到一丝希望，眼中燃起光芒。但诗织突然发出一声尖叫，眼中最后的光芒彻底熄灭。诗织的双眼彻底变得空洞无光，仿佛再次被黑暗吞噬。
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3 mt-1" />
                </div>
              </div>

              {/* 对话块 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm leading-relaxed">
                      <span className="font-medium">夏目 诗织 (Natsume Shiori)：</span>
                      <span className="ml-2">（尖叫）肉——！！！</span>
                    </div>
                  </div>
                  <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧面板 - 手机预览区域 (固定宽度) */}
        <div className="w-80 bg-gray-100 flex flex-col overflow-hidden">
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
          <div className="flex-grow p-4 overflow-auto">
            <div className="h-full flex items-center justify-center">
              <div className="relative w-full h-full max-w-xs">
                {/* 手机外框 - 响应式高度 */}
                <div className="w-full h-full max-w-56 mx-auto bg-black rounded-[2.5rem] p-2 shadow-2xl" style={{ aspectRatio: '9/16' }}>
                  {/* 手机屏幕 */}
                  <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden relative">
                    {/* 刘海屏设计 */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

                    {/* 雪景背景视频内容 */}
                    <div className="absolute inset-0 overflow-hidden">
                      {selectedFileName ? (
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

                          {/* 进度条 */}
                          <div className="absolute bottom-16 left-6 right-6">
                            <div className="flex items-center justify-between text-white text-xs mb-1">
                              <span>00:45</span>
                              <span>01:00</span>
                            </div>
                            <div className="w-full h-1 bg-white/30 rounded-full">
                              <div className="w-3/4 h-1 bg-white rounded-full relative">
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* 底部操作栏 */}
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/60 flex items-center justify-around backdrop-blur-sm">
                            <div className="text-center">
                              <Icon icon="ri:chat-1-line" className="w-5 h-5 text-white mb-1" />
                              <div className="text-white text-xs">数据</div>
                            </div>
                            <div className="text-center">
                              <Icon icon="ri:heart-line" className="w-5 h-5 text-white mb-1" />
                              <div className="text-white text-xs">喜欢</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-white/70 space-y-4">
                            <Icon icon="ri:video-line" className="w-16 h-16 mx-auto" />
                            <div className="text-sm">等待内容加载</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortplayEntryPage;