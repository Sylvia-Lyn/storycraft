import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface Scene {
  id: string;
  timeline: string;
  template: string;
  plot: string;
  characters: string[];
  coreRelationship: string;
  emotionDevelopment: string;
  characterRelationships: string;
  characterEffect: string;
}

interface SceneTableSectionProps {
  scenes: Scene[];
}

function SceneTableSection({ scenes }: SceneTableSectionProps) {
  // 列定义
  const columnHelper = createColumnHelper<Scene>();

  // 定义表格列
  const columns = useMemo(
    () => [
      columnHelper.accessor('timeline', {
        header: '时间线',
        cell: info => info.getValue(),
        size: 100,
      }),
      columnHelper.accessor('template', {
        header: '原型',
        cell: info => info.getValue(),
        size: 150,
      }),
      columnHelper.accessor('plot', {
        header: '剧情',
        cell: info => <div className="max-w-[200px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 200,
      }),
      columnHelper.accessor('characters', {
        header: '角色',
        cell: info => (
          <div className="max-w-[150px] overflow-hidden">
            <ul className="list-disc pl-5">
              {info.getValue().map((char, idx) => (
                <li key={idx} className="truncate">• {char}</li>
              ))}
            </ul>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor('coreRelationship', {
        header: '核心情绪',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('emotionDevelopment', {
        header: '情感发展',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('characterRelationships', {
        header: '人物关系',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
      columnHelper.accessor('characterEffect', {
        header: '人物效果',
        cell: info => <div className="max-w-[150px] whitespace-pre-line truncate">{info.getValue()}</div>,
        size: 150,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: scenes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 150,
    },
  });

  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #000;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #333;
    }
  `;

  return (
    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyle }} />
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 sticky top-0 bg-gray-50"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-600 border-b border-r border-gray-200"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SceneTableSection; 