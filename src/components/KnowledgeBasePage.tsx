import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import AnnouncementBar from './AnnouncementBar';
import { useI18n } from '../contexts/I18nContext';

interface KnowledgeFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  updateTime: string;
}

const KnowledgeBasePage: React.FC = () => {
  const { knowledgeId } = useParams<{ knowledgeId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [knowledgeBase, setKnowledgeBase] = useState<{ id: string; name: string } | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // 加载知识库数据
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟知识库数据
        if (knowledgeId === 'knowledge-1') {
          setKnowledgeBase({ id: 'knowledge-1', name: t('knowledgeBase.testKnowledgeBase') });
        } else if (knowledgeId === 'knowledge-2') {
          setKnowledgeBase({ id: 'knowledge-2', name: t('knowledgeBase.conversationRecords') });
        } else if (knowledgeId === 'knowledge-3') {
          setKnowledgeBase({ id: 'knowledge-3', name: t('knowledgeBase.characterScript') });
        } else {
          // 从 localStorage 获取知识库数据
          try {
            interface KnowledgeBaseItem {
              id: string;
              name: string;
            }
            const knowledgeItems: KnowledgeBaseItem[] = JSON.parse(localStorage.getItem('knowledgeItems') || '[]');
            const currentKnowledge = knowledgeItems.find((item: KnowledgeBaseItem) => item.id === knowledgeId);
            if (currentKnowledge) {
              setKnowledgeBase({ id: currentKnowledge.id, name: currentKnowledge.name });
            }
          } catch (e) {
            console.error('获取知识库信息失败:', e);
          }
        }

        // 尝试从 localStorage 加载用户上传的文件
        const uploadedFilesKey = `uploadedFiles_${knowledgeId}`;
        const uploadedFilesJson = localStorage.getItem(uploadedFilesKey);

        if (uploadedFilesJson) {
          try {
            const uploadedFiles = JSON.parse(uploadedFilesJson);
            if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
              setFiles(uploadedFiles);
              return; // 如果有用户上传的文件，就不显示示例文件
            }
          } catch (e) {
            console.error('解析上传文件数据失败:', e);
          }
        }

        // 如果没有用户上传的文件，显示示例文件
        const demoFiles = [
          {
            id: '1',
            name: t('knowledgeBase.exampleDoc1'),
            type: t('knowledgeBase.pdf'),
            size: 1024,
            uploadTime: '2025-06-01 10:30',
            updateTime: '2025-06-01 10:30'
          },
          {
            id: '2',
            name: t('knowledgeBase.exampleDoc2'),
            type: t('knowledgeBase.word'),
            size: 512,
            uploadTime: '2025-06-01 11:15',
            updateTime: '2025-06-01 11:15'
          },
          {
            id: '3',
            name: t('knowledgeBase.referenceMaterial'),
            type: t('knowledgeBase.text'),
            size: 128,
            uploadTime: '2025-06-01 12:00',
            updateTime: '2025-06-01 12:00'
          }
        ];
        setFiles(demoFiles);
      } catch (error) {
        console.error('加载知识库数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [knowledgeId]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 实际应用中这里应该调用搜索API
    console.log('搜索:', searchQuery);
  };

  // 处理文件上传
  const handleFileUpload = () => {
    // 导航到文件上传页面
    navigate(`/app/knowledge/${knowledgeId}/upload`);
  };

  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };

  // 计算分页数据
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const paginatedFiles = files.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 公告栏 */}
      <AnnouncementBar featureName={t('knowledgeBase.title')} />
      {/* 顶部导航 */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          className="text-gray-600 hover:text-gray-900 mr-4"
          onClick={handleGoBack}
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">{t('sidebar.knowledgeBase')}</span>
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
          <span className="font-medium ml-2">{knowledgeBase?.name || t('knowledgeBase.loading')}</span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-grow p-4 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {/* 工具栏 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <div className="text-base font-medium text-gray-700">
                {knowledgeBase?.name || t('knowledgeBase.loading')}
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('knowledgeBase.search')}
                    className="w-60 border border-gray-200 rounded-md pl-3 pr-9 py-1.5 focus:outline-none focus:border-gray-300 text-sm bg-white shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icon icon="ri:search-line" className="w-4 h-4" />
                  </div>
                </div>

                <button
                  className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm shadow-sm"
                  onClick={handleFileUpload}
                >
                  <Icon icon="ri:add-line" className="w-4 h-4 mr-1" />
                  <span>{t('knowledgeBase.upload')}</span>
                </button>
              </div>
            </div>

            {/* 文件表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        {t('knowledgeBase.fileName')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.fileType')}
                        <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.dataLabel')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.dataSize')}
                        <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.accessCount')}
                        <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.uploadTime')}
                        <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        {t('knowledgeBase.updateTime')}
                        <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('knowledgeBase.operation')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedFiles.length > 0 ? (
                    paginatedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm text-gray-900">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size} KB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.uploadTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.updateTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Icon icon="mdi:eye" className="w-5 h-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Icon icon="mdi:download" className="w-5 h-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Icon icon="mdi:delete" className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                        {t('knowledgeBase.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页控制 */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {t('knowledgeBase.totalData', { count: files.length })}
              </div>

              <div className="flex items-center">
                <button
                  className="px-3 py-1 rounded-md mr-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  {t('knowledgeBase.previousPage')}
                </button>

                <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
                  <button
                    className={`w-8 h-8 flex items-center justify-center ${currentPage === 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    1
                  </button>
                </div>

                <button
                  className="px-3 py-1 rounded-md ml-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  {t('knowledgeBase.nextPage')}
                </button>

                <div className="ml-4 flex items-center">
                  <span className="text-sm text-gray-700 mr-2">{t('knowledgeBase.itemsPerPage')}</span>
                  <select
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
