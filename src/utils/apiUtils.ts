import config from '../config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  request_id?: string;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  request_id?: string;
}

/**
 * 带重试机制的API调用函数
 * @param url API URL
 * @param options fetch选项
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟（毫秒）
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      // 如果是SSL证书错误，不重试
      if (!response.ok && response.status >= 500) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // 如果是SSL证书错误，不重试
      if (error instanceof TypeError && 
          (error.message.includes('ERR_CERT_COMMON_NAME_INVALID') || 
           error.message.includes('ERR_CERT_AUTHORITY_INVALID'))) {
        throw new ApiError('SSL证书验证失败，请联系管理员', {
          code: 'SSL_CERT_ERROR',
          cause: error
        });
      }
      
      // 如果是网络错误且还有重试次数，则等待后重试
      if (attempt < maxRetries && 
          error instanceof TypeError && 
          error.message.includes('Failed to fetch')) {
        console.warn(`API调用失败，${retryDelay}ms后重试 (${attempt}/${maxRetries}):`, error.message);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // 指数退避
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('API调用失败');
}

/**
 * 调用Prompt API的通用函数
 * @param action 操作类型
 * @param payload 请求数据
 * @param token 用户认证token
 * @returns Promise<ApiResponse>
 */
export async function callPromptApi<T = any>(
  action: string,
  payload: Record<string, any> = {},
  token?: string
): Promise<ApiResponse<T>> {
  try {
    console.log('🚀 callPromptApi调用 - action:', action, 'token:', token ? token.substring(0, 20) + '...' : 'null');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 如果提供了token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ 已添加Authorization头');
    } else {
      console.log('⚠️ 未提供token');
    }

    const response = await fetchWithRetry(config.PROMPT_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        ...payload
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Prompt API调用失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 包装其他错误
    throw new ApiError(
      error instanceof Error ? error.message : '未知错误',
      {
        code: 'API_CALL_ERROR',
        cause: error
      }
    );
  }
}

/**
 * 自定义错误类
 */
class ApiError extends Error {
  public code?: string;
  public status?: number;
  public request_id?: string;

  constructor(message: string, options?: {
    code?: string;
    status?: number;
    request_id?: string;
    cause?: Error;
  }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.status = options?.status;
    this.request_id = options?.request_id;
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export { ApiError };
