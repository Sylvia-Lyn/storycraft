# StoryCraft 项目认证和路由系统完整探索报告

## 1. 项目结构概览

本项目采用 React + TypeScript + React Router 架构，使用 CloudBase 作为后端基础设施。

### 核心文件位置
- 路由定义: `/src/router.tsx`
- 认证上下文: `/src/contexts/AuthContext.tsx`
- 认证服务: `/src/services/authService.ts`
- API 拦截器: `/src/services/apiInterceptor.ts`
- CloudBase 配置: `/src/cloudbase.ts`
- Token 过期处理: `/src/components/TokenExpiryHandler.tsx`
- 路由保护: `/src/components/ProtectedRoute.tsx`
- 登录页: `/src/components/LoginPage.tsx`
- 注册页: `/src/components/RegisterPage.tsx`
- 主应用: `/src/App.tsx`
- 一键创作页: `/src/components/ShortplayEntryPage.tsx`

---

## 2. 路由系统详解

### 2.1 路由定义 (`/src/router.tsx`)

使用 `createHashRouter` 而不是 `BrowserRouter`，避免部署时的路径问题。

**路由结构：**

```
/                          → WelcomePage (欢迎页)
/prompt                    → PromptConfigPage (提示词配置)

/app                       → App (主应用布局)
  ├── /app/home           → ProtectedRoute(HomePage) → 重定向到 /app/shortplay-entry
  ├── /app/shortplay-entry → ProtectedRoute(ShortplayEntryPage) ✓ 一键创作页面
  ├── /app/editor         → ProtectedRoute(ScriptEditor)
  ├── /app/outline        → ProtectedRoute(OutlinePage)
  ├── /app/characters     → ProtectedRoute(CharactersPage)
  ├── /app/relations      → ProtectedRoute(RelationsPage)
  ├── /app/chapters       → ProtectedRoute(ChaptersPage)
  ├── /app/scenes         → ProtectedRoute(SceneList)
  ├── /app/scenes/:sceneId → ProtectedRoute(SceneEditor)
  ├── /app/story-settings → ProtectedRoute(StorySettingsPage)
  ├── /app/knowledge/:knowledgeId → ProtectedRoute(KnowledgeBasePage)
  ├── /app/knowledge/:knowledgeId/upload → ProtectedRoute(KnowledgeUploadPage)
  ├── /app/vip            → VipPage (无保护)
  ├── /app/payment        → PaymentPage (无保护)
  ├── /app/payment/success → ProtectedRoute(PaymentSuccessPage)
  ├── /app/profile        → ProtectedRoute(ProfilePage)
  ├── /app/login          → LoginPage (无保护)
  └── /app/register       → RegisterPage (无保护)
```

**重要发现：**
- 一键创作页面路由: `/app/shortplay-entry`
- 首页 (`/app/home`) 是一个重定向页面，自动导航到 `/app/shortplay-entry`
- 大多数功能页面都被 `<ProtectedRoute>` 包装，除了登录、注册、VIP 和支付页面

### 2.2 一键创作页面的路由定义

在 `/src/router.tsx` 第 54-55 行：

```typescript
{
  path: 'shortplay-entry',
  element: <ProtectedRoute><ShortplayEntryPage /></ProtectedRoute>
}
```

**路由访问流程：**
1. 用户访问 `/app/home` → HomePage 组件
2. HomePage 在 useEffect 中立即导航到 `/app/shortplay-entry`
3. ShortplayEntryPage 被 ProtectedRoute 包装
4. 如果用户未认证，ProtectedRoute 将重定向到 `/app/login`
5. 如果用户已认证，ShortplayEntryPage 会被渲染

---

## 3. 认证状态管理

### 3.1 AuthContext (`/src/contexts/AuthContext.tsx`)

**核心接口定义：**

```typescript
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    refreshUserInfo: () => Promise<void>;
    isAuthenticated: boolean;
    checkTokenValidity: () => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
}

interface User {
    user_id: number;
    user_name: string;
    user_email: string;
    user_plan: 'free' | 'chinese' | 'multilingual';
    user_point: string;
    subscription_expires_at?: string | null;
    subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
    userId?: string;
}
```

**Provider 初始化流程：**

