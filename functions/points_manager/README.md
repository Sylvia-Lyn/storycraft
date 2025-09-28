# 积分管理云函数 (points_manager)

## 功能概述

这个云函数提供了完整的用户积分管理系统，包括积分的增删改查操作和积分历史记录功能。

## 支持的API操作

### 1. 获取用户积分
```javascript
{
  action: 'getUserPoints'
}
```

**返回数据:**
```javascript
{
  success: true,
  data: {
    userId: "user123",
    points: 1500,
    user_name: "用户名"
  }
}
```

### 2. 增加积分
```javascript
{
  action: 'addPoints',
  data: {
    points: 100,
    reason: "购买套餐奖励"
  }
}
```

### 3. 增加积分并记录历史
```javascript
{
  action: 'addPointsWithHistory',
  data: {
    points: 100,
    reason: "购买套餐奖励",
    source: "vip_purchase",
    orderId: "order123"
  }
}
```

### 4. 扣除积分
```javascript
{
  action: 'deductPoints',
  data: {
    points: 50,
    reason: "使用服务"
  }
}
```

### 5. 直接设置积分
```javascript
{
  action: 'updatePoints',
  data: {
    points: 1000,
    reason: "管理员调整"
  }
}
```

### 6. 获取积分历史记录
```javascript
{
  action: 'getPointsHistory',
  data: {
    page: 1,
    limit: 20
  }
}
```

### 7. 每日登录积分奖励
```javascript
{
  action: 'dailyLoginReward',
  data: {
    user_plan: 'chinese' // 或 'multilingual'
  }
}
```

## 数据库集合

### users 集合
- `userId`: 用户ID
- `user_point`: 用户当前积分（字符串格式）

### points_history 集合
- `userId`: 用户ID
- `points`: 积分变化数量
- `type`: 操作类型 ('add' | 'deduct')
- `reason`: 操作原因
- `source`: 积分来源
- `orderId`: 关联订单ID（可选）
- `oldPoints`: 操作前积分
- `newPoints`: 操作后积分
- `createdAt`: 创建时间

## 前端使用示例

```typescript
import { pointsService } from '../services/pointsService';

// 获取用户积分
const result = await pointsService.getUserPoints();

// 增加积分
await pointsService.addPoints({
  points: 100,
  reason: "购买奖励"
});

// 增加积分并记录历史
await pointsService.addPointsWithHistory({
  points: 10000,
  reason: "购买套餐奖励",
  source: "vip_purchase",
  orderId: "order123"
});

// 每日登录积分奖励
await pointsService.dailyLoginReward({
  user_plan: "chinese"
});
```

## 部署说明

1. 确保在腾讯云开发环境中部署此云函数
2. 环境ID: `stroycraft-1ghmi4ojd3b4a20b`
3. 函数名: `points_manager`

## 错误处理

所有API都会返回统一的错误格式：
```javascript
{
  success: false,
  error: "错误描述"
}
```

常见错误：
- `用户未登录，请先登录`: 需要用户认证
- `积分数量必须大于0`: 积分参数无效
- `积分不足，无法扣除`: 用户积分不够扣除
- `用户不存在`: 用户记录不存在
