# 500错误排查和修复指南

## 问题描述

用户遇到 `POST https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator 500 (Internal Server Error)` 错误。

## 已修复的问题

### 1. 模块导入错误 ✅
**问题**：自定义模块导入失败导致云函数崩溃
**修复**：
- 添加了模块导入的try-catch包装
- 提供了降级处理机制
- 增加了详细的错误日志

### 2. 数据库操作错误 ✅
**问题**：CloudBase数据库操作失败导致500错误
**修复**：
- 添加了数据库可用性检查
- 数据库错误不再阻止任务提交
- 改进了错误处理逻辑

### 3. 时间计算错误 ✅
**问题**：`processScriptAsync`函数中时间计算错误
**修复**：
- 修复了 `(Date.now() - Date.now())` 的错误
- 正确使用 `startTime` 变量

### 4. 错误处理不完善 ✅
**问题**：某些错误没有被正确捕获和处理
**修复**：
- 添加了更详细的错误分类
- 提供了调试信息
- 改进了错误响应格式

## 新增功能

### 1. 健康检查接口 ✅
```bash
GET /script_generator/health
```
返回云函数状态信息，包括：
- 模块加载状态
- CloudBase可用性
- 环境信息

### 2. 测试脚本 ✅
创建了 `test-fix.js` 用于验证修复效果。

## 测试步骤

### 1. 健康检查测试
```bash
curl -X GET "https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator/health"
```

预期响应：
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cloudbase_available": true,
  "modules_loaded": {
    "contentProcessor": true,
    "aiService": true
  },
  "environment": {
    "node_version": "v18.x.x",
    "platform": "linux"
  }
}
```

### 2. 任务提交测试
```bash
curl -X POST "https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator" \
  -H "Content-Type: application/json" \
  -d '{
    "novel_content": "测试内容",
    "options": {
      "model": "deepseek-r1",
      "language": "zh-CN"
    }
  }'
```

预期响应：
```json
{
  "success": true,
  "task_id": "task_xxx_1234567890",
  "status": "pending",
  "message": "任务已提交，正在处理中...",
  "estimated_time": "3-5分钟",
  "request_id": "req_xxx"
}
```

### 3. 状态查询测试
```bash
curl -X POST "https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "status",
    "task_id": "task_xxx_1234567890"
  }'
```

## 常见问题排查

### 1. 如果健康检查失败
**可能原因**：
- 云函数部署失败
- 环境配置错误
- 依赖包缺失

**解决方案**：
- 检查云函数部署日志
- 验证环境变量配置
- 重新部署云函数

### 2. 如果任务提交失败
**可能原因**：
- 请求格式错误
- 内容验证失败
- 数据库连接问题

**解决方案**：
- 检查请求体格式
- 验证小说内容长度
- 检查CloudBase配置

### 3. 如果状态查询失败
**可能原因**：
- 任务ID不存在
- 数据库查询失败
- 权限问题

**解决方案**：
- 验证任务ID格式
- 检查数据库权限
- 查看错误日志

## 监控和日志

### 1. 关键日志位置
- CloudBase控制台 → 云函数 → script_generator → 日志
- 查看错误堆栈和请求ID

### 2. 重要日志关键词
- `[requestId] 开始处理请求`
- `自定义模块导入成功`
- `任务记录已保存`
- `请求处理失败`

### 3. 错误代码说明
- `MODULE_IMPORT_ERROR`: 模块导入失败
- `DATABASE_ERROR`: 数据库操作失败
- `AI_SERVICE_ERROR`: AI服务不可用
- `REQUEST_ERROR`: 一般请求错误

## 预防措施

### 1. 定期健康检查
- 设置定时任务检查云函数状态
- 监控错误率变化

### 2. 错误告警
- 设置500错误告警
- 监控响应时间

### 3. 备份方案
- 准备降级处理逻辑
- 实现重试机制

## 联系支持

如果问题仍然存在，请提供：
1. 完整的错误日志
2. 请求参数
3. 健康检查结果
4. 时间戳和请求ID

## 总结

通过以上修复，500错误应该已经解决。主要改进包括：
- ✅ 健壮的模块导入机制
- ✅ 完善的错误处理
- ✅ 数据库操作容错
- ✅ 健康检查接口
- ✅ 详细的调试信息

如果仍有问题，请使用健康检查接口和测试脚本进行进一步诊断。
