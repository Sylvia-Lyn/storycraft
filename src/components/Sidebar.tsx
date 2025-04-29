import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface ExpandedItems {
  [key: string]: boolean
}

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    '作品集': true,
    '《xxxx》1': false,
    '《xxxx》2': true,
    '角色剧本': true,
    '女1': true,
    '女2': false,
    '第一本': false,
    '第二本': false,
    '第三本': false,
    '主持人手册': false,
    '物料': false,
    '知识库': false,
    '工作流': false
  })
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleItemClick = (item: string) => {
    if (showDropdown === item) {
      setShowDropdown(null)
    } else {
      setShowDropdown(item)
    }
  }

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 overflow-auto">
      <div className="p-4">
        <div className="flex items-center space-x-1 py-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        </div>

        <div 
          className="font-bold text-lg mb-6 cursor-pointer" 
          onClick={() => toggleExpand('作品集')}
        >
          作品集
        </div>
        
        {expandedItems['作品集'] && (
          <div className="space-y-4">
            <div className="flex items-center">
              <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('《xxxx》1')}>《xxxx》</span>
              <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
              <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
              {showDropdown === '《xxxx》1' && (
                <div 
                  ref={dropdownRef}
                  className="absolute mt-1 ml-6 bg-white shadow-md rounded-md z-10"
                  style={{ top: '100%', left: '0' }}
                >
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">编辑</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">删除</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">复制</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <Icon 
                icon="ri:arrow-down-s-line" 
                className="w-5 h-5 mr-2 text-gray-500"
                onClick={() => toggleExpand('《xxxx》2')}
              />
              <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('《xxxx》2')}>《xxxx》</span>
              <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
              <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
            </div>

            {expandedItems['《xxxx》2'] && (
              <div className="ml-7 space-y-4">
                <div className="flex items-center">
                  <Icon 
                    icon="ri:arrow-down-s-line" 
                    className="w-5 h-5 mr-2 text-gray-500"
                    onClick={() => toggleExpand('角色剧本')}
                  />
                  <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('角色剧本')}>角色剧本</span>
                  <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                  <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                </div>

                {expandedItems['角色剧本'] && (
                  <div className="ml-7 space-y-4">
                    <div className="flex items-center">
                      <Icon 
                        icon="ri:arrow-down-s-line" 
                        className="w-5 h-5 mr-2 text-gray-500"
                        onClick={() => toggleExpand('女1')}
                      />
                      <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('女1')}>女1: xxx</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    {expandedItems['女1'] && (
                      <div className="ml-7 space-y-4">
                        <div className="flex items-center">
                          <Icon 
                            icon="ri:arrow-right-s-line" 
                            className="w-5 h-5 mr-2 text-gray-500"
                            onClick={() => toggleExpand('第一本')}
                          />
                          <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('第一本')}>第一本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex items-center">
                          <Icon 
                            icon="ri:arrow-right-s-line" 
                            className="w-5 h-5 mr-2 text-gray-500"
                            onClick={() => toggleExpand('第二本')}
                          />
                          <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('第二本')}>第二本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex items-center">
                          <Icon 
                            icon="ri:arrow-right-s-line" 
                            className="w-5 h-5 mr-2 text-gray-500"
                            onClick={() => toggleExpand('第三本')}
                          />
                          <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('第三本')}>第三本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Icon 
                        icon="ri:arrow-right-s-line" 
                        className="w-5 h-5 mr-2 text-gray-500"
                        onClick={() => toggleExpand('女2')}
                      />
                      <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('女2')}>女2: xxx</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="flex items-center">
                      <Icon 
                        icon="ri:arrow-right-s-line" 
                        className="w-5 h-5 mr-2 text-gray-500"
                        onClick={() => toggleExpand('主持人手册')}
                      />
                      <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('主持人手册')}>主持人手册</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="flex items-center">
                      <Icon 
                        icon="ri:arrow-right-s-line" 
                        className="w-5 h-5 mr-2 text-gray-500"
                        onClick={() => toggleExpand('物料')}
                      />
                      <span className="flex-grow cursor-pointer" onClick={() => toggleExpand('物料')}>物料</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div 
          className="font-bold text-lg mt-10 mb-6 cursor-pointer flex justify-between items-center" 
          onClick={() => toggleExpand('知识库')}
        >
          <div>知识库</div>
          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
        </div>
        
        {expandedItems['知识库'] && (
          <div className="space-y-4">
            <div className="flex items-center">
              <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer">基础知识</span>
              <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
              <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex items-center">
              <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer">人物背景</span>
              <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
              <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        )}

        <div 
          className="font-bold text-lg mt-10 mb-6 cursor-pointer flex justify-between items-center" 
          onClick={() => toggleExpand('工作流')}
        >
          <div>工作流</div>
          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
        </div>
        
        {expandedItems['工作流'] && (
          <div className="space-y-4">
            <div className="flex items-center">
              <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer">默认流程</span>
              <Icon icon="ri:edit-line" className="w-5 h-5 mx-3 text-gray-500" />
            </div>
            <div className="flex items-center">
              <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer">自定义流程</span>
              <Icon icon="ri:edit-line" className="w-5 h-5 mx-3 text-gray-500" />
            </div>
          </div>
        )}
        
        <div className="text-gray-400 mt-16 text-sm">Writer.AI @千帆叙梦</div>
      </div>
    </div>
  )
}

export default Sidebar 