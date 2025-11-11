/**
 * API拦截器服务
 * 用于统一处理HTTP请求和响应，特别是token过期的情况
 */

import { message } from 'antd';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
}

export interface ApiError {
    message: string;
    code?: number;
    status?: number;
}

class ApiInterceptor {
    private static instance: ApiInterceptor;
    private onTokenExpired: (() => void) | null = null;
    private onTokenRefresh: (() => Promise<boolean>) | null = null;
    private onUnauthorized: (() => void) | null = null;

    public static getInstance(): ApiInterceptor {
        if (!ApiInterceptor.instance) {
            ApiInterceptor.instance = new ApiInterceptor();
        }
        return ApiInterceptor.instance;
    }

    /**
     * 设置token过期回调函数
     */
    public setTokenExpiredCallback(callback: () => void): void {
        this.onTokenExpired = callback;
    }

    /**
     * 设置token刷新回调函数
     */
    public setTokenRefreshCallback(callback: () => Promise<boolean>): void {
        this.onTokenRefresh = callback;
    }

    /**
     * 设置未授权回调函数（用户未登陆时调用）
     */
    public setUnauthorizedCallback(callback: () => void): void {
        this.onUnauthorized = callback;
    }

    /**
     * 触发未授权错误（当用户未登录时调用）
     */
    public triggerUnauthorized(): void {
        console.log('🔴 [ApiInterceptor] 触发未授权错误');
        if (this.onUnauthorized) {
            this.onUnauthorized();
        } else {
            // 如果没有设置回调，直接重定向
            console.warn('⚠️ [ApiInterceptor] 未授权回调未设置，直接重定向到登录页面');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/#/app/login';
        }
    }

    /**
     * 检查响应是否为未授权错误（用户未登陆）
     */
    private isUnauthorizedError(errorData?: any): boolean {
        if (!errorData) return false;

        // 检查响应中的code字段是否为401
        if (errorData.code === 401) {
            return true;
        }

        // 检查错误消息
        const message = errorData.message || '';
        if (message.includes('用户未登录') || message.includes('未登陆')) {
            return true;
        }

        return false;
    }

    /**
     * 检查响应是否为token过期错误
     */
    private isTokenExpiredError(response: Response, errorData?: any): boolean {
        // 检查HTTP状态码
        if (response.status === 401) {
            return true;
        }

        // 检查响应体中的错误信息
        if (errorData) {
            const errorMessage = errorData.error || errorData.message || '';
            const errorCode = errorData.code;
            
            // 明确的token过期错误信息（更精确的匹配）
            const tokenExpiredMessages = [
                '登录已过期，请重新登录',
                'token过期',
                'token expired',
                'access token expired',
                'authentication failed',
                'unauthorized',
                'token无效',
                'invalid token',
                'token is invalid',
                'token has expired'
            ];

            // 检查错误消息（精确匹配，避免误判）
            if (tokenExpiredMessages.some(msg => 
                errorMessage.toLowerCase().includes(msg.toLowerCase())
            )) {
                return true;
            }

            // 检查错误代码
            if (errorCode === 401) {
                return true;
            }
        }

        return false;
    }

