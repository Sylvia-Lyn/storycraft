import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import downloadWork from './WorkDownloader'

interface ExpandedItems {
  [key: string]: boolean
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

interface Character {
  id: string
  name: string
  type: 'draft' | 'final'
}

interface KnowledgeItem {
  id: string
  name: string
}

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    works: true  // 默认展开作品集
  })
  const [works, setWorks] = useState<Work[]>([])
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null)
  const [editingWorkName, setEditingWorkName] = useState('')
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null)
  const [editingKnowledgeName, setEditingKnowledgeName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Handle expand/collapse
  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle work name click
  const handleWorkClick = (work: Work) => {
    // 导航到用户上次访问的视图或默认视图（大纲）
    const view = work.lastVisitedView || 'outline'
    console.log(`Navigating to ${view} view for work: ${work.name}`)
  }

  // Handle work name double click for editing
  const handleWorkDoubleClick = (work: Work) => {
    setEditingWorkId(work.id)
    setEditingWorkName(work.name)
  }

  // Handle work name edit save
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

  // Handle work name edit cancel
  const handleWorkEditCancel = () => {
    setEditingWorkId(null)
    setEditingWorkName('')
  }

  // Handle work name edit key press
  const handleWorkEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWorkEditSave()
    } else if (e.key === 'Escape') {
      handleWorkEditCancel()
    }
  }

  // Handle add new work
  const handleAddWork = () => {
    const newWork: Work = {
      id: `work-${Date.now()}`,
      name: '新作品',
      views: {
        outline: true,      // 大纲视图
        characters: true,   // 角色剧本视图
        hostManual: true,   // 主持人手册视图
        materials: true     // 物料视图
      },
      characters: [
        {
          id: `char-${Date.now()}-1`,
          name: '角色1',
          type: 'draft'
        }
      ]
    }
    setWorks(prev => [...prev, newWork])
    setEditingWorkId(newWork.id)
    setEditingWorkName(newWork.name)
    
    // 展开新作品
    setExpandedItems(prev => ({
      ...prev,
      [newWork.id]: true
    }))
  }

  // Handle download work
  const handleDownloadWork = async (work: Work) => {
    try {
      // 下载作品（包括大纲、所有角色剧本、主持人手册和物料）
      await downloadWork({
        type: 'work',
        workName: work.name,
        downloadType: 'all'
      })

      toast.success('下载成功')
    } catch (error) {
      toast.error('下载失败')
      console.error('Download failed:', error)
    }
  }

  // Handle download character script
  const handleDownloadCharacterScript = async (work: Work, character: Character) => {
    try {
      await downloadWork({
        type: 'character',
        workName: work.name,
        characterName: character.name,
        downloadType: 'all'  // 下载初稿和终稿
      })

      toast.success('下载成功')
    } catch (error) {
      toast.error('下载失败')
      console.error('Download failed:', error)
    }
  }

  // Handle download host manual
  const handleDownloadHostManual = async (work: Work) => {
    try {
      await downloadWork({
        type: 'host',
        workName: work.name
      })

      toast.success('下载成功')
    } catch (error) {
      toast.error('下载失败')
      console.error('Download failed:', error)
    }
  }

  // Handle download materials
  const handleDownloadMaterials = async (work: Work) => {
    try {
      await downloadWork({
        type: 'material',
        workName: work.name
      })

      toast.success('下载成功')
    } catch (error) {
      toast.error('下载失败')
      console.error('Download failed:', error)
    }
  }

  // Handle knowledge base add
  const handleKnowledgeBaseAdd = () => {
    const newItem: KnowledgeItem = {
      id: `knowledge-${Date.now()}`,
      name: '新知识库'
    }
    setKnowledgeItems(prev => [...prev, newItem])
    setEditingKnowledgeId(newItem.id)
    setEditingKnowledgeName(newItem.name)
    
    // 展开知识库部分
    setExpandedItems(prev => ({
      ...prev,
      'knowledgeBase': true
    }))
  }

  // Handle knowledge item edit save
  const handleKnowledgeEditSave = () => {
    if (editingKnowledgeId) {
      setKnowledgeItems(prev => 
        prev.map(item => 
          item.id === editingKnowledgeId 
            ? { ...item, name: editingKnowledgeName }
            : item
        )
      )
      setEditingKnowledgeId(null)
      setEditingKnowledgeName('')
    }
  }

  // Handle knowledge item edit cancel
  const handleKnowledgeEditCancel = () => {
    setEditingKnowledgeId(null)
    setEditingKnowledgeName('')
  }

  // Handle knowledge item edit key press
  const handleKnowledgeEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKnowledgeEditSave()
    } else if (e.key === 'Escape') {
      handleKnowledgeEditCancel()
    }
  }

  // Handle workflow add click
  const handleWorkflowAdd = () => {
    toast('新功能加班加点更新中～')
  }

  useEffect(() => {
    if (editingWorkId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingWorkId])

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 overflow-auto">
      <div className="p-4">
        <div className="flex items-center space-x-1 py-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        </div>

        {/* Works Section */}
        <div className="font-bold text-lg mb-6 flex justify-between items-center">
          <span 
            className="cursor-pointer" 
            onClick={() => toggleExpand('works')}
          >
            作品集
          </span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleAddWork}
          />
        </div>
        
        {expandedItems['works'] && (
          <div className="space-y-4">
            {works.map(work => (
              <div key={work.id}>
                <div className="flex items-center">
                  <Icon 
                    icon={expandedItems[work.id] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
                    className="w-5 h-5 mr-2 text-gray-500 cursor-pointer"
                    onClick={() => toggleExpand(work.id)}
                  />
                  {editingWorkId === work.id ? (
                    <input
                      ref={editInputRef}
                      value={editingWorkName}
                      onChange={e => setEditingWorkName(e.target.value)}
                      onBlur={handleWorkEditSave}
                      onKeyDown={handleWorkEditKeyPress}
                      className="flex-grow border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span 
                      className="flex-grow cursor-pointer"
                      onClick={() => handleWorkClick(work)}
                      onDoubleClick={() => handleWorkDoubleClick(work)}
                    >
                      {work.name}
                    </span>
                  )}
                  <Icon 
                    icon="ri:download-line" 
                    className="w-5 h-5 mx-3 text-gray-500 cursor-pointer"
                    onClick={() => handleDownloadWork(work)}
                  />
                </div>

                {/* Show work views when expanded */}
                {expandedItems[work.id] && (
                  <div className="ml-7 space-y-2 mt-2">
                    {work.views.outline && (
                      <div className="flex items-center">
                        <Icon icon="ri:file-text-line" className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="cursor-pointer">大纲</span>
                      </div>
                    )}
                    {work.views.characters && work.characters && (
                      <div>
                        <div className="flex items-center">
                          <Icon icon="ri:group-line" className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="cursor-pointer">角色剧本</span>
                        </div>
                        <div className="ml-6 mt-1 space-y-1">
                          {work.characters.map(char => (
                            <div key={char.id} className="flex items-center">
                              <Icon icon="ri:user-line" className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="cursor-pointer">{char.name}</span>
                              <Icon 
                                icon="ri:download-line" 
                                className="w-4 h-4 ml-2 text-gray-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadCharacterScript(work, char)
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {work.views.hostManual && (
                      <div className="flex items-center">
                        <Icon icon="ri:book-line" className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="cursor-pointer">主持人手册</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-4 h-4 ml-2 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadHostManual(work)
                          }}
                        />
                      </div>
                    )}
                    {work.views.materials && (
                      <div className="flex items-center">
                        <Icon icon="ri:folder-line" className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="cursor-pointer">物料</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-4 h-4 ml-2 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadMaterials(work)
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Knowledge Base Section */}
        <div 
          className="font-bold text-lg mt-10 mb-6 flex justify-between items-center cursor-pointer" 
        >
          <span onClick={() => toggleExpand('knowledgeBase')}>知识库</span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleKnowledgeBaseAdd}
          />
        </div>
        
        {expandedItems['knowledgeBase'] && (
          <div className="space-y-4">
            {knowledgeItems.map(item => (
              <div key={item.id} className="flex items-center">
                <Icon icon="ri:file-text-line" className="w-5 h-5 mr-2 text-gray-500" />
                {editingKnowledgeId === item.id ? (
                  <input
                    ref={editInputRef}
                    value={editingKnowledgeName}
                    onChange={e => setEditingKnowledgeName(e.target.value)}
                    onBlur={handleKnowledgeEditSave}
                    onKeyDown={handleKnowledgeEditKeyPress}
                    className="flex-grow border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <span 
                    className="flex-grow cursor-pointer"
                    onDoubleClick={() => {
                      setEditingKnowledgeId(item.id)
                      setEditingKnowledgeName(item.name)
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Workflow Section */}
        <div 
          className="font-bold text-lg mt-10 mb-6 cursor-pointer flex justify-between items-center" 
          onClick={() => toggleExpand('workflow')}
        >
          <span>工作流</span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleWorkflowAdd}
          />
        </div>
        
        {/* Empty workflow content */}
        {expandedItems['workflow'] && (
          <div className="space-y-4">
          </div>
        )}
        
        <div className="text-gray-400 mt-16 text-sm">Writer.AI @千帆叙梦</div>
      </div>
    </div>
  )
}

export default Sidebar 