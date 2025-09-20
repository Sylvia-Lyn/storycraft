import React, { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PoweroffOutlined, PoweroffOutlined as PowerOnOutlined } from '@ant-design/icons';
import config from '../config';
import { callPromptApi, ApiError } from '../utils/apiUtils';
import { useAuth } from '../contexts/AuthContext';

interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  model: string;
  language: string;
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  tags: string[];
}

interface PromptFormData {
  name: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  model: string;
  language: string;
  isActive: boolean;
  isDefault: boolean;
  tags: string[];
}

const PromptPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    description: '',
    category: '',
    content: '',
    variables: [],
    model: 'deepseek-r1',
    language: 'zh-CN',
    isActive: true,
    isDefault: false,
    tags: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const categories = [
    '角色生成',
    '剧本生成',
    '大纲生成',
    '场景生成',
    '对话生成',
    '情节发展',
    '其他'
  ];

  const models = [
    'deepseek-r1',
    'gpt-4',
    'claude-3',
    'gemini-pro'
  ];

  const languages = [
    'zh-CN',
    'en-US',
    'ja-JP'
  ];

  // 获取prompt列表
  const fetchPrompts = async () => {
    console.log('🔍 fetchPrompts调用 - isAuthenticated:', isAuthenticated, 'token:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!isAuthenticated || !token) {
      console.warn('用户未登录，无法获取prompt列表');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 调用callPromptApi，token:', token.substring(0, 20) + '...');
      const result = await callPromptApi('list', {
        category: selectedCategory || undefined,
        isActive: showActiveOnly ? true : undefined,
        search: searchTerm || undefined
      }, token);

      if (result.success) {
        setPrompts(result.data || []);
      } else {
        console.error('获取prompt列表失败:', result.error);
        alert('获取prompt列表失败: ' + result.error);
      }
    } catch (error) {
      console.error('获取prompt列表出错:', error);
      let errorMessage = '获取prompt列表失败';
      
      if (error instanceof ApiError) {
        if (error.code === 'SSL_CERT_ERROR') {
          errorMessage = 'SSL证书验证失败，请联系管理员';
        } else if (error.code === 'API_CALL_ERROR') {
          errorMessage = '网络连接失败，请检查网络连接或稍后重试';
        } else if (error.code === 'TOKEN_EXPIRED' || error.code === 'USER_NOT_AUTHENTICATED') {
          errorMessage = '登录已过期，请重新登录';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (error.message.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        errorMessage = 'SSL证书验证失败，请联系管理员';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `服务器错误: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPrompts();
    }
  }, [searchTerm, selectedCategory, showActiveOnly, isAuthenticated, token]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      content: '',
      variables: [],
      model: 'deepseek-r1',
      language: 'zh-CN',
      isActive: true,
      isDefault: false,
      tags: []
    });
  };

  // 打开创建模态框
  const handleCreate = () => {
    resetForm();
    setEditingPrompt(null);
    setShowModal(true);
  };

  // 打开编辑模态框
  const handleEdit = (prompt: Prompt) => {
    setFormData({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      content: prompt.content,
      variables: prompt.variables,
      model: prompt.model,
      language: prompt.language,
      isActive: prompt.isActive,
      isDefault: prompt.isDefault,
      tags: prompt.tags
    });
    setEditingPrompt(prompt);
    setShowModal(true);
  };

  // 查看prompt详情
  const handleView = (prompt: Prompt) => {
    setViewingPrompt(prompt);
  };

  // 保存prompt
  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      alert('请先登录');
      return;
    }

    if (!formData.name || !formData.description || !formData.category || !formData.content) {
      alert('请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      const action = editingPrompt ? 'update' : 'create';
      const payload = editingPrompt 
        ? { id: editingPrompt.id, ...formData }
        : { ...formData, createdBy: 'user' };

      const result = await callPromptApi(action, payload, token);
      
      if (result.success) {
        setShowModal(false);
        fetchPrompts();
        alert(editingPrompt ? 'Prompt更新成功' : 'Prompt创建成功');
      } else {
        alert('保存失败: ' + result.error);
      }
    } catch (error) {
      console.error('保存prompt出错:', error);
      let errorMessage = '保存失败';
      
      if (error instanceof ApiError) {
        if (error.code === 'SSL_CERT_ERROR') {
          errorMessage = 'SSL证书验证失败，请联系管理员';
        } else if (error.code === 'API_CALL_ERROR') {
          errorMessage = '网络连接失败，请检查网络连接或稍后重试';
        } else if (error.code === 'TOKEN_EXPIRED' || error.code === 'USER_NOT_AUTHENTICATED') {
          errorMessage = '登录已过期，请重新登录';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (error.message.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        errorMessage = 'SSL证书验证失败，请联系管理员';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `服务器错误: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 删除prompt
  const handleDelete = async (prompt: Prompt) => {
    if (!isAuthenticated || !token) {
      alert('请先登录');
      return;
    }

    if (!confirm(`确定要删除prompt "${prompt.name}" 吗？`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await callPromptApi('delete', { id: prompt.id }, token);
      
      if (result.success) {
        fetchPrompts();
        alert('Prompt删除成功');
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (error) {
      console.error('删除prompt出错:', error);
      let errorMessage = '删除失败';
      
      if (error instanceof ApiError) {
        if (error.code === 'SSL_CERT_ERROR') {
          errorMessage = 'SSL证书验证失败，请联系管理员';
        } else if (error.code === 'API_CALL_ERROR') {
          errorMessage = '网络连接失败，请检查网络连接或稍后重试';
        } else if (error.code === 'TOKEN_EXPIRED' || error.code === 'USER_NOT_AUTHENTICATED') {
          errorMessage = '登录已过期，请重新登录';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (error.message.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        errorMessage = 'SSL证书验证失败，请联系管理员';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `服务器错误: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 切换启用状态
  const handleToggleActive = async (prompt: Prompt) => {
    if (!isAuthenticated || !token) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const result = await callPromptApi('toggle_active', { id: prompt.id }, token);
      
      if (result.success) {
        fetchPrompts();
      } else {
        alert('切换状态失败: ' + result.error);
      }
    } catch (error) {
      console.error('切换状态出错:', error);
      let errorMessage = '切换状态失败';
      
      if (error instanceof ApiError) {
        if (error.code === 'SSL_CERT_ERROR') {
          errorMessage = 'SSL证书验证失败，请联系管理员';
        } else if (error.code === 'API_CALL_ERROR') {
          errorMessage = '网络连接失败，请检查网络连接或稍后重试';
        } else if (error.code === 'TOKEN_EXPIRED' || error.code === 'USER_NOT_AUTHENTICATED') {
          errorMessage = '登录已过期，请重新登录';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (error.message.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        errorMessage = 'SSL证书验证失败，请联系管理员';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `服务器错误: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 添加变量
  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, '']
    });
  };

  // 更新变量
  const updateVariable = (index: number, value: string) => {
    const newVariables = [...formData.variables];
    newVariables[index] = value;
    setFormData({
      ...formData,
      variables: newVariables
    });
  };

  // 删除变量
  const removeVariable = (index: number) => {
    const newVariables = formData.variables.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variables: newVariables
    });
  };

  // 添加标签
  const addTag = () => {
    const tag = prompt('请输入标签名称:');
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Prompt管理</h1>
            <p className="text-gray-600 mb-6">请先登录以管理您的prompt模板</p>
            <button
              onClick={() => window.location.href = '/#/app/login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt管理</h1>
          <p className="text-gray-600">管理AI模型调用的prompt模板</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <input
                type="text"
                placeholder="搜索prompt名称、描述或内容"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">仅显示启用的</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <PlusOutlined className="w-4 h-4 mr-2" />
                新建Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Prompt列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无prompt数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用次数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prompts.map((prompt) => (
                    <tr key={prompt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{prompt.name}</div>
                          <div className="text-sm text-gray-500">{prompt.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {prompt.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prompt.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(prompt)}
                            className="flex items-center"
                          >
                            {prompt.isActive ? (
                              <PowerOnOutlined className="w-6 h-6 text-green-600" />
                            ) : (
                              <PoweroffOutlined className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          {prompt.isDefault && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              默认
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prompt.usageCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(prompt)}
                            className="text-blue-600 hover:text-blue-900"
                            title="查看"
                          >
                            <EyeOutlined className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(prompt)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="编辑"
                          >
                            <EditOutlined className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prompt)}
                            className="text-red-600 hover:text-red-900"
                            title="删除"
                          >
                            <DeleteOutlined className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 创建/编辑模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingPrompt ? '编辑Prompt' : '新建Prompt'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">名称 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请输入prompt名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择分类</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述 *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请输入prompt描述"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容 *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="请输入prompt内容，可以使用 {变量名} 来定义可替换的变量"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">变量</label>
                  <div className="space-y-2">
                    {formData.variables.map((variable, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={variable}
                          onChange={(e) => updateVariable(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="变量名"
                        />
                        <button
                          onClick={() => removeVariable(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addVariable}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      添加变量
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">模型</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">启用</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">默认</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    添加标签
                  </button>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 查看详情模态框 */}
        {viewingPrompt && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prompt详情</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                    <p className="text-sm text-gray-900">{viewingPrompt.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <p className="text-sm text-gray-900">{viewingPrompt.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                      <p className="text-sm text-gray-900">{viewingPrompt.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
                      <p className="text-sm text-gray-900">{viewingPrompt.model}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">{viewingPrompt.content}</pre>
                    </div>
                  </div>
                  
                  {viewingPrompt.variables.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">变量</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingPrompt.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPrompt.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingPrompt.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                      <p className="text-sm text-gray-900">
                        {viewingPrompt.isActive ? '启用' : '禁用'}
                        {viewingPrompt.isDefault && ' (默认)'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">使用次数</label>
                      <p className="text-sm text-gray-900">{viewingPrompt.usageCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                      <p className="text-sm text-gray-900">{new Date(viewingPrompt.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">更新时间</label>
                      <p className="text-sm text-gray-900">{new Date(viewingPrompt.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setViewingPrompt(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
