import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import downloadWork from './WorkDownloader'

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
}

const Sidebar = () => {
  // 尝试获取navigate，如果不在Router上下文中则使用一个空函数
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = (path: string) => {
      console.warn('Navigation attempted outside Router context:', path);
      window.location.href = path; // 降级为直接跳转
    };
  }
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    works: true,  // 默认展开作品集
    'work-1': true, // 默认展开第一个作品
    'work-1-characters': true, // 默认展开角色剧本
    'work-1-char-1': true // 默认展开第一个角色
  })
  const [works, setWorks] = useState<Work[]>([
    {
      id: 'work-1',
      name: '《xxxx》',
      views: {
        outline: true,      // 大纲视图
        characters: true,   // 角色剧本视图
        hostManual: true,   // 主持人手册视图
        materials: true     // 物料视图
      },
      characters: [
        {
          id: 'char-1',
          name: '女1: xxx',
          type: 'draft',
          scripts: [
            { id: 'script-1', name: '第一本' },
            { id: 'script-2', name: '第二本' },
            { id: 'script-3', name: '第三本' }
          ]
        },
        {
          id: 'char-2',
          name: '女2: xxx',
          type: 'draft'
        }
      ]
    }
  ])
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

  // Handle download script
  const handleDownloadScript = async (work: Work, character: Character, script: Script) => {
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

  // Handle add new script for character
  const handleAddScript = (work: Work, character: Character) => {
    toast('新功能加班加点更新中～')
  }

  // Handle knowledge base add
  const handleKnowledgeBaseAdd = () => {
    toast('新功能加班加点更新中～')
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

  // 处理知识库其他按钮点击
  const handleKnowledgeOtherAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast('新功能加班加点更新中～')
  }

  // 处理工作流其他按钮点击
  const handleWorkflowOtherAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast('新功能加班加点更新中～')
  }

  // 处理知识库项点击
  const handleKnowledgeItemClick = (item: KnowledgeItem) => {
    toast('新功能加班加点更新中～')
  }

  // 处理脚本点击
  const handleScriptClick = (script: Script) => {
    if (script.name === '分幕') {
      navigate('/scenes')
    } else {
      toast('新功能加班加点更新中～')
    }
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
            className="cursor-pointer flex items-center" 
            onClick={() => toggleExpand('works')}
          >
            <Icon 
              icon={expandedItems['works'] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
              className="w-5 h-5 mr-1 text-gray-500"
            />
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
                    className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                    onClick={() => handleDownloadWork(work)}
                  />
                  <Icon 
                    icon="ri:add-line" 
                    className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                    onClick={handleAddWork}
                  />
                </div>

                {/* Show work views when expanded */}
                {expandedItems[work.id] && (
                  <div className="ml-7 space-y-2 mt-2">
                    {/* 角色剧本部分 */}
                    {work.views.characters && work.characters && (
                      <div>
                        <div className="flex items-center">
                          <Icon 
                            icon={expandedItems[`${work.id}-characters`] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
                            className="w-5 h-5 mr-2 text-gray-500 cursor-pointer"
                            onClick={() => toggleExpand(`${work.id}-characters`)}
                          />
                          <span className="flex-grow cursor-pointer">角色剧本</span>
                          <Icon 
                            icon="ri:download-line" 
                            className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                            onClick={() => {
                              const allCharacters = work.characters || []
                              allCharacters.forEach(char => {
                                handleDownloadCharacterScript(work, char)
                              })
                            }}
                          />
                          <Icon 
                            icon="ri:add-line" 
                            className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                            onClick={() => toast('新功能加班加点更新中～')}
                          />
                        </div>
                        
                        {expandedItems[`${work.id}-characters`] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {work.characters.map(char => (
                              <div key={char.id}>
                                <div className="flex items-center">
                                  <Icon 
                                    icon={expandedItems[char.id] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
                                    className="w-5 h-5 mr-2 text-gray-500 cursor-pointer"
                                    onClick={() => toggleExpand(char.id)}
                                  />
                                  <span className="flex-grow cursor-pointer">{char.name}</span>
                                  <Icon 
                                    icon="ri:download-line" 
                                    className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadCharacterScript(work, char)
                                    }}
                                  />
                                  <Icon 
                                    icon="ri:add-line" 
                                    className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddScript(work, char)
                                    }}
                                  />
                                </div>
                                
                                {/* 如果角色有剧本且角色展开，则显示剧本列表 */}
                                {expandedItems[char.id] && char.scripts && (
                                  <div className="ml-7 space-y-1 mt-1">
                                    {char.scripts.map(script => (
                                      <div key={script.id} className="flex items-center">
                                        <Icon 
                                          icon="ri:arrow-right-s-line" 
                                          className="w-5 h-5 mr-2 text-gray-500"
                                        />
                                        <span 
                                          className="flex-grow cursor-pointer"
                                          onClick={() => handleScriptClick(script)}
                                        >
                                          {script.name}
                                        </span>
                                        <Icon 
                                          icon="ri:download-line" 
                                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDownloadScript(work, char, script)
                                          }}
                                        />
                                        <Icon 
                                          icon="ri:add-line" 
                                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                          onClick={() => toast('新功能加班加点更新中～')}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 主持人手册部分 */}
                    {work.views.hostManual && (
                      <div className="flex items-center">
                        <Icon 
                          icon="ri:arrow-right-s-line" 
                          className="w-5 h-5 mr-2 text-gray-500"
                        />
                        <span className="flex-grow cursor-pointer">主持人手册</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadHostManual(work)
                          }}
                        />
                        <Icon 
                          icon="ri:add-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => toast('新功能加班加点更新中～')}
                        />
                      </div>
                    )}
                    
                    {/* 物料部分 */}
                    {work.views.materials && (
                      <div className="flex items-center">
                        <Icon 
                          icon="ri:arrow-right-s-line" 
                          className="w-5 h-5 mr-2 text-gray-500"
                        />
                        <span className="flex-grow cursor-pointer">物料</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadMaterials(work)
                          }}
                        />
                        <Icon 
                          icon="ri:add-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => toast('新功能加班加点更新中～')}
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
          className="font-bold text-lg mt-10 mb-6 flex justify-between items-center" 
        >
          <span 
            className="cursor-pointer flex items-center" 
            onClick={() => toggleExpand('knowledgeBase')}
          >
            <Icon 
              icon={expandedItems['knowledgeBase'] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
              className="w-5 h-5 mr-1 text-gray-500"
            />
            知识库
          </span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleKnowledgeBaseAdd}
          />
        </div>
        
        {expandedItems['knowledgeBase'] && (
          <div className="space-y-4 text-gray-500 text-sm italic">
            <div className="flex items-center">
              <Icon icon="ri:information-line" className="w-5 h-5 mr-2" />
              <span>暂无知识库，请点击"+"添加</span>
            </div>
          </div>
        )}

        {/* Workflow Section */}
        <div 
          className="font-bold text-lg mt-10 mb-6 flex justify-between items-center" 
        >
          <span 
            className="cursor-pointer flex items-center" 
            onClick={() => toggleExpand('workflow')}
          >
            <Icon 
              icon={expandedItems['workflow'] ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
              className="w-5 h-5 mr-1 text-gray-500"
            />
            工作流
          </span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={handleWorkflowAdd}
          />
        </div>
        
        {/* Workflow content */}
        {expandedItems['workflow'] && (
          <div className="space-y-4 text-gray-500 text-sm italic">
            <div className="flex items-center">
              <Icon icon="ri:information-line" className="w-5 h-5 mr-2" />
              <span>暂无工作流，请点击"+"添加</span>
            </div>
          </div>
        )}
        
        <div className="text-gray-400 mt-16 text-sm">Writer.AI @千帆叙梦</div>
      </div>
    </div>
  )
}

export default Sidebar 