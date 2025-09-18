# startTime 错误修复总结

## 问题分析

从数据库记录中发现任务状态为 `failed`，错误信息为：
```
"message": "处理失败: startTime is not defined"
```

## 根本原因

在 `processScriptAsync` 函数中，第313行使用了未定义的 `startTime` 变量：

```javascript
// 第313行：startTime 未定义！
const processingTime = (Date.now() - startTime) / 1000;
```

## 修复内容

### 1. 添加 startTime 变量定义 ✅

**修复前**：
```javascript
async function processScriptAsync(taskId, novelContent, options, requestId) {
    try {
        console.log(`[${requestId}] 开始异步处理任务: ${taskId}`);
        // ... 其他代码
        const processingTime = (Date.now() - startTime) / 1000; // ❌ startTime 未定义
    }
}
```

**修复后**：
```javascript
async function processScriptAsync(taskId, novelContent, options, requestId) {
    const startTime = Date.now(); // ✅ 添加开始时间记录
    
    try {
        console.log(`[${requestId}] 开始异步处理任务: ${taskId}`);
        // ... 其他代码
        const processingTime = (Date.now() - startTime) / 1000; // ✅ startTime 已定义
    }
}
```

### 2. 增强调试信息 ✅

在 `handleTaskStatusQuery` 函数中添加了详细的调试日志：

```javascript
// 查询前记录
console.log(`[${requestId}] 尝试查询任务: ${taskId}`);
console.log(`[${requestId}] 查询集合: script_tasks`);

// 查询后记录
console.log(`[${requestId}] 查询结果: exists=${taskDoc.exists}, id=${taskDoc.id}`);

// 任务不存在时的调试信息
if (!taskDoc.exists) {
    console.log(`[${requestId}] 任务不存在，尝试列出所有任务进行调试...`);
    const allTasks = await db.collection('script_tasks').limit(5).get();
    console.log(`[${requestId}] 集合中的任务数量: ${allTasks.data.length}`);
    console.log(`[${requestId}] 现有任务ID:`, allTasks.data.map(t => t.id));
}
```

## 修复效果

### 修复前 ❌
- 任务提交后立即失败
- 错误信息：`startTime is not defined`
- 任务状态：`failed`
- 无法正常处理剧本生成

### 修复后 ✅
- 任务可以正常开始处理
- 可以正确计算处理时间
- 任务状态会正常更新：`pending` → `processing` → `completed`
- 支持完整的异步处理流程

## 测试验证

### 1. 重新部署云函数
```bash
# 在 functions/script_generator 目录下
npm run deploy
```

### 2. 测试任务提交
```bash
curl -X POST "https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator" \
  -H "Content-Type: application/json" \
  -d '{"novel_content": "测试内容", "options": {"model": "deepseek-r1"}}'
```

### 3. 测试状态查询
```bash
curl -X POST "https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator" \
  -H "Content-Type: application/json" \
  -d '{"action": "status", "task_id": "your_task_id"}'
```

## 预期结果

1. **任务提交**：返回202状态码和任务ID
2. **状态查询**：返回正确的任务状态和进度
3. **异步处理**：任务可以正常完成，状态从 `pending` 变为 `completed`
4. **调试信息**：详细的日志帮助排查问题

## 监控要点

### 关键日志
- `开始异步处理任务: ${taskId}`
- `任务状态已更新: processing (X%)`
- `任务完成: ${taskId}`

### 错误监控
- 监控 `startTime is not defined` 错误
- 监控任务处理失败的情况
- 监控状态查询失败的情况

## 总结

通过添加 `const startTime = Date.now();` 这一行代码，解决了异步处理中的关键错误。现在云函数应该可以正常处理剧本生成任务，支持完整的异步处理流程。

**下一步**：重新部署云函数并测试任务提交和状态查询功能。