```typescript
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 初始化为未登陆状态（不使用localStorage）
        // 注意：AuthContext 不在初始化时恢复认证状态
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);

        // 设置 API 拦截器的未授权回调
        apiInterceptor.setUnauthorizedCallback(() => {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            window.location.href = '/#/app/login';
        });
    }, []);
```

**关键发现：**
- AuthContext **不会在初始化时从任何存储恢复认证状态**
- 认证状态仅存在于内存中
- 页面刷新会导致认证状态丢失（需要重新登录）
- 有 API 拦截器的未授权回调用于处理用户未登录的情况

### 3.2 登录方法

```typescript
const login = async (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);

    // 处理每日登录积分奖励
    try {
        const rewardResult = await pointsService.dailyLoginReward({
            user_plan: userData.user_plan || 'free'
        });
    } catch (error) {
        // 不影响登录流程
    }
};
```

---

## 4. 认证令牌存储机制

### 4.1 Token 存储位置

**localStorage 使用：**

项目在 `/src/cloudbase.ts` 中定义了 token 存储：

```typescript
const CREDENTIALS_KEY = `credentials_${ENV_ID}`; 

export function getAccessToken(): string | null {
    // 首先尝试从 localStorage 中的 'token' 获取
    const authToken = localStorage.getItem('token');
    if (authToken) {
        return authToken;
    }
    
    // 如果没有，尝试从 credentials 获取
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) {
        return null;
    }
    
    try {
      const { access_token } = JSON.parse(raw);
      return access_token || null;
    } catch {
      return null;
    }
}
```

**Token 存储类型：**
1. **Primary**: `localStorage['token']` - 主要存储位置
2. **Fallback**: `localStorage['credentials_${ENV_ID}']` - CloudBase 凭证

### 4.2 Token 来源

在 LoginPage 中，登录后的 token 处理：

```typescript
// 用户名密码登录
const response = await AuthService.login(username, password);
const token = response.token || response.data.username;
await login(userInfo, token);

// 手机号登录
const authHeader = getAuthHeader();
const token = authHeader ? authHeader.replace('Bearer ', '') : null;
await fetchAndUpdateUserInfo(authHeader);
```

**重要发现：**
- Token 从 AuthService 的登录响应返回
- Token 可能来自响应的 `response.token` 或 HTTP 响应头
- Token 会传递给 AuthContext 的 `login()` 方法
- **AuthContext 中的 token 存储在内存中，不会主动写入 localStorage**

---

## 5. 路由保护机制

### 5.1 ProtectedRoute 组件 (`/src/components/ProtectedRoute.tsx`)

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // 重定向到登录页面，并保存当前路径
        return <Navigate to="/app/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
