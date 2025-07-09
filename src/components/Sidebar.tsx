import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import downloadWork from './WorkDownloader'
import { auth } from '../cloudbase'

interface CreateKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}

const CreateKnowledgeModal = ({ isOpen, onClose, onConfirm }: CreateKnowledgeModalProps) => {
  const [knowledgeName, setKnowledgeName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setKnowledgeName('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (knowledgeName.trim()) {
      onConfirm(knowledgeName)
      setKnowledgeName('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
        <h3 className="text-lg font-bold mb-4">创建知识库</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">知识库名称</label>
            <input
              ref={inputRef}
              type="text"
              value={knowledgeName}
              onChange={(e) => setKnowledgeName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入知识库名称"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={!knowledgeName.trim()}
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


interface ExpandedItems {
  [key: string]: boolean
}

interface Script {
  id: string
  name: string
}

interface Character {
  id: string
  name: string
  type: 'draft' | 'final'
  scripts?: Script[]
}

interface Work {
  id: string
  name: string
  lastVisitedView?: string
  characters?: Character[]
  views: {
    outline: boolean
    characters: boolean
    hostManual: boolean
    materials: boolean
  }
}

interface KnowledgeItem {
  id: string
  name: string
  documents?: number
  ideas?: number
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    works: true,  // 默认展开作品集
    'work-1': true, // 默认展开第一个作品
    'work-1-characters': true, // 默认展开角色剧本
    'work-1-char-1': true // 默认展开第一个角色
  })

  const [works, setWorks] = useState<Work[]>([
    {
      id: 'work-1',
      name: '剧本1',
      views: {
        outline: true,      // 大纲视图
        characters: true,   // 角色剧本视图
        hostManual: true,   // 主持人手册视图
        materials: true     // 物料视图
      },
      characters: [
        {
          id: 'char-1',
          name: '女1',
          type: 'draft',
          scripts: [
            { id: 'script-1', name: '第一本' },
            { id: 'script-2', name: '第二本' },
            { id: 'script-3', name: '第三本' }
          ]
        },
        {
          id: 'char-2',
          name: '女2',
          type: 'draft'
        }
      ]
    }
  ])
  // 从本地存储加载知识库数据
  const loadKnowledgeItems = (): KnowledgeItem[] => {
    try {
      const savedItems = localStorage.getItem('knowledgeItems')
      if (savedItems) {
        return JSON.parse(savedItems)
      }
    } catch (error) {
      console.error('加载知识库数据失败:', error)
    }
    // 如果没有保存的数据，返回默认测试数据
    return [
      { id: 'knowledge-1', name: '知识库', documents: 3, ideas: 0 }
    ]
  }

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(loadKnowledgeItems())
  const [showKnowledgeItems, setShowKnowledgeItems] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null)
  const [editingKnowledgeName, setEditingKnowledgeName] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const knowledgeEditInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [editingWorkId, setEditingWorkId] = useState<string | null>(null)
  const [editingWorkName, setEditingWorkName] = useState('')

  // 处理展开/折叠功能
  const toggleExpand = (key: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 通用toast提示函数
  const showToast = () => {
    toast('新功能加班加点更新中～')
  }

  // 处理作品点击
  const handleWorkClick = (work: Work) => {
    const view = work.lastVisitedView || 'outline'
    console.log(`Navigating to ${view} view for work: ${work.name}`)
  }

  // 处理作品名称双击编辑
  const handleWorkDoubleClick = (work: Work) => {
    setEditingWorkId(work.id)
    setEditingWorkName(work.name)
  }

  // 处理作品名称编辑保存
  const handleWorkEditSave = () => {
    if (editingWorkId) {
      setWorks(prev =>
        prev.map(work =>
          work.id === editingWorkId
            ? { ...work, name: editingWorkName }
            : work
        )
      )
      setEditingWorkId(null)
      setEditingWorkName('')
    }
  }

  // 处理作品名称编辑取消
  const handleWorkEditCancel = () => {
    setEditingWorkId(null)
    setEditingWorkName('')
  }

  // 处理作品名称编辑按键
  const handleWorkEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWorkEditSave()
    } else if (e.key === 'Escape') {
      handleWorkEditCancel()
    }
  }

  // 处理添加新作品
  const handleAddWork = () => {
    navigate('/')
  }

  // 处理下载作品
  const handleDownloadWork = async () => {
    showToast()
  }

  // 处理下载角色剧本
  const handleDownloadCharacterScript = async () => {
    showToast()
  }

  // 处理下载单个剧本
  const handleDownloadScript = async () => {
    showToast()
  }

  // 处理添加新剧本
  const handleAddScript = () => {
    showToast()
  }

  // 处理知识库添加按钮点击
  const handleKnowledgeBaseAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreateModalOpen(true)
  }

  // 处理知识库创建确认
  const handleKnowledgeBaseCreate = (name: string) => {
    const newId = `knowledge-${knowledgeItems.length + 1}`
    const newKnowledgeItem: KnowledgeItem = {
      id: newId,
      name: name,
      documents: 0,
      ideas: 0
    }
    const updatedItems = [...knowledgeItems, newKnowledgeItem];
    setKnowledgeItems(updatedItems)

    // 保存到本地存储
    try {
      localStorage.setItem('knowledgeItems', JSON.stringify(updatedItems))
      console.log('知识库保存成功:', updatedItems)
    } catch (error) {
      console.error('保存知识库失败:', error)
      toast.error('知识库保存失败，请重试')
      return
    }

    setShowKnowledgeItems(true)
    setIsCreateModalOpen(false)
    toast.success('知识库创建成功')
  }

  // 处理工作流其他按钮点击
  const handleWorkflowOtherAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/story-settings')
  }

  // 处理知识库项点击
  const handleKnowledgeItemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowKnowledgeItems(false)  // 默认收起知识库
    setActiveMenuId(null)
  }

  // 处理知识库项目点击，导航到知识库详情页面
  const handleKnowledgeItemDetailClick = (knowledgeId: string) => {
    const item = knowledgeItems.find(item => item.id === knowledgeId)
    if (item) {
      navigate(`/knowledge/${item.id}`)
    }
  }

  // 处理知识库项菜单点击
  // 假设添加一个新的状态变量来控制右侧页面显示
  const [showKnowledgePageOnRight, setShowKnowledgePageOnRight] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const handleKnowledgeMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    if (id === activeMenuId) {
      setActiveMenuId(null)
      return
    }

    // 计算菜单位置
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setMenuPosition({
      x: rect.right - 100, // 菜单宽度大约100px，所以向左偏移
      y: rect.bottom + 5
    })

    setActiveMenuId(id)
    setEditingKnowledgeId(null)
    setEditingKnowledgeName('')
    // 添加显示右侧页面的逻辑
    setShowKnowledgePageOnRight(true);
  }

  // 处理知识库编辑
  const handleKnowledgeEdit = (e: React.MouseEvent, item: KnowledgeItem) => {
    e.stopPropagation()
    setEditingKnowledgeId(item.id)
    setEditingKnowledgeName(item.name)
    setActiveMenuId(null)
  }

  // 处理知识库编辑保存
  const handleKnowledgeEditSave = () => {
    if (editingKnowledgeId && editingKnowledgeName.trim()) {
      const updatedItems = knowledgeItems.map(item =>
        item.id === editingKnowledgeId
          ? { ...item, name: editingKnowledgeName.trim() }
          : item
      )
      setKnowledgeItems(updatedItems)

      // 保存到本地存储
      try {
        localStorage.setItem('knowledgeItems', JSON.stringify(updatedItems))
        toast.success('知识库已更新')
      } catch (error) {
        console.error('保存知识库失败:', error)
        toast.error('知识库更新失败，请重试')
      }
    }
    setEditingKnowledgeId(null)
    setEditingKnowledgeName('')
  }

  // 处理知识库编辑取消
  const handleKnowledgeEditCancel = () => {
    setEditingKnowledgeId(null)
    setEditingKnowledgeName('')
  }

  // 处理知识库删除
  const handleKnowledgeDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updatedItems = knowledgeItems.filter(item => item.id !== id)
    setKnowledgeItems(updatedItems)
    setActiveMenuId(null)

    // 保存到本地存储
    try {
      localStorage.setItem('knowledgeItems', JSON.stringify(updatedItems))
      toast.success('知识库已删除')
    } catch (error) {
      console.error('保存知识库失败:', error)
      toast.error('知识库删除失败，请重试')
    }
  }

  // 处理知识库名称编辑按键
  const handleKnowledgeEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKnowledgeEditSave()
    } else if (e.key === 'Escape') {
      handleKnowledgeEditCancel()
    }
  }

  // 处理脚本点击
  const handleScriptClick = () => {
    showToast()
  }

  useEffect(() => {
    if (editingWorkId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingWorkId])

  useEffect(() => {
    if (editingKnowledgeId && knowledgeEditInputRef.current) {
      knowledgeEditInputRef.current.focus()
    }
  }, [editingKnowledgeId])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null)
    }

    const handleScroll = () => {
      setActiveMenuId(null)
    }

    document.addEventListener('click', handleClickOutside)
    // 监听侧边栏滚动事件
    const sidebarElement = document.querySelector('.sidebar-container')
    if (sidebarElement) {
      sidebarElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      if (sidebarElement) {
        sidebarElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div className="w-[300px] h-full bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-grow overflow-y-auto p-4">
        {/* <div className="flex items-center space-x-1 py-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        </div> */}

        {/* 作品集部分 */}
        <div className="font-bold text-lg mb-6 flex justify-between items-center">
          <span className="cursor-pointer flex items-center">
            <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 mr-1 text-gray-500" />
            作品集
          </span>
          <Icon
            icon="ri:add-line"
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleAddWork}
          />
        </div>

        {/* 剧本卡片式展示 */}
        <div className="space-y-2 mb-4 ml-4">
          {works.map(work => (
            <div key={work.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-2 mr-3">
                  <Icon icon="ri:book-2-line" className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium">{work.name}</div>
                  <div className="text-xs text-gray-500">{work.characters ? work.characters.length : 0} 文档</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Icon icon="ri:more-fill" className="w-5 h-5 text-gray-400 cursor-pointer" onClick={() => showToast()} />
              </div>
            </div>
          ))}
        </div>

        {/* 知识库部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span
            className="cursor-pointer flex items-center"
            onClick={handleKnowledgeItemClick}
          >
            <Icon
              icon={showKnowledgeItems ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"}
              className="w-5 h-5 mr-1 text-gray-500"
            />
            知识库
          </span>
          <Icon
            icon="ri:add-line"
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleKnowledgeBaseAddClick}
          />
        </div>

        {/* 知识库项目列表 */}
        {showKnowledgeItems && (
          <div className="space-y-2 ml-4">
            {knowledgeItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleKnowledgeItemDetailClick(item.id)}
              >
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <Icon icon="ri:file-text-line" className="w-5 h-5 text-blue-500" />
                </div>
                {editingKnowledgeId === item.id ? (
                  <div className="flex-grow">
                    <input
                      ref={knowledgeEditInputRef}
                      value={editingKnowledgeName}
                      onChange={e => setEditingKnowledgeName(e.target.value)}
                      onBlur={handleKnowledgeEditSave}
                      onKeyDown={handleKnowledgeEditKeyPress}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                ) : (
                  <div className="flex-grow">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.documents ?? 0} 文档 {(item.ideas && item.ideas > 0) ? `${item.ideas} 笔记 IDEAs` : ''}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Icon
                    icon="ri:more-fill"
                    className="w-5 h-5 text-gray-400 cursor-pointer"
                    onClick={(e) => handleKnowledgeMenuClick(e, item.id)}
                  />
                </div>
              </div>
            ))}
            {/* 底部空白区域 */}
            <div className="py-2"></div>
          </div>
        )}

        {/* 工作流部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span
            className="cursor-pointer flex items-center"
            onClick={handleWorkflowOtherAction}
          >
            <Icon
              icon="ri:arrow-right-s-line"
              className="w-5 h-5 mr-1 text-gray-500"
            />
            工作流
          </span>
          <Icon
            icon="ri:add-line"
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/story-settings')
            }}
          />
        </div>

        {/* 我的资料部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span
            className="cursor-pointer flex items-center"
            onClick={() => navigate('/profile')}
          >
            <Icon
              icon="ri:user-line"
              className="w-5 h-5 mr-1 text-gray-500"
            />
            我的
          </span>
        </div>

        <div className="text-gray-400 text-sm absolute bottom-4 left-4">StoryCraft @千帆叙梦</div>
      </div>

      {/* 创建知识库模态窗口 */}
      <CreateKnowledgeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleKnowledgeBaseCreate}
      />

      {/* 全局右键菜单 */}
      {activeMenuId && (
        <div
          className="fixed bg-white shadow-lg rounded-md py-1 z-50 w-24"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`
          }}
        >
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={(e) => {
              const item = knowledgeItems.find(k => k.id === activeMenuId)
              if (item) handleKnowledgeEdit(e, item)
            }}
          >
            <Icon icon="ri:edit-line" className="w-4 h-4 mr-2" />
            <span>修改</span>
          </div>
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500"
            onClick={(e) => handleKnowledgeDelete(e, activeMenuId)}
          >
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 mr-2" />
            <span>删除</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar