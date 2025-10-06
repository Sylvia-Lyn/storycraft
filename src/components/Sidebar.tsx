import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import downloadWork from './WorkDownloader'
import { getCloudbaseAuth } from '../cloudbase'
import worksService, { Work as CloudWork } from '../services/worksService'
import CreateWorkModal from './CreateWorkModal'
import { useAuth } from '../contexts/AuthContext'
import { useWorks } from '../contexts/WorksContext'
import { useI18n } from '../contexts/I18nContext'

interface CreateKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}

const CreateKnowledgeModal = ({ isOpen, onClose, onConfirm }: CreateKnowledgeModalProps) => {
  const [knowledgeName, setKnowledgeName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()

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
        <h3 className="text-lg font-bold mb-4">{t('sidebar.createKnowledgeTitle')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('sidebar.knowledgeName')}</label>
            <input
              ref={inputRef}
              type="text"
              value={knowledgeName}
              onChange={(e) => setKnowledgeName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('sidebar.enterKnowledgeName')}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('sidebar.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={!knowledgeName.trim()}
            >
              {t('sidebar.confirm')}
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
  _id?: string
  id?: string
  name: string
  content?: any
  type?: 'script' | 'outline' | 'character' | 'web_novel'
  createdAt?: Date
  updatedAt?: Date
  isSaved?: boolean
  userId?: string
  lastVisitedView?: string
  characters?: Character[]
  views?: {
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
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { works, currentWork, isLoading, setCurrentWork, createWork, deleteWork } = useWorks();
  const { t, language } = useI18n();
  
  // 调试信息
  console.log('Sidebar 渲染状态:', { 
    worksLength: works.length, 
    isLoading, 
    isAuthenticated,
    works: works 
  });

  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    works: true,  // 默认展开作品集
    'work-1': true, // 默认展开第一个作品
    'work-1-characters': true, // 默认展开角色剧本
    'work-1-char-1': true // 默认展开第一个角色
  })

  const [isCreateWorkModalOpen, setIsCreateWorkModalOpen] = useState(false)

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

  // 当语言变化时，更新默认知识库的名称
  useEffect(() => {
    const hasDefaultKnowledge = knowledgeItems.some(item => item.id === 'knowledge-1')
    if (hasDefaultKnowledge) {
      setKnowledgeItems(prev => prev.map(item => 
        item.id === 'knowledge-1' 
          ? { ...item, name: t('sidebar.knowledgeBase') }
          : item
      ))
    }
  }, [t, language])
  const [showKnowledgeItems, setShowKnowledgeItems] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null)
  const [editingKnowledgeName, setEditingKnowledgeName] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const knowledgeEditInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [editingWorkId, setEditingWorkId] = useState<string | null>(null)
  const [editingWorkName, setEditingWorkName] = useState('')
  const [activeWorkMenuId, setActiveWorkMenuId] = useState<string | null>(null)
  const [workMenuPosition, setWorkMenuPosition] = useState({ x: 0, y: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [workToDelete, setWorkToDelete] = useState<CloudWork | null>(null)

  // 处理展开/折叠功能
  const toggleExpand = (key: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 添加处理作品集展开/收起的函数
  const handleWorksToggle = () => {
    setExpandedItems(prev => ({
      ...prev,
      works: !prev.works
    }))
  }

  // 通用toast提示函数
  const showToast = () => {
    toast('新功能加班加点更新中～')
  }

  // 根据作品类型导航到相应的编辑界面
  const navigateToWorkEditor = (work: CloudWork) => {
    const view = work.lastVisitedView
    
    // 优先使用lastVisitedView，如果没有则根据作品类型决定
    if (view === 'outline') {
      navigate('/app/outline')
    } else if (view === 'script' || view === 'editor') {
      navigate('/app/editor')
    } else if (view === 'characters') {
      navigate('/app/characters')
    } else if (view === 'relations') {
      navigate('/app/relations')
    } else if (view === 'chapters') {
      navigate('/app/chapters')
    } else if (view === 'scenes') {
      navigate('/app/scenes')
    } else {
      // 所有新创建的作品类型都跳转到编辑器页面
      navigate('/app/editor')
    }
  }

  // 处理作品点击
  const handleWorkClick = async (work: CloudWork) => {
    try {
      setCurrentWork(work)
      console.log(`Navigating to ${work.lastVisitedView || 'default'} view for work: ${work.name}, type: ${work.type}`)

      // 获取完整的作品信息
      const fullWork = await worksService.getWork(work._id || work.id || '')

      // 通过自定义事件通知编辑器加载作品内容
      const event = new CustomEvent('workSelected', {
        detail: { work: fullWork }
      })
      window.dispatchEvent(event)

      // 导航到相应的编辑界面
      navigateToWorkEditor(work)

      toast.success(t('common.workLoaded', { name: work.name }))
    } catch (error) {
      console.error('加载作品失败:', error)
      toast.error(t('common.workLoadFailed'))
    }
  }

  // 处理作品名称双击编辑
  const handleWorkDoubleClick = (work: Work) => {
    setEditingWorkId(work.id)
    setEditingWorkName(work.name)
  }

  // 处理作品名称编辑保存
  const handleWorkEditSave = () => {
    if (editingWorkId) {
      // 使用WorksContext中的updateWork方法
      // 这里暂时注释掉，因为需要实现updateWork功能
      // updateWork(editingWorkId, { name: editingWorkName })
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
    if (!isAuthenticated) {
      toast.error(t('common.pleaseLogin'));
      navigate('/app/login');
      return;
    }
    setIsCreateWorkModalOpen(true)
  }

  // 处理创建作品确认
  const handleCreateWorkConfirm = async (name: string, type: string = 'script') => {
    try {
      const newWork = await createWork(name, undefined, type)
      setIsCreateWorkModalOpen(false)
      toast.success(t('common.workCreated'))
      
      // 创建成功后自动跳转到相应的编辑界面
      navigateToWorkEditor(newWork)
    } catch (error) {
      console.error('创建作品失败:', error)
      toast.error(t('common.workCreateFailed'))
    }
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
      toast.error(t('common.knowledgeBaseSaveFailed'))
      return
    }

    setShowKnowledgeItems(true)
    setIsCreateModalOpen(false)
    toast.success(t('common.knowledgeBaseCreated'))
  }

  // 处理工作流其他按钮点击
  const handleWorkflowOtherAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/app/story-settings')
  }

  // 修改知识库点击处理函数，实现真正的展开/收起切换
  const handleKnowledgeItemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowKnowledgeItems(prev => !prev)  // 切换展开/收起状态
    setActiveMenuId(null)
  }

  // 处理知识库项目点击，导航到知识库详情页面
  const handleKnowledgeItemDetailClick = (knowledgeId: string) => {
    const item = knowledgeItems.find(item => item.id === knowledgeId)
    if (item) {
      navigate(`/app/knowledge/${item.id}`)
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
        toast.success(t('common.knowledgeBaseUpdated'))
      } catch (error) {
        console.error('保存知识库失败:', error)
        toast.error(t('common.knowledgeBaseUpdateFailed'))
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
      toast.success(t('common.knowledgeBaseDeleted'))
    } catch (error) {
      console.error('保存知识库失败:', error)
      toast.error(t('common.knowledgeBaseDeleteFailed'))
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

  // 处理作品操作菜单点击
  const handleWorkMenuClick = (e: React.MouseEvent, work: CloudWork) => {
    e.stopPropagation()
    
    if (activeWorkMenuId === work._id || activeWorkMenuId === work.id) {
      setActiveWorkMenuId(null)
      return
    }

    // 计算菜单位置
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setWorkMenuPosition({
      x: rect.right - 100, // 菜单宽度大约100px，所以向左偏移
      y: rect.bottom + 5
    })

    setActiveWorkMenuId(work._id || work.id || '')
  }

  // 处理作品删除
  const handleWorkDelete = async (work: CloudWork) => {
    try {
      await deleteWork(work._id || work.id || '')
      
      setActiveWorkMenuId(null)
      setShowDeleteConfirm(false)
      setWorkToDelete(null)
      
      toast.success(t('common.workDeleted'))

      // 如果当前在编辑页且删除的是当前作品，则跳转回首页
      const isEditorPage = location.pathname === '/app/editor'
      const deletedId = work._id || work.id
      const currentId = currentWork ? (currentWork._id || currentWork.id) : null
      if (isEditorPage && deletedId && currentId && deletedId === currentId) {
        navigate('/app/home')
      }
    } catch (error) {
      console.error('删除作品失败:', error)
      toast.error(t('common.workDeleteFailed'))
    }
  }

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (workToDelete) {
      handleWorkDelete(workToDelete)
    }
  }

  // 处理删除取消
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setWorkToDelete(null)
    setActiveWorkMenuId(null)
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

  // 组件加载时获取作品列表 - 现在由WorksContext自动处理

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null)
      setActiveWorkMenuId(null)
    }

    const handleScroll = () => {
      setActiveMenuId(null)
      setActiveWorkMenuId(null)
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
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span className="cursor-pointer flex items-center" onClick={handleWorksToggle}>
            <Icon 
              icon={expandedItems.works ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
              className="w-5 h-5 mr-1 text-gray-500" 
            />
            {t('sidebar.works')}
            {isAuthenticated && works.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({works.length})</span>
            )}
          </span>
          {isAuthenticated && (
            <Icon
              icon="ri:add-line"
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={handleAddWork}
            />
          )}
        </div>

        {/* 剧本卡片式展示 - 只在展开时显示 */}
        {expandedItems.works && (
          <div className="max-h-96 overflow-y-auto overflow-x-hidden space-y-2 mb-4 ml-4 pr-2">
            {!isAuthenticated ? (
              <div className="text-center py-4 text-gray-500">
                <Icon icon="ri:lock-line" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{t('common.pleaseLogin')}</p>
                <p className="text-xs">{t('sidebar.loginToView')}</p>
                <button
                  onClick={() => navigate('/app/login')}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  {t('sidebar.goToLogin')}
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">{t('sidebar.loading')}</span>
              </div>
            ) : works.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Icon icon="ri:book-2-line" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{t('sidebar.noWorks')}</p>
                <p className="text-xs">{t('sidebar.clickToCreate')}</p>
              </div>
            ) : (
              // 按更新时间排序，最新的在前
              [...works].sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
                const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
                return dateB - dateA
              }).map(work => (
                <div
                  key={work._id || work.id}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-lg ${currentWork && (currentWork._id === (work._id || work.id) || currentWork.id === (work._id || work.id)) ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  onClick={() => handleWorkClick(work)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`rounded-lg p-2 mr-3 flex-shrink-0 ${
                      work.type === 'web_novel' 
                        ? 'bg-blue-100' 
                        : 'bg-purple-100'
                    }`}>
                      <Icon 
                        icon={work.type === 'web_novel' ? 'ri:article-line' : 'ri:book-2-line'} 
                        className={`w-5 h-5 ${
                          work.type === 'web_novel' 
                            ? 'text-blue-400' 
                            : 'text-purple-400'
                        }`} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium break-words overflow-hidden">{work.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {t(`common.workTypes.${work.type}`)}
                        {work.updatedAt && (
                          <span className="ml-2">
                            {new Date(work.updatedAt).toLocaleDateString(t('common.dateFormat.locale'), t('common.dateFormat.options') as Intl.DateTimeFormatOptions)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {work.isSaved === false && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <Icon icon="ri:more-fill" className="w-5 h-5 text-gray-400 cursor-pointer" onClick={(e) => handleWorkMenuClick(e, work)} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
            {t('sidebar.knowledgeBase')}
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
                      {item.documents ?? 0} {t('sidebar.documents')} {(item.ideas && item.ideas > 0) ? `${item.ideas} ${t('sidebar.ideas')}` : ''}
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
            {t('sidebar.workflow')}
          </span>
          <Icon
            icon="ri:add-line"
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/app/story-settings')
            }}
          />
        </div>

        {/* 一键创作部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-blue-50 p-2 rounded-md">
          <span
            className="cursor-pointer flex items-center w-full"
            onClick={() => navigate('/app/shortplay-entry')}
          >
            <div className="bg-blue-500 rounded-lg p-2 mr-3">
              <Icon icon="ri:magic-line" className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-600">{t('sidebar.oneClickCreate')}</span>
          </span>
        </div>

        {/* 我的资料部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span
            className="cursor-pointer flex items-center"
            onClick={() => navigate('/app/profile')}
          >
            <Icon
              icon="ri:user-line"
              className="w-5 h-5 mr-1 text-gray-500"
            />
            {t('sidebar.myProfile')}
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

      {/* 创建作品模态窗口 */}
      <CreateWorkModal
        isOpen={isCreateWorkModalOpen}
        onClose={() => setIsCreateWorkModalOpen(false)}
        onConfirm={handleCreateWorkConfirm}
      />

      {/* 知识库右键菜单 */}
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
            <span>{t('sidebar.modify')}</span>
          </div>
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500"
            onClick={(e) => handleKnowledgeDelete(e, activeMenuId)}
          >
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 mr-2" />
            <span>{t('sidebar.delete')}</span>
          </div>
        </div>
      )}

      {/* 作品操作菜单 */}
      {activeWorkMenuId && (
        <div
          className="fixed bg-white shadow-lg rounded-md py-1 z-50 w-24"
          style={{
            left: `${workMenuPosition.x}px`,
            top: `${workMenuPosition.y}px`
          }}
        >
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              const work = works.find(w => (w._id === activeWorkMenuId || w.id === activeWorkMenuId))
              if (work) {
                setWorkToDelete(work)
                setShowDeleteConfirm(true)
              }
            }}
          >
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 mr-2" />
            <span>{t('sidebar.delete')}</span>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && workToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-red-600">{t('sidebar.deleteWork')}</h3>
            <p className="text-gray-700 mb-6">
              {t('sidebar.deleteWorkConfirm', { name: workToDelete.name })}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('sidebar.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                {t('sidebar.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar