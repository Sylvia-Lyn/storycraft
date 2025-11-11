# 删除操作二次确认 - 完整说明

## ✅ 已添加删除确认的所有操作

### 1. 场次内容删除（剧本Tab）
**位置**: ScriptTab → 场次内容项
**触发**: 点击场次内容项的删除按钮
**确认对话框**:
- 标题: "确认删除"
- 消息: "确定要删除这项场次内容吗？此操作无法撤销。"

**实现**:
```typescript
// ScriptTab.tsx
<SortableScriptItem
  onShowDeleteConfirm={onShowDeleteConfirm}
/>

// ShortplayEntryPageRefactored.tsx
const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

<DeleteConfirmDialog
  isOpen={sceneManagement.deleteConfirmId !== null}
  onConfirm={async () => {
    await sceneManagement.handleDeleteSceneItem(sceneManagement.deleteConfirmId);
    sceneManagement.setDeleteConfirmId(null);
  }}
/>
```

---

### 2. 分镜板删除（图片Tab & 视频Tab）
**位置**: ImageTab / VideoTab → 分镜板列表
**触发**: 点击分镜板项的删除按钮
**确认对话框**:
- 标题: "确认删除"
- 消息: "确定要删除这个分镜板吗？此操作无法撤销。"

**实现**:
```typescript
// ImageTab.tsx / VideoTab.tsx
<SortableStoryboardItem
  onDelete={onShowDeleteConfirm}
/>

// ShortplayEntryPageRefactored.tsx
const [deleteStoryboardId, setDeleteStoryboardId] = useState<string | null>(null);

const handleShowDeleteStoryboardConfirm = (itemId: string) => {
  setDeleteStoryboardId(itemId);
};

const handleConfirmDeleteStoryboard = async () => {
  // 删除逻辑
  setDeleteStoryboardId(null);
};

<DeleteConfirmDialog
  isOpen={deleteStoryboardId !== null}
  message="确定要删除这个分镜板吗？此操作无法撤销。"
  onConfirm={handleConfirmDeleteStoryboard}
/>
```

---

### 3. 已上传图片删除（视频Tab）
**位置**: VideoTab → 已上传图片列表
**触发**: 鼠标悬停在已上传图片上，点击右上角的删除按钮
**确认对话框**:
- 标题: "确认删除"
- 消息: "确定要删除这张已上传的图片吗？此操作无法撤销。"

**实现**:
```typescript
// VideoTab.tsx
<button onClick={() => onShowRemoveImageConfirm(image.fileId)}>
  <Icon icon="ri:close-line" />
</button>

// ShortplayEntryPageRefactored.tsx
const [removeUploadedImageId, setRemoveUploadedImageId] = useState<string | null>(null);

const handleShowRemoveImageConfirm = (fileId: string) => {
  setRemoveUploadedImageId(fileId);
};

const handleConfirmRemoveImage = () => {
  videoManagement.setUploadedImages((prev) =>
    prev.filter((img) => img.fileId !== removeUploadedImageId)
  );
  setRemoveUploadedImageId(null);
};

<DeleteConfirmDialog
  isOpen={removeUploadedImageId !== null}
  message="确定要删除这张已上传的图片吗？此操作无法撤销。"
  onConfirm={handleConfirmRemoveImage}
/>
```

---

## 📊 删除操作清单

| 序号 | 删除操作 | 位置 | 是否有确认 | 状态 |
|------|---------|------|----------|------|
| 1 | 场次内容删除 | 剧本Tab | ✅ 是 | ✅ 已实现 |
| 2 | 分镜板删除 | 图片Tab | ✅ 是 | ✅ 已实现 |
| 3 | 分镜板删除 | 视频Tab | ✅ 是 | ✅ 已实现 |
| 4 | 已上传图片删除 | 视频Tab | ✅ 是 | ✅ 已实现 |

**注意**: 音频Tab中目前没有删除操作（音色只能编辑名称和应用，不能删除）

---

## 🎨 DeleteConfirmDialog 组件

所有删除确认都使用统一的 `DeleteConfirmDialog` 组件：

**特性**:
- ✅ 统一的UI设计
- ✅ 动画效果
- ✅ 点击遮罩关闭
- ✅ ESC键关闭（可扩展）
- ✅ 可自定义标题和消息
- ✅ 可自定义按钮文本

**Props**:
```typescript
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;                // 默认: "确认删除"
  message?: string;              // 默认: "确定要删除这项内容吗？此操作无法撤销。"
  confirmText?: string;          // 默认: "确定删除"
  cancelText?: string;           // 默认: "取消"
  onConfirm: () => void;
  onCancel: () => void;
}
```

**使用示例**:
```typescript
<DeleteConfirmDialog
  isOpen={deleteId !== null}
  title="确认删除"
  message="确定要删除这个项目吗？此操作无法撤销。"
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteId(null)}
/>
```

---

## 🔧 实现细节

### 状态管理模式

每种删除操作都使用独立的状态：

```typescript
// 主组件中的删除状态
const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);        // 场次内容
const [deleteStoryboardId, setDeleteStoryboardId] = useState<string | null>(null);  // 分镜板
const [removeUploadedImageId, setRemoveUploadedImageId] = useState<string | null>(null); // 已上传图片
```

