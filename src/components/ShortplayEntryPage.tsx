import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button, Select, Segmented, Modal } from "antd";
import toast from "react-hot-toast";
import { useI18n } from "../contexts/I18nContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// 导入拆分后的组件
import { SortableAudioItem } from "./ShortplayEntryPage/Audio/SortableAudioItem";
import { AudioResourcePanel } from "./ShortplayEntryPage/Audio/AudioResourcePanel";
import { AudioBottomPanel } from "./ShortplayEntryPage/Audio/AudioBottomPanel";
import { SortableScriptCard } from "./ShortplayEntryPage/Script/SortableScriptCard";
import { SortableScriptItem } from "./ShortplayEntryPage/Script/SortableScriptItem";
import { BottomInputArea } from "./ShortplayEntryPage/Common/BottomInputArea";
import { TimeRangeInput } from "./ShortplayEntryPage/Common/TimeRangeInput";
import { SectionHeader } from "./ShortplayEntryPage/Common/SectionHeader";
import { ChatConversation, type ConversationMessage } from "./ShortplayEntryPage/Common/ChatConversation";
import { SortableImageItem } from "./ShortplayEntryPage/Image/SortableImageItem";
import { ImageItemComponent } from "./ShortplayEntryPage/Image/ImageItemComponent";
import { SortableVideoItem } from "./ShortplayEntryPage/Video/SortableVideoItem";
import { VideoItemComponent } from "./ShortplayEntryPage/Video/VideoItemComponent";
import { SortableStoryboardItem } from "./ShortplayEntryPage/Storyboard/SortableStoryboardItem";
import { StoryboardList } from "./ShortplayEntryPage/Storyboard/StoryboardList";

// 导入类型定义
import type { ScriptCardProps } from "./ShortplayEntryPage/types";

// 导入工具函数
import { formatMillisecondsToTime } from "./ShortplayEntryPage/utils/formatTime";

// 一键创作API基础路径
const STORYAI_API_BASE = "/storyai";

// 处理 401 未授权错误的辅助函数
const handleUnauthorized = () => {
  // 清除本地存储的认证信息
  localStorage.removeItem("token");
  sessionStorage.removeItem("userId");
  // 重定向到登录页面
  window.location.href = "/login";
};

