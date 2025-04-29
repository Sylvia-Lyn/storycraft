import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface ExpandedItems {
  [key: string]: boolean
}

function ScriptEditor() {
  const [selectedTab, setSelectedTab] = useState('剧本')
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
    '物料': false
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
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-white border-r border-gray-200 overflow-auto">
        <div className="p-4">
          <div className="flex items-center space-x-1 py-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          </div>

          <div className="font-bold text-lg mb-6">作品集</div>
          
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
              <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 mr-2 text-gray-500" />
              <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('《xxxx》2')}>《xxxx》</span>
              <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
              <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
            </div>

            {expandedItems['《xxxx》2'] && (
              <div className="ml-7 space-y-4">
                <div className="flex items-center">
                  <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('角色剧本')}>角色剧本</span>
                  <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                  <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                </div>

                {expandedItems['角色剧本'] && (
                  <div className="ml-7 space-y-4">
                    <div className="flex items-center">
                      <Icon icon="ri:arrow-down-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('女1')}>女1: xxx</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    {expandedItems['女1'] && (
                      <div className="ml-7 space-y-4">
                        <div className="flex items-center">
                          <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('第一本')}>第一本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex items-center">
                          <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('第二本')}>第二本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex items-center">
                          <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('第三本')}>第三本</span>
                          <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                          <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('女2')}>女2: xxx</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="flex items-center">
                      <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('主持人手册')}>主持人手册</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="flex items-center">
                      <Icon icon="ri:arrow-right-s-line" className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="flex-grow cursor-pointer" onClick={() => handleItemClick('物料')}>物料</span>
                      <Icon icon="ri:download-line" className="w-5 h-5 mx-3 text-gray-500" />
                      <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between items-center">
            <div className="font-bold text-lg">知识库</div>
            <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
          </div>

          <div className="mt-10 flex justify-between items-center">
            <div className="font-bold text-lg">工作流</div>
            <Icon icon="ri:add-line" className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="text-gray-400 mt-16 text-sm">Writer.AI @千帆叙梦</div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="w-[520px] border-r border-gray-200 bg-white p-4">
        <div className="flex justify-center mb-4 gap-1">
          {['大纲', '角色', '关系', '章节', '分集', '剧本'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-1 rounded-md border ${
                selectedTab === tab 
                  ? 'bg-black text-white' 
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 flex-1">
            <span className="text-black mr-2">
              <Icon icon="ri:ai-generate" className="w-5 h-5" />
            </span>
            <span>claude35_sonnet2</span>
            <span className="ml-auto">
              <Icon icon="ri:arrow-down-s-line" />
            </span>
          </div>
          
          <div className="flex items-center bg-white border rounded-md px-3 py-2 w-24">
            <span>文风</span>
          </div>
          
          <div className="flex items-center bg-white border rounded-md px-3 py-2 flex-1">
            <span>知识库: xxxxxx</span>
            <span className="ml-auto">
              <Icon icon="ri:arrow-down-s-line" />
            </span>
          </div>
        </div>
        
        <div className="bg-black text-white rounded-full px-4 py-1 my-4 inline-block">
          角色1和角色2在xxx发生了xxx而不是xxx
        </div>
        
        <div className="my-4">
          <p>根据xxxxxxxx，为您提供以下下内容选择：</p>
        </div>
        
        <div className="border border-gray-300 rounded p-3 mb-4 max-h-40 overflow-y-auto">
          <div className="mb-1">1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
        </div>
        
        <div className="border border-gray-300 rounded p-3 mb-4 max-h-40 overflow-y-auto">
          <div className="mb-1">2. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
        </div>
        
        <div className="border border-gray-300 rounded p-3 mb-4 max-h-40 overflow-y-auto">
          <div className="mb-1">3. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
        </div>
        
        <div className="mb-4">
          <button className="border border-gray-300 rounded p-2 w-full text-left">
            点击替换。这个方向对吗？还是从xxxxxxxxxx展开？
          </button>
        </div>
        
        <div className="mb-4">
          <button className="border border-gray-300 rounded p-2 w-full text-left">
            剧情不好？告诉我如何优化，如：xxxxxxxx
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <div className="font-bold text-lg mr-2">第一本-第一幕</div>
            <input 
              type="text" 
              placeholder="进入角色" 
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex justify-between items-center mb-1">
            <span>分集副标12:</span>
            <button className="text-blue-500 text-sm">修改副标</button>
          </div>
          <div className="border border-gray-300 rounded p-2 mb-4">
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </div>

          <div className="mb-4">
            1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xx
          </div>
          <div className="mb-4">
            2. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xx
          </div>
          <div className="mb-4">
            3. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </div>
          <div className="mb-4">
            4. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxx
          </div>
          <div className="mb-4">
            5. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </div>
          <div className="mb-4">
            6. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </div>
        </div>
      </div>

      {/* Empty space for icons on the right */}
      <div className="w-[100px] bg-white flex flex-col items-center pt-8 gap-4">
        <div className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center">
          <Icon icon="ri:layout-right-2-line" className="w-6 h-6 text-gray-400" />
        </div>
        <div className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center">
          <Icon icon="ri:layout-column-line" className="w-6 h-6 text-gray-400" />
        </div>
        <div className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center">
          <Icon icon="ri:layout-grid-line" className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

export default ScriptEditor 