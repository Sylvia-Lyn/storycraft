import React, { useState } from 'react';
import { Button, Card, Alert, Spin } from 'antd';
import { generateGeminiContent, checkGeminiApiStatus } from '../services/geminiService';

const GeminiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);

  const testApiConnection = async () => {
    setIsLoading(true);
    setError('');
    setResult('');
    
    try {
      const status = await checkGeminiApiStatus();
      setApiStatus(status);
      if (status) {
        setResult('API连接测试成功！');
      } else {
        setError('API连接测试失败');
      }
    } catch (err) {
      setError(`API连接测试失败: ${err instanceof Error ? err.message : '未知错误'}`);
      setApiStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testGeminiGeneration = async () => {
    setIsLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await generateGeminiContent('请用中文回答：你好，请简单介绍一下你自己。', 'zh-CN');
      setResult(response);
    } catch (err) {
      setError(`生成测试失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card title="Gemini API 测试" className="mb-4">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              type="primary" 
              onClick={testApiConnection}
              loading={isLoading}
            >
              测试 API 连接
            </Button>
            <Button 
              onClick={testGeminiGeneration}
              loading={isLoading}
            >
              测试内容生成
            </Button>
          </div>
          
          {apiStatus !== null && (
            <Alert
              message={apiStatus ? "API 连接正常" : "API 连接失败"}
              type={apiStatus ? "success" : "error"}
              showIcon
            />
          )}
          
          {error && (
            <Alert
              message="错误信息"
              description={error}
              type="error"
              showIcon
            />
          )}
          
          {result && (
            <Card size="small" title="生成结果">
              <div className="whitespace-pre-wrap">{result}</div>
            </Card>
          )}
          
          {isLoading && (
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-2">正在测试中...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GeminiTest;