```

**工作流程：**
1. 读取 `useAuth()` 获取 `isAuthenticated` 状态
2. 如果 `isAuthenticated === false`，重定向到 `/app/login`
3. 保存当前位置信息在 `state.from`（便于登录后返回）
4. 否则，正常渲染子组件

**保护的路由：**
- `/app/home` - 首页（实际上是重定向页面）
- `/app/shortplay-entry` - 一键创作页面 ✓
- `/app/editor` - 剧本编辑器
- `/app/outline` - 大纲编辑
- `/app/characters` - 角色管理
- 等等...

**不受保护的路由：**
- `/app/login` - 登录页
- `/app/register` - 注册页
- `/app/vip` - VIP 页面
- `/app/payment` - 支付页面

### 5.2 导航守卫

项目使用 React Router 的 `<Navigate>` 组件作为导航守卫：

```typescript
// 在 ProtectedRoute 中
if (!isAuthenticated) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
}
```

**特点：**
- 被动式守卫（在组件渲染时检查）
- 不需要主动调用任何 API 验证
- 仅基于 AuthContext 中的 `isAuthenticated` 状态

---

## 6. 页面刷新时的认证状态恢复

### 6.1 当前实现的问题

**现象：**
- 页面刷新后，AuthContext 会重置为初始状态（`isAuthenticated = false`）
- 用户会被重定向到登录页
- 已登录用户需要重新登录

**原因分析：**

1. **AuthContext 初始化不恢复状态：**
   ```typescript
   useEffect(() => {
       // 初始化为未登陆状态（不使用localStorage）
       setIsAuthenticated(false);
       setUser(null);
       setToken(null);
   }, []);
   ```

2. **Token 存储机制不匹配：**
   - Token 在内存中（`AuthContext`）
   - Token 在 localStorage 中的位置不确定
   - 刷新时没有代码读取 localStorage 并恢复认证状态

### 6.2 潜在的改进方向

项目中有以下机制可以改进：

1. **CloudBase 凭证恢复：**
   ```typescript
   export async function ensureCloudbaseLogin(): Promise<void> {
       const token = localStorage.getItem('token');
       if (token) {
           const success = await loginWithJWT(token);
           if (success) return;
       }
       // 否则匿名登录
   }
   ```

2. **Token 有效性检查：**
   ```typescript
   export function getAuthHeader(): string | null {
       // 解析 JWT 并检查过期时间
       const payload = JSON.parse(atob(token.split('.')[1]));
       const exp = payload.exp;
       const now = Math.floor(Date.now() / 1000);
       const expired = now > exp;
   }
   ```

---

## 7. 认证令牌处理和 Token 过期

### 7.1 Token 过期检测机制

**API 拦截器 (`/src/services/apiInterceptor.ts`)：**

```typescript
private isTokenExpiredError(response: Response, errorData?: any): boolean {
    // HTTP 状态码检查
    if (response.status === 401) {
        return true;
    }

    // 错误信息检查
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

    // 检查错误消息（精确匹配）
    if (tokenExpiredMessages.some(msg => 
        errorMessage.toLowerCase().includes(msg.toLowerCase())
    )) {
        return true;
    }

    // 检查错误代码
    if (errorCode === 401) {
        return true;
    }

    return false;
}
```

### 7.2 Token 过期回调流程

```typescript
private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // ... 解析响应
    
    // 检查 token 过期错误
    if (!response.ok && this.isTokenExpiredError(response, responseData)) {
        // 1. 先尝试刷新 token
        if (this.onTokenRefresh) {
            const refreshSuccess = await this.onTokenRefresh();
            if (refreshSuccess) {
                return {
                    success: false,
                    error: 'Token已刷新，请重试',
                    code: 401
                };
            }
        }
        
        // 2. 刷新失败，触发登出
        if (this.onTokenExpired) {
            this.onTokenExpired();  // 由 TokenExpiryHandler 设置
        }
        
        return {
            success: false,
            error: '登录已过期，请重新登录',
            code: 401
        };
    }
}
```

### 7.3 Token 过期处理组件 (`/src/components/TokenExpiryHandler.tsx`)

```typescript
const TokenExpiryHandler: React.FC<TokenExpiryHandlerProps> = ({ children }) => {
    const navigate = useNavigate();
    const { logout, refreshToken } = useAuth();

    useEffect(() => {
        // Token 过期回调
        const handleTokenExpired = () => {
            logout();
            navigate('/app/login', { replace: true });
        };

        // Token 刷新回调
        const handleTokenRefresh = async (): Promise<boolean> => {
            return await refreshToken();
        };

        apiInterceptor.setTokenExpiredCallback(handleTokenExpired);
        apiInterceptor.setTokenRefreshCallback(handleTokenRefresh);
    }, [navigate, logout, refreshToken]);

    return <>{children}</>;
};
```

**工作流程：**
1. API 请求返回 401 错误
2. API 拦截器检测到 token 过期
3. 触发 `onTokenExpired` 回调
4. TokenExpiryHandler 的回调执行
5. 调用 `logout()` 清空认证状态
6. 使用 `navigate()` 重定向到登录页

### 7.4 在 App.tsx 中的集成

```typescript
const App: React.FC = () => {
  return (
    <TokenExpiryHandler>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1 min-h-0 h-[calc(100vh-64px)]">
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </div>
    </TokenExpiryHandler>
  )
}
```

**重要发现：**
- TokenExpiryHandler 包装整个应用路由
- 所有在 `/app` 下的路由都受到 token 过期检测的保护
- 如果 token 过期，用户会被自动重定向到登录页

---

## 8. 完整的认证流程

### 8.1 用户名密码登录流程

**步骤 1: 用户输入用户名和密码 (LoginPage.tsx)**

```typescript
const handleAccountLogin = async () => {
    // 调用 AuthService.login()
    const response = await AuthService.login(username, password);
    
    const token = response.token || response.data.username;
    const userInfo = {
        user_id: parseInt(String(response.data.userId)) || 1,
        user_name: response.data.username || username,
        user_email: '',
        user_plan: 'free' as const,
        user_point: '0'
    };
    
    // 更新 AuthContext
    await login(userInfo, token);
    
    // 导航到首页
    navigate('/app/home');
};
```

**步骤 2: 调用登录 API (authService.ts)**

```typescript
static async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${STORYAI_API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || data.code !== 0) {
        throw new Error(data.message || '登录失败');
    }

    // 尝试从 response headers 中获取 token
    const authHeader = response.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

    return { ...data, token };
}
```

**步骤 3: 更新 AuthContext (AuthContext.tsx)**

```typescript
const login = async (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);

    // 处理每日登录积分奖励
    try {
        const rewardResult = await pointsService.dailyLoginReward({
            user_plan: userData.user_plan || 'free'
        });
    } catch (error) {
        // 忽略错误
    }
};
```

**步骤 4: 重定向到首页**

```typescript
navigate('/app/home');
```

**步骤 5: 首页自动重定向到一键创作页面**

```typescript
function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        // 直接导航到一键创作页面
        navigate('/app/shortplay-entry', { replace: true });
    }, [navigate]);

    return null;
}
```

**步骤 6: 一键创作页面检查认证状态**

```typescript
// ProtectedRoute 会检查 isAuthenticated
if (!isAuthenticated) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
}
// 否则渲染 ShortplayEntryPage
```

### 8.2 API 请求的 Token 添加

当需要进行 API 请求时，项目使用 `getAuthHeader()` 函数：

```typescript
// 在 /src/cloudbase.ts 中
export function getAuthHeader(): string | null {
    const token = getAccessToken();
    if (!token) return null;
    
    // 返回 "Bearer <token>" 格式
    if (token.startsWith('Bearer ')) {
        return token;
    }
    return `Bearer ${token}`;
}
```

**使用示例 (paymentService.ts)：**

```typescript
private async callFunctionWithAuth(action: string, data: any): Promise<any> {
    const authHeader = getAuthHeader();
    if (!authHeader) {
        return {
            success: false,
            error: '用户未登录'
        };
    }

    // 使用 authHeader 调用云函数或 API
}
```

---

## 9. 访问权限控制总结

### 9.1 检查用户是否已登录

**方法 1: 使用 useAuth hook (推荐)**

```typescript
const { isAuthenticated, user, token } = useAuth();

