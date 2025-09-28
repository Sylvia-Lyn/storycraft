import cloudbase from '@cloudbase/js-sdk';

const ENV_ID = 'stroycraft-1ghmi4ojd3b4a20b';

// 使用单例模式确保只有一个CloudBase实例
let app: any = null;
let auth: any = null;

function getCloudbaseApp() {
    if (!app) {
        app = cloudbase.init({
            env: ENV_ID,
            // clientId: '', // 如有需要可填写
            // 尝试设置全局超时时间
            timeout: 600000 // 10分钟
        } as any);
    }
    return app;
}

function getCloudbaseAuth() {
    if (!auth) {
        const cloudbaseApp = getCloudbaseApp();
        auth = cloudbaseApp.auth();
    }
    return auth;
}

// 导出函数而不是直接导出实例
export { getCloudbaseApp, getCloudbaseAuth };

const CREDENTIALS_KEY = `credentials_${ENV_ID}`; 

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    console.log('🔐 [CloudBase] getAccessToken - 开始获取token:');
    
    // 首先尝试从 AuthContext 的 token 获取
    const authToken = localStorage.getItem('token');
    console.log('  - localStorage中的token:', authToken ? authToken.substring(0, 50) + '...' : 'null');
    
    if (authToken) {
        console.log('  - 返回: localStorage中的token');
        return authToken;
    }
    
    // 如果没有，尝试从 credentials 获取
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    console.log('  - credentials原始数据:', raw ? '存在' : '不存在');
    
    if (!raw) {
        console.log('  - 返回: null (无token)');
        return null;
    }
    
    try {
      const { access_token } = JSON.parse(raw);
      console.log('  - credentials中的access_token:', access_token ? access_token.substring(0, 50) + '...' : 'null');
      console.log('  - 返回: credentials中的access_token');
      return access_token || null;
    } catch {
      console.log('  - 返回: null (解析失败)');
      return null;
    }
}

export function getAuthHeader(): string | null {
    const token = getAccessToken();
    if (!token) return null;
    
    console.log('🔐 [CloudBase] getAuthHeader - Token调试信息:');
    console.log('  - 原始token:', token);
    console.log('  - token类型:', typeof token);
    console.log('  - token长度:', token.length);
    console.log('  - 是否包含Bearer:', token.startsWith('Bearer '));
    console.log('  - 前50个字符:', token.substring(0, 50));
    
    // 解析JWT token检查过期时间
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        const expired = now > exp;
        console.log('  - Token过期时间:', new Date(exp * 1000));
        console.log('  - 当前时间:', new Date());
        console.log('  - Token是否过期:', expired);
        console.log('  - 剩余时间(秒):', exp - now);
    } catch (e) {
        console.log('  - 无法解析JWT token:', e.message);
    }
    
    // 如果 token 已经包含 Bearer 前缀，直接返回
    if (token.startsWith('Bearer ')) {
        console.log('  - 返回: 直接使用带Bearer前缀的token');
        return token;
    }
    
    // 否则添加 Bearer 前缀
    const bearerToken = `Bearer ${token}`;
    console.log('  - 返回: 添加Bearer前缀后的token:', bearerToken.substring(0, 50) + '...');
    return bearerToken;
}

// 确保已登录到 CloudBase（如未登录则匿名登录）
export async function ensureCloudbaseLogin(): Promise<void> {
    const authInstance = getCloudbaseAuth();
    const anyAuth: any = authInstance as any;
    
    // 使用本地持久化，减少凭证丢失导致的过期问题
    try {
        anyAuth?.persistence && anyAuth.persistence('local');
    } catch (_) {}
    
    try {
        const loginState = anyAuth?.getLoginState ? await anyAuth.getLoginState() : null;
        console.log('🔍 [CloudBase] 当前登录状态:', loginState ? '已登录' : '未登录');
        
        if (!loginState) {
            console.log('🔄 [CloudBase] 未登录，尝试匿名登录');
            if (anyAuth?.signInAnonymously) {
                await anyAuth.signInAnonymously();
                console.log('✅ [CloudBase] 匿名登录成功');
            }
        }
    } catch (e) {
        console.warn('⚠️ [CloudBase] 获取登录状态失败:', e);
        // 某些环境下 getLoginState 可能抛错，直接尝试匿名登录（若可用）
        try { 
            if (anyAuth?.signInAnonymously) { 
                await anyAuth.signInAnonymously();
                console.log('✅ [CloudBase] 匿名登录成功（备用方法）');
            } 
        } catch (anonymousError) {
            console.warn('⚠️ [CloudBase] 匿名登录也失败了:', anonymousError);
        }
    }
}