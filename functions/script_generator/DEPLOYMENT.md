# 部署指南

## 前置条件

1. **腾讯云开发环境**
   - 已创建云开发环境
   - 环境ID: `stroycraft-1ghmi4ojd3b4a20b`

2. **API密钥配置**
   - DeepSeek API密钥
   - Gemini API密钥（可选）

3. **开发工具**
   - Node.js 16+
   - 腾讯云开发CLI工具

## 部署步骤

### 1. 环境准备

```bash
# 进入项目目录
cd functions/script_generator

# 安装依赖
npm install

# 检查腾讯云开发CLI
tcb --version
```

### 2. 配置环境变量

在腾讯云开发控制台设置以下环境变量：

```bash
# 必需的环境变量
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com

# 可选的环境变量
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_BASE=https://generativelanguage.googleapis.com
```

### 3. 本地测试

```bash
# 运行测试
node test.js

# 运行客户端示例（需要设置API密钥）
node client-example.js
```

### 4. 部署云函数

```bash
# 使用部署脚本
chmod +x deploy.sh
./deploy.sh

# 或手动部署
tcb functions:deploy script_generator
```

### 5. 验证部署

```bash
# 健康检查
curl https://stroycraft-1ghmi4ojd3b4a20b.tcb.qcloud.la/script_generator/health

# 测试API调用
curl -X POST "https://stroycraft-1ghmi4ojd3b4a20b.tcb.qcloud.la/script_generator" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "novel_content": "这是一个测试小说内容...",
    "options": {
      "model": "deepseek-r1",
      "language": "zh-CN",
      "max_scenes": 3
    }
  }'
```

## 配置说明

### 环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| DEEPSEEK_API_KEY | 是 | DeepSeek API密钥 | sk-xxx... |
| DEEPSEEK_API_BASE | 否 | DeepSeek API基础URL | https://api.deepseek.com |
| GEMINI_API_KEY | 否 | Gemini API密钥 | AIza... |
| GEMINI_API_BASE | 否 | Gemini API基础URL | https://generativelanguage.googleapis.com |

### 云函数配置

- **内存**: 512MB
- **超时时间**: 60秒
- **并发数**: 10
- **触发器**: HTTP触发器

## 监控和日志

### 查看日志

```bash
# 查看云函数日志
tcb functions:log script_generator

# 实时查看日志
tcb functions:log script_generator --tail
```

### 监控指标

在腾讯云开发控制台可以查看：
- 调用次数
- 错误率
- 平均响应时间
- 内存使用情况

## 故障排除

### 常见问题

1. **API密钥错误**
   ```
   错误: DeepSeek API密钥未配置
   解决: 检查环境变量DEEPSEEK_API_KEY是否正确设置
   ```

2. **超时错误**
   ```
   错误: 操作超时，超过30000ms
   解决: 检查网络连接，或增加超时时间
   ```

3. **内存不足**
   ```
   错误: 内存使用超限
   解决: 增加云函数内存配置
   ```

4. **内容过长**
   ```
   错误: novel_content长度不能超过100,000个字符
   解决: 减少输入内容长度
   ```

### 调试方法

1. **本地调试**
   ```bash
   # 设置环境变量
   export DEEPSEEK_API_KEY=your_key
   
   # 运行测试
   node test.js
   ```

2. **日志调试**
   ```bash
   # 查看详细日志
   tcb functions:log script_generator --verbose
   ```

3. **API测试**
   ```bash
   # 使用curl测试
   curl -X POST "your_api_url" \
     -H "Content-Type: application/json" \
     -d '{"novel_content": "test"}'
   ```

## 性能优化

### 建议配置

1. **内存配置**: 512MB（处理大文本时可能需要1GB）
2. **超时时间**: 60秒（复杂内容可能需要更长时间）
3. **并发数**: 10（根据实际使用情况调整）

### 优化建议

1. **内容预处理**: 在客户端进行基础文本清理
2. **缓存机制**: 对相同内容使用缓存
3. **分批处理**: 对超长内容进行分批处理
4. **错误重试**: 实现指数退避重试机制

## 安全考虑

1. **API密钥管理**: 使用环境变量存储敏感信息
2. **请求验证**: 验证输入参数和API密钥
3. **频率限制**: 实现请求频率限制
4. **日志脱敏**: 避免在日志中记录敏感信息

## 更新和维护

### 更新流程

1. 修改代码
2. 本地测试
3. 部署到测试环境
4. 验证功能
5. 部署到生产环境

### 版本管理

```bash
# 查看当前版本
tcb functions:list

# 回滚到上一版本
tcb functions:rollback script_generator
```

## 联系支持

如有问题，请联系技术支持团队或查看相关文档。
