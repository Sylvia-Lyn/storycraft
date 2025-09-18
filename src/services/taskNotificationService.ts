// 任务通知服务 - 可选的WebSocket支持
// 这个服务可以减少轮询频率，提供实时通知

export type NotificationCallback = (taskInfo: any) => void;

class TaskNotificationService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, NotificationCallback> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor() {
    // 可以在这里初始化WebSocket连接
    // this.connect();
  }

  /**
   * 订阅任务状态更新
   * @param taskId 任务ID
   * @param callback 回调函数
   */
  subscribe(taskId: string, callback: NotificationCallback): void {
    this.callbacks.set(taskId, callback);
    
    // 如果WebSocket可用，发送订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        task_id: taskId
      }));
    }
  }

  /**
   * 取消订阅任务状态更新
   * @param taskId 任务ID
   */
  unsubscribe(taskId: string): void {
    this.callbacks.delete(taskId);
    
    // 如果WebSocket可用，发送取消订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        task_id: taskId
      }));
    }
  }

  /**
   * 连接WebSocket（可选功能）
   */
  private connect(): void {
    try {
      // 这里可以连接到你的WebSocket服务器
      // this.ws = new WebSocket('wss://your-websocket-server.com/tasks');
      
      this.ws!.onopen = () => {
        console.log('任务通知WebSocket连接已建立');
        this.reconnectAttempts = 0;
      };

      this.ws!.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'task_update' && data.task_id) {
            const callback = this.callbacks.get(data.task_id);
            if (callback) {
              callback(data.task_info);
            }
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };

      this.ws!.onclose = () => {
        console.log('任务通知WebSocket连接已关闭');
        this.scheduleReconnect();
      };

      this.ws!.onerror = (error) => {
        console.error('任务通知WebSocket错误:', error);
      };
    } catch (error) {
      console.error('连接WebSocket失败:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`尝试重连WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
  }
}

// 单例实例
export const taskNotificationService = new TaskNotificationService();

/**
 * 智能轮询策略 - 结合WebSocket和轮询
 * @param taskId 任务ID
 * @param onProgress 进度回调
 * @param maxWaitTime 最大等待时间
 * @returns Promise<GenerateResult>
 */
export async function smartWaitForTaskCompletion(
  taskId: string,
  onProgress?: (taskInfo: any) => void,
  maxWaitTime: number = 600000
): Promise<any> {
  return new Promise((resolve, reject) => {
    let isCompleted = false;
    let pollTimeout: NodeJS.Timeout;
    
    // 设置超时
    const timeout = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        taskNotificationService.unsubscribe(taskId);
        reject(new Error('任务等待超时'));
      }
    }, maxWaitTime);

    // 尝试使用WebSocket通知
    const useWebSocket = false; // 暂时禁用，因为需要WebSocket服务器支持
    
    if (useWebSocket) {
      // 订阅WebSocket通知
      taskNotificationService.subscribe(taskId, (taskInfo) => {
        if (isCompleted) return;
        
        if (onProgress) {
          onProgress(taskInfo);
        }

        if (taskInfo.status === 'completed') {
          isCompleted = true;
          clearTimeout(timeout);
          taskNotificationService.unsubscribe(taskId);
          resolve(taskInfo.result?.data);
        } else if (taskInfo.status === 'failed') {
          isCompleted = true;
          clearTimeout(timeout);
          taskNotificationService.unsubscribe(taskId);
          reject(new Error(taskInfo.message || '任务处理失败'));
        }
      });
    } else {
      // 回退到智能轮询
      let lastProgress = 0;
      let consecutiveNoProgress = 0;
      
      const poll = async () => {
        if (isCompleted) return;
        
        try {
          const { queryTaskStatus } = await import('./scriptGeneratorService');
          const taskInfo = await queryTaskStatus(taskId);
          
          if (onProgress) {
            onProgress(taskInfo);
          }

          if (taskInfo.status === 'completed') {
            isCompleted = true;
            clearTimeout(timeout);
            resolve(taskInfo.result?.data || taskInfo.result);
          } else if (taskInfo.status === 'failed') {
            isCompleted = true;
            clearTimeout(timeout);
            reject(new Error(taskInfo.message || '任务处理失败'));
          } else {
            // 智能轮询间隔
            const pollInterval = calculateSmartPollInterval(taskInfo, lastProgress, consecutiveNoProgress);
            
            if (taskInfo.progress === lastProgress) {
              consecutiveNoProgress++;
            } else {
              consecutiveNoProgress = 0;
              lastProgress = taskInfo.progress;
            }
            
            pollTimeout = setTimeout(poll, pollInterval);
          }
        } catch (error) {
          if (!isCompleted) {
            isCompleted = true;
            clearTimeout(timeout);
            reject(error);
          }
        }
      };

      // 开始轮询
      poll();
    }
  });
}

/**
 * 计算智能轮询间隔
 */
function calculateSmartPollInterval(
  taskInfo: any,
  lastProgress: number,
  consecutiveNoProgress: number
): number {
  let interval = 2000;
  
  switch (taskInfo.status) {
    case 'pending':
      interval = 5000;
      break;
    case 'processing':
      interval = taskInfo.progress > 0 ? 3000 : 5000;
      break;
  }
  
  if (consecutiveNoProgress > 0) {
    interval = Math.min(interval * (1 + consecutiveNoProgress * 0.5), 15000);
  }
  
  if (taskInfo.progress > 80) {
    interval = Math.min(interval, 2000);
  }
  
  return Math.max(interval, 1000);
}
