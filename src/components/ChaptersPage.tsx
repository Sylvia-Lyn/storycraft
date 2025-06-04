import React from 'react';
import ChapterTable from './ChapterTable';

const ChaptersPage: React.FC = () => {
  return (
    <div className="h-full">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">章节管理</h1>
        <ChapterTable />
      </div>
    </div>
  );
};

export default ChaptersPage; 