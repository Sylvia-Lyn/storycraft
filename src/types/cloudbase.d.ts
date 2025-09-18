declare module '@cloudbase/js-sdk' {
    export interface Auth {
        // 登录状态
        getLoginState?: () => Promise<any>;
        // 匿名登录
        signInAnonymously?: () => Promise<any>;
        // 设置持久化
        persistence?: (mode: 'local' | 'session' | 'none') => void;
        getVerification(params: { phone_number?: string; email?: string }): Promise<{
            verification_id: string;
            is_user: boolean;
        }>;

        // 验证验证码
        verify(params: {
            verification_id: string;
            verification_code: string;
        }): Promise<{
            verification_token: string;
        }>;

        // 注册用户
        signUp(params: {
            phone_number?: string;
            email?: string;
            verification_code: string;
            verification_token: string;
            username?: string;
            password?: string;
        }): Promise<any>;

        // 登录用户（支持 verification_token）
        signIn(params: {
            username: string;
            password?: string;
            verification_token?: string;
        }): Promise<any>;

        signInWithSms(params: {
            verificationInfo: any;
            verificationCode: string;
            phoneNumber: string;
        }): Promise<any>;
    }

    export interface App {
        auth(): Auth;
        callFunction(params: {
            name: string;
            data?: any;
            headers?: any;
        }): Promise<{
            result: any;
        }>;
    }

    export interface Cloudbase {
        init(config: { env: string }): App;
    }

    const cloudbase: Cloudbase;
    export default cloudbase;
} 