# Ant Design Segmented 组件自定义指南

## 1. 基础属性 Props

### 常用Props
```typescript
interface SegmentedProps {
  // 值和回调
  value?: string | number;
  onChange?: (value: string | number) => void;

  // 选项
  options?: Array<{
    label?: React.ReactNode;
    value: string | number;
    disabled?: boolean;
    title?: string;  // hover时的提示
  }> | Array<string | number>;

  // 状态
  disabled?: boolean;  // 禁用整个组件

  // 大小和方向
  size?: 'large' | 'middle' | 'small';
  block?: boolean;  // 占满容器宽度

  // 样式
  className?: string;
  style?: React.CSSProperties;
}
```

## 2. 可自定义的颜色

### 背景色相关
```jsx
// 1. 选中项背景色（最常用）
className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"

// 2. 容器背景色
style={{ backgroundColor: '#f5f5f5' }}

// 3. 未选中项背景色
className="[&_.ant-segmented-item]:!bg-white"
```

### 文字颜色相关
```jsx
// 1. 选中项文字色
className="[&_.ant-segmented-item-selected]:!text-white"

// 2. 未选中项文字色
className="[&_.ant-segmented-item]:!text-gray-600"

// 3. 禁用项文字色
className="[&_.ant-segmented-item-disabled]:!text-gray-400"
```

### 边框颜色相关
```jsx
// 1. 容器边框色
style={{ borderColor: '#3E83F6' }}

// 2. 分割线颜色
className="[&_.ant-segmented-item]:!border-gray-200"
```

## 3. 可自定义的样式

### 尺寸相关
```jsx
// 1. 组件尺寸
<Segmented size="large" />      // 'large' | 'middle' | 'small'

// 2. 宽度
style={{ width: '100%' }}        // 占满容器
style={{ width: '200px' }}       // 固定宽度

// 3. 高度
style={{ height: '58px' }}

// 4. 内边距
style={{ padding: '8px' }}

// 5. 填满容器
<Segmented block />              // 等同于 width: 100%
```

### 圆角相关
```jsx
// 1. 容器圆角
style={{ borderRadius: '8px' }}

// 2. 选中项圆角
className="[&_.ant-segmented-item-selected]:!rounded-lg"

// 3. 完全圆形
style={{ borderRadius: '24px' }}
```

### 边框相关
```jsx
// 1. 容器边框
style={{ border: '1px solid #3E83F6' }}

// 2. 选中项边框
className="[&_.ant-segmented-item-selected]:!border-[#3E83F6]"

// 3. 移除边框
style={{ border: 'none' }}
```

### 阴影相关
```jsx
// 1. 容器阴影
style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}

// 2. 选中项阴影
className="[&_.ant-segmented-item-selected]:!shadow-md"
```

### 透明度相关
```jsx
// 1. 容器透明度
style={{ opacity: 0.8 }}

// 2. 选中项透明度
className="[&_.ant-segmented-item-selected]:!opacity-100"
```

### 字体相关
```jsx
// 1. 字体大小
className="[&_.ant-segmented-item]:!text-sm"

// 2. 字体加粗
className="[&_.ant-segmented-item-selected]:!font-bold"

// 3. 字间距
className="[&_.ant-segmented-item]:!tracking-wide"
```

### 间距相关
```jsx
// 1. 按钮间距
className="[&_.ant-segmented-item]:!gap-2"

// 2. 外边距
style={{ margin: '10px' }}

// 3. 内边距
style={{ padding: '12px' }}
```

## 4. CSS类名选择器

```jsx
// Segmented容器类
.ant-segmented

// 选项包装器
.ant-segmented-item

// 选中项
.ant-segmented-item-selected

// 禁用项
.ant-segmented-item-disabled

// 标签
.ant-segmented-label

// 缩略图
.ant-segmented-thumb
```

## 5. CSS变量（主题相关）

```jsx
// 设置Ant Design主题变量
style={{
  '--ant-color-primary': '#3E83F6',           // 主色
  '--ant-color-primary-bg': '#e6f7ff',       // 主色背景
  '--ant-color-primary-border': '#91caff',   // 主色边框
  '--ant-border-radius': '8px',              // 圆角
  '--ant-padding-content-vertical': '8px',   // 垂直内边距
  '--ant-padding-content-horizontal': '12px' // 水平内边距
} as React.CSSProperties}
```

## 6. 实际应用示例

### 示例1: 蓝色风格（当前项目）
```jsx
<div style={{
  border: '1px solid #3E83F6',
  borderRadius: 8,
  padding: 8,
  height: 58,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Segmented
    value={activeTab}
    onChange={setActiveTab}
    options={[...]}
    style={{ width: '100%' }}
    className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"
  />
</div>
```

