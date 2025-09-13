import cloudbase from '@cloudbase/js-sdk';
const ENV_ID = 'stroycraft-1ghmi4ojd3b4a20b';
const app = cloudbase.init({
    env: ENV_ID,
    // clientId: '', // 如有需要可填写
});

const auth = app.auth();

const CREDENTIALS_KEY = `credentials_${ENV_ID}`;

export { app, auth }; 

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // 首先尝试从 AuthContext 的 token 获取
    const authToken = localStorage.getItem('token');
    if (authToken) {
        return authToken;
    }
    
    // 如果没有，尝试从 credentials 获取
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    try {
      const { access_token } = JSON.parse(raw);
      return access_token || null;
    } catch {
      return null;
    }
}

export function getAuthHeader(): string | null {
    const token = getAccessToken();
    if (!token) return null;
    
    // 如果 token 已经包含 Bearer 前缀，直接返回
    if (token.startsWith('Bearer ')) {
        return token;
    }
    
    // 否则添加 Bearer 前缀
    return `Bearer ${token}`;
}