    /**
     * 处理API响应
     */
    public async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        let responseData: any = null;

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
        } catch (error) {
            console.error('解析响应数据失败:', error);
        }

        // 首先检查是否为未授权错误（用户未登陆）
        if (this.isUnauthorizedError(responseData)) {
            console.log('检测到用户未登陆，触发重定向到登陆页面');
            message.error('用户未登录，请重新登陆');

            if (this.onUnauthorized) {
                this.onUnauthorized();
            }

            return {
                success: false,
                error: '用户未登录',
                code: 401
            };
        }

        // 检查是否为token过期错误
        if (!response.ok && this.isTokenExpiredError(response, responseData)) {
            console.log('检测到token过期，尝试刷新token');
            
            // 先尝试刷新token
            if (this.onTokenRefresh) {
                try {
                    const refreshSuccess = await this.onTokenRefresh();
                    if (refreshSuccess) {
                        console.log('Token刷新成功，重试请求');
                        // 这里可以重试原始请求，但需要调用方处理
                        return {
                            success: false,
                            error: 'Token已刷新，请重试',
                            code: 401
                        };
                    }
                } catch (error) {
                    console.log('Token刷新失败:', error);
                }
            }
            
            // 如果刷新失败或没有刷新机制，触发登出
            console.log('Token刷新失败，触发自动登出');
            message.warning('登录已过期，请重新登录');
            
            if (this.onTokenExpired) {
                this.onTokenExpired();
            }

            return {
                success: false,
                error: '登录已过期，请重新登录',
                code: 401
            };
        }

        // 处理其他错误
        if (!response.ok) {
            const errorMessage = responseData?.error || responseData?.message || `请求失败: ${response.status}`;
            return {
                success: false,
                error: errorMessage,
                code: response.status
            };
        }

        // 成功响应
        return {
            success: true,
            data: responseData,
            code: response.status
        };
    }

    /**
     * 包装fetch请求，自动处理token过期
     */
    public async fetchWithInterceptor<T>(
        url: string, 
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(url, options);
            return await this.handleResponse<T>(response);
        } catch (error) {
            console.error('网络请求失败:', error);
            return {
                success: false,
                error: '网络请求失败，请检查网络连接',
                code: 0
            };
        }
    }

    /**
     * 包装云函数调用，自动处理token过期
     */
    public async callFunctionWithInterceptor<T>(
        callFunction: () => Promise<any>
    ): Promise<ApiResponse<T>> {
        try {
            const result = await callFunction();

            // 检查云函数返回的错误
            if (result && result.result) {
                const { success, error, code, message: resultMessage } = result.result;

                // 首先检查是否为未授权错误
                if (this.isUnauthorizedError({ code, message: resultMessage, error })) {
                    console.log('云函数检测到用户未登陆，触发重定向到登陆页面');
                    message.error('用户未登录，请重新登陆');

                    if (this.onUnauthorized) {
                        this.onUnauthorized();
                    }

                    return {
                        success: false,
                        error: '用户未登录',
                        code: 401
                    };
                }

                // 检查是否为token过期错误
                if (!success && this.isTokenExpiredError(
                    { status: code || 401 } as Response,
                    { error, code }
                )) {
                    console.log('云函数检测到token过期，尝试刷新token');
                    
                    // 先尝试刷新token
                    if (this.onTokenRefresh) {
                        try {
                            const refreshSuccess = await this.onTokenRefresh();
                            if (refreshSuccess) {
                                console.log('Token刷新成功，重试请求');
                                return {
                                    success: false,
                                    error: 'Token已刷新，请重试',
                                    code: 401
                                };
                            }
                        } catch (error) {
                            console.log('Token刷新失败:', error);
                        }
                    }
                    
                    // 如果刷新失败或没有刷新机制，触发登出
                    console.log('Token刷新失败，触发自动登出');
                    message.warning('登录已过期，请重新登录');
                    
                    if (this.onTokenExpired) {
                        this.onTokenExpired();
                    }

                    return {
                        success: false,
                        error: '登录已过期，请重新登录',
                        code: 401
                    };
                }
            }

            // 如果云函数返回了result.result结构，则返回result.result的内容
            if (result && result.result) {
                return result.result;
            }
            
            // 否则返回整个result
            return {
                success: true,
                data: result
            };
        } catch (error: any) {
            console.error('云函数调用失败:', error);

            // 检查错误信息中是否包含token过期相关的内容
            const errorMessage = error.message || error.toString();
            // 注意：网络错误不应被强制当作401
            const isExpired = this.isTokenExpiredError(
                { status: 0 } as Response,
                { error: errorMessage }
            );
            if (isExpired) {
                console.log('云函数调用检测到token过期，尝试刷新token');
                
                // 先尝试刷新token
                if (this.onTokenRefresh) {
                    try {
                        const refreshSuccess = await this.onTokenRefresh();
                        if (refreshSuccess) {
                            console.log('Token刷新成功，重试请求');
                            return {
                                success: false,
                                error: 'Token已刷新，请重试',
                                code: 401
                            };
                        }
                    } catch (error) {
                        console.log('Token刷新失败:', error);
                    }
                }
                
                // 如果刷新失败或没有刷新机制，触发登出
                console.log('Token刷新失败，触发自动登出');
                message.warning('登录已过期，请重新登录');
                
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }

                return {
                    success: false,
                    error: '登录已过期，请重新登录',
                    code: 401
                };
            }

            return {
                success: false,
                error: errorMessage,
                code: 0
            };
        }
    }
}

// 导出单例实例
export const apiInterceptor = ApiInterceptor.getInstance();
