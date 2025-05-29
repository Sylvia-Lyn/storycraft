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

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
                  currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
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
                  currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
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
                  currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
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
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-700 mb-2">分段与清洗步骤</h3>
                <p className="text-gray-500">在这里可以设置文档的分段和清洗规则</p>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-700 mb-2">数据处理步骤</h3>
                <p className="text-gray-500">在这里可以设置数据处理的相关参数</p>
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
