import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Info } from "./ui/icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { callPromptApi } from "../utils/apiUtils";
import { useAuth } from "../contexts/AuthContext";

interface PromptConfig {
  id: string;
  position: string;
  option: string;
  prompt: string;
}


export default function PromptConfigPage() {
  const { token, isAuthenticated } = useAuth();
  const [configs, setConfigs] = useState<PromptConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingConfig, setEditingConfig] = useState<PromptConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<PromptConfig | null>(null);

  const filteredConfigs = useMemo(() => {
    return configs.filter(config => 
      config.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.option.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [configs, searchTerm]);

  const handleSave = async (config: PromptConfig) => {
    try {
      if (editingConfig) {
        // 更新现有配置
        const result = await callPromptApi('update', {
          id: config.id,
          name: `${config.position} - ${config.option}`,
          description: `位置：${config.position}，选项：${config.option}`,
          category: 'prompt-config',
          content: config.prompt,
          location: config.position,
          option: config.option
        }, token);
        
        if (result.success) {
          setConfigs(prev => prev.map(c => c.id === config.id ? config : c));
        } else {
          alert('更新失败: ' + result.error);
          return;
        }
      } else {
        // 创建新配置
        const result = await callPromptApi('create', {
          name: `${config.position} - ${config.option}`,
          description: `位置：${config.position}，选项：${config.option}`,
          category: 'prompt-config',
          content: config.prompt,
          location: config.position,
          option: config.option
        }, token);
        
        if (result.success) {
          const newConfig = { ...config, id: result.data.id };
          setConfigs(prev => [...prev, newConfig]);
        } else {
          alert('创建失败: ' + result.error);
          return;
        }
      }
      
      setEditingConfig(null);
      setIsEditMode(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEdit = (config: PromptConfig) => {
    setEditingConfig(config);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (config: PromptConfig) => {
    setConfigToDelete(config);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (configToDelete) {
      try {
        const result = await callPromptApi('delete', {
          id: configToDelete.id
        }, token);
        
        if (result.success) {
          setConfigs(prev => prev.filter(c => c.id !== configToDelete.id));
        } else {
          alert('删除失败: ' + result.error);
          return;
        }
      } catch (error) {
        console.error('删除配置失败:', error);
        alert('删除失败: ' + (error.message || '未知错误'));
        return;
      }
    }
    setConfigToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const cancelDelete = () => {
    setConfigToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingConfig(null);
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const result = await callPromptApi('list', {
        category: 'prompt-config'
      }, token);
      
      if (result.success && result.data) {
        console.log('从后端获取的原始数据:', result.data);
        // 将后端数据转换为前端格式
        const formattedConfigs = result.data.map((item: any) => {
          console.log('处理数据项:', {
            id: item.id,
            location: item.location,
            option: item.option,
            content: item.content,
            name: item.name,
            description: item.description
          });
          
          // 如果 location 和 option 字段不存在，尝试从 description 中解析
          let position = item.location || '';
          let option = item.option || '';
          
          if (!position || !option) {
            // 解析 description 格式："位置：首页-创作模式，选项：创作模式" 或 "位置：首页-输入框，选项："
            // 使用 (.*) 而不是 (.+) 来允许选项为空
            const descMatch = item.description?.match(/位置：([^，]+)，选项：(.*)/);
            if (descMatch) {
              position = descMatch[1] || position;
              option = descMatch[2] || option;
            }
          }
          
          return {
            id: item.id,
            position: position,
            option: option,
            prompt: item.content || ''
          };
        });
        console.log('格式化后的配置数据:', formattedConfigs);
        setConfigs(formattedConfigs);
      } else {
        console.error('获取配置失败:', result.error);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  React.useEffect(() => {
    if (isAuthenticated && token) {
      fetchConfigs();
    }
  }, [isAuthenticated, token]);

  const getPositionColor = (position: string) => {
    if (position.includes("创作类型")) return "bg-blue-100 text-blue-800";
    if (position.includes("创作模式")) return "bg-green-100 text-green-800";
    if (position.includes("题材风格")) return "bg-purple-100 text-purple-800";
    if (position.includes("输入框")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">提示词配置后台</h1>
            <p className="text-gray-600 mb-6">请先登录以管理您的提示词配置</p>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">提示词配置后台</h1>
        <Card>
          <CardHeader>
            <CardTitle>提示词配置管理</CardTitle>
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索位置、选项或提示词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) {
                  handleDialogClose();
                }
              }}>
                <DialogTrigger>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加配置
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingConfig ? "编辑配置" : "添加新配置"}
                    </DialogTitle>
                  </DialogHeader>
                  <ConfigForm
                    config={editingConfig}
                    isEditMode={isEditMode}
                    onSave={handleSave}
                    onCancel={handleDialogClose}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">位置</TableHead>
                      <TableHead className="w-1/4">选项</TableHead>
                      <TableHead className="w-1/3">提示词</TableHead>
                      <TableHead className="w-1/6">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant="secondary" className={getPositionColor(config.position)}>
                          {config.position}
                        </Badge>
                      </TableCell>
                      <TableCell>{config.option}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={config.prompt}>
                          {config.prompt}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {config.position !== "首页-输入框" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(config)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredConfigs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "没有找到匹配的配置项" : "暂无配置项"}
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* 删除确认弹窗 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          cancelDelete();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              确定要删除配置项 "{configToDelete?.position} - {configToDelete?.option}" 吗？
            </p>
            <p className="text-sm text-gray-500 mt-2">
              此操作无法撤销。
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDelete}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ConfigFormProps {
  config: PromptConfig | null;
  isEditMode: boolean;
  onSave: (config: PromptConfig) => void;
  onCancel: () => void;
}

function ConfigForm({ config, isEditMode, onSave, onCancel }: ConfigFormProps) {
  const [position, setPosition] = useState(config?.position || "");
  const [option, setOption] = useState(config?.option || "");
  const [prompt, setPrompt] = useState(config?.prompt || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) return;

    onSave({
      id: config?.id || "",
      position: position.trim(),
      option: option.trim(),
      prompt: prompt.trim(),
    });
  };

  const predefinedPositions = [
    "首页-创作类型",
    "首页-创作模式", 
    "首页-题材风格",
    "首页-输入框"
  ];

  const isEditing = isEditMode;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="position">位置</Label>
        {isEditing ? (
          <div className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md border">
            {position}
          </div>
        ) : (
          <>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="例如：首页-创作类型"
              required
              list="positions"
            />
            <datalist id="positions">
              {predefinedPositions.map(pos => (
                <option key={pos} value={pos} />
              ))}
            </datalist>
          </>
        )}
      </div>
      
      <div>
        <Label htmlFor="option">选项</Label>
        {isEditing ? (
          <div className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md border">
            {option || '-'}
          </div>
        ) : (
          <Input
            id="option"
            value={option}
            onChange={(e) => setOption(e.target.value)}
            placeholder="例如：副本生成"
          />
        )}
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="prompt">提示词</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help hover:text-blue-600 transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="whitespace-normal leading-relaxed">
                用[]拼接其它提示词和用户输入内容，用+拼接不同提示词，如[提示词:首页-创作类型]+[提示词:首页-创作模式]+[提示词:题材风格]+[输入内容:首页-输入框]
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入提示词内容..."
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {config ? "更新" : "添加"}
        </Button>
      </div>
    </form>
  );
}
