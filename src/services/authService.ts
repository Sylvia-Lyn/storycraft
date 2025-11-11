/**
 * 认证服务 - 使用统一的 /storyai host
 */

const STORYAI_API_BASE = '/storyai';

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    userId: number | string;
    username: string;
    loginTime?: string;
    message?: string;
    token?: string;
  };
}

export interface RegisterResponse {
  code: number;
  message: string;
  data: null | {
    userId?: number | string;
    username?: string;
    token?: string;
  };
}

export class AuthService {
  /**
   * 用户名密码登录
   */
  static async login(username: string, password: string): Promise<LoginResponse & { token?: string }> {
    const response = await fetch(`${STORYAI_API_BASE}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || '登录失败');
    }

    // 尝试从response headers中获取token
    const authHeader = response.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

    // 返回包含token的响应
    return {
      ...data,
      token
    };
  }

  /**
   * 用户注册
   */
  static async register(
    username: string,
    password: string,
    confirmPassword: string
  ): Promise<RegisterResponse & { token?: string }> {
    if (password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    const response = await fetch(`${STORYAI_API_BASE}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data: RegisterResponse = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || '注册失败');
    }

    // 尝试从response headers中获取token
    const authHeader = response.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

    // 返回包含token的响应
    return {
      ...data,
      token
    };
  }

  /**
   * 获取用户信息（使用token）
   */
  static async getUserInfo(token: string) {
    const response = await fetch(`${STORYAI_API_BASE}/user/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '获取用户信息失败');
    }

    return data;
  }

  /**
   * 验证当前用户登录状态（基于Session/Cookie）
   * 用于页面初始化时恢复登录状态
   * 调用 /user/heartbeat 接口（POST方式，userId为URL参数）
   */
  static async validateSession(userId?: string | number) {
    if (!userId) {
      console.warn('⚠️ [AuthService] validateSession: userId为空');
      return null;
    }

    try {
      const response = await fetch(`${STORYAI_API_BASE}/user/heartbeat?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 重要：发送cookie
      });

      const data = await response.json();
      console.log('📊 [AuthService] validateSession 响应:', { status: response.status, data });

      if (data.code === 401 || !response.ok) {
        // 未登录或session失效
        console.warn('⚠️ [AuthService] validateSession: code=401 或 HTTP error');
        return null;
      }

      // 检查数据结构
      if (data.code === 0) {
        console.log('✅ [AuthService] validateSession: session验证成功');
        return data;
      } else {
        console.warn('⚠️ [AuthService] validateSession: code !== 0:', data.code);
        return null;
      }
    } catch (error) {
      console.error('❌ [AuthService] validateSession 请求失败:', error);
      return null;
    }
  }
}

export default AuthService;
