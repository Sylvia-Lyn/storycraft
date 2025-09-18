# 轮询优化指南

## 问题分析

### 轮询对服务器的影响

1. **不会阻塞任务处理进度** ✅
   - 任务处理在后台异步执行
   - 状态查询只是读取数据库
   - 两者完全独立，互不影响

2. **但会增加服务器负载** ⚠️
   - 频繁的HTTP请求
   - 数据库查询压力
   - 网络带宽消耗

## 优化策略

### 1. 智能轮询间隔

我们已经实现了智能轮询策略：

```typescript
// 根据任务状态和进度动态调整轮询间隔
function calculatePollInterval(taskInfo, lastProgress, consecutiveNoProgress) {
  let interval = 2000; // 基础2秒
  
  switch (taskInfo.status) {
    case 'pending': interval = 5000; break;      // 等待状态：5秒
    case 'processing': 
      interval = taskInfo.progress > 0 ? 3000 : 5000; // 有进度：3秒，无进度：5秒
      break;
  }
  
  // 连续无进度时，逐渐增加间隔
  if (consecutiveNoProgress > 0) {
    interval = Math.min(interval * (1 + consecutiveNoProgress * 0.5), 15000);
  }
  
  // 接近完成时，提高轮询频率
  if (taskInfo.progress > 80) {
    interval = Math.min(interval, 2000);
  }
  
  return Math.max(interval, 1000); // 最少1秒
}
```

### 2. 轮询间隔策略

| 任务状态 | 进度情况 | 轮询间隔 | 说明 |
|---------|---------|---------|------|
| pending | - | 5秒 | 等待处理，频率较低 |
| processing | 有进度 | 3秒 | 正常处理，适中频率 |
| processing | 无进度 | 5秒 | 可能卡住，降低频率 |
| processing | 连续无进度 | 递增至15秒 | 避免无效轮询 |
| processing | 进度>80% | 2秒 | 接近完成，提高频率 |

### 3. 进一步优化方案

#### A. WebSocket实时通知（推荐）

```typescript
// 使用WebSocket替代轮询
const ws = new WebSocket('wss://your-server.com/tasks');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.task_id === currentTaskId) {
    updateProgress(data.task_info);
  }
};
```

**优势：**
- 实时通知，无延迟
- 减少HTTP请求
- 降低服务器负载
- 更好的用户体验

#### B. 服务端推送（Server-Sent Events）

```typescript
// 使用SSE替代轮询
const eventSource = new EventSource(`/api/tasks/${taskId}/stream`);
eventSource.onmessage = (event) => {
  const taskInfo = JSON.parse(event.data);
  updateProgress(taskInfo);
};
```

#### C. 混合策略

```typescript
// 结合WebSocket和轮询
async function smartWaitForTask(taskId, onProgress) {
  // 1. 尝试WebSocket连接
  if (websocketAvailable) {
    return waitWithWebSocket(taskId, onProgress);
  }
  
  // 2. 回退到智能轮询
  return waitWithSmartPolling(taskId, onProgress);
}
```

## 服务器端优化

### 1. 数据库优化

```javascript
// 在云函数中添加缓存
const taskCache = new Map();

async function queryTaskStatus(taskId) {
  // 先检查缓存
  if (taskCache.has(taskId)) {
    const cached = taskCache.get(taskId);
    if (Date.now() - cached.timestamp < 5000) { // 5秒缓存
      return cached.data;
    }
  }
  
  // 查询数据库
  const taskData = await db.collection('script_tasks').doc(taskId).get();
  
  // 更新缓存
  taskCache.set(taskId, {
    data: taskData,
    timestamp: Date.now()
  });
  
  return taskData;
}
```

### 2. 批量查询支持

```javascript
// 支持批量查询多个任务状态
async function batchQueryTaskStatus(taskIds) {
  const tasks = await Promise.all(
    taskIds.map(id => db.collection('script_tasks').doc(id).get())
  );
  
  return tasks.map((task, index) => ({
    task_id: taskIds[index],
    ...task.data()
  }));
}
```

### 3. 连接池优化

```javascript
// 使用连接池减少数据库连接开销
const dbPool = {
  connections: [],
  getConnection() {
    // 获取可用连接
  },
  releaseConnection(conn) {
    // 释放连接
  }
};
```

## 监控和告警

### 1. 轮询频率监控

```javascript
// 监控轮询频率
const pollingStats = {
  totalRequests: 0,
  requestsPerMinute: 0,
  averageInterval: 0
};

// 设置告警阈值
if (pollingStats.requestsPerMinute > 100) {
  console.warn('轮询频率过高，建议优化');
}
```

### 2. 服务器负载监控

```javascript
// 监控服务器负载
const serverMetrics = {
  cpuUsage: 0,
  memoryUsage: 0,
  activeConnections: 0
};
```

## 最佳实践

### 1. 客户端优化

- ✅ 使用智能轮询间隔
- ✅ 实现指数退避策略
- ✅ 添加轮询暂停机制
- ✅ 支持用户手动刷新

### 2. 服务端优化

- ✅ 实现查询缓存
- ✅ 优化数据库查询
- ✅ 添加请求限流
- ✅ 监控服务器负载

### 3. 用户体验优化

- ✅ 显示预计完成时间
- ✅ 提供任务取消功能
- ✅ 支持离线状态检测
- ✅ 添加重试机制

## 总结

**轮询不会阻塞服务器处理进度**，但确实会增加服务器负载。通过以下优化策略可以显著减少影响：

1. **智能轮询间隔** - 根据任务状态动态调整
2. **WebSocket通知** - 实时推送，减少轮询
3. **服务端缓存** - 减少数据库查询
4. **监控告警** - 及时发现和解决问题

建议优先实现智能轮询策略，后续可以考虑添加WebSocket支持以获得更好的用户体验。
