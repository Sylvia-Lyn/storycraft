import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const KnowledgeUploadPage: React.FC = () => {
  const { knowledgeId } = useParams<{ knowledgeId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [tags, setTags] = useState(['标签1', '标签2', '标签3']);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showSegmentPreviewDialog, setShowSegmentPreviewDialog] = useState(false);
  const [analysisModel, setAnalysisModel] = useState('deepseek-R1');
  const [relatedKnowledge, setRelatedKnowledge] = useState('大纲');
  const [promptText, setPromptText] = useState('#你是一位深刺的小说创作专家，描述构建引人入胆、逸群畅达且层次分明的故事结构。请根据以下要求，为我生成一份完整的小说大纲，并特别设计出小说篇章的黄金三分详细大纲。\n【任务要求】\n立意整体小说大纲：\n - 采用"第一章 - 第一节"结构，简述故事的整体脉络和主要情节发展。\n - 描述故事背景、主要事件及结局（可为开放式回归结局）。\n\n - 主要目标：让主角在经历折后还远自小小澄湖，通过情感或行动上的爆发展示其坚韧力量，同时保留开放性问题。\n - 关键事件/高潮：设定一个决定性时刻，主角作出重大反击或遇见重大阻力。\n - 情感设置：在');
  const [chunkMaxLength, setChunkMaxLength] = useState('1024');
  const [chunkMinLength, setChunkMinLength] = useState('0');
  const [addTitleToChunk, setAddTitleToChunk] = useState(true);
  
  // 获取知识库名称
  useEffect(() => {
    // 根据ID获取对应的知识库名称
    const getKnowledgeBaseName = () => {
      // 这里应该是API调用，现在用模拟数据
      const knowledgeBases = [
        { id: 'knowledge-1', name: '测试' },
        { id: 'knowledge-2', name: '对话记录' },
        { id: 'knowledge-3', name: '角色剧本' }
      ];
      
      const found = knowledgeBases.find(kb => kb.id === knowledgeId);
      setKnowledgeBaseName(found?.name || '未知知识库');
    };
    
    getKnowledgeBaseName();
  }, [knowledgeId]);
  
  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 处理下一步
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // 处理拖放文件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => {
        const fileType = file.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'txt', 'md', 'html', 'doc', 'docx'].includes(fileType || '');
      });
      
      if (validFiles.length > 0) {
        handleFilesSelected(validFiles);
      }
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // 处理点击上传
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };
  
  // 处理文件选择
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFilesSelected(files);
    }
  };
  
  // 处理选中的文件
  const handleFilesSelected = (files: File[]) => {
    // 限制最多10个文件
    const newFiles = files.slice(0, 10);
    setSelectedFiles(prevFiles => {
      const combined = [...prevFiles, ...newFiles];
      return combined.slice(0, 10); // 确保总数不超过10个
    });
    
    // 移除自动进入下一步的逻辑，用户需要点击下一步按钮
  };
  
  // 删除选中的文件
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // 处理自定义对话框关闭
  const handleCloseCustomDialog = () => {
    setShowCustomDialog(false);
  };

  // 处理自定义对话框保存
  const handleSaveCustomSettings = () => {
    setShowCustomDialog(false);
    // 这里可以添加保存设置的逻辑
  };

  // 处理分段预览对话框关闭
  const handleCloseSegmentPreviewDialog = () => {
    setShowSegmentPreviewDialog(false);
  };

  // 处理分段预览对话框打开
  const handleOpenSegmentPreviewDialog = () => {
    setShowSegmentPreviewDialog(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 自定义对话框 */}
      {showCustomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">自定义</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={handleCloseCustomDialog}
              >
                <Icon icon="ri:close-line" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分析模型</label>
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        value={analysisModel}
                        onChange={(e) => setAnalysisModel(e.target.value)}
                      >
                        <option value="deepseek-R1">deepseek-R1</option>
                        <option value="gpt-4">gpt-4</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">关联知识库</label>
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        value={relatedKnowledge}
                        onChange={(e) => setRelatedKnowledge(e.target.value)}
                      >
                        <option value="大纲">大纲</option>
                        <option value="角色设定">角色设定</option>
                        <option value="世界观">世界观</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">拆解提示词</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm h-32"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">分段最大长度 (当前知识库向量模型最大接收长度为8192tokens)</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="w-32 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      value={chunkMaxLength}
                      onChange={(e) => setChunkMaxLength(e.target.value)}
                    />
                    <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-r-md text-sm">tokens</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">分段最小长度 ("分段最小长度"最大为"分段最大长度"的1/10)</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="w-32 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      value={chunkMinLength}
                      onChange={(e) => setChunkMinLength(e.target.value)}
                    />
                    <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-r-md text-sm">tokens</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={addTitleToChunk}
                        onChange={(e) => setAddTitleToChunk(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">分段内容中添加文字标题</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 mr-2 hover:bg-gray-50"
                onClick={handleCloseCustomDialog}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                onClick={handleSaveCustomSettings}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 顶部导航 */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button 
          className="text-gray-600 hover:text-gray-900 mr-4"
          onClick={handleGoBack}
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">知识库</span>
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 mx-2">{knowledgeBaseName}</span>
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
          <span className="font-medium ml-2">添加</span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-grow p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
          {/* 步骤指示器 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > 1 ? 'bg-indigo-600 text-white' : currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 1 ? <Icon icon="ri:check-line" className="w-5 h-5" /> : '1'}
                </div>
                <div className="text-sm font-medium ml-2">上传</div>
              </div>
              
              <div className="w-24 h-1 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-indigo-600" 
                  style={{ width: currentStep > 1 ? '100%' : '0%' }}
                ></div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > 2 ? 'bg-indigo-600 text-white' : currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 2 ? <Icon icon="ri:check-line" className="w-5 h-5" /> : '2'}
                </div>
                <div className="text-sm font-medium ml-2">分段&清洗</div>
              </div>
              
              <div className="w-24 h-1 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-indigo-600" 
                  style={{ width: currentStep > 2 ? '100%' : '0%' }}
                ></div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <div className="text-sm font-medium ml-2">数据处理</div>
              </div>
            </div>
          </div>
          
          {/* 步骤内容 */}
          <div className="p-6">
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <div className="text-base font-medium text-gray-700 mb-2">
                    数据标签 (非必填，用于给文档打标签，便于后续回归回溯)
                  </div>
                  <div className="relative">
                    <div 
                      className="w-full border border-indigo-200 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-300 appearance-none bg-white flex justify-between items-center cursor-pointer"
                      onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                    >
                      <div className="flex-1 flex items-center">
                        {selectedTag ? (
                          <div className="flex items-center">
                            <span className="text-gray-800">{selectedTag}</span>
                            <button
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag('');
                              }}
                            >
                              <Icon icon="ri:close-line" className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">请选择标签</span>
                        )}
                      </div>
                      <Icon 
                        icon={isTagDropdownOpen ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'} 
                        className="w-5 h-5 text-gray-400" 
                      />
                    </div>
                    
                    {isTagDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                        {/* 增加标签按钮 */}
                        <button 
                          className="w-full flex items-center text-indigo-600 hover:bg-indigo-50 px-4 py-2 text-left border-b border-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewTagName('');
                            setShowTagInput(true);
                            setTimeout(() => {
                              const input = document.getElementById('newTagInput');
                              if (input) {
                                input.focus();
                              }
                            }, 10);
                          }}
                        >
                          <Icon icon="ri:add-line" className="w-4 h-4 mr-2" />
                          <span>增加标签</span>
                        </button>
                        
                        {/* 新标签输入框 */}
                        {showTagInput && (
                          <div className="p-3 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="flex-1 relative">
                                <input
                                  id="newTagInput"
                                  type="text"
                                  className="w-full border border-gray-200 rounded-md pl-2 pr-7 py-1 text-sm focus:outline-none focus:border-indigo-300"
                                  value={newTagName}
                                  onChange={(e) => setNewTagName(e.target.value)}
                                  placeholder="输入新标签名称"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTagName.trim()) {
                                      setTags([...tags, newTagName.trim()]);
                                      setSelectedTag(newTagName.trim());
                                      setNewTagName('');
                                      setShowTagInput(false);
                                      setIsTagDropdownOpen(false);
                                    }
                                  }}
                                />
                                {newTagName && (
                                  <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNewTagName('');
                                    }}
                                  >
                                    <Icon icon="ri:close-line" className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <button 
                                className="ml-2 px-2 py-1 bg-indigo-600 text-white text-sm rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (newTagName && newTagName.trim()) {
                                    setTags([...tags, newTagName.trim()]);
                                    setSelectedTag(newTagName.trim());
                                    setNewTagName('');
                                    setShowTagInput(false);
                                    setIsTagDropdownOpen(false);
                                  }
                                }}
                              >
                                确定
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* 标签列表 */}
                        <div className="max-h-60 overflow-y-auto">
                          {tags.length > 0 ? (
                            tags.map((tag, index) => (
                              <div 
                                key={index}
                                className={`px-4 py-2 cursor-pointer ${selectedTag === tag ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                  setSelectedTag(tag);
                                  setIsTagDropdownOpen(false);
                                }}
                              >
                                {tag}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-center">无选项</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 隐藏的文件输入框 */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept=".pdf,.txt,.md,.html,.doc,.docx"
                  onChange={handleFileInputChange}
                />
                
                {selectedFiles.length === 0 ? (
                  <div 
                    className={`border-2 border-dashed ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'} rounded-lg p-12 flex flex-col items-center justify-center text-center transition-colors duration-200`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="w-16 h-16 mb-4 text-indigo-200">
                      <Icon icon="ri:upload-cloud-2-line" className="w-full h-full" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      将文件拖到此区域，或<button type="button" onClick={handleClickUpload} className="text-indigo-600 hover:text-indigo-800">点击上传</button>
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      支持 PDF、TXT、MARKDOWN、HTML、DOC、DOCX 最多上传 10 个文件
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700">
                        已选择 {selectedFiles.length} 个文件
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                          onClick={handleClickUpload}
                        >
                          <Icon icon="ri:add-line" className="w-4 h-4 mr-1" />
                          添加文件
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="mr-3 text-gray-400">
                              <Icon 
                                icon={
                                  file.name.endsWith('.pdf') ? 'ri:file-pdf-line' :
                                  file.name.endsWith('.txt') ? 'ri:file-text-line' :
                                  file.name.endsWith('.md') ? 'ri:markdown-line' :
                                  file.name.endsWith('.html') ? 'ri:html5-line' :
                                  'ri:file-word-line'
                                } 
                                className="w-6 h-6" 
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{file.name}</div>
                              <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                          </div>
                          <button 
                            type="button"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <Icon icon="ri:delete-bin-line" className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">分段与清洗步骤</h3>
                
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                      <label className="flex items-center cursor-pointer" onClick={() => setShowCustomDialog(true)}>
                        <input 
                          type="radio" 
                          name="processingType" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          checked={true}
                          readOnly
                        />
                        <span className="ml-2 text-base font-medium text-gray-700">自定义</span>
                      </label>
                      <p className="mt-1 ml-6 text-sm text-gray-500">
                        优先按行数分段，超出设置的最大分段长度后，再按大分段划分并按段落长度处理
                      </p>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium text-gray-700">共 {selectedFiles.length} 个文档</div>
                        <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800">分段预览</button>
                      </div>
                      

                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">数据处理步骤</h3>
                
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">向量模型</label>
                      <select 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      >
                        <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                        <option value="text2vec-base">text2vec-base</option>
                        <option value="text2vec-large">text2vec-large</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked={true}
                        />
                        <span className="ml-2 text-sm text-gray-700">文本去重</span>
                      </label>
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked={true}
                        />
                        <span className="ml-2 text-sm text-gray-700">文本清洗</span>
                      </label>
                      <p className="mt-1 ml-6 text-xs text-gray-500">
                        删除多余空格、换行符、特殊符号等
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked={false}
                        />
                        <span className="ml-2 text-sm text-gray-700">智能分段</span>
                      </label>
                      <p className="mt-1 ml-6 text-xs text-gray-500">
                        使用大模型对文本进行智能分段，根据语义划分段落
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-700">处理摘要</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700">文件总数：{selectedFiles.length}</div>
                      <div className="text-sm text-gray-500">大小：{selectedFiles.reduce((total, file) => total + file.size, 0) / 1024 > 1024 ? 
                        (selectedFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2) + ' MB' : 
                        (selectedFiles.reduce((total, file) => total + file.size, 0) / 1024).toFixed(2) + ' KB'}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">预计分段数：{Math.ceil(selectedFiles.reduce((total, file) => total + file.size, 0) / 2000)}</div>
                      <div className="text-sm text-gray-500">预计向量数：{Math.ceil(selectedFiles.reduce((total, file) => total + file.size, 0) / 2000)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 底部按钮 */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button 
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md text-sm"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
            >
              {currentStep > 1 ? '上一步' : '取消'}
            </button>
            
            <div>
              {currentStep < 3 && (
                <button 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                  onClick={handleNextStep}
                  disabled={currentStep === 1 && selectedFiles.length === 0}
                >
                  下一步
                </button>
              )}
              
              {currentStep === 3 && (
                <button 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                  onClick={() => navigate(`/knowledge/${knowledgeId}`)}
                >
                  完成
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeUploadPage;
