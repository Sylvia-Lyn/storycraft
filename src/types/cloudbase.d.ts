declare module '@cloudbase/js-sdk' {
    export interface Auth {
        getVerification(params: { phone_number: string }): Promise<any>;
        signInWithSms(params: {
            verificationInfo: any;
            verificationCode: string;
            phoneNumber: string;
        }): Promise<any>;
        signIn(params: { username: string; password: string }): Promise<any>;
    }

    export interface App {
        auth(): Auth;
    }

    export interface Cloudbase {
        init(config: { env: string }): App;
    }

    const cloudbase: Cloudbase;
    export default cloudbase;
} 