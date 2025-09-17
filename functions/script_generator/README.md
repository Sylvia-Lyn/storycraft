# 小说转剧本生成API

这是一个基于AI的小说转剧本生成云函数，可以将小说文本自动转换为包含大纲、角色设定和分幕剧本的完整剧本。

## 功能特性

- 📖 **智能内容分析**: 自动分析小说内容，提取角色和场景信息
- 🎭 **AI剧本生成**: 使用DeepSeek或Gemini模型生成专业剧本
- 📋 **完整剧本结构**: 包含大纲、角色设定、分幕剧本
- 🎬 **详细场景描述**: 每幕包含角色、场景、对话和动作指导
- 🌐 **多语言支持**: 支持中文、英文、日文
- ⚡ **高性能处理**: 优化的处理流程，快速生成结果

## API接口

### 请求格式

```http
POST https://your-domain.com/script_generator
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "novel_content": "小说文本内容...",
  "options": {
    "model": "deepseek-r1",
    "language": "zh-CN",
    "style": "古风情感",
    "max_scenes": 5,
    "include_dialogue": true
  }
}
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| novel_content | string | 是 | 小说文本内容，100-100,000字符 |
| options | object | 否 | 生成选项 |

#### options参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| model | string | "deepseek-r1" | AI模型：deepseek-r1 或 gemini |
| language | string | "zh-CN" | 语言：zh-CN, en-US, ja-JP |
| style | string | "古风情感" | 剧本风格 |
| max_scenes | number | 5 | 最大分幕数，1-20 |
| include_dialogue | boolean | true | 是否包含对话 |

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    "outline": {
      "title": "剧本标题",
      "summary": "剧本大纲",
      "theme": "主题",
      "genre": "类型",
      "structure": "故事结构",
      "tone": "整体基调"
    },
    "characters": [
      {
        "name": "角色名",
        "description": "角色描述",
        "personality": "性格特点",
        "background": "背景故事",
        "role": "主角/配角",
        "motivation": "角色动机",
        "relationships": "与其他角色的关系"
      }
    ],
    "scenes": [
      {
        "scene_number": 1,
        "title": "场景标题",
        "characters": ["角色1", "角色2"],
        "setting": {
          "time": "时间",
          "location": "地点",
          "atmosphere": "氛围"
        },
        "dialogue": [
          {
            "character": "角色名",
            "content": "对话内容",
            "emotion": "情感"
          }
        ],
        "narrative": "场景描述和动作指导",
        "summary": "场景总结"
      }
    ]
  },
  "processing_time": 15.2,
  "request_id": "req_1234567890_abc123",
  "metadata": {
    "original_word_count": 5000,
    "sentence_count": 200,
    "character_count": 5,
    "scene_count": 5,
    "model_used": "deepseek-r1"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "processing_time": 2.1,
  "request_id": "req_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 使用示例

### JavaScript

```javascript
async function generateScript(novelContent, apiKey, options = {}) {
    const response = await fetch('https://your-domain.com/script_generator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            novel_content: novelContent,
            options: {
                model: 'deepseek-r1',
                language: 'zh-CN',
                style: '古风情感',
                max_scenes: 5,
                include_dialogue: true
            }
        })
    });

    const result = await response.json();
    
    if (result.success) {
        console.log('剧本生成成功:', result.data);
        return result.data;
    } else {
        console.error('剧本生成失败:', result.error);
        throw new Error(result.error);
    }
}

// 使用示例
const novelText = "这是一个关于爱情的故事...";
const script = await generateScript(novelText, 'YOUR_API_KEY');
```

### Python

```python
import requests
import json

def generate_script(novel_content, api_key, options=None):
    if options is None:
        options = {
            "model": "deepseek-r1",
            "language": "zh-CN",
            "style": "古风情感",
            "max_scenes": 5,
            "include_dialogue": True
        }
    
    url = "https://your-domain.com/script_generator"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "novel_content": novel_content,
        "options": options
    }
    
    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    
    if result["success"]:
        return result["data"]
    else:
        raise Exception(result["error"])

# 使用示例
novel_text = "这是一个关于爱情的故事..."
script = generate_script(novel_text, "YOUR_API_KEY")
```

### cURL

```bash
curl -X POST "https://your-domain.com/script_generator" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "novel_content": "这是一个关于爱情的故事...",
    "options": {
      "model": "deepseek-r1",
      "language": "zh-CN",
      "style": "古风情感",
      "max_scenes": 5,
      "include_dialogue": true
    }
  }'
```

## 错误代码

| 错误代码 | 说明 |
|----------|------|
| VALIDATION_ERROR | 请求参数验证失败 |
| AUTH_ERROR | 认证失败 |
| CONTENT_PROCESSING_ERROR | 内容处理失败 |
| AI_SERVICE_ERROR | AI服务调用失败 |
| GENERATION_ERROR | 剧本生成失败 |
| RATE_LIMIT_ERROR | 请求频率超限 |
| INTERNAL_ERROR | 内部服务器错误 |

## 部署说明

### 1. 环境变量配置

在腾讯云开发控制台设置以下环境变量：

```
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com
GEMINI_API_BASE=https://generativelanguage.googleapis.com
```

### 2. 部署命令

```bash
# 安装依赖
cd functions/script_generator
npm install

# 部署云函数
tcb functions:deploy script_generator
```

### 3. 测试部署

```bash
# 健康检查
curl https://your-domain.com/script_generator/health
```

## 限制说明

- 单次请求最大小说长度：100,000字符
- 最大分幕数：20幕
- 处理超时时间：60秒
- 建议请求频率：每分钟最多10次

## 技术支持

如有问题，请联系技术支持团队。
