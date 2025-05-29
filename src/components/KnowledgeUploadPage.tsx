import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const KnowledgeUploadPage: React.FC = () => {
  const { knowledgeId } = useParams<{ knowledgeId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  
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
    // 实际应用中这里应该处理文件上传
    console.log('文件已拖放');
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // 处理点击上传
  const handleClickUpload = () => {
    // 实际应用中这里应该触发文件选择对话框
    console.log('点击上传');
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
          <span className="text-gray-500 mx-2">{knowledgeId}</span>
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
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                    >
                      <option value="">请选择标签</option>
                      <option value="tag1">标签1</option>
                      <option value="tag2">标签2</option>
                      <option value="tag3">标签3</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="w-16 h-16 mb-4 text-indigo-200">
                    <Icon icon="ri:upload-cloud-2-line" className="w-full h-full" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    将文件拖到此区域，或<button onClick={handleClickUpload} className="text-indigo-600 hover:text-indigo-800">点击上传</button>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    支持 PDF、TXT、MARKDOWNM、HTML、DOC、DOCX 最多上传 10 个文件
                  </p>
                </div>
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
          <div className="p-6 border-t border-gray-200 flex justify-end">
            {currentStep < 3 && (
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                onClick={handleNextStep}
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
  );
};

export default KnowledgeUploadPage;
