import React from 'react';

// 简单表格行数据接口
type SimpleChapterRow = {
  id: string;
  chapterName: string;
  mainEvents: string;
};

// 详细表格行数据接口
type DetailedChapterRow = {
  id: string;
  chapterName: string;
  initialState: string;
  climax: string;
  intensifyingEvent: string;
  keyChoice: string;
  conflict: string;
  characterSpotlight: string;
};

// 简单表格示例数据
const simpleChapters: SimpleChapterRow[] = [
  {
    id: '1',
    chapterName: '第一本-第一幕',
    mainEvents: 'XXXXXXXXXXXXX'
  },
  {
    id: '2',
    chapterName: '第一本-第二幕',
    mainEvents: ''
  },
  {
    id: '3',
    chapterName: '第一本-第三幕',
    mainEvents: ''
  },
  {
    id: '4',
    chapterName: '第一本-第四幕',
    mainEvents: ''
  },
  {
    id: '5',
    chapterName: '第一本-第五幕',
    mainEvents: ''
  },
  {
    id: '6',
    chapterName: '第一本-第六幕',
    mainEvents: ''
  },
  {
    id: '7',
    chapterName: '第一本-第七幕',
    mainEvents: ''
  }
];

// 详细表格示例数据
const detailedChapters: DetailedChapterRow[] = [
  {
    id: '1',
    chapterName: '第一本-第一幕',
    initialState: 'XXXXXXXXXXXX',
    climax: 'XXXXXXXXXX',
    intensifyingEvent: 'XXXXXXXXXXX',
    keyChoice: 'XXXXXXXXXXX',
    conflict: 'XXXXXXXXXXX',
    characterSpotlight: 'XXXXXXXXXXXXXXX'
  },
  {
    id: '2',
    chapterName: '第一本-第二幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  },
  {
    id: '3',
    chapterName: '第一本-第三幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  },
  {
    id: '4',
    chapterName: '第一本-第四幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  },
  {
    id: '5',
    chapterName: '第一本-第五幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  },
  {
    id: '6',
    chapterName: '第一本-第六幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  },
  {
    id: '7',
    chapterName: '第一本-第七幕',
    initialState: '',
    climax: '',
    intensifyingEvent: '',
    keyChoice: '',
    conflict: '',
    characterSpotlight: ''
  }
];

// 自定义滚动条样式
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

function ChapterTable() {
  return (
    <div className="flex gap-8">
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyle }} />
      
      {/* 左侧简单表格 */}
      <div className="w-[450px]">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse border border-gray-300 table-fixed">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-3 text-left font-medium" style={{ width: '40%' }}>章节分幕</th>
                <th className="border border-gray-300 p-3 text-left font-medium" style={{ width: '60%' }}>主要事件</th>
              </tr>
            </thead>
            <tbody>
              {simpleChapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{chapter.chapterName}</td>
                  <td className="border border-gray-300 p-3 break-words">{chapter.mainEvents}</td>
                </tr>
              ))}
              {/* 空行，用于添加新章节 */}
              <tr className="h-20">
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
              </tr>
              <tr className="h-20">
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 右侧详细表格 */}
      <div className="flex-1">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse border border-gray-300 table-fixed">
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-3 text-left font-medium">章节分幕</th>
                <th className="border border-gray-300 p-3 text-left font-medium">初始状态</th>
                <th className="border border-gray-300 p-3 text-left font-medium">心结</th>
                <th className="border border-gray-300 p-3 text-left font-medium">激化事件</th>
                <th className="border border-gray-300 p-3 text-left font-medium">关键抉择</th>
                <th className="border border-gray-300 p-3 text-left font-medium">冲突</th>
                <th className="border border-gray-300 p-3 text-left font-medium">人物弧光</th>
              </tr>
            </thead>
            <tbody>
              {detailedChapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.chapterName}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.initialState}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.climax}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.intensifyingEvent}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.keyChoice}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.conflict}</td>
                  <td className="border border-gray-300 p-3 whitespace-normal break-words">{chapter.characterSpotlight}</td>
                </tr>
              ))}
              {/* 空行，用于添加新章节 */}
              <tr className="h-20">
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
              </tr>
              <tr className="h-20">
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
                <td className="border border-gray-300 p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ChapterTable; 