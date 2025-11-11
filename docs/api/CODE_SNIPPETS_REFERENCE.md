# StoryCraft 认证系统 - 代码片段快速参考

## 1. 核心代码片段

### 1.1 检查用户是否已登录

**在组件中使用 useAuth hook：**
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
    const { isAuthenticated, user, token } = useAuth();
    
    if (!isAuthenticated) {
        return <div>请先登录</div>;
    }
    
    return <div>欢迎, {user?.user_name}</div>;
}
```

### 1.2 获取 Token

**方法 1: 从 AuthContext 获取**
```typescript
const { token } = useAuth();
```

**方法 2: 从 localStorage 获取（带 Bearer 前缀）**
```typescript
import { getAuthHeader } from '../cloudbase';

const authHeader = getAuthHeader();  // 返回 "Bearer <token>" 或 null
```

**方法 3: 从 localStorage 获取（纯 token）**
```typescript
import { getAccessToken } from '../cloudbase';

const token = getAccessToken();  // 返回纯 token 或 null
```

### 1.3 进行认证的 API 请求

**使用 getAuthHeader() 添加认证头：**
```typescript
const authHeader = getAuthHeader();

const response = await fetch('/api/some-endpoint', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''  // 添加 Bearer token
    }
});
```

**使用 paymentService 的示例：**
```typescript
import { paymentService } from '../services/paymentService';

// paymentService 内部会处理 Authorization 头
const result = await paymentService.getUserInfo();
```

### 1.4 登出用户

**在组件中：**
```typescript
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();  // 清空认证状态
        navigate('/app/login');  // 导航到登录页
    };
    
    return <button onClick={handleLogout}>登出</button>;
}
```

### 1.5 用户登录

**在登录页中：**
```typescript
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/authService';

function LoginComponent() {
    const { login } = useAuth();
    
    const handleLogin = async (username: string, password: string) => {
        try {
            // 调用登录 API
            const response = await AuthService.login(username, password);
            
            // 构建用户信息
            const userInfo = {
                user_id: response.data.userId,
                user_name: response.data.username,
                user_email: '',
                user_plan: 'free' as const,
                user_point: '0'
            };
            
            // 更新 AuthContext
            const token = response.token || '';
            await login(userInfo, token);
            
            // 导航到首页或一键创作页
            navigate('/app/home');  // 或 navigate('/app/shortplay-entry')
        } catch (error) {
            console.error('登录失败:', error);
        }
    };
    
    return <div><!-- 登录表单 --></div>;
}
```

---

## 2. 路由保护

### 2.1 使用 ProtectedRoute 包装组件

```typescript
import ProtectedRoute from './components/ProtectedRoute';
import MySecretPage from './pages/MySecretPage';

// 在路由定义中
{
    path: 'secret',
    element: <ProtectedRoute><MySecretPage /></ProtectedRoute>
}
```

### 2.2 访问受保护的路由

```
未认证用户访问 /app/secret
    ↓
ProtectedRoute 检查 isAuthenticated
    ↓
重定向到 /app/login
    ↓
用户登录
    ↓
重定向回 /app/secret（或通过 from location 返回）
    ↓
渲染 MySecretPage 组件
```

### 2.3 创建自定义受保护的路由组件

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPlan?: 'free' | 'chinese' | 'multilingual';
}

const CustomProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredPlan 
}) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/app/login" state={{ from: location }} replace />;
    }

    // 检查用户计划
    if (requiredPlan && user?.user_plan !== requiredPlan) {
        return <Navigate to="/app/vip" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default CustomProtectedRoute;
```

---

## 3. Token 过期处理

### 3.1 在 API 响应中处理 Token 过期

```typescript
// API 拦截器已经自动处理，但如果需要手动处理：
import { apiInterceptor } from '../services/apiInterceptor';

// 调用 API
const result = await apiInterceptor.fetchWithInterceptor<any>(
    '/api/endpoint',
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
);

if (!result.success && result.code === 401) {
    // Token 已过期，用户已被重定向到登录页
    console.log('Token 已过期:', result.error);
}
```

### 3.2 手动检查 Token 有效性

```typescript
import { useAuth } from '../contexts/AuthContext';

function TokenStatusComponent() {
    const { token, checkTokenValidity } = useAuth();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const check = async () => {
            const valid = await checkTokenValidity();
            setIsValid(valid);
        };
        
        check();
    }, [checkTokenValidity]);

    if (!token) {
        return <div>未登录</div>;
    }

    return (
        <div>
            Token 状态: {isValid ? '有效' : '无效'}
        </div>
    );
}
```

### 3.3 JWT Token 解析和过期时间检查

```typescript
import { getAccessToken } from '../cloudbase';

function TokenExpiryCheck() {
    const token = getAccessToken();
    
    if (!token) {
        return <div>未登录</div>;
    }

    try {
        // 解析 JWT 的 payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;  // 过期时间戳（秒）
        const now = Math.floor(Date.now() / 1000);
        const remainingTime = exp - now;  // 剩余秒数
        
        if (remainingTime <= 0) {
            return <div>Token 已过期</div>;
        }
        
        const remainingMinutes = Math.floor(remainingTime / 60);
        return (
            <div>
                Token 在 {remainingMinutes} 分钟后过期
            </div>
        );
    } catch (error) {
        return <div>无法解析 Token</div>;
    }
}
```

---

## 4. localStorage 操作

### 4.1 保存 Token 到 localStorage

```typescript
// 登录时
const token = response.token;
localStorage.setItem('token', token);
```

### 4.2 从 localStorage 读取 Token

```typescript
const token = localStorage.getItem('token');
```

### 4.3 清除 localStorage 中的 Token

```typescript
// 登出时
localStorage.removeItem('token');

// 或清除所有认证相关数据
const ENV_ID = 'stroycraft-1ghmi4ojd3b4a20b';
localStorage.removeItem('token');
localStorage.removeItem(`credentials_${ENV_ID}`);
```

### 4.4 恢复 localStorage 中的认证状态

```typescript
// 在 AuthProvider 初始化时（建议改进）
useEffect(() => {
    const savedToken = localStorage.getItem('token');
    
    if (savedToken) {
        // 验证 token 有效性
        // 如果有效，恢复认证状态
        
        // 获取用户信息
        // 更新 AuthContext
    }
}, []);
```

---

## 5. API 拦截器使用

### 5.1 使用 API 拦截器处理 fetch 请求

```typescript
import { apiInterceptor } from '../services/apiInterceptor';

// 包装 fetch 请求
const result = await apiInterceptor.fetchWithInterceptor<UserData>(
    '/api/user/profile',
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
);

if (result.success) {
    console.log('用户数据:', result.data);
} else {
    console.error('请求失败:', result.error);
}
```

### 5.2 使用 API 拦截器处理云函数调用

```typescript
import { apiInterceptor } from '../services/apiInterceptor';
import { getCloudbaseApp } from '../cloudbase';

const cloudbaseApp = getCloudbaseApp();

const result = await apiInterceptor.callFunctionWithInterceptor(
    () => cloudbaseApp.callFunction({
        name: 'user_manager',
        data: {
            action: 'getInfo'
        }
    })
);

if (result.success) {
    console.log('云函数返回:', result.data);
} else {
    console.error('云函数调用失败:', result.error);
}
```

### 5.3 设置自定义的 Token 过期回调

```typescript
import { apiInterceptor } from '../services/apiInterceptor';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        // 自定义 Token 过期处理
        apiInterceptor.setTokenExpiredCallback(() => {
            console.log('Token 已过期');
            // 显示通知
            message.error('登录已过期，请重新登录');
            // 导航到登录页
            navigate('/app/login');
        });

        // 自定义未授权处理
        apiInterceptor.setUnauthorizedCallback(() => {
            console.log('用户未登录');
            message.error('请先登录');
            navigate('/app/login');
        });

        return () => {
            // 清理回调
            apiInterceptor.setTokenExpiredCallback(() => {});
            apiInterceptor.setUnauthorizedCallback(() => {});
        };
    }, [navigate]);

    return <div><!-- 组件内容 --></div>;
}
```

---

## 6. CloudBase 相关操作

### 6.1 登录到 CloudBase

```typescript
import { getCloudbaseAuth, loginWithJWT } from '../cloudbase';

// 方法 1: 使用 JWT Token 登录
const success = await loginWithJWT('your-jwt-token');

// 方法 2: 直接使用 CloudBase Auth
const auth = getCloudbaseAuth();
await auth.signIn({
    username: 'user@example.com',
    password: 'password'
});
```

