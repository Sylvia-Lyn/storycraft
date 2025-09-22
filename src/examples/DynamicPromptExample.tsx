import React, { useState } from 'react';
import { callHomePageAI } from '../services/dynamicPromptService';
import { useAuth } from '../contexts/AuthContext';
import { checkPromptConfigIntegrity } from '../utils/promptBuilder';

/**
 * 动态 Prompt 使用示例
 * 展示如何在前端组件中使用动态 prompt 构建器
 */
export const DynamicPromptExample: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [selectedType, setSelectedType] = useState('副本生成');
  const [selectedMode, setSelectedMode] = useState('续写模式');
  const [selectedStyle, setSelectedStyle] = useState('古风');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [configCheckResult, setConfigCheckResult] = useState<any>(null);

  // 检查配置完整性
  const handleCheckConfig = async () => {
    if (!isAuthenticated || !token) {
      alert('请先登录');
      return;
    }

    const replacements = {
      '首页-创作类型': selectedType,
      '首页-创作模式': selectedMode,
      '首页-题材风格': selectedStyle,
      '输入内容': userInput
    };

    try {
      const result = await checkPromptConfigIntegrity(replacements, token);
      setConfigCheckResult(result);
    } catch (error) {
      console.error('配置检查失败:', error);
    }
  };

  // 处理 AI 生成
  const handleGenerate = async () => {
    if (!isAuthenticated || !token) {
      alert('请先登录');
      return;
    }

    if (!userInput.trim()) {
      alert('请输入内容');
      return;
    }

    setIsGenerating(true);
    setAiResponse('');

    try {
      console.log('开始调用首页 AI:', {
        userInput,
        selectedType,
        selectedMode,
        selectedStyle
      });

      const response = await callHomePageAI(
        userInput,
        selectedType,
        selectedMode,
        selectedStyle,
        token,
        'deepseek-r1'
      );

      setAiResponse(response);
    } catch (error) {
      console.error('AI 生成失败:', error);
      setAiResponse('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <p>请先登录以使用动态 prompt 功能</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">动态 Prompt 示例</h2>
      
      <div className="space-y-4">
        {/* 用户选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">创作类型</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="副本生成">副本生成</option>
              <option value="小说生成">小说生成</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">创作模式</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="续写模式">续写模式</option>
              <option value="创作模式">创作模式</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">题材风格</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="古风">古风</option>
              <option value="西方奇幻">西方奇幻</option>
              <option value="浪漫言情">浪漫言情</option>
              <option value="悬疑惊悚">悬疑惊悚</option>
            </select>
          </div>
        </div>

        {/* 用户输入 */}
        <div>
          <label className="block text-sm font-medium mb-2">输入内容</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="请输入您想要生成的内容..."
            className="w-full p-3 border rounded-md h-24 resize-none"
          />
        </div>

        {/* 按钮组 */}
        <div className="flex gap-3">
          <button
            onClick={handleCheckConfig}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700"
          >
            检查配置
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !userInput.trim()}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '生成内容'}
          </button>
        </div>

        {/* 配置检查结果 */}
        {configCheckResult && (
          <div>
            <label className="block text-sm font-medium mb-2">配置检查结果</label>
            <div className="p-4 bg-gray-50 border rounded-md">
              {configCheckResult.missing.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium text-red-600 mb-2">缺失配置:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {configCheckResult.missing.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configCheckResult.warnings.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium text-yellow-600 mb-2">警告:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-600">
                    {configCheckResult.warnings.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configCheckResult.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">建议:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-600">
                    {configCheckResult.suggestions.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configCheckResult.missing.length === 0 && configCheckResult.warnings.length === 0 && (
                <p className="text-green-600">✅ 所有配置完整</p>
              )}
            </div>
          </div>
        )}

        {/* AI 响应 */}
        {aiResponse && (
          <div>
            <label className="block text-sm font-medium mb-2">AI 生成结果</label>
            <div className="p-4 bg-gray-50 border rounded-md min-h-[100px] whitespace-pre-wrap">
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* 调试信息 */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          查看调试信息
        </summary>
        <div className="mt-2 p-4 bg-gray-100 rounded-md text-sm">
          <p><strong>当前选择：</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>创作类型: {selectedType}</li>
            <li>创作模式: {selectedMode}</li>
            <li>题材风格: {selectedStyle}</li>
            <li>输入内容: {userInput}</li>
          </ul>
          <p className="mt-2"><strong>说明：</strong></p>
          <p className="text-xs text-gray-600">
            系统会从数据库中获取"首页-输入框"的 prompt 模板，然后根据您的选择动态替换其中的占位符：
            [首页-创作类型]、[首页-创作模式]、[首页-题材风格]、[输入内容]
          </p>
        </div>
      </details>
    </div>
  );
};

export default DynamicPromptExample;