### 示例2: 绿色风格
```jsx
<Segmented
  value={activeTab}
  onChange={setActiveTab}
  options={[...]}
  style={{
    width: '100%',
    border: '1px solid #52c41a',
    borderRadius: 8,
    padding: 8,
    height: 58
  }}
  className="[&_.ant-segmented-item-selected]:!bg-[#52c41a] [&_.ant-segmented-item-selected]:!text-white"
/>
```

### 示例3: 紫色优雅风格
```jsx
<Segmented
  value={activeTab}
  onChange={setActiveTab}
  options={[...]}
  size="large"
  style={{
    width: '100%',
    border: '2px solid #722ed1',
    borderRadius: 20,
    padding: 12,
    height: 64,
    boxShadow: '0 4px 12px rgba(114, 46, 209, 0.1)'
  }}
  className="[&_.ant-segmented-item-selected]:!bg-[#722ed1] [&_.ant-segmented-item-selected]:!text-white [&_.ant-segmented-item]:!rounded-2xl"
/>
```

### 示例4: 最小化风格
```jsx
<Segmented
  value={activeTab}
  onChange={setActiveTab}
  options={[...]}
  style={{
    backgroundColor: 'transparent',
    border: 'none'
  }}
  className="[&_.ant-segmented-item-selected]:!bg-gray-100 [&_.ant-segmented-item-selected]:!border-b-2 [&_.ant-segmented-item-selected]:!border-[#3E83F6]"
/>
```

## 7. 高级自定义方案

### 使用CSS模块
```css
/* segmented.module.css */
.customSegmented {
  width: 100%;
  border: 1px solid #3E83F6;
  border-radius: 8px;
  padding: 8px;
  height: 58px;
  background: linear-gradient(135deg, #fff 0%, #f5f7fa 100%);
}

.customSegmented :global(.ant-segmented-item-selected) {
  background: linear-gradient(135deg, #3E83F6 0%, #1890ff 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(62, 131, 246, 0.3);
}
```

### 使用内联样式函数
```jsx
const customSegmentedStyle = (theme = 'blue') => {
  const colors = {
    blue: { primary: '#3E83F6', light: '#e6f7ff' },
    green: { primary: '#52c41a', light: '#f6ffed' },
    red: { primary: '#ff4d4f', light: '#fff1f0' }
  };

  const color = colors[theme] || colors.blue;

  return {
    border: `1px solid ${color.primary}`,
    borderRadius: 8,
    padding: 8,
    height: 58,
    backgroundColor: color.light
  };
};

<Segmented
  style={customSegmentedStyle('blue')}
  className="[&_.ant-segmented-item-selected]:!bg-[#3E83F6]"
/>
```

## 8. 禁用状态样式

```jsx
<Segmented
  disabled
  style={{ opacity: 0.6 }}
  className="[&_.ant-segmented-item-disabled]:!bg-gray-100 [&_.ant-segmented-item-disabled]:!text-gray-400"
/>

// 单个选项禁用
options={[
  { label: '启用', value: '1' },
  { label: '禁用', value: '2', disabled: true }
]}
```

## 9. 响应式设计

```jsx
// 使用内联样式响应式
style={{
  width: window.innerWidth < 768 ? '100%' : '50%',
  height: window.innerWidth < 768 ? '44px' : '58px',
  fontSize: window.innerWidth < 768 ? '12px' : '14px'
}}
```

## 10. 常用颜色参考

| 颜色 | 值 | 用途 |
|------|-----|------|
| 品牌蓝 | #3E83F6 | 主色 |
| 浅蓝 | #e6f7ff | 背景 |
| 成功绿 | #52c41a | 成功状态 |
| 警告橙 | #faad14 | 警告状态 |
| 错误红 | #ff4d4f | 错误状态 |
| 灰色 | #d9d9d9 | 边框/禁用 |
| 深灰 | #595959 | 文字 |

## 总结

### 最常自定义的属性：
1. ✅ **背景色** - `className="[&_.ant-segmented-item-selected]:!bg-[color]"`
2. ✅ **边框** - `style={{ border: 'color' }}`
3. ✅ **高度** - `style={{ height: 'px' }}`
4. ✅ **圆角** - `style={{ borderRadius: 'px' }}`
5. ✅ **文字色** - `className="[&_.ant-segmented-item-selected]:!text-[color]"`
6. ✅ **宽度** - `style={{ width: '100%' }}` 或 `block`
7. ✅ **阴影** - `style={{ boxShadow: 'shadow' }}`
8. ✅ **内边距** - `style={{ padding: 'px' }}`