### 6.2 获取当前登录状态

```typescript
import { getCloudbaseAuth } from '../cloudbase';

const auth = getCloudbaseAuth();
const loginState = await auth.getLoginState();

if (loginState) {
    console.log('已登录，用户 ID:', loginState.uid);
} else {
    console.log('未登录');
}
```

### 6.3 匿名登录

```typescript
import { getCloudbaseAuth } from '../cloudbase';

const auth = getCloudbaseAuth();
await auth.signInAnonymously();
```

---

## 7. 在 ShortplayEntryPage 中的使用

### 7.1 访问 ShortplayEntryPage（一键创作页面）

```typescript
// 通过路由访问
// 1. 导航到 /app/home
navigate('/app/home');

// 2. HomePage 会自动重定向到 /app/shortplay-entry
// 3. ProtectedRoute 检查认证
// 4. ShortplayEntryPage 被渲染

// 或者直接导航
navigate('/app/shortplay-entry');  // 同样会经过 ProtectedRoute 检查
```

### 7.2 在 ShortplayEntryPage 中使用认证信息

```typescript
// 在 ShortplayEntryPage.tsx 中
import { useAuth } from '../contexts/AuthContext';

function ShortplayEntryPage() {
    const { isAuthenticated, user, token } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('用户未登录，应该被 ProtectedRoute 阻止');
            return;
        }

        console.log('当前用户:', user?.user_name);
        console.log('用户 ID:', user?.user_id);
        console.log('用户计划:', user?.user_plan);

        // 进行需要认证的 API 请求
        // ...
    }, [isAuthenticated, user, token]);

    return (
        <div>
            <!-- 一键创作页面内容 -->
        </div>
    );
}
```

---

## 8. 常见错误和调试

### 8.1 "useAuth must be used within an AuthProvider" 错误

**原因**: 组件不在 AuthProvider 内
**解决**: 确保组件被 AuthProvider 包装（通常在 main.tsx 中）

```typescript
// main.tsx
<AuthProvider>
    <I18nProvider>
        <WorksProvider>
            <RouterProvider router={router} />
        </WorksProvider>
    </I18nProvider>
</AuthProvider>
```

### 8.2 Token 总是 null

**可能原因**:
1. 用户未登录（isAuthenticated === false）
2. localStorage 中没有保存 token
3. Token 已过期

**调试**:
```typescript
const { token, isAuthenticated } = useAuth();
console.log('isAuthenticated:', isAuthenticated);
console.log('token:', token);
console.log('localStorage token:', localStorage.getItem('token'));
```

### 8.3 页面刷新后被重定向到登录页

**原因**: AuthContext 初始化时不从 localStorage 恢复状态（当前设计）
**解决方案**:
1. 改进 AuthProvider 以恢复状态（推荐）
2. 或使用 LocalStorage 直接管理认证状态
3. 或在每个受保护页面的 useEffect 中手动检查并恢复

---

## 9. 最佳实践

### 9.1 组件中的认证检查

```typescript
// 推荐做法
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function SecureComponent() {
    const { isAuthenticated, user } = useAuth();

    // 方法 1: 直接使用 useAuth 检查
    if (!isAuthenticated) {
        return <Navigate to="/app/login" replace />;
    }

    // 方法 2: 或使用 ProtectedRoute 包装（在路由定义中）
    return (
        <div>
            <h1>欢迎, {user?.user_name}</h1>
            {/* 组件内容 */}
        </div>
    );
}
```

### 9.2 API 请求中的错误处理

```typescript
async function fetchUserData() {
    try {
        const authHeader = getAuthHeader();
        const response = await fetch('/api/user/data', {
            headers: {
                'Authorization': authHeader || ''
            }
        });

        if (response.status === 401) {
            // Token 过期或用户未登录
            // API 拦截器会处理，但也可以手动处理
            console.log('需要重新登录');
        } else if (!response.ok) {
            console.error('请求失败:', response.status);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('网络错误:', error);
    }
}
```

### 9.3 清理资源

```typescript
function MyComponent() {
    const { logout, refreshUserInfo } = useAuth();

    useEffect(() => {
        // 定期刷新用户信息
        refreshUserInfo();

        // 清理
        return () => {
            // 可选：在组件卸载时清理
        };
    }, [refreshUserInfo]);

    return <div><!-- 内容 --></div>;
}
```

