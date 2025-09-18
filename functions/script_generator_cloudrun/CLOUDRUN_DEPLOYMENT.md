# 函数型云托管部署指南

## 概述

本指南介绍如何将 `script_generator` 云函数迁移到函数型云托管（CBRF）。

## 迁移要点

### 主要变更

1. **CloudBase SDK 初始化方式**
   - 原云函数：`tcb.init` 可以在入口函数外部调用
   - 云托管：`tcb.init` 必须在入口函数内部调用，并传入 `context` 参数

2. **目录结构**
   - 单服务单函数结构，适合当前需求
   - 如需多函数，可创建 `cloudbase-functions.json` 配置文件

3. **调用方式**
   - 原云函数：使用 `wx.cloud.callFunction`
   - 云托管：使用 `wx.cloud.callContainer`

## 部署步骤

### 1. 环境准备

```bash
# 进入云托管目录
cd functions/script_generator_cloudrun

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
# 创建测试文件
cat > test-cloudrun.js << 'EOF'
const { main } = require('./index.js');

async function test() {
    const event = {
        novel_content: "这是一个测试小说内容，用来验证云托管函数是否正常工作。",
        options: {
            model: "deepseek-r1",
            language: "zh-CN",
            max_scenes: 3
        },
        headers: {
            authorization: "Bearer storycraft_script_2024_secure"
        }
    };
    
    const context = {
        requestId: 'test-request-id'
    };
    
    try {
        const result = await main(event, context);
        console.log('测试结果:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('测试失败:', error);
    }
}

test();
EOF

# 运行测试
node test-cloudrun.js
```

### 4. 部署到云托管

#### 方法一：使用腾讯云开发控制台

1. 登录腾讯云开发控制台
2. 进入函数型云托管服务
3. 创建新服务
4. 上传代码包或连接代码仓库
5. 配置环境变量
6. 部署服务

#### 方法二：使用CLI工具

```bash
# 打包代码
zip -r script_generator_cloudrun.zip . -x "*.git*" "node_modules/*" "*.md"

# 使用CLI部署（具体命令请参考最新文档）
tcb cloudrun:deploy script_generator_cloudrun.zip
```

### 5. 验证部署

#### 健康检查

```bash
# 健康检查
curl -X GET "https://your-cloudrun-url/health"
```

#### API测试

```bash
# 测试API调用
curl -X POST "https://script-generator-187660-8-1304253469.sh.run.tcloudbase.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer storycraft_script_2024_secure" \
  -d '{
    "novel_content": "这是一个测试小说内容...",
    "options": {
      "model": "deepseek-r1",
      "language": "zh-CN",
      "max_scenes": 3
    } '
```

## 客户端调用方式变更

### 原云函数调用方式

```javascript
// 小程序中调用云函数
wx.cloud
  .callFunction({
    name: "script_generator",
    data: {
      novel_content: "小说内容...",
      options: {
        model: "deepseek-r1",
        language: "zh-CN"
      }
    }
  })
  .then((res) => {
    console.log(res.result);
  })
  .catch(console.error);
```

### 云托管调用方式

```javascript
// 小程序中调用云托管
const c1 = new wx.cloud.Cloud({
  resourceEnv: "stroycraft-1ghmi4ojd3b4a20b"  // 环境ID
});
await c1.init();

const r = await c1.callContainer({
  path: "/",  // 请求路径
  header: {
    "X-WX-SERVICE": "script_generator_cloudrun",  // 服务名称
    "Authorization": "Bearer storycraft_script_2024_secure"
  },
  method: "POST",
  data: {
    novel_content: "小说内容...",
    options: {
      model: "deepseek-r1",
      language: "zh-CN"
    }
  }
});
console.log(r);
```

## 配置说明

### 云托管服务配置

- **内存**: 512MB（推荐1GB用于处理大文本）
- **超时时间**: 60秒（复杂内容可能需要更长时间）
- **并发数**: 10（根据实际使用情况调整）
- **触发器**: HTTP触发器

### 环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| DEEPSEEK_API_KEY | 是 | DeepSeek API密钥 | sk-xxx... |
| DEEPSEEK_API_BASE | 否 | DeepSeek API基础URL | https://api.deepseek.com |
| GEMINI_API_KEY | 否 | Gemini API密钥 | AIza... |
| GEMINI_API_BASE | 否 | Gemini API基础URL | https://generativelanguage.googleapis.com |

## 监控和日志

### 查看日志

```bash
# 查看云托管日志
tcb cloudrun:log script_generator_cloudrun

# 实时查看日志
tcb cloudrun:log script_generator_cloudrun --tail
```

### 监控指标

在腾讯云开发控制台可以查看：
- 调用次数
- 错误率
- 平均响应时间
- 内存使用情况
- 冷启动次数

## 性能优化

### 云托管优势

1. **更好的资源利用**: 多个请求可以共享同一个运行实例
2. **降低冷启动**: 实例保持活跃状态更长时间
3. **更灵活的配置**: 可以配置更复杂的环境和依赖

### 优化建议

1. **内存配置**: 1GB（处理大文本时推荐）
2. **超时时间**: 60秒（复杂内容可能需要更长时间）
3. **并发数**: 10（根据实际使用情况调整）
4. **预热机制**: 定期调用健康检查接口保持实例活跃

## 故障排除

### 常见问题

1. **CloudBase SDK 初始化失败**
   ```
   错误: context 参数未传入
   解决: 确保 tcb.init 在 main 函数内部调用，并传入 context 参数
   ```

2. **服务调用失败**
   ```
   错误: X-WX-SERVICE 头部缺失
   解决: 确保在调用时设置正确的服务名称
   ```

3. **环境变量未生效**
   ```
   错误: API密钥未配置
   解决: 检查云托管服务中的环境变量配置
   ```

### 调试方法

1. **本地调试**
   ```bash
   # 设置环境变量
   export DEEPSEEK_API_KEY=your_key
   
   # 运行测试
   node test-cloudrun.js
   ```

2. **日志调试**
   ```bash
   # 查看详细日志
   tcb cloudrun:log script_generator_cloudrun --verbose
   ```

3. **API测试**
   ```bash
   # 使用curl测试
   curl -X POST "your_cloudrun_url" \
     -H "Content-Type: application/json" \
     -H "X-WX-SERVICE: script_generator_cloudrun" \
     -d '{"novel_content": "test"}'
   ```

## 迁移检查清单

- [ ] 代码已迁移到云托管目录
- [ ] CloudBase SDK 初始化已修改（传入 context 参数）
- [ ] 环境变量已配置
- [ ] 本地测试通过
- [ ] 云托管服务已部署
- [ ] 健康检查接口正常
- [ ] API调用测试通过
- [ ] 客户端调用方式已更新
- [ ] 监控和日志配置完成

## 回滚计划

如果迁移后出现问题，可以：

1. **保留原云函数**: 在迁移期间保持原云函数运行
2. **切换调用方式**: 通过配置开关在云函数和云托管之间切换
3. **快速回滚**: 如果云托管出现问题，立即切换回云函数调用

## 联系支持

如有问题，请联系技术支持团队或查看相关文档：
- [函数型云托管官方文档](https://docs.cloudbase.net/cbrf/)
- [迁移指南](https://docs.cloudbase.net/cbrf/how-to-migrate-to-cbrf)