function ShortplayEntryPage() {
  const { t, language } = useI18n();
  const location = useLocation();

  // 从sessionStorage获取userId的辅助函数
  const getUserId = (): string => {
    return sessionStorage.getItem("userId") || "";
  };

  // 从URL的search部分提取seriesId参数
  const urlSeriesId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("seriesId");
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<string>("script");
  const [selectedModel, setSelectedModel] = useState<string>("deepseek"); // 脚本tab模型
  const [imageModel, setImageModel] = useState<string>(
    "doubao-seedream-3.0-t2i"
  ); // 图片tab模型
  const [audioModel, setAudioModel] = useState<string>("minmax"); // 音频tab模型
  const [progress, setProgress] = useState<number>(0); // 进度百分比
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isHoveringVideo, setIsHoveringVideo] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(false); // 默认有视频
  const [userInput, setUserInput] = useState<string>(""); // 用户输入内容
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // 生成状态
  const [generatedContent, setGeneratedContent] = useState<string>(""); // 生成的内容
  const [generationStatus, setGenerationStatus] = useState<string>(""); // 生成状态文本
  const [isGeneratingPreview, setIsGeneratingPreview] =
    useState<boolean>(false); // 预览生成状态

  // 对话历史状态
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // 底部输入区域的额外状态
  const [voiceType, setVoiceType] = useState<string>("male");
  const [audioGender, setAudioGender] = useState<string>("1"); // '0' for 女生, '1' for 男生
  const [backgroundType, setBackgroundType] = useState<string>(
    t("shortplayEntry.image.background")
  );
  const [style, setStyle] = useState<string>(t("shortplayEntry.image.ancient"));
  const [relevanceScore, setRelevanceScore] = useState<string>("1");
  const [videoLength, setVideoLength] = useState<string>("2s");
  const [resolution, setResolution] = useState<string>("1080p");
  const [singleGenerate, setSingleGenerate] = useState<string>("5s");
  const [videoModel, setVideoModel] = useState<string>(
    "doubao-seedance-1.0-lite-text"
  );

  // 场次管理状态
  const [seriesId, setSeriesId] = useState<string>(""); // 生成的series ID
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [currentSceneId, setCurrentSceneId] = useState<string | number>(""); // 中间区域头部下拉选择的场景 ID
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const [scenesData, setScenesData] = useState<any[]>([]); // 存储完整的场次数据
  const [sceneContent, setSceneContent] = useState<any[]>([]); // 存储当前场次的内容数据
  const [isLoadingSceneContent, setIsLoadingSceneContent] = useState(false); // 场景内容加载状态
  const [showTypeSelector, setShowTypeSelector] = useState(false); // 显示类型选择弹窗
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // 视频缓存：存储每个场景的视频 URL (sceneId -> videoUrl)
  const [videoCacheMap, setVideoCacheMap] = useState<Record<string, any>>({});

  // 剧本卡片数据状态
  const [scriptCards, setScriptCards] = useState<ScriptCardProps[]>([]);

  // 音色数据状态
  const [configuredVoices, setConfiguredVoices] = useState<any[]>([]);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [isConfiguredVoicesExpanded, setIsConfiguredVoicesExpanded] =
    useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [editingVoiceName, setEditingVoiceName] = useState<string>("");

  // 音频类型选择状态（音色/音效）
  const [audioType, setAudioType] = useState<"voice" | "sound">("voice");

  // 音频内容数据状态
  const [audioContent, setAudioContent] = useState<any[]>([]); // 存储音频tab的内容数据
  const [isLoadingAudioContent, setIsLoadingAudioContent] = useState(false);

  // 音效数据状态
  const [bgmList, setBgmList] = useState<any[]>([]);
  const [isLoadingBgm, setIsLoadingBgm] = useState(false);

  // 音效时间编辑状态
  const [bgmEditingTimeId, setBgmEditingTimeId] = useState<string | null>(null);
  const [bgmEditingStartMinutes, setBgmEditingStartMinutes] =
    useState<string>("");
  const [bgmEditingStartSeconds, setBgmEditingStartSeconds] =
    useState<string>("");
  const [bgmEditingEndMinutes, setBgmEditingEndMinutes] = useState<string>("");
  const [bgmEditingEndSeconds, setBgmEditingEndSeconds] = useState<string>("");

  // 音效库列表时间编辑状态
  const [bgmLibraryEditingId, setBgmLibraryEditingId] = useState<string | null>(
    null
  );
  const [bgmLibraryStartMinutes, setBgmLibraryStartMinutes] =
    useState<string>("00");
  const [bgmLibraryStartSeconds, setBgmLibraryStartSeconds] =
    useState<string>("00");
  const [bgmLibraryEndMinutes, setBgmLibraryEndMinutes] =
    useState<string>("05");
  const [bgmLibraryEndSeconds, setBgmLibraryEndSeconds] =
    useState<string>("00");
  const [bgmLibraryDisplayTime, setBgmLibraryDisplayTime] =
    useState<string>("00'00'-00'05'");

  // 音效播放进度状态
  const [playingBgmId, setPlayingBgmId] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState<number>(10);
  const audioRefMap = useRef<Record<string, HTMLAudioElement>>({});

  // 标记是否已经初始化过 currentSceneId（用于避免重复设置）
  const isCurrentSceneIdInitialized = useRef<boolean>(false);

  // 用于生成新增项目的临时 ID（负数）
  const newItemIdCounter = useRef<number>(-1);

  // 监听音量变化，更新所有 audio 元素
  // 初始化：从 localStorage 加载视频缓存
  React.useEffect(() => {
    const savedCache = localStorage.getItem("videoCacheMap");
    if (savedCache) {
      try {
        const cache = JSON.parse(savedCache);
        setVideoCacheMap(cache);
      } catch (error) {
      }
    }

    // 恢复对话历史
    const savedConversation = localStorage.getItem("conversationHistory");
    if (savedConversation) {
      try {
        const conversation = JSON.parse(savedConversation);
        setConversationHistory(conversation);
      } catch (error) {
        console.error("Failed to restore conversation history:", error);
      }
    }
  }, []);

  // 页面初始化时，从 /series/detail 接口加载对话历史
  React.useEffect(() => {
    const initializeConversationFromAPI = async () => {
      // 检查是否已有对话历史
      if (conversationHistory.length > 0) {
        return;
      }

      // 尝试获取seriesId
      const storedSeriesId = localStorage.getItem("currentSeriesId");
      if (!storedSeriesId) {
        return; // 没有seriesId，不加载
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${STORYAI_API_BASE}/series/detail?seriesId=${storedSeriesId}`,
          {
            method: "GET",
            headers: {
              "X-Prompt-Manager-Token": token || "",
            },
          }
        );

        if (!response.ok) {
          console.warn("Failed to load series detail for conversation");
          return;
        }

        const result = await response.json();
        if (result.code === 0 && result.data) {
          const { seriesContent, userInput } = result.data;

          console.log(
            "📝 [页面初始化] 从API加载对话内容",
            { userInput, seriesContentLength: seriesContent?.length }
          );

          // 如果有seriesContent和userInput，添加到对话历史
          if (userInput && seriesContent) {
            const newMessages: ConversationMessage[] = [
              {
                id: Date.now().toString(),
                type: 'user',
                content: userInput,
                timestamp: Date.now(),
              },
              {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: seriesContent,
                timestamp: Date.now(),
              },
            ];

            console.log('✅ [页面初始化] 添加初始对话消息:', newMessages.length);
            setConversationHistory(newMessages);
          }
        }
      } catch (error) {
        console.error("Error loading conversation from API:", error);
      }
    };

    initializeConversationFromAPI();
  }, []); // 只在组件挂载时执行一次

  // 保存对话历史到 localStorage
  React.useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  React.useEffect(() => {
    Object.values(audioRefMap.current).forEach((audio) => {
      if (audio) {
        audio.volume = bgmVolume / 10;
      }
    });
  }, [bgmVolume]);

  // 图片聊天记录数据状态
  const [imageChatHistory, setImageChatHistory] = useState<any[]>([]);
  const [isLoadingImageHistory, setIsLoadingImageHistory] =
    useState<boolean>(false);

  // 加载图片聊天记录
  const loadImageChatHistory = async () => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      setIsLoadingImageHistory(false); // 确保loading状态被重置
      return;
    }

    setIsLoadingImageHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/chat-history/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          sceneId: sceneId.toString(),
          chatScene: "IMAGE",
          pageNum: 1,
          pageSize: 24,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setImageChatHistory(result.data.records || result.data || []);
        } else {
          setImageChatHistory([]);
        }
      } else {
        setImageChatHistory([]);
      }
    } catch (error) {
      setImageChatHistory([]);
    } finally {
      setIsLoadingImageHistory(false);
    }
  };

  // 图片数据状态
  const [imageItems, setImageItems] = useState([]);

  // 图片分镜板数据状态
  const [storyboardItems, setStoryboardItems] = useState<any[]>([]);
  const [isLoadingStoryboard, setIsLoadingStoryboard] =
    useState<boolean>(false);

  // 加载分镜板列表
  const loadStoryboardList = async () => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      setIsLoadingStoryboard(false); // 确保loading状态被重置
      return;
    }

    setIsLoadingStoryboard(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/storyboard/list?sceneId=${sceneId}`,
        {
          method: "GET",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          // 按 storyboardOrder 排序后设置数据
          const sortedData = (result.data || []).sort(
            (a: any, b: any) =>
              (a.storyboardOrder || 0) - (b.storyboardOrder || 0)
          );
          setStoryboardItems(sortedData);
        } else {
          setStoryboardItems([]);
        }
      } else {
        setStoryboardItems([]);
      }
    } catch (error) {
      setStoryboardItems([]);
    } finally {
      setIsLoadingStoryboard(false);
    }
  };

  // 静默加载分镜板列表（不显示loading状态）
  const silentLoadStoryboardList = async () => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/storyboard/list?sceneId=${sceneId}`,
        {
          method: "GET",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          // 按 storyboardOrder 排序后设置数据
          const sortedData = (result.data || []).sort(
            (a: any, b: any) =>
              (a.storyboardOrder || 0) - (b.storyboardOrder || 0)
          );
          setStoryboardItems(sortedData);
        }
      }
    } catch (error) {
    }
  };

  // 视频预览
  const handleVideoPreview = async () => {
    // 防止重复点击
    if (isLoadingPreviewVideo) {
      return;
    }

    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId && sceneId !== 0) {
      toast.error(t("shortplayEntry.validation.selectSceneFirst"));
      return;
    }

    setIsLoadingPreviewVideo(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/multimedia/episode/video/preview?sceneId=${sceneId}`,
        {
          method: "POST",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 0) {
        // 获取下载地址并更新视频源
        if (result.data?.downloadUrl) {
          const downloadUrl = result.data.downloadUrl;
          setVideoSrc(downloadUrl);
          setHasVideo(true);

          // 保存完整的返回数据到缓存（使用seriesId和sceneId组合作为key）
          const cacheKey = `${seriesId}_${sceneId}`;
          const newCache = { ...videoCacheMap, [cacheKey]: result.data };
          setVideoCacheMap(newCache);
          localStorage.setItem("videoCacheMap", JSON.stringify(newCache));

          toast.success(
            t("shortplayEntry.messages.success.videoPreviewLoaded")
          );
        } else {
          throw new Error("返回数据中缺少downloadUrl");
        }
      } else {
        throw new Error(result.message || "视频预览生成失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.videoPreviewFailed", {
          error: (error as Error).message,
        })
      );
    } finally {
      setIsLoadingPreviewVideo(false);
    }
  };

  // 创建分镜板
  const handleCreateStoryboard = async (
    fileId: string,
    fileName: string,
    userPrompt?: string
  ) => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      toast.error("请先选择场次");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 计算下一个排序号 (当前列表长度 + 1)
      const storyboardOrder = storyboardItems.length + 1;

      const requestBody: any = {
        sceneId: sceneId,
        storyboardOrder: storyboardOrder,
        fileId: fileId,
      };

      // 如果提供了userPrompt，添加到请求体
      if (userPrompt) {
        requestBody.userPrompt = userPrompt;
      }

      const response = await fetch(`${STORYAI_API_BASE}/storyboard/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        // 静默刷新分镜板列表，不显示loading和toast提示
        await silentLoadStoryboardList();
      } else {
        throw new Error(result.message || "应用图片失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.imageApplyFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 编辑时间状态
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingStartMinutes, setEditingStartMinutes] = useState<string>("");
  const [editingStartSeconds, setEditingStartSeconds] = useState<string>("");
  const [editingEndMinutes, setEditingEndMinutes] = useState<string>("");
  const [editingEndSeconds, setEditingEndSeconds] = useState<string>("");

  // 场次内容编辑状态
  const [editingSceneItemId, setEditingSceneItemId] = useState<number | null>(
    null
  );
  const [editingSceneContent, setEditingSceneContent] = useState<string>("");
  const [editingSceneType, setEditingSceneType] = useState<number>(0); // 0: 画面, 1: 对话
  const [editingSceneRoleName, setEditingSceneRoleName] = useState<string>(""); // 角色名称
  const [editingSceneStartMinutes, setEditingSceneStartMinutes] =
    useState<string>("");
  const [editingSceneStartSeconds, setEditingSceneStartSeconds] =
    useState<string>("");
  const [editingSceneEndMinutes, setEditingSceneEndMinutes] =
    useState<string>("");
  const [editingSceneEndSeconds, setEditingSceneEndSeconds] =
    useState<string>("");

  // 删除确认状态
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteStoryboardId, setDeleteStoryboardId] = useState<string | null>(
    null
  );
  const [removeUploadedImageId, setRemoveUploadedImageId] = useState<
    string | null
  >(null);
  const [deleteAudioItemId, setDeleteAudioItemId] = useState<number | null>(
    null
  );

  // 视频数据状态 (使用与图片相同的数据结构)
  const [videoItems, setVideoItems] = useState([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>(""); // 视频文件路径
  const [isLoadingPreviewVideo, setIsLoadingPreviewVideo] =
    useState<boolean>(false); // 视频预览加载状态
  const [lastFrameImage, setLastFrameImage] = useState<string>(""); // 最后一帧图片
  const [highlightedItemId, setHighlightedItemId] = useState<
    string | number | null
  >(null); // 当前高亮的列表项 ID

  // 用于跟踪上一次的audioType值
  const prevAudioTypeRef = useRef<"voice" | "sound">(audioType);

  // 进度条查找状态 - 使用 isSeeking 避免播放中拖拽进度条冲突
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

  // 监听 videoSrc 变化，自动显示视频
  React.useEffect(() => {
    if (videoSrc) {
      setHasVideo(true);
      setLastFrameImage(""); // 清除lastFrame
      setProgress(0); // 新视频加载时重置进度条
      // 重新加载视频
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setHasVideo(false);
      setProgress(0); // 没有视频时重置进度条
    }
  }, [videoSrc]);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // 根据当前 tab 选择对应的数据源
      const isAudioTab = activeTab === "audio";
      const oldItems = isAudioTab ? audioContent : sceneContent;

      const oldIndex = oldItems.findIndex(
        (item) => item.id.toString() === active.id
      );
      const newIndex = oldItems.findIndex(
        (item) => item.id.toString() === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // 先更新本地状态
        const newItems = arrayMove(oldItems, oldIndex, newIndex);

        // 根据 tab 类型更新相应的状态
        if (isAudioTab) {
          setAudioContent(newItems);
        } else {
          setSceneContent(newItems);
        }

        // 调用API更新排序
        try {
          const token = localStorage.getItem("token");

          // 获取排序后的所有id数组
          const ids = newItems.map((item) => item.id);

          const response = await fetch(
            `${STORYAI_API_BASE}/scene/content/reorder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Prompt-Manager-Token": token || "",
              },
              body: JSON.stringify({
                ids: ids,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
          }

          const result = await response.json();
          if (result.code !== 0) {
            throw new Error(result.message || "更新排序失败");
          }
        } catch (error) {
          // API调用失败时，恢复原来的排序
          if (isAudioTab) {
            setAudioContent(oldItems);
          } else {
            setSceneContent(oldItems);
          }
          toast.error(
            t("shortplayEntry.messages.error.sortingFailed", {
              error: (error as Error).message,
            })
          );
        }
      }
    }
  };

  // 图片拖拽处理
  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 显示删除分镜板确认对话框
  const handleShowDeleteStoryboardConfirm = (itemId: string) => {
    setDeleteStoryboardId(itemId);
  };

  // 删除分镜板
  const handleDeleteStoryboard = async (itemId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/storyboard/${itemId}`, {
        method: "DELETE",
        headers: {
          "X-Prompt-Manager-Token": token || "",
        },
      });

      if (!response.ok) {
        throw new Error(`删除失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        toast.success(t("shortplayEntry.messages.success.storyboardDeleted"));
        // 刷新分镜板列表
        await loadStoryboardList();
      } else {
        throw new Error(result.message || "删除分镜板失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.deleteFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 确认删除分镜板
  const handleConfirmDeleteStoryboard = async () => {
    if (deleteStoryboardId === null) return;
    await handleDeleteStoryboard(deleteStoryboardId);
    setDeleteStoryboardId(null);
  };

  // 分镜板拖拽处理
  const handleStoryboardDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldItems = storyboardItems;
      const oldIndex = oldItems.findIndex(
        (item) => item.id.toString() === active.id
      );
      const newIndex = oldItems.findIndex(
        (item) => item.id.toString() === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // 先更新本地状态
        const newItems = arrayMove(oldItems, oldIndex, newIndex);
        setStoryboardItems(newItems);

        // 调用API更新分镜板排序
        try {
          const token = localStorage.getItem("token");
          const movedItem = oldItems[oldIndex];

          // 计算新的storyboardOrder：使用新位置的索引+1作为storyboardOrder
          const newStoryboardOrder = newIndex + 1;

          const response = await fetch(
            `${STORYAI_API_BASE}/storyboard/update`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Prompt-Manager-Token": token || "",
              },
              body: JSON.stringify({
                id: parseInt(movedItem.id),
                storyboardOrder: newStoryboardOrder,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`更新排序失败: ${response.status}`);
          }

          const result = await response.json();
          if (result.code === 0) {
            toast.success(
              t("shortplayEntry.messages.success.storyboardSorted")
            );
          } else {
            throw new Error(result.message || "更新排序失败");
          }
        } catch (error) {
          // API调用失败时，恢复原来的排序
          setStoryboardItems(oldItems);
          toast.error(
            t("shortplayEntry.messages.error.sortingFailed", {
              error: (error as Error).message,
            })
          );
        }
      }
    }
  };

  // 视频拖拽处理
  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVideoItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 剧本卡片拖动处理
  const handleScriptDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScriptCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 删除剧本卡片
  const handleDeleteScriptCard = (id: string) => {
    setScriptCards((items) => items.filter((item) => item.id !== id));
  };

  // 显示删除确认对话框
  const handleShowDeleteConfirm = (id: number) => {
    setDeleteConfirmId(id);
  };

  // 确认删除场次内容项
  const handleConfirmDelete = async () => {
    if (deleteConfirmId === null) return;

    const id = deleteConfirmId;
    setDeleteConfirmId(null); // 先关闭对话框

    // 如果是新创建的临时项（还没保存到服务器），直接从本地删除
    if (id < 0) {
      setSceneContent((items) => items.filter((item) => item.id !== id));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/scene/content/${id}`, {
        method: "DELETE",
        headers: {
          "X-Prompt-Manager-Token": token || "",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 从本地状态中删除
          setSceneContent((items) => items.filter((item) => item.id !== id));
        } else {
          toast.error("删除失败：" + (result.message || "未知错误"));
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.deleteFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // 显示删除音频项确认对话框
  const handleShowDeleteAudioConfirm = (id: number) => {
    setDeleteAudioItemId(id);
  };

  // 确认删除音频项
  const handleConfirmDeleteAudio = async () => {
    if (deleteAudioItemId === null) return;

    const id = deleteAudioItemId;
    setDeleteAudioItemId(null); // 先关闭对话框

    // 如果是新创建的临时项（还没保存到服务器），直接从本地删除
    if (id < 0) {
      setAudioContent((items) => items.filter((item) => item.id !== id));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/scene/content/${id}`, {
        method: "DELETE",
        headers: {
          "X-Prompt-Manager-Token": token || "",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 从本地状态中删除
          setAudioContent((items) => items.filter((item) => item.id !== id));
          toast.success("删除成功！");
        } else {
          toast.error("删除失败：" + (result.message || "未知错误"));
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.deleteFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 取消删除音频项
  const handleCancelDeleteAudio = () => {
    setDeleteAudioItemId(null);
  };

  // 更新场次名称
  const updateSceneName = async (sceneId: number, newSceneName: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/scene`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          id: sceneId,
          sceneTitle: newSceneName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 获取旧的场次名称
          const oldSceneName = scenesData.find(
            (scene: any) => scene.id === sceneId
          )?.sceneTitle;

          // 更新本地场次数据
          setScenesData((scenes) =>
            scenes.map((scene: any) =>
              scene.id === sceneId
                ? { ...scene, sceneTitle: newSceneName }
                : scene
            )
          );

          // 更新场次选项
          setSceneOptions((options) =>
            options.map((option) =>
              option === oldSceneName ? newSceneName : option
            )
          );

          return true;
        } else {
          toast.error("场次名称更新失败：" + (result.message || "未知错误"));
          return false;
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.sceneNameUpdateFailed", {
          error: (error as Error).message,
        })
      );
      return false;
    }
  };

  // 新增场景
  const handleAddScene = async (sceneName: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");

      // 构建请求体，如果有 episodeId 则包含，否则不传
      const episodeId = scenesData.length > 0 ? scenesData[0].episodeId : null;
      const requestBody: any = {
        seriesId: seriesId,
        sceneTitle: sceneName,
        sceneOrder: scenesData.length + 1,
      };

      // 只有当 episodeId 存在时才添加
      if (episodeId) {
        requestBody.episodeId = episodeId;
      }

      const response = await fetch(`${STORYAI_API_BASE}/scene`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          const newScene = result.data;

          // 更新本地场次数据
          setScenesData((scenes) => [...scenes, newScene]);

          // 更新场次选项
          setSceneOptions((options) => [...options, newScene.sceneTitle]);

          // 自动切换到新场景
          setSelectedScene(newScene.sceneTitle);
          setCurrentSceneId(newScene.id);

          toast.success(t("shortplayEntry.messages.success.sceneAdded") || "场景已添加");
          return true;
        } else {
          toast.error("场景创建失败：" + (result.message || "未知错误"));
          return false;
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.sceneAddFailed", {
          error: (error as Error).message,
        }) || "场景创建失败"
      );
      return false;
    }
  };

  // 删除场景
  const handleDeleteScene = async (sceneName: string): Promise<boolean> => {
    try {
      // 找到对应的 sceneId
      const sceneToDelete = scenesData.find(
        (scene: any) => scene.sceneTitle === sceneName
      );

      if (!sceneToDelete) {
        toast.error("找不到场景");
        return false;
      }

      // 弹出确认框
      const isConfirmed = window.confirm(
        `确定要删除场景"${sceneName}"吗？此操作无法撤销。`
      );

      if (!isConfirmed) {
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/scene/${sceneToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 更新本地场次数据
          setScenesData((scenes) =>
            scenes.filter((scene: any) => scene.id !== sceneToDelete.id)
          );

          // 更新场次选项
          setSceneOptions((options) =>
            options.filter((option) => option !== sceneName)
          );

          // 如果删除的是当前选中的场景，切换到第一个场景
          if (selectedScene === sceneName) {
            const remainingScenes = scenesData.filter(
              (scene: any) => scene.sceneTitle !== sceneName
            );
            if (remainingScenes.length > 0) {
              setSelectedScene(remainingScenes[0].sceneTitle);
              setCurrentSceneId(remainingScenes[0].id);
            } else {
              setSelectedScene("");
              setCurrentSceneId("");
            }
          }

          toast.success(t("shortplayEntry.messages.success.sceneDeleted") || "场景已删除");
          return true;
        } else {
          toast.error("场景删除失败：" + (result.message || "未知错误"));
          return false;
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.sceneDeleteFailed", {
          error: (error as Error).message,
        }) || "场景删除失败"
      );
      return false;
    }
  };

  // 时间格式验证和格式化函数
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(time)) return false;

    const [minutes, seconds] = time.split(":").map(Number);
    return minutes <= 59 && seconds <= 59;
  };

  const formatTimeInput = (time: string): string => {
    const timeRegex = /^(\d{1,2}):(\d{1,2})$/;
    const match = time.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      if (minutes <= 59 && seconds <= 59) {
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    }
    return time;
  };

  // 时间输入组件
  const TimeRangeInput = ({
    startMinutes,
    startSeconds,
    endMinutes,
    endSeconds,
    onStartMinutesChange,
    onStartSecondsChange,
    onEndMinutesChange,
    onEndSecondsChange,
  }: {
    startMinutes: string;
    startSeconds: string;
    endMinutes: string;
    endSeconds: string;
    onStartMinutesChange: (value: string) => void;
    onStartSecondsChange: (value: string) => void;
    onEndMinutesChange: (value: string) => void;
    onEndSecondsChange: (value: string) => void;
  }) => {
    const handleNumberInputChange = (
      value: string,
      setter: (value: string) => void
    ) => {
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
          onChange={(e) =>
            handleNumberInputChange(e.target.value, onStartMinutesChange)
          }
          className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
        />
        <span>:</span>
        {/* 开始时间编辑 - 秒 */}
        <input
          type="number"
          min="0"
          max="59"
          value={startSeconds}
          onChange={(e) =>
            handleNumberInputChange(e.target.value, onStartSecondsChange)
          }
          className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
        />
        <span>-</span>
        {/* 结束时间编辑 - 分钟 */}
        <input
          type="number"
          min="0"
          max="59"
          value={endMinutes}
          onChange={(e) =>
            handleNumberInputChange(e.target.value, onEndMinutesChange)
          }
          className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
        />
        <span>:</span>
        {/* 结束时间编辑 - 秒 */}
        <input
          type="number"
          min="0"
          max="59"
          value={endSeconds}
          onChange={(e) =>
            handleNumberInputChange(e.target.value, onEndSecondsChange)
          }
          className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  };

  const handleTimeInputChange = (
    value: string,
    setter: (time: string) => void
  ) => {
    // 只允许数字和冒号
    const cleanValue = value.replace(/[^0-9:]/g, "");

    // 防止多个冒号
    const parts = cleanValue.split(":");
    if (parts.length > 2) {
      return; // 不允许超过一个冒号
    }

    // 限制格式为 MM:SS
    if (cleanValue.length <= 5) {
      // 自动添加冒号：当输入2位数字且没有冒号时
      if (cleanValue.length === 2 && !cleanValue.includes(":")) {
        setter(cleanValue + ":");
      } else {
        // 验证每部分不超过59
        const [minutes, seconds] = cleanValue.split(":");
        if (minutes && parseInt(minutes) > 59) return;
        if (seconds && parseInt(seconds) > 59) return;

        setter(cleanValue);
      }
    }
  };

  // 开始编辑场次内容项
  const handleEditSceneItem = (item: any) => {
    setEditingSceneItemId(item.id);
    setEditingSceneContent(item.content);
    setEditingSceneType(item.type || 1); // 默认为画面脚本
    setEditingSceneRoleName(item.roleName || ""); // 角色名称

    // 将毫秒格式转换为 mm:ss 格式
    const startTimeMs = item.startTime || 0;
    const endTimeMs = item.endTime || 0;

    const startTimeStr = formatMillisecondsToTime(startTimeMs);
    const endTimeStr = formatMillisecondsToTime(endTimeMs);

    // 解析开始时间
    const [startMin, startSec] = startTimeStr.split(":");
    setEditingSceneStartMinutes(startMin || "00");
    setEditingSceneStartSeconds(startSec || "00");

    // 解析结束时间
    const [endMin, endSec] = endTimeStr.split(":");
    setEditingSceneEndMinutes(endMin || "00");
    setEditingSceneEndSeconds(endSec || "00");
  };

  // 保存场次内容项编辑
  const handleSaveSceneItem = async () => {
    if (editingSceneItemId === null) return;

    // 验证时间逻辑
    const startSeconds =
      parseInt(editingSceneStartMinutes) * 60 +
      parseInt(editingSceneStartSeconds);
    const endSeconds =
      parseInt(editingSceneEndMinutes) * 60 + parseInt(editingSceneEndSeconds);

    if (startSeconds >= endSeconds) {
      toast.error(t("shortplayEntry.validation.startTimeLessThanEnd"));
      return;
    }

    if (!editingSceneContent.trim()) {
      toast.error(t("shortplayEntry.validation.enterContent"));
      return;
    }

    // 将时间转换为毫秒格式
    const startTimeMs = startSeconds * 1000;
    const endTimeMs = endSeconds * 1000;

    try {
      const token = localStorage.getItem("token");

      // 检查是否是新创建的项目（新增项使用负数ID）
      const isNewItem = editingSceneItemId < 0;

      // 获取当前选中场次的sceneId
      const currentSceneData = scenesData.find(
        (scene: any) => scene.sceneTitle === selectedScene
      );
      const sceneId = currentSceneData?.id;

      if (isNewItem && !sceneId) {
        toast.error("请先选择场次");
        return;
      }

      // 构建API请求参数
      let requestBody: any = {
        type: editingSceneType,
        content: editingSceneContent,
        startTime: startTimeMs,
        endTime: endTimeMs,
      };

      // 新增时添加sceneId，编辑时添加id
      if (isNewItem) {
        requestBody.sceneId = sceneId;
      } else {
        requestBody.id = editingSceneItemId;
      }

      // 对话类型时添加角色名
      if (editingSceneType === 2 && editingSceneRoleName) {
        requestBody.roleName = editingSceneRoleName;
      }

      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: isNewItem ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          if (isNewItem) {
            // 新项目：更新本地状态，使用服务器返回的真实ID
            setSceneContent((items) =>
              items.map((item) =>
                item.id === editingSceneItemId
                  ? {
                      ...item,
                      id: result.data?.id || item.id, // 使用服务器返回的真实ID
                      type: editingSceneType,
                      content: editingSceneContent,
                      roleName:
                        editingSceneType === 2
                          ? editingSceneRoleName
                          : undefined,
                      startTime: startTimeMs,
                      endTime: endTimeMs,
                    }
                  : item
              )
            );
          } else {
            // 更新项目：正常更新
            setSceneContent((items) =>
              items.map((item) =>
                item.id === editingSceneItemId
                  ? {
                      ...item,
                      type: editingSceneType,
                      content: editingSceneContent,
                      roleName:
                        editingSceneType === 2
                          ? editingSceneRoleName
                          : undefined,
                      startTime: startTimeMs,
                      endTime: endTimeMs,
                    }
                  : item
              )
            );
          }

          // 重置编辑状态
          setEditingSceneItemId(null);
          setEditingSceneContent("");
          setEditingSceneType(0);
          setEditingSceneRoleName("");
          setEditingSceneStartMinutes("");
          setEditingSceneStartSeconds("");
          setEditingSceneEndMinutes("");
          setEditingSceneEndSeconds("");
        } else {
          toast.error("保存失败：" + (result.message || "未知错误"));
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.saveFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 取消编辑场次内容项
  const handleCancelEditSceneItem = () => {
    // 如果是新创建的项目且取消编辑，则删除该项目
    if (editingSceneItemId !== null && editingSceneItemId < 0) {
      setSceneContent((items) =>
        items.filter((item) => item.id !== editingSceneItemId)
      );
    }

    setEditingSceneItemId(null);
    setEditingSceneContent("");
    setEditingSceneType(0);
    setEditingSceneRoleName("");
    setEditingSceneStartMinutes("");
    setEditingSceneStartSeconds("");
    setEditingSceneEndMinutes("");
    setEditingSceneEndSeconds("");
  };

  // 开始新增场次内容项 - 先显示类型选择
  const handleStartAddNewItem = () => {
    // 音频tab只能新增角色台词
    if (activeTab === "audio") {
      handleCreateNewItem(2);
      return;
    }

    // 定位最后一个新增按钮的位置以放置类型选择弹窗
    const addButtons = document.querySelectorAll(
      '[data-section-add-button="true"]'
    );
    if (addButtons.length > 0) {
      const lastButton = addButtons[addButtons.length - 1] as HTMLElement;
      const rect = lastButton.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8, // 按钮下方一点位置
        left: rect.left + rect.width / 2 - 60, // 让宽度为120px的弹窗相对按钮居中
      });
    }
    setShowTypeSelector(true);
  };

  // 创建新项 - 按照选择的类型
  const handleCreateNewItem = (type: number) => {
    // 生成递减的负数 ID，用于区分新增项目
    const newId = newItemIdCounter.current;
    newItemIdCounter.current--;

    const newItem = {
      id: newId, // 新增项目使用负数 ID
      type: type, // 按照选择的类型
      content: "",
      roleName: type === 2 ? "" : undefined, // 对话类型时有角色名
      startTime: 0, // 毫秒
      endTime: 5000, // 毫秒
    };

    // 根据当前tab选择不同的内容列表
    if (activeTab === "audio") {
      setAudioContent((items) => [newItem, ...items]);
    } else {
      setSceneContent((items) => [newItem, ...items]);
    }

    // 立即进入编辑状态
    setEditingSceneItemId(newItem.id);
    setEditingSceneContent("");
    setEditingSceneType(type);
    setEditingSceneRoleName(type === 2 ? "" : "");
    setEditingSceneStartMinutes("00");
    setEditingSceneStartSeconds("00");
    setEditingSceneEndMinutes("00");
    setEditingSceneEndSeconds("05");

    // 关闭类型选择器
    setShowTypeSelector(false);
  };

  // 时间解析和格式化函数
  const parseTimeRange = (timeRange: string) => {
    // 支持两种格式: "00:00'-00:05'" 和 "00:00-00:05"
    const match = timeRange.match(/(\d{2}):(\d{2})'?-'?(\d{2}):(\d{2})'?/);
    if (match) {
      return {
        startMinutes: match[1],
        startSeconds: match[2],
        endMinutes: match[3],
        endSeconds: match[4],
      };
    }
    return {
      startMinutes: "00",
      startSeconds: "00",
      endMinutes: "00",
      endSeconds: "05",
    };
  };

  const formatTimeRange = (
    startMin: string,
    startSec: string,
    endMin: string,
    endSec: string
  ) => {
    return `${startMin.padStart(2, "0")}:${startSec.padStart(
      2,
      "0"
    )}'-${endMin.padStart(2, "0")}:${endSec.padStart(2, "0")}'`;
  };

  // 编辑时间相关函数
  const startEditTime = (itemId: string, currentTimeRange: string) => {
    const timeData = parseTimeRange(currentTimeRange);

    setEditingTimeId(itemId);
    setEditingStartMinutes(timeData.startMinutes);
    setEditingStartSeconds(timeData.startSeconds);
    setEditingEndMinutes(timeData.endMinutes);
    setEditingEndSeconds(timeData.endSeconds);
  };

  // 更新分镜板时间
  const updateStoryboardTime = async (
    itemId: string,
    startTimeMs: number,
    endTimeMs: number
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/storyboard/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          id: parseInt(itemId),
          startTime: startTimeMs,
          endTime: endTimeMs,
        }),
      });

      if (!response.ok) {
        throw new Error(`更新时间失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        toast.success(t("shortplayEntry.messages.success.timeUpdated"));
        // 刷新分镜板列表
        await loadStoryboardList();
      } else {
        throw new Error(result.message || "更新时间失败");
      }
    } catch (error) {
      toast.error("时间更新失败：" + (error as Error).message);
    }
  };

  // 分镜板时间编辑保存
  const saveStoryboardTimeEdit = async (itemId: string) => {
    // 验证输入是否有效
    if (
      !editingStartMinutes ||
      !editingStartSeconds ||
      !editingEndMinutes ||
      !editingEndSeconds
    )
      return;

    // 将时间转换为毫秒时间戳
    const startMinutes = parseInt(editingStartMinutes);
    const startSeconds = parseInt(editingStartSeconds);
    const endMinutes = parseInt(editingEndMinutes);
    const endSeconds = parseInt(editingEndSeconds);

    const startTimeMs = (startMinutes * 60 + startSeconds) * 1000;
    const endTimeMs = (endMinutes * 60 + endSeconds) * 1000;

    // 调用API更新时间
    await updateStoryboardTime(itemId, startTimeMs, endTimeMs);

    // 清理编辑状态
    setEditingTimeId(null);
    setEditingStartMinutes("");
    setEditingStartSeconds("");
    setEditingEndMinutes("");
    setEditingEndSeconds("");
  };

  const saveTimeEdit = (itemId: string, isImage: boolean = true) => {
    // 验证输入是否有效
    if (
      !editingStartMinutes ||
      !editingStartSeconds ||
      !editingEndMinutes ||
      !editingEndSeconds
    )
      return;

    // 在保存时补零
    const startMin = editingStartMinutes.padStart(2, "0");
    const startSec = editingStartSeconds.padStart(2, "0");
    const endMin = editingEndMinutes.padStart(2, "0");
    const endSec = editingEndSeconds.padStart(2, "0");

    const newTimeRange = formatTimeRange(startMin, startSec, endMin, endSec);

    const updateItems = (items: typeof imageItems) =>
      items.map((item) => {
        if (item.id === itemId) {
          return { ...item, timeRange: newTimeRange };
        }
        return item;
      });

    if (isImage) {
      setImageItems(updateItems);
    } else {
      setVideoItems(updateItems);
    }

    setEditingTimeId(null);
    setEditingStartMinutes("");
    setEditingStartSeconds("");
    setEditingEndMinutes("");
    setEditingEndSeconds("");
  };

  const cancelTimeEdit = () => {
    setEditingTimeId(null);
    setEditingStartMinutes("");
    setEditingStartSeconds("");
    setEditingEndMinutes("");
    setEditingEndSeconds("");
  };

  // 处理时间输入的辅助函数
  const handleTimeInput = (value: string, max: number) => {
    // 只允许数字输入，最多2位
    const numValue = value.replace(/\D/g, "").slice(0, 2);

    if (numValue === "") return "";

    const intValue = parseInt(numValue);
    if (isNaN(intValue)) return "";

    // 如果超过最大值，返回最大值对应的字符串
    if (intValue > max) {
      return max.toString();
    }

    return numValue;
  };

  // 处理进度条拖拽
  // 进度条变化处理
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);

    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
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

  // 格式化时间显示函数（支持小时）
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 计算当前时间
  const videoDuration = videoRef.current?.duration || 0;
  const currentTime = Math.floor((progress / 100) * videoDuration);
  const timeDisplay = formatTime(currentTime);
  const totalTimeDisplay = formatTime(videoDuration);

  // 获取音色列表
  const loadVoiceList = async (status: number, voiceSeriesId?: number) => {
    try {
      const userId = getUserId();
      if (!userId) return [];

      const token = localStorage.getItem("token");
      // 使用传入的 seriesId，如果没有则使用当前的 currentSeriesId
      const apiSeriesId = voiceSeriesId || seriesId;

      const response = await fetch(`${STORYAI_API_BASE}/voice/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          seriesId: apiSeriesId,
          status: status,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          return result.data;
        }
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  // 加载所有音色数据
  const loadAllVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const [configured, available] = await Promise.all([
        loadVoiceList(1), // 已设置的音色
        loadVoiceList(2), // 可用的音色
      ]);
      setConfiguredVoices(configured);
      setAvailableVoices(available);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // 应用音色到已设置列表
  // 删除音色
  const handleDeleteVoice = async (voiceId: string) => {
    const voice = configuredVoices.find((v) => v.voiceId === voiceId);
    const voiceName = voice?.displayName || "该音色";

    Modal.confirm({
      title: "删除音色",
      content: `确定要删除音色"${voiceName}"吗？`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${STORYAI_API_BASE}/voice/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Prompt-Manager-Token": token || "",
            },
            body: JSON.stringify({
              voiceId: voiceId,
              status: 2,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.code === 0) {
              // 删除成功，刷新已设置的音色列表和可用音色列表
              const updatedConfigured = await loadVoiceList(1);
              const updatedAvailable = await loadVoiceList(2);
              setConfiguredVoices(updatedConfigured);
              setAvailableVoices(updatedAvailable);
            } else {
              throw new Error(result.message || "删除音色失败");
            }
          } else {
            throw new Error(`请求失败: ${response.status}`);
          }
        } catch (error) {
          toast.error(
            t("shortplayEntry.messages.error.voiceDeleteFailed", {
              error: (error as Error).message,
            })
          );
        }
      },
    });
  };

  const handleApplyVoice = async (voiceId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/voice/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          voiceId: voiceId,
          status: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 应用成功，刷新已设置的音色列表和可用音色列表
          const updatedConfigured = await loadVoiceList(1);
          const updatedAvailable = await loadVoiceList(2);
          setConfiguredVoices(updatedConfigured);
          setAvailableVoices(updatedAvailable);
          toast.success(t("shortplayEntry.messages.success.voiceApplied"));
        } else {
          throw new Error(result.message || "应用音色失败");
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.voiceApplyFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 开始编辑音色名称
  const handleStartEditVoiceName = (voiceId: string, currentName: string) => {
    setEditingVoiceId(voiceId);
    setEditingVoiceName(currentName);
  };

  // 保存音色名称修改
  const handleSaveVoiceName = async () => {
    if (!editingVoiceId || !editingVoiceName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/voice/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          voiceId: editingVoiceId,
          aliasName: editingVoiceName.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 更新成功，刷新音色列表
          await loadAllVoices();
          toast.success(t("shortplayEntry.messages.success.voiceNameUpdated"));
        } else {
          throw new Error(result.message || "更新音色名称失败");
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.voiceNameUpdateFailed", {
          error: (error as Error).message,
        })
      );
    } finally {
      setEditingVoiceId(null);
      setEditingVoiceName("");
    }
  };

  // 取消编辑音色名称
  const handleCancelEditVoiceName = () => {
    setEditingVoiceId(null);
    setEditingVoiceName("");
  };

  // 处理音色名称编辑的键盘事件
  const handleVoiceNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveVoiceName();
    } else if (e.key === "Escape") {
      handleCancelEditVoiceName();
    }
  };

  // 处理音色选择
  const handleVoiceSelect = async (itemId: string, voiceId: string) => {
    if (!voiceId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/ai/voice/batch-bind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          bindings: [
            {
              voiceId: voiceId,
              subtitleId: parseInt(itemId),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        toast.success(t("shortplayEntry.messages.success.voiceBound"));
      } else {
        throw new Error(result.message || "音色绑定失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.voiceBindFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 播放音频
  const handlePlayAudio = async (itemId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/multimedia/audio/play`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Prompt-Manager-Token": token || "",
          },
          body: JSON.stringify({
            sceneContentId: parseInt(itemId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        if (result.data?.audioUrl) {
          // 直接播放音频，不添加事件监听器
          const audio = new Audio(result.data.audioUrl);
          audio.play().catch((error) => {
            toast.error(
              t("shortplayEntry.messages.success.audioPlaybackFailed")
            );
          });
        } else {
          toast.error(
            t("shortplayEntry.messages.success.voiceStillGenerating")
          );
        }
      } else {
        throw new Error(result.message || "获取音频失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.audioPlayError", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 加载音效列表
  const loadBgmList = async () => {
    setIsLoadingBgm(true);
    try {
      const userId = getUserId();
      if (!userId) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/bgm/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          seriesId: seriesId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setBgmList(result.data);
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingBgm(false);
    }
  };

  // 应用音效到场次
  const handleApplyBgm = async (bgm: any) => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      toast.error("请先选择场次");
      return;
    }

    if (!bgm.attachmentId) {
      toast.error(t("shortplayEntry.userErrors.soundMissingAttachmentId"));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 计算下一个排序号（当前音频内容列表长度 + 1）
      const orderNum = audioContent.length + 1;

      // 从编辑后的时间计算毫秒值
      const startSeconds =
        parseInt(bgmLibraryStartMinutes) * 60 +
        parseInt(bgmLibraryStartSeconds);
      const endSeconds =
        parseInt(bgmLibraryEndMinutes) * 60 + parseInt(bgmLibraryEndSeconds);
      const startTimeMs = startSeconds * 1000;
      const endTimeMs = endSeconds * 1000;

      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          sceneId: sceneId,
          type: 3,
          content: bgm.prompt || bgm.name || "音效",
          orderNum: orderNum,
          fileId: bgm.attachmentId,
          startTime: startTimeMs,
          endTime: endTimeMs,
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 0) {
        toast.success(t("shortplayEntry.messages.success.soundApplied"));
        // 刷新音频内容列表
        await loadAudioContent(sceneId);
      } else {
        throw new Error(result.message || "应用音效失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.soundApplyFailed", {
          error: (error as Error).message,
        })
      );
    }
  };

  // 音效时间编辑处理函数
  const handleBgmStartEditTime = (bgmId: string, timeRange: string) => {
    setBgmEditingTimeId(bgmId);
    const [startTime, endTime] = timeRange.split("-");
    const [startMin, startSec] = startTime.trim().split(":");
    const [endMin, endSec] = endTime.trim().split(":");
    setBgmEditingStartMinutes(startMin || "00");
    setBgmEditingStartSeconds(startSec || "00");
    setBgmEditingEndMinutes(endMin || "00");
    setBgmEditingEndSeconds(endSec || "00");
  };

  const handleBgmSaveTimeEdit = async (bgmId: string) => {
    if (
      !bgmEditingStartMinutes ||
      !bgmEditingStartSeconds ||
      !bgmEditingEndMinutes ||
      !bgmEditingEndSeconds
    )
      return;

    const startSeconds =
      parseInt(bgmEditingStartMinutes) * 60 + parseInt(bgmEditingStartSeconds);
    const endSeconds =
      parseInt(bgmEditingEndMinutes) * 60 + parseInt(bgmEditingEndSeconds);

    if (startSeconds >= endSeconds) {
      toast.error(t("shortplayEntry.validation.startTimeLessThanEnd"));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const bgmItem = audioContent.find(
        (item: any) => item.id.toString() === bgmId
      );

      if (!bgmItem) {
        toast.error(t("shortplayEntry.validation.soundNotFound"));
        return;
      }

      // 将时间转换为毫秒格式
      const startTimeMs = startSeconds * 1000;
      const endTimeMs = endSeconds * 1000;

      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          id: bgmId,
          startTime: startTimeMs,
          endTime: endTimeMs,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0) {
          // 更新本地状态
          setAudioContent((items) =>
            items.map((item) =>
              item.id.toString() === bgmId
                ? { ...item, startTime: startTimeMs, endTime: endTimeMs }
                : item
            )
          );
          setBgmEditingTimeId(null);
          toast.success("时间更新成功");
        } else {
          throw new Error(result.message || "更新失败");
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      toast.error("更新时间失败：" + (error as Error).message);
    }
  };

  const handleBgmCancelTimeEdit = () => {
    setBgmEditingTimeId(null);
  };

  // 图片生成API调用
  const handleImageGenerate = async () => {
    // 如果scenesData为空，尝试使用currentSceneId
    let sceneId: string | number | undefined;

    if (scenesData.length > 0 && selectedScene) {
      // 获取当前选中场次的sceneId
      const currentSceneData = scenesData.find(
        (scene: any) => scene.sceneTitle === selectedScene
      );
      sceneId = currentSceneData?.id;
    } else if (currentSceneId) {
      // 如果没有selectedScene，使用currentSceneId
      sceneId = currentSceneId;
    }

    if (!sceneId && sceneId !== 0) {
      toast.error("请先选择场次");
      return;
    }

    // 验证模型和图片数量的兼容性
    const isT2iModel = imageModel === "doubao-seedream-3.0-t2i";
    const isSingleImageModel = imageModel === "doubao-seededit-3.0-i2i";
    const isMultiImageModel = imageModel === "doubao-seedream-4.0";

    // 文生图模型（doubao-seedream-3.0-t2i）不支持上传图片
    if (isT2iModel && uploadedImages.length > 0) {
      toast.error("doubao-seedream-3.0-t2i 模型只支持文生图，不支持上传图片");
      return;
    }

    // 单图模型（doubao-seededit-3.0-i2i）只支持单张图片
    if (isSingleImageModel && uploadedImages.length === 0) {
      toast.error("doubao-seededit-3.0-i2i 模型需要上传图片进行图生图");
      return;
    }

    if (isSingleImageModel && uploadedImages.length > 1) {
      toast.error("doubao-seededit-3.0-i2i 模型只支持单张图片");
      return;
    }

    // 多图模型（doubao-seedream-4.0）最多10张
    if (isMultiImageModel && uploadedImages.length > 10) {
      toast.error("doubao-seedream-4.0 模型最多支持 10 张图片");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("正在生成图片...");

    try {
      const token = localStorage.getItem("token");

      // 将时间格式 "1s", "2s" 等转换为毫秒
      const durationSeconds = parseInt(videoLength.replace("s", ""));
      const durationMillis = durationSeconds * 1000;

      // 判断是否需要调用图生图API
      // 如果有上传的图片，调用图生图API；否则调用文生图API
      const hasUploadedImages = uploadedImages.length > 0;
      const apiEndpoint = hasUploadedImages
        ? `${STORYAI_API_BASE}/ai/image2image`
        : `${STORYAI_API_BASE}/ai/image/generate`;

      // 构建请求体
      const requestBody: any = {
        sceneId: sceneId,
        userInput: userInput.trim(),
        llmName: imageModel,
        durationMillis: durationMillis,
        imageBackground: `画面风格-${backgroundType}`,
        imageStyle: `画面类型-${style}`,
        relevance: relevanceScore,
      };

      // 如果有上传的图片，添加sourceFileIds参数
      if (hasUploadedImages) {
        requestBody.sourceFileIds = uploadedImages.map((img) => img.fileId);
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 0) {
        setGenerationStatus("生成完成！");
        setUserInput(""); // 清空输入

        // 刷新图片聊天记录列表和分镜板列表
        await loadImageChatHistory();
        await loadStoryboardList();

        toast.success(t("shortplayEntry.messages.success.imageGenerated"));
      } else {
        throw new Error(result.message || "图片生成失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.imageGenerationFailed", {
          error: (error as Error).message,
        })
      );
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
    }
  };

  // 文件上传状态
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 批量文件上传状态
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  // 上传成功的图片文件列表
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ fileId: string; fileUrl: string; fileName: string }>
  >([]);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file || isUploading) return;

    try {
      const userId = getUserId();
      if (!userId) {
        toast.error(t("shortplayEntry.userErrors.userInfoMissing"));
        return;
      }

      // 构建URL参数
      const fileName = encodeURIComponent(file.name);
      const uploadUrl = `${STORYAI_API_BASE}/file/upload?userId=${userId}&fileName=${fileName}`;

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "X-Prompt-Manager-Token": token || "",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 0) {
        // 这里可以处理上传成功后的逻辑，比如保存文件信息
        return result.data;
      } else {
        throw new Error(result.message || "文件上传失败");
      }
    } catch (error) {
      throw error; // 重新抛出错误，让批量上传处理
    }
  };

  // 批量文件上传处理
  const handleMultipleFileUpload = async (files: File[]) => {

    if (!files.length || isUploading) {
      return;
    }
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const results: Array<{
      file: File;
      success: boolean;
      data?: any;
      error?: string;
    }> = [];
    const successfulUploads: Array<{
      fileId: string;
      fileUrl: string;
      fileName: string;
    }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        try {
          const data = await handleFileUpload(file);
          results.push({ file, success: true, data });

          // 记录上传成功的文件信息
          if (data && data.fileId && data.fileUrl) {
            successfulUploads.push({
              fileId: data.fileId,
              fileUrl: data.fileUrl,
              fileName: data.fileName || file.name,
            });
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          results.push({ file, success: false, error: errorMessage });
        }
      }

      // 更新上传成功的图片列表
      if (successfulUploads.length > 0) {
        setUploadedImages((prev) => [...prev, ...successfulUploads]);
      }

      // 统计结果
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      return results;
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  // 移除上传的图片
  const handleRemoveImage = (fileId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.fileId !== fileId));
  };

  // 视频聊天记录数据状态
  const [videoChatHistory, setVideoChatHistory] = useState<any[]>([]);
  const [isLoadingVideoHistory, setIsLoadingVideoHistory] =
    useState<boolean>(false);

  // 图片/视频预览弹窗状态
  const [previewModalVisible, setPreviewModalVisible] =
    useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<"image" | "video">("image");
  const [previewFileId, setPreviewFileId] = useState<string>("");
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewUserPrompt, setPreviewUserPrompt] = useState<string>(""); // 预览时保存的用户提示词
  const [previewSource, setPreviewSource] = useState<"left" | "middle" | null>(
    null
  ); // 弹窗来源：left=左侧列表，middle=中间列表

  // 编辑器状态（题目和选项）
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false); // 是否进入编辑模式
  const [questionTitle, setQuestionTitle] = useState<string>(""); // 题目
  const [options, setOptions] = useState<string[]>([]); // 选项列表
  const [editingTitle, setEditingTitle] = useState<string>(""); // 正在编辑的题目
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false); // 是否在编辑题目
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  ); // 正在编辑的选项索引
  const [editingOptionText, setEditingOptionText] = useState<string>(""); // 正在编辑的选项文本

  // 加载视频聊天记录
  const loadVideoChatHistory = async () => {
    // 获取当前选中场次的sceneId
    const currentSceneData = scenesData.find(
      (scene: any) => scene.sceneTitle === selectedScene
    );
    const sceneId = currentSceneData?.id;

    if (!sceneId) {
      setIsLoadingVideoHistory(false); // 确保loading状态被重置
      return;
    }

    setIsLoadingVideoHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${STORYAI_API_BASE}/chat-history/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          sceneId: sceneId.toString(),
          chatScene: "VIDEO",
          pageNum: 1,
          pageSize: 24,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setVideoChatHistory(result.data.records || result.data || []);
        } else {
          setVideoChatHistory([]);
        }
      } else {
        setVideoChatHistory([]);
      }
    } catch (error) {
      setVideoChatHistory([]);
    } finally {
      setIsLoadingVideoHistory(false);
    }
  };

  // 视频生成状态
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [videoGenerationFileId, setVideoGenerationFileId] = useState<
    string | null
  >(null);

  // 视频生成API调用
  const handleVideoGenerate = async () => {
    // 如果scenesData为空，尝试使用currentSceneId
    let sceneId: string | number | undefined;

    if (scenesData.length > 0 && selectedScene) {
      // 获取当前选中场次的sceneId
      const currentSceneData = scenesData.find(
        (scene: any) => scene.sceneTitle === selectedScene
      );
      sceneId = currentSceneData?.id;
    } else if (currentSceneId) {
      // 如果没有selectedScene，使用currentSceneId
      sceneId = currentSceneId;
    }

    if (!sceneId && sceneId !== 0) {
      toast.error("请先选择场次");
      return;
    }

    setIsGenerating(true); // 使用统一的生成状态
    setIsVideoGenerating(true);
    setGenerationStatus("正在生成视频...");

    try {
      const token = localStorage.getItem("token");

      // 构建请求参数
      const durationSeconds = parseInt(
        singleGenerate?.toString().replace("s", "") || "5"
      );
      const requestBody = {
        sceneId: sceneId.toString(),
        llmName: videoModel,
        userMessage: userInput.trim(),
        useImageGeneration: uploadedImages.length > 0,
        images: uploadedImages.map((img) => img.fileId), // 使用fileId而不是fileUrl
        durationMillis: durationSeconds * 1000, // 转换秒为毫秒
        resolution: resolution, // 分辨率参数
      };

      const response = await fetch(`${STORYAI_API_BASE}/ai/video/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      // 检查是否未登录
      if (result.code === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok && result.code !== 0) {
        throw new Error(`视频生成请求失败: ${response.status}`);
      }

      if (result.code === 0 && result.data) {
        const fileId = result.data.toString();
        setVideoGenerationFileId(fileId);

        toast.success(
          t("shortplayEntry.messages.success.videoGenerationStarted")
        );
        setGenerationStatus("视频生成中，请稍候...");

        // 开始轮询进度
        await pollVideoProgress(fileId);
      } else if (result.code !== 401) {
        throw new Error(result.message || "视频生成失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.videoGenerationFailed", {
          error: (error as Error).message,
        })
      );
      setGenerationStatus("");
      setIsGenerating(false);
      setIsVideoGenerating(false);
    }
  };

  // 轮询视频生成进度
  const pollVideoProgress = async (fileId: string) => {
    const maxPolls = 60; // 最多轮询60次 (5分钟)
    let pollCount = 0;

    const poll = async () => {
      try {
        pollCount++;

        const token = localStorage.getItem("token");
        const response = await fetch(`${STORYAI_API_BASE}/ai/video/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Prompt-Manager-Token": token || "",
          },
          body: JSON.stringify({ fileId: parseInt(fileId) }),
        });

        const result = await response.json();

        // 检查是否未登录
        if (result.code === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok && result.code !== 0) {
          throw new Error(`进度查询失败: ${response.status}`);
        }

        if (result.code === 0 && result.data) {
          const { status, playUrl, errorMessage } = result.data;

          if (status === "COMPLETED") {
            setGenerationStatus("视频生成完成！");
            toast.success("视频生成成功！");

            if (playUrl) {
              // 这里可以添加显示视频的逻辑
            }

            // 视频生成完成后刷新视频聊天记录列表和分镜板列表
            await loadVideoChatHistory();
            await loadStoryboardList();

            setIsGenerating(false);
            setIsVideoGenerating(false);
            setVideoGenerationFileId(null);
            setUserInput(""); // 清空输入
            return;
          } else if (status === "FAILED" || errorMessage) {
            throw new Error(errorMessage || "视频生成失败");
          } else {
            // 继续轮询
            setGenerationStatus(`视频生成中... (${pollCount}/${maxPolls})`);

            if (pollCount < maxPolls) {
              setTimeout(poll, 5000); // 5秒后继续轮询
            } else {
              throw new Error("视频生成超时");
            }
          }
        } else {
          throw new Error(result.message || "进度查询失败");
        }
      } catch (error) {
        toast.error(
          t("shortplayEntry.messages.error.videoGenerationFailed", {
            error: (error as Error).message,
          })
        );
        setIsGenerating(false);
        setIsVideoGenerating(false);
        setVideoGenerationFileId(null);
        setGenerationStatus("");
      }
    };

    // 开始第一次轮询
    setTimeout(poll, 2000); // 2秒后开始轮询
  };

  // 音效生成API调用
  const handleBgmGenerate = async () => {
    if (!userInput.trim()) {
      toast.error(t("shortplayEntry.input.description"));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("正在生成音效...");

    try {
      const userId = getUserId();
      if (!userId) {
        toast.error(t("shortplayEntry.userErrors.userInfoIncomplete"));
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${STORYAI_API_BASE}/ai/bgm/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          seriesId: seriesId,
          userId: userId,
          style: style,
          userInput: userInput.trim(),
          llmName: audioModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 0) {
        setGenerationStatus("生成完成！");
        setUserInput(""); // 清空输入

        // 刷新音效列表
        await loadBgmList();
      } else {
        throw new Error(result.message || "音效生成失败");
      }
    } catch (error) {
      toast.error(
        t("shortplayEntry.messages.error.soundGenerationFailed", {
          error: (error as Error).message,
        })
      );
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
    }
  };
  const loadSceneContent = async (sceneId: number) => {
    setIsLoadingSceneContent(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/scene/content?sceneId=${sceneId}&type=1&type=2`,
        {
          method: "GET",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setSceneContent(result.data);
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingSceneContent(false);
    }
  };

  // 加载音频内容（音频Tab专用）
  const loadAudioContent = async (sceneId: number) => {
    setIsLoadingAudioContent(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/scene/content?sceneId=${sceneId}&type=2&type=3`,
        {
          method: "GET",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.code === 0 && result.data) {
          setAudioContent(result.data);
        } else {
          setAudioContent([]);
        }
      } else {
        setAudioContent([]);
      }
    } catch (error) {
      setAudioContent([]);
    } finally {
      setIsLoadingAudioContent(false);
    }
  };

  // 用户数据加载状态
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);

  // 根据URL中的seriesId加载数据
  const loadSeriesBySeriesId = async (targetSeriesId: string) => {
    if (isLoadingUserData) return;
    setIsLoadingUserData(true);

    try {
      const token = localStorage.getItem("token");
      // 先获取series详情，获取seriesId并存储到localStorage
      const seriesDetailUrl = `${STORYAI_API_BASE}/series/detail?seriesId=${targetSeriesId}`;

      const seriesResponse = await fetch(seriesDetailUrl, {
        method: "GET",
        headers: {
          "X-Prompt-Manager-Token": token || "",
        },
      });

      if (seriesResponse.ok) {
        const seriesResult = await seriesResponse.json();

        // 检查是否未登录
        if (seriesResult.code === 401) {
          handleUnauthorized();
          return;
        }

        if (seriesResult.code === 0 && seriesResult.data) {
          const {
            seriesContent,
            seriesId: returnedSeriesId,
          } = seriesResult.data;

          // 设置seriesId
          const finalSeriesId = returnedSeriesId || targetSeriesId;
          if (finalSeriesId) {
            setSeriesId(finalSeriesId);
            // 存储seriesId到localStorage供后续使用
            localStorage.setItem("currentSeriesId", finalSeriesId);
          }

          // 设置历史内容
          if (seriesContent) {
            setGeneratedContent(seriesContent);
          }

          // 使用localStorage中的seriesId获取场景列表
          const storedSeriesId = localStorage.getItem("currentSeriesId") || finalSeriesId;
          const sceneUrl = `${STORYAI_API_BASE}/scene/${storedSeriesId}`;
          const sceneResponse = await fetch(sceneUrl, {
            method: "GET",
            headers: {
              "X-Prompt-Manager-Token": token || "",
            },
          });

          if (sceneResponse.ok) {
            const sceneResult = await sceneResponse.json();

            // 检查是否未登录
            if (sceneResult.code === 401) {
              handleUnauthorized();
              return;
            }

            if (sceneResult.code === 0 && sceneResult.data) {
              const scenes = sceneResult.data;

              // 设置场景数据
              if (scenes && scenes.length > 0) {
                setScenesData(scenes);
                const sceneOptions = scenes.map((scene: any) => scene.sceneTitle);
                setSceneOptions(sceneOptions);
                setSelectedScene(sceneOptions[0] || "");
                isCurrentSceneIdInitialized.current = false;

                // 设置第一个场景为当前场景
                const firstScene = scenes[0];
                if (firstScene?.id) {
                  setCurrentSceneId(firstScene.id);
                }
              }
            }
          }
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // 获取用户历史数据
  const loadUserData = async () => {
    // 防止重复调用
    if (isLoadingUserData) return;
    setIsLoadingUserData(true);

    try {
      const userId = getUserId();
      if (!userId) return;

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${STORYAI_API_BASE}/series/detail?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "X-Prompt-Manager-Token": token || "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        // 检查是否未登录
        if (result.code === 401) {
          handleUnauthorized();
          return;
        }

        if (result.code === 0 && result.data) {
          const {
            seriesContent,
            seriesId: returnedSeriesId,
          } = result.data;

          // 如果有seriesId则设置，否则mock值为9
          const finalSeriesId = returnedSeriesId || "9";
          if (finalSeriesId) {
            setSeriesId(finalSeriesId);
            // 存储seriesId到localStorage供后续使用
            localStorage.setItem("currentSeriesId", finalSeriesId);
          }

          // 如果有历史内容，则显示
          if (seriesContent) {
            setGeneratedContent(seriesContent);
          }

          // 使用localStorage中的seriesId获取场景列表
          const storedSeriesId = localStorage.getItem("currentSeriesId") || finalSeriesId;
          const sceneUrl = `${STORYAI_API_BASE}/scene/${storedSeriesId}`;
          const sceneResponse = await fetch(sceneUrl, {
            method: "GET",
            headers: {
              "X-Prompt-Manager-Token": token || "",
            },
          });

          if (sceneResponse.ok) {
            const sceneResult = await sceneResponse.json();

            // 检查是否未登录
            if (sceneResult.code === 401) {
              handleUnauthorized();
              return;
            }

            if (sceneResult.code === 0 && sceneResult.data) {
              const scenes = sceneResult.data;
              // 如果有场次数据，则更新下拉列表
              if (scenes && scenes.length > 0) {
                setScenesData(scenes);
                const sceneOptions = scenes.map((scene: any) => scene.sceneTitle);
                setSceneOptions(sceneOptions);
                setSelectedScene(sceneOptions[0] || "");
                // 重置初始化标志，使得新的场景列表会触发 currentSceneId 的初始化
                isCurrentSceneIdInitialized.current = false;
              }
            }
          }
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // 组件加载时，根据URL参数决定加载哪个数据源
  React.useEffect(() => {
    if (urlSeriesId) {
      // 如果URL中有seriesId参数，加载指定的series数据
      loadSeriesBySeriesId(urlSeriesId);
    } else {
      // 否则加载用户的历史数据
      loadUserData();
    }
  }, [urlSeriesId]);

  // 当 scenesData 有数据但 currentSceneId 还未初始化时，初始化为第一个场景
  React.useEffect(() => {
    console.log("🔄 [useEffect scenesData] 场次数据变化:", scenesData.length, "已初始化:", isCurrentSceneIdInitialized.current);
    if (scenesData.length > 0 && !isCurrentSceneIdInitialized.current) {
      console.log("✅ [useEffect scenesData] 设置 currentSceneId:", scenesData[0].id);
      setCurrentSceneId(scenesData[0].id);
      isCurrentSceneIdInitialized.current = true;
    }
  }, [scenesData]);

  // 当 currentSceneId 改变时，加载该场景的内容
  React.useEffect(() => {
    if (
      currentSceneId &&
      (activeTab === "script" ||
        activeTab === "audio" ||
        activeTab === "image" ||
        activeTab === "video")
    ) {
      loadSceneContent(currentSceneId as number);
    }
  }, [currentSceneId, activeTab]);

  // Tab切换时加载数据
  React.useEffect(() => {
    if (activeTab === "script") {
      // 加载剧本内容列表
      const currentSceneData = scenesData.find(
        (scene: any) => scene.sceneTitle === selectedScene
      );
      if (currentSceneData?.id) {
        loadSceneContent(currentSceneData.id);
      }
    } else if (activeTab === "audio") {
      // 加载音频内容列表（仅在切换Tab或场次时）
      const currentSceneData = scenesData.find(
        (scene: any) => scene.sceneTitle === selectedScene
      );
      if (currentSceneData?.id) {
        loadAudioContent(currentSceneData.id);
      }

      // 首次进入音频Tab时也加载资源
      if (audioType === "voice") {
        loadAllVoices();
      } else {
        loadBgmList();
      }
    } else if (activeTab === "image") {
      loadImageChatHistory();
      loadStoryboardList();
    } else if (activeTab === "video") {
      loadVideoChatHistory();
      loadStoryboardList();
    }
  }, [activeTab, selectedScene]);

  // 音色/音效切换时只加载左侧资源（不重新加载中间列表）
  React.useEffect(() => {
    // 只有当audioType真正改变且在音频Tab中时才执行
    if (activeTab === "audio") {
      if (audioType === "voice") {
        loadAllVoices();
        setAudioModel("minmax");
      } else {
        loadBgmList();
        setAudioModel("minmax");
      }
      // 更新ref
      prevAudioTypeRef.current = audioType;
    }
  }, [audioType, activeTab]);

  // 音色生成API调用
  const handleAudioGenerate = async () => {
    if (!userInput.trim()) {
      toast.error(t("shortplayEntry.input.description"));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("正在生成音色...");

    try {
      // 从localStorage获取user信息
      const userId = getUserId();
      if (!userId) {
        toast.error(t("shortplayEntry.userErrors.userInfoIncomplete"));
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${STORYAI_API_BASE}/ai/voice/design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          prompt: userInput.trim(),
          userId: userId,
          seriesId: seriesId,
          llmName: audioModel,
          gender: audioGender,
        }),
      });

      const result = await response.json();

      // 检查是否未登录
      if (result.code === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      if (result.code === 0) {
        // 生成成功，刷新音频列表
        setGenerationStatus("生成完成！");
        setUserInput(""); // 清空输入

        // 刷新音频列表（可用音色列表）
        await loadAllVoices();
      } else {
        throw new Error(result.message || "音色生成失败");
      }
    } catch (error) {
      toast.error("音色生成失败：" + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
    }
  };
  const handleGenerate = async () => {
    if (activeTab === "video") {
      // 视频生成
      await handleVideoGenerate();
      return;
    }

    // 原有的剧本生成逻辑
    if (!userInput.trim()) {
      toast.error(t("shortplayEntry.input.description"));
      return;
    }

    // 保存用户输入，用于后续对话记录
    const savedUserInput = userInput.trim();

    setIsGenerating(true);
    setGenerationStatus("正在创建剧本任务...");

    try {
      // 从sessionStorage获取userId（在LoginPage中设置）
      let userId = sessionStorage.getItem("userId") || "";

      if (!userId) {
        toast.error(t("shortplayEntry.userErrors.userInfoIncomplete"));
        return;
      }

      // 从localStorage获取token
      const token = localStorage.getItem("token");

      // 映射language值
      const languageMap: Record<string, string> = {
        'zh-CN': '中文',
        'en-US': '英文',
        'ja-JP': '日语',
        'ko-KR': '韩文',
      };
      const mappedLanguage = languageMap[language] || language;

      // 第一步：创建剧本生成任务
      const response = await fetch(`${STORYAI_API_BASE}/series/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Prompt-Manager-Token": token || "",
        },
        body: JSON.stringify({
          userId: userId,
          userInput: savedUserInput,
          provider: selectedModel,
          language: mappedLanguage,
        }),
      });

      const result = await response.json();

      // 检查是否未登录
      if (result.code === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      if (result.code !== 0 || !result.data?.seriesId) {
        throw new Error(result.message || "创建任务失败");
      }

      const seriesId = result.data.seriesId;
      setSeriesId(seriesId);
      // 保存seriesId到localStorage，用于页面初始化时加载对话
      localStorage.setItem("currentSeriesId", seriesId.toString());
      setGenerationStatus("剧本生成中，请稍候...");

      // 第二步：轮询获取生成结果
      const pollForResult = async (): Promise<void> => {
        try {
          const detailResponse = await fetch(
            `${STORYAI_API_BASE}/series/detail?seriesId=${seriesId}`,
            {
              method: "GET",
              headers: {
                "X-Prompt-Manager-Token": token || "",
              },
            }
          );

          const detailResult = await detailResponse.json();

          // 检查是否未登录
          if (detailResult.code === 401) {
            handleUnauthorized();
            return;
          }

          if (!detailResponse.ok) {
            throw new Error(`获取详情失败: ${detailResponse.status}`);
          }

          if (detailResult.code === 0 && detailResult.data) {
            const {
              generationStatus: status,
              seriesContent,
              scenes,
              seriesId: returnedSeriesId,
            } = detailResult.data;

            // 设置seriesId
            if (returnedSeriesId) {
              setSeriesId(returnedSeriesId);
            }

            if (status === "COMPLETED") {
              // 生成完成
              setGenerationStatus("生成完成！");
              setGeneratedContent(seriesContent || "");

              // 添加对话记录 - 使用保存的用户输入
              const userMessage = savedUserInput;
              const aiMessage = seriesContent || '';

              console.log('📝 [对话记录检查] userMessage:', userMessage);
              console.log('📝 [对话记录检查] aiMessage长度:', aiMessage.length);
              console.log('📝 [对话记录检查] aiMessage前100字:', aiMessage.substring(0, 100));

              if (userMessage && aiMessage) {
                const newMessages: ConversationMessage[] = [
                  {
                    id: Date.now().toString(),
                    type: 'user',
                    content: userMessage,
                    timestamp: Date.now(),
                  },
                  {
                    id: (Date.now() + 1).toString(),
                    type: 'assistant',
                    content: aiMessage,
                    timestamp: Date.now(),
                  },
                ];
                console.log('✅ [添加对话记录] 新消息:', newMessages);
                setConversationHistory((prev) => {
                  const updated = [...prev, ...newMessages];
                  console.log('✅ [更新对话历史] 总消息数:', updated.length);
                  console.log('✅ [更新对话历史] 完整历史:', updated);
                  return updated;
                });
              } else {
                console.warn('⚠️ [对话记录] 用户消息或AI消息为空', { userMessage, aiMessage });
              }

              // 使用 /scene/{seriesId} API 获取完整的场景列表数据
              try {
                const storedSeriesId = returnedSeriesId || seriesId;
                const sceneUrl = `${STORYAI_API_BASE}/scene/${storedSeriesId}`;
                const sceneResponse = await fetch(sceneUrl, {
                  method: "GET",
                  headers: {
                    "X-Prompt-Manager-Token": token || "",
                  },
                });

                if (sceneResponse.ok) {
                  const sceneResult = await sceneResponse.json();
                  console.log("✅ [剧本生成完成] 场景列表API响应:", sceneResult);

                  if (sceneResult.code === 0 && sceneResult.data) {
                    const scenesList = sceneResult.data;
                    if (scenesList && scenesList.length > 0) {
                      console.log("✅ [剧本生成完成] 场次数据:", scenesList);
                      setScenesData(scenesList);
                      const newSceneOptions = scenesList.map(
                        (scene: any) => scene.sceneTitle
                      );
                      console.log("✅ [剧本生成完成] 场次选项:", newSceneOptions);
                      setSceneOptions(newSceneOptions);
                      setSelectedScene(newSceneOptions[0] || "");
                      console.log("✅ [剧本生成完成] 已设置场次选项和选中场次");
                      // 重置初始化标志，使得新的场景列表会触发 currentSceneId 的初始化
                      isCurrentSceneIdInitialized.current = false;

                      // 刷新第一个场次的内容
                      if (scenesList[0]?.id) {
                        await loadSceneContent(scenesList[0].id);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("❌ [剧本生成完成] 获取场景列表失败:", error);
              }

              setUserInput(""); // 清空输入
              setIsGenerating(false);
              toast.success("剧本生成完成！");
            } else if (status === "PROCESSING") {
              // 继续轮询
              setGenerationStatus("正在生成剧本内容...");
              setTimeout(pollForResult, 3000); // 3秒后重试
            } else if (status === "FAILED") {
              // 生成失败
              setIsGenerating(false);
              setGenerationStatus("");
              toast.error(
                t("shortplayEntry.messages.error.videoGenerationRetry")
              );
            } else {
              // 其他状态，可能是失败
              setIsGenerating(false);
              setGenerationStatus("");
              toast.error(`生成状态异常: ${status}`);
            }
          } else {
            throw new Error(detailResult.message || "获取生成状态失败");
          }
        } catch (pollError) {
          // 继续重试轮询，不立即失败
          setTimeout(pollForResult, 5000); // 5秒后重试
        }
      };

      // 开始轮询
      setTimeout(pollForResult, 2000); // 2秒后开始第一次轮询
    } catch (error) {
      toast.error(
        t("shortplayEntry.input.generateFailed") +
          ": " +
          (error as Error).message
      );
      setIsGenerating(false);
      setGenerationStatus("");
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <div className="flex flex-grow overflow-hidden">
          {/* 左侧面板 - 一键创作 (均分) */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
            {/* 顶部Logo和标题区 */}
            <div
              className="bg-white flex items-center flex-shrink-0"
              style={{
                height: "64px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <svg
                    width="40"
                    height="36"
                    viewBox="0 0 56 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* 边框 */}
                    <rect width="56" height="51" rx="10" fill="#3E83F6" />
                    {/* Logo内容 - 星星 */}
                    <g transform="translate(28, 25.5) scale(0.7, 0.7) translate(-19, -19)">
                      <path
                        d="M34.8333 15.3109C34.7333 15.0213 34.5515 14.767 34.3098 14.5787C34.0681 14.3904 33.7769 14.2762 33.4717 14.2501L24.4625 12.9359L20.425 4.75011C20.2954 4.48241 20.0929 4.25665 19.8409 4.09868C19.5889 3.94072 19.2974 3.85693 19 3.85693C18.7026 3.85693 18.4111 3.94072 18.1591 4.09868C17.9071 4.25665 17.7047 4.48241 17.575 4.75011L13.5375 12.9201L4.52834 14.2501C4.2353 14.2918 3.9598 14.4147 3.73311 14.605C3.50642 14.7953 3.33761 15.0454 3.24584 15.3268C3.16183 15.6018 3.1543 15.8944 3.22403 16.1734C3.29377 16.4523 3.43815 16.707 3.64167 16.9101L10.1808 23.2434L8.59751 32.2368C8.54098 32.5336 8.57058 32.8404 8.6828 33.121C8.79503 33.4015 8.98519 33.6441 9.23084 33.8201C9.47027 33.9913 9.75266 34.0923 10.0463 34.1119C10.34 34.1315 10.6333 34.0688 10.8933 33.9309L19 29.7034L27.075 33.9468C27.2972 34.0721 27.5482 34.1376 27.8033 34.1368C28.1387 34.138 28.4658 34.0326 28.7375 33.8359C28.9832 33.66 29.1733 33.4174 29.2855 33.1368C29.3978 32.8563 29.4274 32.5494 29.3708 32.2526L27.7875 23.2593L34.3267 16.9259C34.5553 16.7323 34.7242 16.4777 34.8139 16.1918C34.9036 15.9059 34.9103 15.6005 34.8333 15.3109ZM25.0958 21.6443C24.9102 21.8239 24.7712 22.0462 24.6912 22.2918C24.6112 22.5374 24.5924 22.7989 24.6367 23.0534L25.7767 29.6876L19.8233 26.5209C19.5943 26.399 19.3387 26.3352 19.0792 26.3352C18.8196 26.3352 18.5641 26.399 18.335 26.5209L12.3817 29.6876L13.5217 23.0534C13.5659 22.7989 13.5472 22.5374 13.4671 22.2918C13.3871 22.0462 13.2482 21.8239 13.0625 21.6443L8.31251 16.8943L14.9783 15.9284C15.2348 15.8928 15.4787 15.7947 15.6885 15.6429C15.8983 15.4911 16.0676 15.2901 16.1817 15.0576L19 9.02511L21.9767 15.0734C22.0907 15.3059 22.2601 15.5069 22.4699 15.6587C22.6797 15.8105 22.9235 15.9086 23.18 15.9443L29.8458 16.9101L25.0958 21.6443Z"
                        fill="white"
                      />
                    </g>
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    {t("shortplayEntry.sidebar.aiCreation")}
                  </span>
                </div>

                {/* Ant Design Segmented组件 - 带边框和平滑过渡动画 */}
                <div>
                  <Segmented
                    value={activeTab}
                    onChange={(value) => {
                      // 检查是否有未保存的编辑
                      if (editingSceneItemId !== null) {
                        Modal.confirm({
                          title: t("shortplayEntry.messages.unsavedChanges"),
                          content: t("shortplayEntry.messages.unsavedChangesDetail"),
                          okText: t("shortplayEntry.buttons.discard"),
                          cancelText: t("shortplayEntry.buttons.cancel"),
                          okButtonProps: { danger: true },
                          onOk() {
                            // 取消编辑并切换tab
                            handleCancelEditSceneItem();
                            setActiveTab(
                              value as "script" | "audio" | "image" | "video"
                            );
                            setUserInput("");
                          },
                        });
                      } else {
                        setActiveTab(
                          value as "script" | "audio" | "image" | "video"
                        );
                        setUserInput("");
                      }
                    }}
                    options={[
                      {
                        label: t("shortplayEntry.tabs.script"),
                        value: "script",
                      },
                      { label: t("shortplayEntry.tabs.image"), value: "image" },
                      { label: t("shortplayEntry.tabs.video"), value: "video" },
                      { label: t("shortplayEntry.tabs.audio"), value: "audio" },
                    ]}
                    style={{
                      width: "100%",
                      border: "1px solid #3E83F6",
                      borderRadius: "29px",
                    }}
                    className="[&.ant-segmented]:!border [&.ant-segmented]:!border-[#3E83F6]! [&.ant-segmented]:!rounded-[29px]! [&_.ant-segmented-item-selected]:!bg-[#3E83F6] [&_.ant-segmented-thumb]:!bg-[#3E83F6] [&_.ant-segmented-item]:!rounded-[28px] [&_.ant-segmented-thumb]:!transition-all [&_.ant-segmented-thumb]:!duration-300 [&_.ant-segmented-thumb]:!ease-in-out [&_.ant-segmented-item:not(.ant-segmented-item-selected):hover]:!bg-transparent [&_.ant-segmented-item:not(.ant-segmented-item-selected):hover]:!text-white [&_.ant-segmented-item-selected:hover]:!bg-[#3E83F6] [&_.ant-segmented-item-selected:hover]:!text-white"
                  />
                </div>
              </div>
            </div>

            {/* 音频tab专属：音色选择和已设置的音色区域（头部下方） */}
            {activeTab === "audio" && (
              <div className="px-4 pb-2 flex-shrink-0">
                <AudioResourcePanel
                  audioType={audioType}
                  onAudioTypeChange={setAudioType}
                  configuredVoices={configuredVoices}
                  isLoadingVoices={isLoadingVoices}
                  isConfiguredVoicesExpanded={isConfiguredVoicesExpanded}
                  onConfiguredVoicesExpandedChange={
                    setIsConfiguredVoicesExpanded
                  }
                  editingVoiceId={editingVoiceId}
                  editingVoiceName={editingVoiceName}
                  onEditingVoiceNameChange={setEditingVoiceName}
                  onStartEditVoiceName={handleStartEditVoiceName}
                  onSaveVoiceName={handleSaveVoiceName}
                  onCancelEditVoiceName={handleCancelEditVoiceName}
                  onVoiceNameKeyDown={handleVoiceNameKeyDown}
                  onDeleteVoice={handleDeleteVoice}
                />
              </div>
            )}

            {/* 内容区域 */}
            <div className="flex-grow min-h-0 overflow-hidden p-2.5">
              <div
                className={`bg-white rounded-lg h-full w-full flex flex-col overflow-hidden ${
                  activeTab === "script" ? "" : "border border-gray-200"
                }`}
              >
                {/* 卡片内容区域 */}
                <div
                  className="flex-grow overflow-auto min-h-0 w-full"
                  style={{ padding: "10px 10px 40px 10px" }}
                >
                  {activeTab === "script" && (
                    <ChatConversation
                      messages={conversationHistory}
                      isLoading={isGenerating}
                    />
                  )}

                  {activeTab === "audio" && (
                    <div className="space-y-4">
                      {/* 可用音色/音效列表 - 居上排列 */}
                      <div className="space-y-2">
                        {audioType === "voice" ? (
                          <>
                            {isLoadingVoices ? (
                              <div className="flex items-center justify-center p-4 text-gray-500">
                                <Icon
                                  icon="ri:loader-4-line"
                                  className="w-4 h-4 animate-spin mr-2"
                                />
                                加载中...
                              </div>
                            ) : (
                              availableVoices.map((voice) => (
                                <div
                                  key={voice.voiceId}
                                  className="flex items-center space-x-3 py-3"
                                >
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Icon
                                      icon="ri:music-2-line"
                                      className="w-4 h-4 text-white"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                      {voice.voiceName}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      className="px-1 py-0.5 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                                      onClick={() => {
                                        if (voice.sampleAudioUrl) {
                                          const audio = new Audio(
                                            voice.sampleAudioUrl
                                          );
                                          audio.play();
                                        }
                                      }}
                                    >
                                      {t("shortplayEntry.buttons.play")}
                                    </button>
                                    <button
                                      className="px-1 py-0.5 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                                      onClick={() =>
                                        handleApplyVoice(voice.voiceId)
                                      }
                                    >
                                      {t("shortplayEntry.buttons.apply")}
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        ) : (
                          <>
                            {isLoadingBgm ? (
                              <div className="flex items-center justify-center p-4 text-gray-500">
                                <Icon
                                  icon="ri:loader-4-line"
                                  className="w-4 h-4 animate-spin mr-2"
                                />
                                {t("shortplayEntry.status.loading")}
                              </div>
                            ) : (
                              bgmList.map((bgm, index) => (
                                <div
                                  key={bgm.id || index}
                                  className="py-3 space-y-2"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Icon
                                        icon="ri:music-2-line"
                                        className="w-4 h-4 text-white"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-800">
                                        {bgm.prompt ||
                                          bgm.name ||
                                          bgm.title ||
                                          t(
                                            "shortplayEntry.ui.defaultSoundName"
                                          )}
                                      </div>
                                    </div>
                                    <button
                                      className="px-1 py-0.5 text-sm rounded flex items-center space-x-1"
                                      style={{
                                        color: "#3E83F6",
                                        borderColor: "#3E83F6",
                                        borderWidth: "1px",
                                      }}
                                      onClick={() => handleApplyBgm(bgm)}
                                    >
                                      <Icon
                                        icon="ri:check-line"
                                        className="w-3 h-3"
                                      />
                                      <span>
                                        {t("shortplayEntry.buttons.apply")}
                                      </span>
                                    </button>
                                  </div>
                                  {bgm.description && (
                                    <div className="text-xs text-gray-500 pl-11">
                                      {bgm.description}
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2 pl-11">
                                    <span className="text-sm text-gray-600">
                                      {t(
                                        "shortplayEntry.preview.playbackLocation"
                                      )}
                                    </span>
                                    {bgmLibraryEditingId === bgm.id ? (
                                      <div className="flex items-center space-x-1">
                                        <TimeRangeInput
                                          startMinutes={bgmLibraryStartMinutes}
                                          startSeconds={bgmLibraryStartSeconds}
                                          endMinutes={bgmLibraryEndMinutes}
                                          endSeconds={bgmLibraryEndSeconds}
                                          onStartMinutesChange={
                                            setBgmLibraryStartMinutes
                                          }
                                          onStartSecondsChange={
                                            setBgmLibraryStartSeconds
                                          }
                                          onEndMinutesChange={
                                            setBgmLibraryEndMinutes
                                          }
                                          onEndSecondsChange={
                                            setBgmLibraryEndSeconds
                                          }
                                        />
                                        <button
                                          onClick={() => {
                                            setBgmLibraryDisplayTime(
                                              `${bgmLibraryStartMinutes}'${bgmLibraryStartSeconds}'-${bgmLibraryEndMinutes}'${bgmLibraryEndSeconds}'`
                                            );
                                            setBgmLibraryEditingId(null);
                                          }}
                                          className="text-green-600 hover:text-green-800 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
                                        >
                                          <Icon
                                            icon="ri:check-line"
                                            className="w-3 h-3"
                                          />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setBgmLibraryEditingId(null)
                                          }
                                          className="text-red-600 hover:text-red-800 p-0 border-0 bg-transparent outline-none cursor-pointer"
                                        >
                                          <Icon
                                            icon="ri:close-line"
                                            className="w-3 h-3"
                                          />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1">
                                        <span
                                          style={{
                                            color: "#000",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {bgmLibraryDisplayTime}
                                        </span>
                                        <button
                                          onClick={() =>
                                            setBgmLibraryEditingId(bgm.id)
                                          }
                                          className="text-gray-400 hover:text-blue-600 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
                                        >
                                          <Icon
                                            icon="ri:edit-line"
                                            className="w-3 h-3"
                                          />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {/* 自定义进度条 + audio 元素 */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: "8px",
                                      paddingLeft: "44px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                      }}
                                    >
                                      {/* 播放控制 */}
                                      <audio
                                        key={bgm.id}
                                        ref={(el) => {
                                          if (el) {
                                            audioRefMap.current[bgm.id || ""] =
                                              el;
                                            el.volume = bgmVolume / 10;
                                          }
                                        }}
                                        onPlay={() => setPlayingBgmId(bgm.id)}
                                        onPause={() => setPlayingBgmId(null)}
                                        onEnded={() => setPlayingBgmId(null)}
                                        src={bgm.audioUrl}
                                        style={{
                                          width: "100%",
                                          height: "28px",
                                        }}
                                        controls
                                      />
                                    </div>
                                    <div
                                      className="relative inline-flex items-center border border-blue-500 rounded-lg text-blue-500 appearance-none flex-shrink-0"
                                      style={{
                                        padding: "0 4px",
                                        height: "28px",
                                        display: "none",
                                      }}
                                    >
                                      <Icon
                                        icon="ri:volume-up-line"
                                        className="w-4 h-4"
                                      />
                                      <select
                                        value={bgmVolume}
                                        onChange={(e) =>
                                          setBgmVolume(parseInt(e.target.value))
                                        }
                                        className="text-sm font-medium bg-transparent border-0 focus:outline-none cursor-pointer text-blue-500 appearance-none ml-1 pr-5"
                                      >
                                        {Array.from(
                                          { length: 10 },
                                          (_, i) => i + 1
                                        ).map((num) => (
                                          <option
                                            key={num}
                                            value={num}
                                            className="text-black"
                                          >
                                            {num}
                                          </option>
                                        ))}
                                      </select>
                                      <Icon
                                        icon="ri:arrow-down-s-line"
                                        className="w-4 h-4 absolute pointer-events-none"
                                        style={{ right: "2px" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "image" && (
                    <div className="space-y-4">
                      {/* 图片聊天记录内容区域 */}
                      <div className="space-y-3 pt-5">
                        {isLoadingImageHistory ? (
                          <div className="flex items-center justify-center p-4 text-gray-500">
                            <Icon
                              icon="ri:loader-4-line"
                              className="w-4 h-4 animate-spin mr-2"
                            />
                            加载中...
                          </div>
                        ) : imageChatHistory.length > 0 ? (
                          <div className="space-y-4">
                            {imageChatHistory
                              .filter(
                                (message: any) => message.type === "AI_ANSWER"
                              )
                              .map((message, messageIndex) => (
                                <div
                                  key={`message-${messageIndex}`}
                                  className="flex items-start justify-start gap-2"
                                >
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                    <Icon
                                      icon="ri:user-fill"
                                      className="w-3.5 h-3.5 text-gray-600"
                                    />
                                  </div>
                                  <div className="max-w-2xl rounded-2xl rounded-tl-none">
                                    {message.type === "AI_ANSWER" ? (
                                      // AI回答 - 显示files中的图片，横向展示
                                      <div>
                                        {message.content && (
                                          <div className="text-sm text-gray-700 mb-2">
                                            {message.userPrompt}
                                          </div>
                                        )}
                                        {message.files &&
                                          message.files.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                              {message.files.map(
                                                (file, fileIndex) => (
                                                  <div
                                                    key={`file-${fileIndex}`}
                                                    className="flex flex-col items-center gap-1 relative group"
                                                  >
                                                    <div
                                                      className="w-20 bg-gray-200 overflow-hidden flex-shrink-0 relative"
                                                      style={{
                                                        aspectRatio: "9 / 16",
                                                      }}
                                                    >
                                                      <img
                                                        src={file.downloadUrl}
                                                        alt={
                                                          file.fileName ||
                                                          "生成的图片"
                                                        }
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onError={(e) => {
                                                          e.currentTarget.style.display =
                                                            "none";
                                                        }}
                                                      />
                                                      {/* 悬停时显示的按钮覆盖层 */}
                                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 rounded-lg bg-black bg-opacity-50">
                                                        <button
                                                          onClick={() => {
                                                            setPreviewUrl(
                                                              file.downloadUrl
                                                            );
                                                            setPreviewType(
                                                              "image"
                                                            );
                                                            setPreviewFileId(
                                                              file.fileId
                                                            );
                                                            setPreviewFileName(
                                                              file.fileName
                                                            );
                                                            setPreviewUserPrompt(
                                                              message.userPrompt ||
                                                                ""
                                                            );
                                                            setPreviewSource(
                                                              "left"
                                                            );
                                                            setPreviewModalVisible(
                                                              true
                                                            );
                                                          }}
                                                          className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium hover:text-gray-200 transition-colors bg-transparent"
                                                          style={{
                                                            border:
                                                              "1px solid #3E83F6",
                                                            borderRadius: "4px",
                                                          }}
                                                          title={t(
                                                            "shortplayEntry.tooltips.viewOriginal"
                                                          )}
                                                        >
                                                          <Icon
                                                            icon="ri:external-link-line"
                                                            className="w-3 h-3"
                                                          />
                                                          {t(
                                                            "shortplayEntry.preview.view"
                                                          )}
                                                        </button>
                                                        <button
                                                          onClick={() => {
                                                            handleCreateStoryboard(
                                                              file.fileId,
                                                              file.fileName,
                                                              message.userPrompt
                                                            );
                                                          }}
                                                          className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium hover:text-gray-200 transition-colors bg-transparent"
                                                          style={{
                                                            border:
                                                              "1px solid #3E83F6",
                                                            borderRadius: "4px",
                                                          }}
                                                          title={t(
                                                            "shortplayEntry.tooltips.applyImage"
                                                          )}
                                                        >
                                                          <Icon
                                                            icon="ri:check-line"
                                                            className="w-3 h-3 text-green-400"
                                                          />
                                                          {t(
                                                            "shortplayEntry.buttons.apply"
                                                          )}
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}

                                        {/* 显示生成参数 */}
                                        {message.params && (
                                          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">模型:</span>
                                              <span className="text-gray-600">{message.params.llmName || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">画面风格:</span>
                                              <span className="text-gray-600">{message.params.imageBackground || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">画面类型:</span>
                                              <span className="text-gray-600">{message.params.imageStyle || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">时长:</span>
                                              <span className="text-gray-600">
                                                {message.params.durationMillis ? `${message.params.durationMillis / 1000}s` : '-'}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {activeTab === "video" && (
                    <div className="space-y-4">
                      {/* 视频聊天记录内容区域 */}
                      <div className="space-y-3 pt-5">
                        {isLoadingVideoHistory ? (
                          <div className="flex items-center justify-center p-4 text-gray-500">
                            <Icon
                              icon="ri:loader-4-line"
                              className="w-4 h-4 animate-spin mr-2"
                            />
                            加载中...
                          </div>
                        ) : videoChatHistory.length > 0 ? (
                          <div className="space-y-4">
                            {videoChatHistory
                              .filter(
                                (message: any) => message.type === "AI_ANSWER"
                              )
                              .map((message, messageIndex) => (
                                <div
                                  key={`message-${messageIndex}`}
                                  className="flex items-start justify-start gap-2"
                                >
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                    <Icon
                                      icon="ri:user-fill"
                                      className="w-3.5 h-3.5 text-gray-600"
                                    />
                                  </div>
                                  <div className="max-w-2xl rounded-2xl rounded-tl-none">
                                    {message.type === "AI_ANSWER" ? (
                                      // AI回答 - 显示files中的视频，横向展示
                                      <div>
                                        {message.content && (
                                          <div className="text-sm text-gray-700 mb-2">
                                            {message.userPrompt}
                                          </div>
                                        )}
                                        {message.files &&
                                          message.files.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                              {message.files.map(
                                                (file, fileIndex) => (
                                                  <div
                                                    key={`file-${fileIndex}`}
                                                    className="flex flex-col items-center gap-1"
                                                  >
                                                    <div
                                                      className="w-20 bg-gray-200 overflow-hidden flex-shrink-0 relative group"
                                                      style={{
                                                        aspectRatio: "9 / 16",
                                                      }}
                                                    >
                                                      <video
                                                        src={file.downloadUrl}
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onError={(e) => {
                                                          e.currentTarget.style.display =
                                                            "none";
                                                          const parent =
                                                            e.currentTarget
                                                              .parentElement;
                                                          if (parent) {
                                                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
                                                      <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                    </div>`;
                                                          }
                                                        }}
                                                      />
                                                      {/* 悬停时显示的按钮覆盖层 */}
                                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 rounded-lg bg-black bg-opacity-50">
                                                        <button
                                                          onClick={() => {
                                                            setPreviewUrl(
                                                              file.downloadUrl
                                                            );
                                                            setPreviewType(
                                                              "video"
                                                            );
                                                            setPreviewFileId(
                                                              file.fileId
                                                            );
                                                            setPreviewFileName(
                                                              file.fileName
                                                            );
                                                            setPreviewUserPrompt(
                                                              message.userPrompt ||
                                                                ""
                                                            );
                                                            setPreviewSource(
                                                              "left"
                                                            );
                                                            setPreviewModalVisible(
                                                              true
                                                            );
                                                          }}
                                                          className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium hover:text-gray-200 transition-colors bg-transparent"
                                                          style={{
                                                            border:
                                                              "1px solid #3E83F6",
                                                            borderRadius: "4px",
                                                          }}
                                                          title={t(
                                                            "shortplayEntry.tooltips.playVideo"
                                                          )}
                                                        >
                                                          <Icon
                                                            icon="ri:play-line"
                                                            className="w-3 h-3"
                                                          />
                                                          {t(
                                                            "shortplayEntry.preview.view"
                                                          )}
                                                        </button>
                                                        <button
                                                          onClick={() => {
                                                            handleCreateStoryboard(
                                                              file.fileId,
                                                              file.fileName,
                                                              message.userPrompt
                                                            );
                                                          }}
                                                          className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium hover:text-gray-200 transition-colors bg-transparent"
                                                          style={{
                                                            border:
                                                              "1px solid #3E83F6",
                                                            borderRadius: "4px",
                                                          }}
                                                          title={t(
                                                            "shortplayEntry.tooltips.applyVideo"
                                                          )}
                                                        >
                                                          <Icon
                                                            icon="ri:check-line"
                                                            className="w-3 h-3 text-green-400"
                                                          />
                                                          {t(
                                                            "shortplayEntry.buttons.apply"
                                                          )}
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}

                                        {/* 显示生成参数 */}
                                        {message.params && (
                                          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">模型:</span>
                                              <span className="text-gray-600">{message.params.llmName || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">分辨率:</span>
                                              <span className="text-gray-600">{message.params.resolution || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-700">时长:</span>
                                              <span className="text-gray-600">
                                                {message.params.durationMillis ? `${message.params.durationMillis / 1000}s` : '-'}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* 卡片底部输入区域 */}
                <div className="flex-shrink-0 px-3 py-2   border-gray-100 mb-8">
                  {activeTab === "audio" ? (
                    <AudioBottomPanel
                      audioType={audioType}
                      availableVoices={availableVoices}
                      isLoadingVoices={isLoadingVoices}
                      editingVoiceId={editingVoiceId}
                      editingVoiceName={editingVoiceName}
                      onEditingVoiceNameChange={setEditingVoiceName}
                      onStartEditVoiceName={(voiceId, voiceName) => {
                        setEditingVoiceId(voiceId);
                        setEditingVoiceName(voiceName);
                      }}
                      onSaveVoiceName={handleSaveVoiceName}
                      onCancelEditVoiceName={() => {
                        setEditingVoiceId(null);
                        setEditingVoiceName("");
                      }}
                      onVoiceNameKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveVoiceName();
                        } else if (e.key === "Escape") {
                          setEditingVoiceId(null);
                          setEditingVoiceName("");
                        }
                      }}
                      onApplyVoice={handleApplyVoice}
                      bgmList={bgmList}
                      isLoadingBgm={isLoadingBgm}
                      onApplyBgm={handleApplyBgm}
                      selectedModel={audioModel}
                      onModelChange={setAudioModel}
                      audioGender={audioGender}
                      onAudioGenderChange={setAudioGender}
                      userInput={userInput}
                      onInputChange={setUserInput}
                      isGenerating={isGenerating}
                      onGenerate={
                        audioType === "voice"
                          ? handleAudioGenerate
                          : handleBgmGenerate
                      }
                      generationStatus={generationStatus}
                    />
                  ) : (
                    <BottomInputArea
                      activeTab={activeTab}
                      selectedModel={
                        activeTab === "image" ? imageModel : selectedModel
                      }
                      onModelChange={
                        activeTab === "image" ? setImageModel : setSelectedModel
                      }
                      userInput={userInput}
                      onInputChange={setUserInput}
                      isGenerating={isGenerating}
                      onGenerate={
                        activeTab === "image"
                          ? handleImageGenerate
                          : activeTab === "video"
                          ? handleVideoGenerate
                          : handleGenerate
                      }
                      generationStatus={generationStatus}
                      audioType={audioType}
                      voiceType={voiceType}
                      onVoiceTypeChange={setVoiceType}
                      backgroundType={backgroundType}
                      onBackgroundTypeChange={setBackgroundType}
                      style={style}
                      onStyleChange={setStyle}
                      relevanceScore={relevanceScore}
                      onRelevanceScoreChange={setRelevanceScore}
                      videoLength={videoLength}
                      onVideoLengthChange={setVideoLength}
                      resolution={resolution}
                      onResolutionChange={setResolution}
                      singleGenerate={singleGenerate}
                      onSingleGenerateChange={setSingleGenerate}
                      videoModel={videoModel}
                      onVideoModelChange={setVideoModel}
                      uploadedImagesCount={uploadedImages.length}
                      onFileUpload={handleFileUpload}
                      onMultipleFileUpload={handleMultipleFileUpload}
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                      uploadedImages={uploadedImages}
                      onRemoveImage={handleRemoveImage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 中间面板 - 剧本编辑区域 */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden ">
            <div className="flex-shrink-0">
              <SectionHeader
                title={
                  activeTab === "script"
                    ? t("shortplayEntry.tabs.script")
                    : activeTab === "audio"
                    ? t("shortplayEntry.tabs.audio")
                    : activeTab === "image"
                    ? t("shortplayEntry.tabs.image")
                    : t("shortplayEntry.tabs.video")
                }
                subtitle={
                  activeTab === "script"
                    ? selectedScene
                    : activeTab === "audio"
                    ? selectedScene
                    : activeTab === "image"
                    ? selectedScene
                    : activeTab === "video"
                    ? selectedScene
                    : undefined
                }
                subtitleOptions={
                  activeTab === "script" ||
                  activeTab === "audio" ||
                  activeTab === "image" ||
                  activeTab === "video"
                    ? sceneOptions
                    : undefined
                }
                onSubtitleChange={(value) => {
                  // 处理从下拉列表选择场次的情况
                  setSelectedScene(value);
                  const selectedSceneData = scenesData.find(
                    (scene: any) => scene.sceneTitle === value
                  );
                  if (selectedSceneData?.id) {
                    setCurrentSceneId(selectedSceneData.id);
                    // loadSceneContent 由 useEffect 自动触发，无需手动调用
                  }
                }}
                onSubtitleEdit={async (value) => {
                  // 处理直接编辑场次名称的情况
                  const currentSceneData = scenesData.find(
                    (scene: any) => scene.sceneTitle === selectedScene
                  );
                  if (currentSceneData?.id) {
                    const success = await updateSceneName(
                      currentSceneData.id,
                      value
                    );
                    if (success) {
                      setSelectedScene(value);
                    }
                    return success;
                  }
                  return false;
                }}
                onOptionsChange={(options) => setSceneOptions(options)}
                onAddSubtitleOption={handleAddScene}
                onDeleteSubtitleOption={handleDeleteScene}
                onAddClick={
                  activeTab === "script" || activeTab === "audio"
                    ? handleStartAddNewItem
                    : undefined
                }
                onApplyClick={async () => {
                  // 防止重复点击
                  if (isLoadingPreviewVideo) {
                    return;
                  }

                  try {
                    // 使用中间区域头部下拉选择的 sceneId
                    const sceneId = currentSceneId;

                    if (!sceneId && sceneId !== 0) {
                      toast.error("请先选择场次");
                      return;
                    }

                    setIsLoadingPreviewVideo(true);
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                      `${STORYAI_API_BASE}/multimedia/episode/video/preview?sceneId=${sceneId}`,
                      {
                        method: "POST",
                        headers: {
                          "X-Prompt-Manager-Token": token || "",
                        },
                      }
                    );

                    if (!response.ok) {
                      throw new Error(`请求失败: ${response.status}`);
                    }

                    const result = await response.json();

                    // 获取下载地址并更新视频源
                    if (result.data?.downloadUrl) {
                      const downloadUrl = result.data.downloadUrl;
                      setVideoSrc(downloadUrl);
                      setHasVideo(true);

                      // 保存完整的返回数据到缓存（使用seriesId和sceneId组合作为key）
                      const cacheKey = `${seriesId}_${sceneId}`;
                      const newCache = {
                        ...videoCacheMap,
                        [cacheKey]: result.data,
                      };
                      setVideoCacheMap(newCache);
                      localStorage.setItem(
                        "videoCacheMap",
                        JSON.stringify(newCache)
                      );

                      toast.success(
                        t("shortplayEntry.messages.success.videoPreviewLoaded")
                      );
                    } else {
                      throw new Error("返回数据中缺少downloadUrl");
                    }
                  } catch (error) {
                    toast.error(
                      t("shortplayEntry.messages.error.videoPreviewFailed", {
                        error: (error as Error).message,
                      })
                    );
                  } finally {
                    setIsLoadingPreviewVideo(false);
                  }
                }}
                isLoading={isLoadingPreviewVideo}
                isContentLoading={isLoadingSceneContent}
              />
            </div>

            {/* 剧本内容区域 */}
            <div
              className="flex-grow min-h-0 overflow-hidden w-full"
              style={{ padding: "16px 16px 80px 16px" }}
            >
              <div className="h-full w-full overflow-auto">
                {activeTab === "script" && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sceneContent.map((item) => item.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-0.5">
                        {sceneContent.map((item, index) => (
                          <SortableScriptItem
                            key={item.id}
                            index={index}
                            item={item}
                            editingSceneItemId={editingSceneItemId}
                            editingSceneType={editingSceneType}
                            editingSceneContent={editingSceneContent}
                            editingSceneRoleName={editingSceneRoleName}
                            editingSceneStartMinutes={editingSceneStartMinutes}
                            editingSceneStartSeconds={editingSceneStartSeconds}
                            editingSceneEndMinutes={editingSceneEndMinutes}
                            editingSceneEndSeconds={editingSceneEndSeconds}
                            onEditingSceneTypeChange={setEditingSceneType}
                            onEditingSceneContentChange={setEditingSceneContent}
                            onEditingSceneRoleNameChange={
                              setEditingSceneRoleName
                            }
                            onEditingSceneStartMinutesChange={
                              setEditingSceneStartMinutes
                            }
                            onEditingSceneStartSecondsChange={
                              setEditingSceneStartSeconds
                            }
                            onEditingSceneEndMinutesChange={
                              setEditingSceneEndMinutes
                            }
                            onEditingSceneEndSecondsChange={
                              setEditingSceneEndSeconds
                            }
                            onEditSceneItem={handleEditSceneItem}
                            onSaveSceneItem={handleSaveSceneItem}
                            onCancelEditSceneItem={handleCancelEditSceneItem}
                            onShowDeleteConfirm={handleShowDeleteConfirm}
                            TimeRangeInput={TimeRangeInput}
                            isHighlighted={highlightedItemId === item.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {activeTab === "audio" && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={audioContent.map((item) => item.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {isLoadingAudioContent ? (
                          <div className="flex items-center justify-center p-4 text-gray-500">
                            <Icon
                              icon="ri:loader-4-line"
                              className="w-4 h-4 animate-spin mr-2"
                            />
                            加载中...
                          </div>
                        ) : audioContent.length > 0 ? (
                          audioContent.map((item) => (
                            <SortableAudioItem
                              key={item.id}
                              item={{
                                id: item.id.toString(),
                                type: item.type === 2 ? "voice" : "sound",
                                itemType: item.type,
                                speaker:
                                  item.type === 1
                                    ? ""
                                    : item.type === 2
                                    ? item.roleName || ""
                                    : "音效",
                                content: item.content,
                                timeRange: `${formatMillisecondsToTime(
                                  item.startTime || 0
                                )}-${formatMillisecondsToTime(
                                  item.endTime || 0
                                )}`,
                                icon:
                                  item.type === 1
                                    ? "ri:camera-line"
                                    : item.type === 2
                                    ? "ri:user-voice-line"
                                    : "ri:music-2-line",
                              }}
                              audioType={audioType}
                              configuredVoices={configuredVoices}
                              onVoiceSelect={handleVoiceSelect}
                              onPlayAudio={handlePlayAudio}
                              onShowDeleteConfirm={handleShowDeleteAudioConfirm}
                              editingItemId={editingSceneItemId}
                              editingContent={editingSceneContent}
                              editingRoleName={editingSceneRoleName}
                              onEditingContentChange={setEditingSceneContent}
                              onEditingRoleNameChange={setEditingSceneRoleName}
                              onStartEditContent={(
                                itemId,
                                content,
                                roleName
                              ) => {
                                const numItemId = parseInt(
                                  itemId.toString(),
                                  10
                                );
                                const editItem = audioContent.find(
                                  (c: any) => c.id === numItemId
                                );

                                setEditingSceneItemId(numItemId);
                                setEditingSceneContent(content);
                                setEditingSceneRoleName(roleName || "");

                                // 从项目的时间数据中计算分钟和秒
                                if (editItem) {
                                  const startTotalSeconds = Math.floor(
                                    (editItem.startTime || 0) / 1000
                                  );
                                  const endTotalSeconds = Math.floor(
                                    (editItem.endTime || 5000) / 1000
                                  );

                                  const startMinutes = Math.floor(
                                    startTotalSeconds / 60
                                  );
                                  const startSeconds = startTotalSeconds % 60;
                                  const endMinutes = Math.floor(
                                    endTotalSeconds / 60
                                  );
                                  const endSeconds = endTotalSeconds % 60;

                                  setEditingSceneStartMinutes(
                                    String(startMinutes).padStart(2, "0")
                                  );
                                  setEditingSceneStartSeconds(
                                    String(startSeconds).padStart(2, "0")
                                  );
                                  setEditingSceneEndMinutes(
                                    String(endMinutes).padStart(2, "0")
                                  );
                                  setEditingSceneEndSeconds(
                                    String(endSeconds).padStart(2, "0")
                                  );
                                } else {
                                  setEditingSceneStartMinutes("00");
                                  setEditingSceneStartSeconds("00");
                                  setEditingSceneEndMinutes("00");
                                  setEditingSceneEndSeconds("05");
                                }
                              }}
                              onSaveContentEdit={async (itemId) => {
                                try {
                                  const currentSceneData = scenesData.find(
                                    (scene: any) =>
                                      scene.sceneTitle === selectedScene
                                  );
                                  const sceneId = currentSceneData?.id;

                                  if (!sceneId) {
                                    toast.error(
                                      t(
                                        "shortplayEntry.validation.sceneNotFound"
                                      )
                                    );
                                    return;
                                  }

                                  const numItemId =
                                    typeof itemId === "string"
                                      ? parseInt(itemId)
                                      : itemId;
                                  const item = audioContent.find(
                                    (c: any) => c.id === numItemId
                                  );
                                  if (!item) return;

                                  const startTime =
                                    (parseInt(editingSceneStartMinutes || "0") *
                                      60 +
                                      parseInt(
                                        editingSceneStartSeconds || "0"
                                      )) *
                                    1000;
                                  const endTime =
                                    (parseInt(editingSceneEndMinutes || "0") *
                                      60 +
                                      parseInt(editingSceneEndSeconds || "0")) *
                                    1000;
                                  const orderNum =
                                    audioContent.findIndex(
                                      (c: any) => c.id === numItemId
                                    ) + 1;

                                  // 根据 id 判断是新增还是编辑（负数 id 为新增项目）
                                  const isNewItem = numItemId < 0;

                                  const token = localStorage.getItem("token");
                                  const requestBody: any = {
                                    type: item.type,
                                    content: editingSceneContent,
                                    startTime: startTime,
                                    endTime: endTime,
                                  };

                                  // 新增时添加sceneId和orderNum，编辑时添加id
                                  if (isNewItem) {
                                    requestBody.sceneId = sceneId;
                                    requestBody.orderNum = orderNum;
                                  } else {
                                    requestBody.id = numItemId;
                                  }

                                  const response = await fetch(
                                    `${STORYAI_API_BASE}/scene/content`,
                                    {
                                      method: isNewItem ? "POST" : "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                        "X-Prompt-Manager-Token": token || "",
                                      },
                                      body: JSON.stringify(requestBody),
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error(
                                      `请求失败: ${response.status}`
                                    );
                                  }

                                  const result = await response.json();
                                  if (result.code !== 0) {
                                    throw new Error(
                                      result.message || "保存失败"
                                    );
                                  }

                                  // 获取服务器返回的真实ID
                                  const realItemId =
                                    result.data?.id || numItemId;

                                  const updatedContent = audioContent.map(
                                    (c: any) =>
                                      c.id === numItemId
                                        ? {
                                            ...c,
                                            id: realItemId, // 更新为服务器返回的真实ID
                                            content: editingSceneContent,
                                            roleName: editingSceneRoleName,
                                            startTime: startTime,
                                            endTime: endTime,
                                          }
                                        : c
                                  );
                                  setAudioContent(updatedContent);

                                  // 如果有音色选择，调用绑定接口
                                  if (
                                    editingSceneRoleName &&
                                    audioType === "voice"
                                  ) {
                                    try {
                                      const bindingResponse = await fetch(
                                        `${STORYAI_API_BASE}/ai/voice/batch-bind`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                            "X-Prompt-Manager-Token":
                                              token || "",
                                          },
                                          body: JSON.stringify({
                                            bindings: [
                                              {
                                                voiceId: editingSceneRoleName,
                                                subtitleId: realItemId,
                                              },
                                            ],
                                          }),
                                        }
                                      );

                                      if (!bindingResponse.ok) {
                                      }

                                      const bindingResult =
                                        await bindingResponse.json();
                                      if (bindingResult.code !== 0) {
                                      }
                                    } catch (bindError) {
                                    }
                                  }

                                  setEditingSceneItemId(null);
                                  setEditingSceneContent("");
                                  setEditingSceneRoleName("");
                                } catch (error) {
                                  toast.error(
                                    t(
                                      "shortplayEntry.messages.error.saveFailed",
                                      { error: (error as Error).message }
                                    )
                                  );
                                }
                              }}
                              onCancelContentEdit={() => {
                                setEditingSceneItemId(null);
                                setEditingSceneContent("");
                                setEditingSceneRoleName("");
                              }}
                              isHighlighted={highlightedItemId === item.id}
                              editingTimeId={
                                editingSceneItemId === item.id
                                  ? editingSceneItemId
                                  : bgmEditingTimeId
                              }
                              editingStartMinutes={
                                editingSceneItemId === item.id
                                  ? editingSceneStartMinutes
                                  : bgmEditingStartMinutes
                              }
                              editingStartSeconds={
                                editingSceneItemId === item.id
                                  ? editingSceneStartSeconds
                                  : bgmEditingStartSeconds
                              }
                              editingEndMinutes={
                                editingSceneItemId === item.id
                                  ? editingSceneEndMinutes
                                  : bgmEditingEndMinutes
                              }
                              editingEndSeconds={
                                editingSceneItemId === item.id
                                  ? editingSceneEndSeconds
                                  : bgmEditingEndSeconds
                              }
                              onEditingStartMinutesChange={
                                editingSceneItemId === item.id
                                  ? setEditingSceneStartMinutes
                                  : setBgmEditingStartMinutes
                              }
                              onEditingStartSecondsChange={
                                editingSceneItemId === item.id
                                  ? setEditingSceneStartSeconds
                                  : setBgmEditingStartSeconds
                              }
                              onEditingEndMinutesChange={
                                editingSceneItemId === item.id
                                  ? setEditingSceneEndMinutes
                                  : setBgmEditingEndMinutes
                              }
                              onEditingEndSecondsChange={
                                editingSceneItemId === item.id
                                  ? setEditingSceneEndSeconds
                                  : setBgmEditingEndSeconds
                              }
                              onStartEditTime={
                                editingSceneItemId === item.id
                                  ? undefined
                                  : handleBgmStartEditTime
                              }
                              onSaveTimeEdit={
                                editingSceneItemId === item.id
                                  ? undefined
                                  : handleBgmSaveTimeEdit
                              }
                              onCancelTimeEdit={
                                editingSceneItemId === item.id
                                  ? undefined
                                  : handleBgmCancelTimeEdit
                              }
                            />
                          ))
                        ) : null}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {activeTab === "image" && (
                  <StoryboardList
                    storyboardItems={storyboardItems}
                    isLoadingStoryboard={isLoadingStoryboard}
                    editingTimeId={editingTimeId}
                    editingStartMinutes={editingStartMinutes}
                    editingStartSeconds={editingStartSeconds}
                    editingEndMinutes={editingEndMinutes}
                    editingEndSeconds={editingEndSeconds}
                    sensors={sensors}
                    onEditingStartMinutesChange={setEditingStartMinutes}
                    onEditingStartSecondsChange={setEditingStartSeconds}
                    onEditingEndMinutesChange={setEditingEndMinutes}
                    onEditingEndSecondsChange={setEditingEndSeconds}
                    onStartEditTime={startEditTime}
                    onSaveTimeEdit={saveStoryboardTimeEdit}
                    onCancelTimeEdit={cancelTimeEdit}
                    onDragEnd={handleStoryboardDragEnd}
                    onDeleteItem={handleShowDeleteStoryboardConfirm}
                    TimeRangeInput={TimeRangeInput}
                    onRefreshList={loadStoryboardList}
                    highlightedItemId={highlightedItemId}
                    onPreview={(fileUrl, fileName) => {
                      setPreviewUrl(fileUrl);
                      setPreviewFileName(fileName);
                      // 判断是否为视频文件
                      const isVideo =
                        /\.(mp4|webm|mov|avi)$/i.test(fileUrl) ||
                        /\.(mp4|webm|mov|avi)$/i.test(fileName || "");
                      setPreviewType(isVideo ? "video" : "image");
                      setPreviewSource("middle");
                      setPreviewModalVisible(true);
                    }}
                  />
                )}

                {activeTab === "video" && (
                  <StoryboardList
                    storyboardItems={storyboardItems}
                    isLoadingStoryboard={isLoadingStoryboard}
                    editingTimeId={editingTimeId}
                    editingStartMinutes={editingStartMinutes}
                    editingStartSeconds={editingStartSeconds}
                    editingEndMinutes={editingEndMinutes}
                    editingEndSeconds={editingEndSeconds}
                    sensors={sensors}
                    onEditingStartMinutesChange={setEditingStartMinutes}
                    onEditingStartSecondsChange={setEditingStartSeconds}
                    onEditingEndMinutesChange={setEditingEndMinutes}
                    onEditingEndSecondsChange={setEditingEndSeconds}
                    onStartEditTime={startEditTime}
                    onSaveTimeEdit={saveStoryboardTimeEdit}
                    onCancelTimeEdit={cancelTimeEdit}
                    onDragEnd={handleStoryboardDragEnd}
                    onDeleteItem={handleShowDeleteStoryboardConfirm}
                    TimeRangeInput={TimeRangeInput}
                    onRefreshList={loadStoryboardList}
                    highlightedItemId={highlightedItemId}
                    onPreview={(fileUrl, fileName) => {
                      setPreviewUrl(fileUrl);
                      setPreviewFileName(fileName);
                      // 判断是否为视频文件
                      const isVideo =
                        /\.(mp4|webm|mov|avi)$/i.test(fileUrl) ||
                        /\.(mp4|webm|mov|avi)$/i.test(fileName || "");
                      setPreviewType(isVideo ? "video" : "image");
                      setPreviewSource("middle");
                      setPreviewModalVisible(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 右侧面板 - 手机预览区域 (固定宽度340px) */}
          <div
            className="bg-gray-100 flex flex-col overflow-hidden"
            style={{ width: "340px" }}
          >
            {/* 预览头部 */}
            <div
              className="border-b border-gray-200 bg-white flex items-center flex-shrink-0"
              style={{ height: "64px" }}
            >
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="36" rx="8" fill="#3E83F6"/>
                    <circle cx="20" cy="18" r="9" stroke="white" strokeWidth="1.5" fill="none"/>
                    <path d="M26.5 18L17.5 23.464V12.536L26.5 18Z" fill="white"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">
                    {t("shortplayEntry.buttons.preview")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="small"
                    type="text"
                    className="text-xs text-blue-500 border border-blue-200 rounded"
                    onClick={() => {
                      // 从缓存中获取视频downloadUrl
                      const cacheKey = `${seriesId}_${currentSceneId}`;
                      const cachedData = videoCacheMap[cacheKey];
                      if (cachedData && cachedData.downloadUrl) {
                        const downloadUrl = cachedData.downloadUrl;
                        const fileName = cachedData.fileName || "video.mp4";

                        // 创建a标签触发下载
                        const link = document.createElement("a");
                        link.href = downloadUrl;
                        link.download = fileName;
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        toast.success(
                          t("shortplayEntry.messages.success.downloadStarted")
                        );
                      } else {
                        toast.error(
                          t("shortplayEntry.messages.error.noVideoToDownload")
                        );
                      }
                    }}
                  >
                    <Icon icon="ri:download-line" className="w-3 h-3 mr-1" />
                    {t("shortplayEntry.buttons.download")}
                  </Button>
                  {
                    // 计算是否存在缓存的lastFrame
                    (() => {
                      const cacheKey = `${seriesId}_${currentSceneId}`;
                      const hasLastFrame = videoCacheMap[cacheKey]?.lastFrame ?? false;
                      return (
                        <Button
                          size="small"
                          type="text"
                          disabled={!hasLastFrame}
                          className={`text-xs border border-blue-200 rounded transition-all ${
                            hasLastFrame
                              ? "text-blue-500 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                              : "text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => {
                            // 从缓存中获取lastFrame
                            const cacheKey = `${seriesId}_${currentSceneId}`;
                            const cachedData = videoCacheMap[cacheKey];
                            if (cachedData && cachedData.lastFrame) {
                              setLastFrameImage(cachedData.lastFrame);
                              setHasVideo(false); // 停止显示视频，改为显示图片
                              setVideoSrc(""); // 清空视频源

                              // 进入编辑模式，初始化题目和选项
                              setIsEditorMode(true);
                              setQuestionTitle("");
                              setOptions([
                                `${t("shortplayEntry.ui.defaultOptionPrefix")}1`,
                              ]);

                              toast.success(
                                t("shortplayEntry.messages.success.frameInserted")
                              );
                            } else {
                              toast.error(t("shortplayEntry.ui.noFrameCacheHint"));
                            }
                          }}
                        >
                          {t("shortplayEntry.buttons.insertOption")}
                        </Button>
                      );
                    })()
                  }
                </div>
              </div>
            </div>

            {/* 手机预览容器 */}
            <div className="flex-grow min-h-0 overflow-hidden p-2.5 w-full">
              {/* 实际可滚动内容区 */}
              <div className="h-full w-full overflow-auto flex flex-col items-center py-4">
              {/* 手机外框 - 响应式宽高 */}
              <div
                className="bg-black rounded-[2.5rem] p-2 shadow-2xl"
                style={{
                  aspectRatio: "9/18",
                  width: "min(85%, 280px)",
                  height: "auto",
                }}
              >
                {/* 手机屏幕 */}
                <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden relative">
                  {/* 刘海屏设计 */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

                  {/* 视频播放内容 */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    onMouseEnter={() => setIsHoveringVideo(true)}
                    onMouseLeave={() => setIsHoveringVideo(false)}
                  >
                    {hasVideo ? (
                      /* 真实视频播放 */
                      <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        onClick={togglePlay}
                        onTimeUpdate={(e) => {
                          const video = e.currentTarget;
                          if (video.duration && !isSeeking) {
                            setProgress(
                              (video.currentTime / video.duration) * 100
                            );

                            // 根据当前播放时间高亮对应的列表项
                            const currentTimeMs = video.currentTime * 1000;
                            let itemToHighlight = null;

                            // 辅助函数：处理时间格式并进行比较
                            const isTimeInRange = (item: any): boolean => {
                              let startTime = item.startTime || 0;
                              let endTime = item.endTime || 0;

                              // 如果时间小于 1000，可能是秒，转换为毫秒
                              if (startTime > 0 && startTime < 1000) {
                                startTime = startTime * 1000;
                              }
                              if (endTime > 0 && endTime < 1000) {
                                endTime = endTime * 1000;
                              }

                              return (
                                currentTimeMs >= startTime &&
                                currentTimeMs < endTime
                              );
                            };

                            // 根据当前 tab 查找对应的列表
                            if (
                              activeTab === "script" &&
                              sceneContent &&
                              sceneContent.length > 0
                            ) {
                              // 在脚本列表中查找对应的项
                              itemToHighlight = sceneContent.find((item: any) =>
                                isTimeInRange(item)
                              );
                            } else if (
                              activeTab === "audio" &&
                              sceneContent &&
                              sceneContent.length > 0
                            ) {
                              // 在音频列表中查找对应的项
                              itemToHighlight = sceneContent.find((item: any) =>
                                isTimeInRange(item)
                              );
                            } else if (
                              activeTab === "image" &&
                              storyboardItems &&
                              storyboardItems.length > 0
                            ) {
                              // 在图片列表中查找对应的项
                              itemToHighlight = storyboardItems.find(
                                (item: any) => isTimeInRange(item)
                              );
                            } else if (
                              activeTab === "video" &&
                              storyboardItems &&
                              storyboardItems.length > 0
                            ) {
                              // 在分镜板列表中查找对应的项
                              itemToHighlight = storyboardItems.find(
                                (item: any) => isTimeInRange(item)
                              );
                            }

                            setHighlightedItemId(itemToHighlight?.id || null);
                          }
                        }}
                        onLoadedMetadata={handleVideoLoaded}
                      />
                    ) : lastFrameImage ? (
                      // 显示最后一帧图片
                      <img
                        src={lastFrameImage}
                        alt="最后一帧"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // 默认黑色背景
                      <div className="w-full h-full bg-black"></div>
                    )}

                    {/* 加载中覆盖层 */}
                    {isLoadingPreviewVideo && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <div className="flex flex-col items-center">
                          <Icon
                            icon="ri:loader-4-line"
                            className="w-8 h-8 text-white animate-spin mb-2"
                          />
                          <div className="text-white text-sm">
                            {t("shortplayEntry.ui.creatingPreview")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 播放控制按钮 */}
                    {hasVideo && (!isPlaying || isHoveringVideo) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300">
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
                      {/* 进度条 - 编辑模式下隐藏 - 应用 react-project CSS 样式 */}
                      {hasVideo && !isEditorMode && (
                        <div className="absolute bottom-12 left-4 right-4 z-10">
                          <div className="time-display mb-2">
                            <span className="current-time">{timeDisplay}</span>
                            <span className="separator">/</span>
                            <span className="duration">{totalTimeDisplay}</span>
                          </div>
                          <div
                            data-progress-bar
                            onMouseDown={handleProgressMouseDown}
                            onMouseUp={handleProgressMouseUp}
                            onTouchStart={handleProgressTouchStart}
                            onTouchEnd={handleProgressTouchEnd}
                          >
                            {/* 进度条填充效果 - 渐变色 + 阴影 */}
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${progress}%` }}
                            ></div>
                            {/* 进度条 slider - 支持 Chrome/Firefox/Safari */}
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
                      )}

                      {/* 编辑器蒙层 - 仅在编辑模式下显示 */}
                      {isEditorMode && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 z-20">
                          {/* 题目区域 */}
                          <div className="mb-3">
                            {isEditingTitle ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setQuestionTitle(editingTitle);
                                    setIsEditingTitle(false);
                                  }
                                }}
                                onBlur={() => {
                                  setQuestionTitle(editingTitle);
                                  setIsEditingTitle(false);
                                }}
                                className="w-full px-3 py-2 bg-white/90 text-black rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t(
                                  "shortplayEntry.ui.inputTitlePlaceholder"
                                )}
                              />
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingTitle(questionTitle);
                                  setIsEditingTitle(true);
                                }}
                                className="text-white text-sm font-medium px-3 py-2 bg-black/40 rounded cursor-pointer hover:bg-black/60 transition-colors"
                              >
                                {questionTitle ||
                                  t("shortplayEntry.ui.editTitleHint")}
                              </div>
                            )}
                          </div>

                          {/* 选项列表 */}
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                {editingOptionIndex === index ? (
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingOptionText}
                                    onChange={(e) =>
                                      setEditingOptionText(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const newOptions = [...options];
                                        newOptions[index] = editingOptionText;
                                        setOptions(newOptions);
                                        setEditingOptionIndex(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      const newOptions = [...options];
                                      newOptions[index] = editingOptionText;
                                      setOptions(newOptions);
                                      setEditingOptionIndex(null);
                                    }}
                                    className="flex-1 px-3 py-2 bg-white/90 text-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingOptionIndex(index);
                                      setEditingOptionText(option);
                                    }}
                                    className="flex-1 text-white/90 text-sm cursor-pointer hover:text-white transition-colors"
                                  >
                                    {String.fromCharCode(65 + index)}. {option}
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    setOptions(
                                      options.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="text-red-500 hover:text-red-400 transition-colors p-0"
                                  title={t(
                                    "shortplayEntry.tooltips.deleteOption"
                                  )}
                                >
                                  <Icon
                                    icon="ri:delete-bin-line"
                                    className="w-4 h-4"
                                  />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* 新增选项、保存和取消按钮 - 同一行 */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setOptions([
                                  ...options,
                                  `${t(
                                    "shortplayEntry.ui.defaultOptionPrefix"
                                  )}${options.length + 1}`,
                                ]);
                              }}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title={t("shortplayEntry.buttons.addOption")}
                            >
                              <Icon icon="ri:add-line" className="w-4 h-4" />
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem("token");
                                  const storyboardOrder =
                                    storyboardItems.length + 1;

                                  const requestData = {
                                    sceneId: currentSceneId,
                                    storyboardOrder: storyboardOrder,
                                    questionInfo: {
                                      title: questionTitle,
                                      options: options,
                                    },
                                  };

                                  const response = await fetch(
                                    `${STORYAI_API_BASE}/storyboard/special/create`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        "X-Prompt-Manager-Token": token || "",
                                      },
                                      body: JSON.stringify(requestData),
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error(
                                      `请求失败: ${response.status}`
                                    );
                                  }

                                  const result = await response.json();

                                  if (result.code === 0) {
                                    toast.success(
                                      t("shortplayEntry.messages.success.saved")
                                    );
                                    setIsEditorMode(false);
                                    setHasVideo(true);
                                    setLastFrameImage("");
                                  } else {
                                    throw new Error(
                                      result.message || "保存失败"
                                    );
                                  }
                                } catch (error) {
                                  toast.error(
                                    t(
                                      "shortplayEntry.messages.error.saveFailed",
                                      { error: (error as Error).message }
                                    )
                                  );
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                            >
                              <span className="whitespace-nowrap">{t("shortplayEntry.buttons.save")}</span>
                            </button>

                            <button
                              onClick={() => {
                                setIsEditorMode(false);
                                setHasVideo(true);
                                setLastFrameImage("");
                              }}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                            >
                              <span className="whitespace-nowrap">{t("shortplayEntry.buttons.cancel")}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 底部操作栏 */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 flex items-center justify-around backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-white text-sm">
                            {t("shortplayEntry.navigation.appName")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-white text-sm">
                            {t("shortplayEntry.navigation.myProfile")}
                          </div>
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
      </div>

      {/* 删除确认对话框 - 场次内容 */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="ri:delete-bin-line"
                  className="w-5 h-5 text-red-600"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t("shortplayEntry.dialogs.deleteConfirm.title")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("shortplayEntry.dialogs.deleteConfirm.message")}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 - 音频项 */}
      {deleteAudioItemId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="ri:delete-bin-line"
                  className="w-5 h-5 text-red-600"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t("shortplayEntry.dialogs.deleteConfirm.title")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("shortplayEntry.dialogs.deleteConfirm.message")}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelDeleteAudio}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.cancel")}
              </button>
              <button
                onClick={handleConfirmDeleteAudio}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 - 分镜板 */}
      {deleteStoryboardId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="ri:delete-bin-line"
                  className="w-5 h-5 text-red-600"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t("shortplayEntry.dialogs.deleteConfirm.title")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("shortplayEntry.dialogs.deleteConfirm.message")}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteStoryboardId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.cancel")}
              </button>
              <button
                onClick={handleConfirmDeleteStoryboard}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {t("shortplayEntry.dialogs.deleteConfirm.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片/视频预览弹窗 */}
      <Modal
        title={null}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={
          previewSource === "left" ? (
            <div className="w-full flex gap-4 p-3">
              <button
                onClick={() => setPreviewModalVisible(false)}
                className="flex-1 px-4 py-2 text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors font-medium text-sm rounded"
              >
                {t("shortplayEntry.preview.close")}
              </button>
              <button
                onClick={() => {
                  if (previewFileId && previewFileName) {
                    handleCreateStoryboard(
                      previewFileId,
                      previewFileName,
                      previewUserPrompt
                    );
                    setPreviewModalVisible(false);
                  }
                }}
                className="flex-1 px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 transition-colors font-medium text-sm rounded"
              >
                {t("shortplayEntry.buttons.apply")}
              </button>
            </div>
          ) : null
        }
        width={450}
        centered
        bodyStyle={{ padding: 0 }}
        closeIcon={
          previewSource === "middle" ? (
            <div
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              style={{ marginRight: "-8px", marginTop: "-8px" }}
            >
              <Icon icon="ri:close-line" className="w-5 h-5 text-white" />
            </div>
          ) : null
        }
        styles={{
          content: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
        }}
      >
        <div className="flex flex-col items-center justify-center">
          {previewType === "image" ? (
            <img
              src={previewUrl}
              alt="预览图片"
              className="w-full h-auto object-contain"
            />
          ) : (
            <video
              src={previewUrl}
              controls
              className="w-full h-auto min-h-[600px]"
              style={{ objectFit: "contain" }}
              autoPlay
            />
          )}
        </div>
      </Modal>

      {/* 类型选择 Popover */}
      {showTypeSelector && popoverPosition && (
        <>
          {/* 背景遮罩 - 点击关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTypeSelector(false)}
          />
          {/* Popover 弹窗 */}
          <div
            className="fixed bg-white rounded-md shadow-lg overflow-hidden z-50"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: "120px",
            }}
          >
            <div className="divide-y divide-gray-100">
              <button
                onClick={() => handleCreateNewItem(1)}
                className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 transition-colors text-sm"
              >
                画面脚本
              </button>
              <button
                onClick={() => handleCreateNewItem(2)}
                className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 transition-colors text-sm"
              >
                角色台词
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ShortplayEntryPage;
