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

  // 处理展开/折叠功能
  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
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
    showToast()
  }

  // 处理下载作品
  const handleDownloadWork = async (work: Work) => {
    showToast()
  }

  // 处理下载角色剧本
  const handleDownloadCharacterScript = async (work: Work, character: Character) => {
    showToast()
  }

  // 处理下载单个剧本
  const handleDownloadScript = async (work: Work, character: Character, script: Script) => {
    showToast()
  }

  // 处理添加新剧本
  const handleAddScript = (work: Work, character: Character) => {
    showToast()
  }

  // 处理知识库添加
  const handleKnowledgeBaseAdd = () => {
    showToast()
  }

  // 处理工作流其他按钮点击
  const handleWorkflowOtherAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    showToast()
  }

  // 处理知识库项点击
  const handleKnowledgeItemClick = (item: KnowledgeItem) => {
    showToast()
  }

  // 处理脚本点击
  const handleScriptClick = (script: Script) => {
    showToast()
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

        {/* 作品集部分 */}
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
        
        {/* 作品集内容 */}
        {expandedItems['works'] && (
          <div className="space-y-4 mb-4">
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
                    onClick={() => showToast()}
                  />
                </div>

                {/* 作品内容展开时 */}
                {expandedItems[work.id] && (
                  <div className="ml-7 space-y-2 mt-2">
                    {/* 角色剧本部分 */}
                    {work.views.characters && work.characters && work.characters.length > 0 && (
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
                            onClick={() => work.characters && work.characters.length > 0 ? handleDownloadCharacterScript(work, work.characters[0]) : showToast()}
                          />
                          <Icon 
                            icon="ri:add-line" 
                            className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                            onClick={() => work.characters && work.characters.length > 0 ? handleAddScript(work, work.characters[0]) : showToast()}
                          />
                        </div>
                        
                        {expandedItems[`${work.id}-characters`] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {work.characters && work.characters.map(char => (
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
                                    onClick={() => handleDownloadCharacterScript(work, char)}
                                  />
                                  <Icon 
                                    icon="ri:add-line" 
                                    className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                    onClick={() => handleAddScript(work, char)}
                                  />
                                </div>
                                
                                {/* 角色剧本列表 */}
                                {expandedItems[char.id] && char.scripts && char.scripts.length > 0 && (
                                  <div className="ml-7 space-y-1 mt-1">
                                    {char.scripts && char.scripts.map(script => (
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
                                          onClick={() => handleDownloadScript(work, char, script)}
                                        />
                                        <Icon 
                                          icon="ri:add-line" 
                                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                                          onClick={() => showToast()}
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
                        <span 
                          className="flex-grow cursor-pointer"
                          onClick={() => showToast()}
                        >主持人手册</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => showToast()}
                        />
                        <Icon 
                          icon="ri:add-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => showToast()}
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
                        <span 
                          className="flex-grow cursor-pointer"
                          onClick={() => showToast()}
                        >物料</span>
                        <Icon 
                          icon="ri:download-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => showToast()}
                        />
                        <Icon 
                          icon="ri:add-line" 
                          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer"
                          onClick={() => showToast()}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 知识库部分 */}
        <div className="font-bold text-lg mt-6 mb-2 flex justify-between items-center hover:bg-gray-50 p-2 rounded-md">
          <span 
            className="cursor-pointer flex items-center" 
            onClick={() => handleKnowledgeItemClick({id: 'default', name: '知识库'})}
          >
            <Icon 
              icon="ri:arrow-right-s-line" 
              className="w-5 h-5 mr-1 text-gray-500"
            />
            知识库
          </span>
          <Icon 
            icon="ri:add-line" 
            className="w-5 h-5 text-gray-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              showToast()
            }}
          />
        </div>
        
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
              showToast()
            }}
          />
        </div>
        
        <div className="text-gray-400 mt-16 text-sm">Writer.AI @千帆叙梦</div>
      </div>
    </div>
  )
}

export default Sidebar 