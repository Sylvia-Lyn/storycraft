# Segmented 快速参考表

## 🎨 常用颜色自定义

| 需求 | 代码 |
|------|------|
| 选中背景蓝色 | `className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"` |
| 选中背景绿色 | `className="[&_.ant-segmented-item-selected]:!bg-[#52c41a]"` |
| 选中背景红色 | `className="[&_.ant-segmented-item-selected]:!bg-[#ff4d4f]"` |
| 选中文字白色 | `className="[&_.ant-segmented-item-selected]:!text-white"` |
| 未选中文字灰色 | `className="[&_.ant-segmented-item]:!text-gray-600"` |
| 禁用项灰色 | `className="[&_.ant-segmented-item-disabled]:!bg-gray-100"` |

## 📏 常用尺寸自定义

| 需求 | 代码 |
|------|------|
| 高度58px | `style={{ height: 58 }}` |
| 宽度100% | `style={{ width: '100%' }}` 或 `block` |
| 大尺寸 | `size="large"` |
| 小尺寸 | `size="small"` |
| 内边距8px | `style={{ padding: 8 }}` |
| 外边距10px | `style={{ margin: 10 }}` |

## 🎭 常用形状自定义

| 需求 | 代码 |
|------|------|
| 边框1px蓝色 | `style={{ border: '1px solid #3E83F6' }}` |
| 圆角8px | `style={{ borderRadius: 8 }}` |
| 完全圆形 | `style={{ borderRadius: '24px' }}` |
| 边框2px | `style={{ border: '2px solid #3E83F6' }}` |
| 移除边框 | `style={{ border: 'none' }}` |
| 阴影效果 | `style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}` |
| 透明度0.8 | `style={{ opacity: 0.8 }}` |

## 💬 字体样式自定义

| 需求 | 代码 |
|------|------|
| 字体加粗 | `className="[&_.ant-segmented-item-selected]:!font-bold"` |
| 字体小号 | `className="[&_.ant-segmented-item]:!text-sm"` |
| 字体大号 | `className="[&_.ant-segmented-item]:!text-lg"` |
| 字间距宽 | `className="[&_.ant-segmented-item]:!tracking-wide"` |

## 🔗 CSS类名速查

```
.ant-segmented                      = 整个容器
.ant-segmented-item                 = 单个选项
.ant-segmented-item-selected        = 选中的选项 ⭐ 最常用
.ant-segmented-item-disabled        = 禁用的选项
.ant-segmented-label                = 标签文字
.ant-segmented-thumb                = 缩略图背景
```

## 🎯 当前项目配置

```jsx
<div style={{
  border: '1px solid #3E83F6',      // ✅ 边框
  borderRadius: 8,                   // ✅ 圆角
  padding: 8,                        // ✅ 内边距
  height: 58,                        // ✅ 高度
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Segmented
    value={activeTab}
    onChange={setActiveTab}
    options={[...]}
    style={{ width: '100%' }}        // ✅ 宽度
    className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"  // ✅ 选中背景
  />
</div>
```

## 📋 Props参考

| Prop | 类型 | 说明 |
|------|------|------|
| `value` | string \| number | 当前选中值 |
| `onChange` | function | 值变化回调 |
| `options` | array | 选项列表 |
| `disabled` | boolean | 禁用整个组件 |
| `size` | 'large' \| 'middle' \| 'small' | 尺寸 |
| `block` | boolean | 是否占满宽度 |
| `className` | string | CSS类名 |
| `style` | object | 内联样式 |

## 🎨 颜色代码速查

```
蓝色    #3E83F6
绿色    #52c41a
红色    #ff4d4f
橙色    #faad14
紫色    #722ed1
灰色    #d9d9d9
深灰    #595959
白色    #ffffff
```

## ⚡ 常用组合

### 蓝色方案（推荐）
```jsx
style={{
  border: '1px solid #3E83F6',
  borderRadius: 8,
  padding: 8,
  height: 58
}}
className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6] [&_.ant-segmented-item-selected]:!text-white"
```

### 绿色方案
```jsx
style={{
  border: '1px solid #52c41a',
  borderRadius: 8,
  padding: 8,
  height: 58
}}
className="[&_.ant-segmented-item-selected]:!bg-[#52c41a] [&_.ant-segmented-item-selected]:!text-white"
```

### 最小化方案
```jsx
style={{ backgroundColor: 'transparent' }}
className="[&_.ant-segmented-item-selected]:!border-b-2 [&_.ant-segmented-item-selected]:!border-[#3E83F6]"
```

### 卡片方案
```jsx
style={{
  border: '2px solid #3E83F6',
  borderRadius: 12,
  padding: 12,
  boxShadow: '0 4px 12px rgba(62, 131, 246, 0.1)'
}}
className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6] [&_.ant-segmented-item-selected]:!shadow-md"
```

## 💡 技巧

1. **Tailwind Arbitrary Selector** 用 `!` 增加优先级
   ```jsx
   className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"
   //                                              ↑ 重要
   ```

2. **16进制颜色** 用方括号包裹
   ```jsx
   className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"
   //                                              ↑        ↑
   ```

3. **响应式设计** 可用内联样式动态计算
   ```jsx
   style={{
     height: window.innerWidth < 768 ? 44 : 58,
     padding: window.innerWidth < 768 ? 4 : 8
   }}
   ```

4. **禁用项样式** 需要同时禁用disabled和设置className
   ```jsx
   options={[
     { label: '启用', value: '1' },
     { label: '禁用', value: '2', disabled: true }
   ]}
   className="[&_.ant-segmented-item-disabled]:!opacity-50"
   ```