**为什么不共用一个状态?**
- 不同删除操作的数据类型不同（number vs string）
- 需要区分是哪种类型的删除
- 更清晰的代码逻辑
- 方便后期扩展

### 删除流程

```
用户点击删除按钮
  ↓
调用 onShowDeleteConfirm(id)
  ↓
设置对应的删除状态（如 setDeleteStoryboardId(id)）
  ↓
DeleteConfirmDialog isOpen 变为 true，显示对话框
  ↓
用户选择：
  - 点击"确定删除" → 调用 onConfirm → 执行删除逻辑 → 重置状态
  - 点击"取消" → 调用 onCancel → 重置状态
  - 点击遮罩 → 调用 onCancel → 重置状态
```

---

## 📝 测试清单

### 场次内容删除测试
- [ ] 点击场次内容的删除按钮
- [ ] 确认出现删除确认对话框
- [ ] 标题和消息正确
- [ ] 点击"取消"，对话框关闭，内容未删除
- [ ] 再次点击删除按钮
- [ ] 点击"确定删除"，内容被删除
- [ ] Toast提示正确
- [ ] 检查后端数据是否删除

### 分镜板删除测试（图片Tab）
- [ ] 点击分镜板的删除按钮
- [ ] 确认出现删除确认对话框
- [ ] 标题和消息正确
- [ ] 点击"取消"，对话框关闭，分镜板未删除
- [ ] 再次点击删除按钮
- [ ] 点击"确定删除"，分镜板被删除
- [ ] Toast提示正确
- [ ] 检查后端数据是否删除

### 分镜板删除测试（视频Tab）
- [ ] 点击分镜板的删除按钮
- [ ] 确认出现删除确认对话框
- [ ] 标题和消息正确
- [ ] 点击"取消"，对话框关闭，分镜板未删除
- [ ] 再次点击删除按钮
- [ ] 点击"确定删除"，分镜板被删除
- [ ] Toast提示正确
- [ ] 检查后端数据是否删除

### 已上传图片删除测试（视频Tab）
- [ ] 鼠标悬停在已上传图片上
- [ ] 右上角出现删除按钮
- [ ] 点击删除按钮
- [ ] 确认出现删除确认对话框
- [ ] 标题和消息正确
- [ ] 点击"取消"，对话框关闭，图片未删除
- [ ] 再次点击删除按钮
- [ ] 点击"确定删除"，图片被删除
- [ ] 图片从列表中移除（仅本地删除，未上传到服务器）

### 通用测试
- [ ] 点击对话框外的遮罩可以关闭对话框
- [ ] 对话框的动画效果正常
- [ ] 多次打开关闭对话框，状态正常
- [ ] 快速连续点击删除按钮，对话框不会重复打开

---

## 🎯 已修改的文件

```
✅ src/components/shortplay/tabs/ImageTab.tsx
   - 修改: onDeleteStoryboard → onShowDeleteConfirm

✅ src/components/shortplay/tabs/VideoTab.tsx
   - 修改: onDeleteStoryboard → onShowDeleteConfirm
   - 修改: onRemoveUploadedImage → onShowRemoveImageConfirm
   - 新增: 已上传图片删除确认

✅ src/components/ShortplayEntryPageRefactored.tsx
   - 新增: deleteStoryboardId 状态
   - 新增: removeUploadedImageId 状态
   - 新增: handleShowDeleteStoryboardConfirm 方法
   - 新增: handleConfirmDeleteStoryboard 方法
   - 新增: handleShowRemoveImageConfirm 方法
   - 新增: handleConfirmRemoveImage 方法
   - 新增: 两个 DeleteConfirmDialog 组件渲染
```

---

## 💡 扩展建议

如果将来需要添加更多删除操作，按照以下步骤：

### 1. 添加状态
```typescript
const [deleteXxxId, setDeleteXxxId] = useState<string | null>(null);
```

### 2. 添加显示确认方法
```typescript
const handleShowDeleteXxxConfirm = (id: string) => {
  setDeleteXxxId(id);
};
```

### 3. 添加确认删除方法
```typescript
const handleConfirmDeleteXxx = async () => {
  if (!deleteXxxId) return;
  // 执行删除逻辑
  setDeleteXxxId(null);
};
```

### 4. 渲染对话框
```typescript
<DeleteConfirmDialog
  isOpen={deleteXxxId !== null}
  title="确认删除"
  message="确定要删除这项内容吗？"
  onConfirm={handleConfirmDeleteXxx}
  onCancel={() => setDeleteXxxId(null)}
/>
```

### 5. 传递给子组件
```typescript
<SubComponent
  onShowDeleteConfirm={handleShowDeleteXxxConfirm}
/>
```

---

## ✅ 总结

- ✅ **所有删除操作都已添加二次确认**
- ✅ **统一使用 DeleteConfirmDialog 组件**
- ✅ **清晰的状态管理**
- ✅ **一致的用户体验**
- ✅ **防止误操作**

**更新时间**: 2025-10-12
**状态**: ✅ 已完成
**测试状态**: ⏳ 待测试