if (!isAuthenticated) {
    // 用户未登录
}
```

**方法 2: 使用 ProtectedRoute 包装**

```typescript
<ProtectedRoute>
    <YourComponent />
</ProtectedRoute>
```

### 9.2 Token 检查和验证

**获取当前 token：**

```typescript
const { token } = useAuth();

// 或者直接从 localStorage 获取
const token = getAccessToken();  // from cloudbase.ts
```

**验证 token 有效性：**

```typescript
// 在 cloudbase.ts 中
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = payload.exp;
const now = Math.floor(Date.now() / 1000);
const expired = now > exp;
```

### 9.3 权限检查流程

```
用户访问受保护的路由
    ↓
ProtectedRoute 组件
    ↓
检查 useAuth().isAuthenticated
    ├── false → 重定向到 /app/login
    └── true → 渲染组件
        ↓
    组件发送 API 请求
        ↓
    API 拦截器检查 Authorization 头
        ├── 无 token → 触发 onUnauthorized 回调
        └── 有 token → 正常发送请求
            ↓
            服务器验证 token
            ├── token 有效 → 返回数据
            ├── token 过期 → 返回 401
            │   ↓
            │   API 拦截器检测 token 过期
            │   ↓
            │   触发 onTokenExpired 回调
            │   ↓
            │   TokenExpiryHandler 执行登出
            │   ↓
            │   重定向到登录页
            │
            └── token 无效 → 返回 401 (同上)
```

---

## 10. 关键技术点总结

### 10.1 认证架构
- **模式**: React Context + localStorage + API 拦截器
- **Token 位置**: 内存 (AuthContext) + localStorage
- **Token 格式**: Bearer token (JWT)
- **认证检查**: ProtectedRoute 组件

### 10.2 路由保护
- **方式**: 组件级别的条件渲染 (ProtectedRoute)
- **重定向**: 使用 React Router 的 Navigate 组件
- **状态保存**: 在 navigate 的 state 中保存原始位置

### 10.3 Token 过期处理
- **检测**: API 拦截器 (HTTP 401 或错误信息匹配)
- **响应**: 自动触发登出并重定向
- **恢复**: 用户需要重新登录

### 10.4 一键创作页面访问流程
```
/app/home 
  → ProtectedRoute 检查 isAuthenticated
  → HomePage useEffect 重定向到 /app/shortplay-entry
  → ProtectedRoute(ShortplayEntryPage)
  → 检查 isAuthenticated
  → 渲染 ShortplayEntryPage
