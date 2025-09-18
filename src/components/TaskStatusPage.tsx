import React, { useState, useEffect } from 'react';
import { queryTaskStatus, type TaskInfo } from '../services/scriptGeneratorService';

function TaskStatusPage() {
  const [taskId, setTaskId] = useState<string>('');
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleQueryTask = async () => {
    if (!taskId.trim()) {
      setError('请输入任务ID');
      return;
    }

    setLoading(true);
    setError('');
    setTaskInfo(null);

    try {
      const result = await queryTaskStatus(taskId.trim());
      setTaskInfo(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">任务状态查询</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="请输入任务ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleQueryTask()}
              />
              <button
                onClick={handleQueryTask}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {taskInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">任务信息</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">任务ID：</span>
                    <span className="text-sm text-gray-800">{taskInfo.task_id}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">状态：</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(taskInfo.status)}`}>
                      {getStatusText(taskInfo.status)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">进度：</span>
                    <span className="text-sm text-gray-800">{taskInfo.progress}%</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">创建时间：</span>
                    <span className="text-sm text-gray-800">
                      {taskInfo.created_at ? new Date(taskInfo.created_at).toLocaleString() : '未知'}
                    </span>
                  </div>
                </div>

                {taskInfo.message && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-600">状态消息：</span>
                    <div className="text-sm text-gray-800 mt-1">{taskInfo.message}</div>
                  </div>
                )}

                {/* 进度条 */}
                {taskInfo.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>处理进度</span>
                      <span>{taskInfo.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${taskInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 结果预览 */}
                {taskInfo.status === 'completed' && (taskInfo.result?.data || taskInfo.result) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="text-sm font-medium text-green-800 mb-2">生成结果预览</h4>
                    <div className="text-xs text-green-700 space-y-1">
                      <div>大纲：{(taskInfo.result.data || taskInfo.result)?.outline ? '✓ 已生成' : '✗ 未生成'}</div>
                      <div>角色：{(taskInfo.result.data || taskInfo.result)?.characters?.length || 0} 个</div>
                      <div>分幕：{(taskInfo.result.data || taskInfo.result)?.scenes?.length || 0} 个</div>
                    </div>
                  </div>
                )}

                {/* 失败信息 */}
                {taskInfo.status === 'failed' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-2">失败原因</h4>
                    <div className="text-sm text-red-700">{taskInfo.message}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskStatusPage;
