import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface PromptConfig {
  id: string;
  position: string;
  option: string;
  prompt: string;
}

const initialData: PromptConfig[] = [
  { id: "1", position: "首页-创作类型", option: "副本生成", prompt: "" },
  { id: "2", position: "首页-创作类型", option: "小说生成", prompt: "" },
  { id: "3", position: "首页-创作模式", option: "续写模式", prompt: "" },
  { id: "4", position: "首页-创作模式", option: "创作模式", prompt: "" },
  { id: "5", position: "首页-题材风格", option: "古风", prompt: "" },
  { id: "6", position: "首页-题材风格", option: "西方奇幻", prompt: "" },
  { id: "7", position: "首页-题材风格", option: "浪漫言情", prompt: "" },
  { id: "8", position: "首页-题材风格", option: "悬疑惊悚", prompt: "" },
  { id: "9", position: "首页-题材风格", option: "粉丝同人", prompt: "" },
  { id: "10", position: "首页-题材风格", option: "游戏竞技", prompt: "" },
  { id: "11", position: "首页-题材风格", option: "LGBTQ+", prompt: "" },
  { id: "12", position: "首页-输入框", option: "", prompt: "[首页-创作类型]+[创作模式]+[题材风格]+[输入内容]" },
];

export function PromptConfigManager() {
  const [configs, setConfigs] = useState<PromptConfig[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingConfig, setEditingConfig] = useState<PromptConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredConfigs = useMemo(() => {
    return configs.filter(config => 
      config.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.option.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [configs, searchTerm]);

  const handleSave = (config: PromptConfig) => {
    if (editingConfig) {
      setConfigs(prev => prev.map(c => c.id === config.id ? config : c));
    } else {
      const newConfig = { ...config, id: Date.now().toString() };
      setConfigs(prev => [...prev, newConfig]);
    }
    setEditingConfig(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (config: PromptConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setIsDialogOpen(true);
  };

  const getPositionColor = (position: string) => {
    if (position.includes("创作类型")) return "bg-blue-100 text-blue-800";
    if (position.includes("创作模式")) return "bg-green-100 text-green-800";
    if (position.includes("题材风格")) return "bg-purple-100 text-purple-800";
    if (position.includes("输入框")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>提示词配置管理</CardTitle>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索位置、选项或提示词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
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
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredConfigs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "没有找到匹配的配置项" : "暂无配置项"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConfigFormProps {
  config: PromptConfig | null;
  onSave: (config: PromptConfig) => void;
  onCancel: () => void;
}

function ConfigForm({ config, onSave, onCancel }: ConfigFormProps) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="position">位置</Label>
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
      </div>
      
      <div>
        <Label htmlFor="option">选项</Label>
        <Input
          id="option"
          value={option}
          onChange={(e) => setOption(e.target.value)}
          placeholder="例如：副本生成"
        />
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="prompt">提示词</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>用[]拼接其它提示词和用户输入内容，用+拼接不同提示词，如[提示词:首页-创作类型]+[提示词:首页-创作模式]+[提示词:题材风格]+[输入内容:首页-输入框]</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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