```

---

## 11. 文件位置快速参考

| 功能 | 文件路径 |
|------|--------|
| 路由定义 | `/src/router.tsx` |
| 认证上下文 | `/src/contexts/AuthContext.tsx` |
| 认证服务 | `/src/services/authService.ts` |
| API 拦截器 | `/src/services/apiInterceptor.ts` |
| CloudBase 配置 | `/src/cloudbase.ts` |
| 路由保护 | `/src/components/ProtectedRoute.tsx` |
| Token 过期处理 | `/src/components/TokenExpiryHandler.tsx` |
| 登录页 | `/src/components/LoginPage.tsx` |
| 一键创作页 | `/src/components/ShortplayEntryPage.tsx` |
| 主应用布局 | `/src/App.tsx` |
| 主入口 | `/src/main.tsx` |

---

## 12. 发现的潜在问题和改进建议

### 12.1 问题 1: 页面刷新丢失认证状态
**现状**: 页面刷新后用户被重定向到登录页
**原因**: AuthContext 不从 localStorage 恢复状态
**建议**: 在 AuthProvider 初始化时检查 localStorage 中的 token

### 12.2 问题 2: Token 存储位置不一致
**现状**: Token 在内存中，也可能在 localStorage 中
**原因**: 登录时 token 不会保存到 localStorage
**建议**: 统一在 localStorage 中存储 token，登录时保存，刷新时恢复

### 12.3 问题 3: 未实现 Token 刷新机制
**现状**: `refreshToken()` 方法直接返回 false
**原因**: CloudBase 可能不支持 token 刷新
**建议**: 如果后端支持，实现 token 刷新机制

### 12.4 问题 4: 一键创作页面的间接访问
**现状**: 首页是个重定向页面，导航到一键创作页面
**原因**: 设计选择，可能是为了确保认证检查
**改进**: 可以直接将一键创作页面设为首页

---

## 13. 完整的认证流程图

```
用户访问应用
    ↓
加载 main.tsx
    ↓
初始化 AuthProvider (isAuthenticated = false)
    ↓
初始化 I18nProvider
    ↓
初始化 WorksProvider
    ↓
RouterProvider 渲染路由
    ↓
用户点击/导航到受保护的路由
    ↓
ProtectedRoute 组件
    ├─ isAuthenticated === false
    │   ↓
    │   <Navigate to="/app/login" />
    │   ↓
    │   用户看到登录页
    │
    └─ isAuthenticated === true
        ↓
        渲染目标组件

用户在登录页输入凭证
    ↓
handleAccountLogin() 执行
    ↓
AuthService.login(username, password)
    ↓
调用 /episode-api/storyai/user/login API
    ↓
返回 token 和用户信息
    ↓
调用 AuthContext.login(userData, token)
    ↓
setIsAuthenticated(true)
    ↓
navigate('/app/home')
    ↓
HomePage useEffect 执行
    ↓
navigate('/app/shortplay-entry')
    ↓
ProtectedRoute 检查 isAuthenticated
    ↓
isAuthenticated === true
    ↓
渲染 ShortplayEntryPage
    ↓
用户开始使用一键创作功能
    ↓
发送 API 请求
    ↓
API 拦截器添加 Authorization 头
    ↓
getAuthHeader() 返回 "Bearer <token>"
    ↓
服务器验证 token
    ├─ token 有效 → 正常响应
    ├─ token 过期 → 返回 401
    │   ↓
    │   API 拦截器检测到 token 过期
    │   ↓
    │   触发 onTokenExpired 回调
    │   ↓
    │   TokenExpiryHandler 执行 logout()
    │   ↓
    │   setIsAuthenticated(false)
    │   ↓
    │   navigate('/app/login')
    │   ↓
    │   ProtectedRoute 重定向到登录页
    │
    └─ token 无效 → (同上)
```

