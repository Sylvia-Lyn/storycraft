import React, { useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import Navigation from './Navigation';
import AnnouncementBar from './AnnouncementBar';
import 'reactflow/dist/style.css';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  MarkerType,
  NodeTypes
} from 'reactflow';

// 自定义节点类型的数据接口
interface CharacterNodeData {
  label: string;
  nodeType: string;
  subLabel?: string;
}

// 自定义节点类型
const characterNode = ({ data }: { data: CharacterNodeData }) => {
  return (
    <div className={`p-2 border-2 rounded-md shadow-md w-20 text-center ${data.nodeType === 'npc' ? 'bg-gray-100' : 'bg-blue-50'}`}>
      <div className="font-bold">{data.label}</div>
      {data.subLabel && <div className="text-xs text-gray-500">{data.subLabel}</div>}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  characterNode: characterNode
};

interface Relationship {
  id: string;
  character1: string;
  character2: string;
  type: string;
  description: string;
}

const RelationsPage: React.FC = () => {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];

  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };

  // 定义初始节点
  const initialNodes: Node<CharacterNodeData>[] = [
    {
      id: '1',
      data: { label: '男1', nodeType: 'character' },
      position: { x: 250, y: 150 },
      type: 'characterNode'
    },
    {
      id: '2',
      data: { label: '男2', nodeType: 'character' },
      position: { x: 450, y: 150 },
      type: 'characterNode'
    },
    {
      id: '3',
      data: { label: '女1', nodeType: 'character' },
      position: { x: 250, y: 300 },
      type: 'characterNode'
    },
    {
      id: '4',
      data: { label: '女2', nodeType: 'character' },
      position: { x: 450, y: 300 },
      type: 'characterNode'
    },
    {
      id: '5',
      data: { label: '女3', nodeType: 'character' },
      position: { x: 650, y: 300 },
      type: 'characterNode'
    },
    {
      id: '6',
      data: { label: '女4', nodeType: 'character' },
      position: { x: 850, y: 300 },
      type: 'characterNode'
    },
    {
      id: '7',
      data: { label: '男恋路', subLabel: 'NPC1', nodeType: 'npc' },
      position: { x: 650, y: 150 },
      type: 'characterNode'
    },
    {
      id: '8',
      data: { label: '男恋路', subLabel: 'NPC2', nodeType: 'npc' },
      position: { x: 850, y: 150 },
      type: 'characterNode'
    }
  ];

  // 定义初始边
  const initialEdges: Edge[] = [
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      label: '爱人',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#FF6B6B' }
    },
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      label: '生死仇敌',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      }
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      label: '义结金兰',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      }
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      label: '假兄妹\n利用爱情',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      }
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      label: '换魂',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedRelation] = useState({ label: '爱情线80%', char: '角色1' });

  // 引用用于图谱操作
  const reactFlowInstance = useRef(null);

  // 处理连接
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'default', markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    },
    [setEdges]
  );

  // 添加角色节点
  const addCharacterNode = useCallback(() => {
    const newNode: Node<CharacterNodeData> = {
      id: `${nodes.length + 1}`,
      data: { label: `新角色${nodes.length + 1}`, nodeType: 'character' },
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      type: 'characterNode'
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  // 选择工具
  const [activeTool, setActiveTool] = useState('select');

  return (
    <div className="w-full flex">
      {/* 侧边栏 */}
      <div className="flex-1 flex flex-col pl-5">
        {/* 公告栏 - 暂时隐藏 */}
        {false && (
          <AnnouncementBar
            onTabClick={handleTabChange}
            featureName="关系图谱"
          />
        )}

        {/* 导航栏 - 向左偏移 */}
        <div className="flex w-full pl-10 mt-12">
          <Navigation
            tabs={tabs}
            defaultTab="关系"
            onTabChange={handleTabChange}
          />
        </div>

        {/* 关系页面主体内容 */}
        <div className="flex flex-col h-full">
          <div className="flex flex-1">
            {/* 左侧工具栏 */}
            <div className="w-12 border-r flex flex-col items-center py-4 space-y-4">
              <button
                className={`p-2 rounded ${activeTool === 'select' ? 'bg-gray-200' : ''}`}
                onClick={() => setActiveTool('select')}
                title="选择"
              >
                <Icon icon="mdi:cursor-default" className="w-6 h-6" />
              </button>
              <button
                className={`p-2 rounded ${activeTool === 'add-node' ? 'bg-gray-200' : ''}`}
                onClick={() => setActiveTool('add-node')}
                title="添加节点"
              >
                <Icon icon="mdi:shape-square-plus" className="w-6 h-6" />
              </button>
              <button
                className={`p-2 rounded ${activeTool === 'add-edge' ? 'bg-gray-200' : ''}`}
                onClick={() => setActiveTool('add-edge')}
                title="添加连线"
              >
                <Icon icon="mdi:vector-line" className="w-6 h-6" />
              </button>
              <button
                className={`p-2 rounded ${activeTool === 'delete' ? 'bg-gray-200' : ''}`}
                onClick={() => setActiveTool('delete')}
                title="删除"
              >
                <Icon icon="mdi:delete-outline" className="w-6 h-6" />
              </button>
            </div>

            {/* 关系图谱区 */}
            <div className="flex-1 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                ref={reactFlowInstance}
              >
                <Controls />
                <Background color="#aaa" gap={16} />
                <MiniMap />
                <Panel position="top-right">
                  <button
                    className="flex items-center space-x-1 bg-white border rounded-md px-3 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50"
                    onClick={addCharacterNode}
                  >
                    <span>添加角色</span>
                    <Icon icon="mdi:plus-circle-outline" className="w-5 h-5" />
                  </button>
                </Panel>
              </ReactFlow>
            </div>
          </div>

          {/* 底部区域 */}
          <div className="h-64 border-t flex">
            {/* 情感线编辑区 (左下) */}
            <div className="w-1/2 border-r p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold">情感线</div>
                <div className="inline-flex items-center space-x-2">
                  <span className="text-blue-500 font-medium">{selectedRelation.label} ({selectedRelation.char})</span>
                  <button className="p-1 bg-gray-100 rounded-full">
                    <Icon icon="mdi:plus" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span>和</span>
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                    <option>角色1</option>
                    <option>角色2</option>
                    <option>角色3</option>
                  </select>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
                <span>的</span>
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                    <option>事业线</option>
                    <option>爱情线</option>
                    <option>友情线</option>
                  </select>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
                <span>占比</span>
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                    <option>80%</option>
                    <option>70%</option>
                    <option>60%</option>
                    <option>50%</option>
                  </select>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
                <Icon icon="mdi:check" className="w-5 h-5 text-green-500" />
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium mb-1">情感点</div>
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none w-full bg-purple-50">
                    <option>「只差一步就能永远在一起」</option>
                  </select>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
                  placeholder="角色关系不好？告诉我如何优化，如"
                />
                <Icon
                  icon="ri:corner-down-right-fill"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 关联剧情区 (右下) */}
            <div className="w-1/2 p-4">
              <div className="text-lg font-bold mb-4">关联剧情</div>
              <div className="space-y-4 overflow-y-auto h-[calc(100%-2rem)]">
                <div>
                  <div className="font-medium">第一本-第一幕:</div>
                  <p className="text-gray-700 ml-4">
                    1.赫连英是赫连部神女，获得萨满大巫预言"草原兴亡，在汝一人"
                  </p>
                </div>
                <div>
                  <div className="font-medium">第一本-第一幕:</div>
                  <p className="text-gray-700 ml-4">
                    2. 赫连英从小被宠爱但心怀大志，学习军事与治理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelationsPage; 