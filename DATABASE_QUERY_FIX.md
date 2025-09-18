# 数据库查询问题修复

## 问题分析

从日志中发现关键问题：

```
[req_xxx] 查询结果: exists=undefined, id=undefined
[req_xxx] 集合中的任务数量: 4
[req_xxx] 现有任务ID: [ undefined, undefined, undefined, undefined ]
```

## 根本原因

CloudBase数据库的查询结果结构与预期不符：
- `doc().get()` 查询返回的 `exists` 和 `id` 字段为 `undefined`
- `collection().get()` 查询返回的数据中 `id` 字段为 `undefined`

## 修复方案

### 1. 改用 where 查询替代 doc 查询 ✅

**修复前**：
```javascript
// 使用doc查询，但结果异常
taskDoc = await db.collection('script_tasks').doc(taskId).get();
console.log(`exists=${taskDoc.exists}, id=${taskDoc.id}`); // undefined, undefined
```

**修复后**：
```javascript
// 使用where查询，通过task_id字段查询
const taskQuery = await db.collection('script_tasks').where({
    task_id: taskId
}).get();

if (taskQuery.data.length > 0) {
    taskDoc = {
        exists: true,
        data: () => taskQuery.data[0],
        id: taskQuery.data[0]._id || taskQuery.data[0].task_id
    };
} else {
    taskDoc = {
        exists: false,
        data: () => null,
        id: null
    };
}
```

### 2. 修复任务ID显示 ✅

**修复前**：
```javascript
// 所有任务ID都显示为undefined
console.log('现有任务ID:', allTasks.data.map(t => t.id)); // [undefined, undefined, ...]
```

**修复后**：
```javascript
// 使用正确的字段获取任务ID
console.log('现有任务ID:', allTasks.data.map(t => t._id || t.task_id || t.id));
```

### 3. 增强调试信息 ✅

添加了完整的查询结果日志：
```javascript
console.log(`查询结果数量: ${taskQuery.data.length}`);
console.log(`完整查询结果:`, JSON.stringify(taskQuery.data, null, 2));
console.log(`完整任务列表:`, JSON.stringify(allTasks.data, null, 2));
```

## 修复效果

### 修复前 ❌
- 查询结果：`exists=undefined, id=undefined`
- 任务ID显示：`[undefined, undefined, undefined, undefined]`
- 无法正确判断任务是否存在
- 状态查询总是返回"任务不存在"

### 修复后 ✅
- 使用 `where` 查询通过 `task_id` 字段查找任务
- 正确显示任务ID和查询结果
- 可以正确判断任务是否存在
- 状态查询应该能正常工作

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

重新部署后，日志应该显示：
```
[req_xxx] 查询结果数量: 1
[req_xxx] 完整查询结果: [{"_id": "task_xxx", "task_id": "task_xxx", "status": "processing", ...}]
[req_xxx] 任务状态: processing
```

## 关键改进

1. **查询方式**：从 `doc().get()` 改为 `where().get()`
2. **字段访问**：使用 `_id` 或 `task_id` 而不是 `id`
3. **调试信息**：添加完整的查询结果日志
4. **错误处理**：更好的数据结构处理

## 总结

通过改用 `where` 查询和正确的字段访问方式，解决了CloudBase数据库查询结果异常的问题。现在状态查询应该能够正常工作，正确返回任务状态和进度信息。

**下一步**：重新部署云函数并测试任务提交和状态查询功能。
