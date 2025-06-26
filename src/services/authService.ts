import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    phone: string;
    password: string;
}

export interface UserResponse {
    user_id: number;
    user_name: string;
    user_email: string;
    user_phonenumber: string;
    user_plan: string;
    user_piont: string;
    token: string;
}

export class AuthService {
    // 验证密码强度
    private static validatePassword(password: string): boolean {
        // 密码长度8-20位，必须包含字母、数字和特殊符号
        const minLength = 8;
        const maxLength = 20;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        return password.length >= minLength &&
            password.length <= maxLength &&
            hasLetter &&
            hasNumber &&
            hasSpecialChar;
    }

    // 验证用户名格式
    private static validateUsername(username: string): boolean {
        // 用户名长度3-20个字符，只能包含字母、数字、下划线
        const minLength = 3;
        const maxLength = 20;
        const validPattern = /^[a-zA-Z0-9_]+$/;

        return username.length >= minLength &&
            username.length <= maxLength &&
            validPattern.test(username);
    }

    // 注册用户
    static async register(data: RegisterData): Promise<UserResponse> {
        try {
            // 验证用户名格式
            if (!this.validateUsername(data.username)) {
                throw new Error('用户名格式不正确，长度3-20个字符，只能包含字母、数字、下划线');
            }

            // 验证密码强度
            if (!this.validatePassword(data.password)) {
                throw new Error('密码强度不够，长度8-20位，必须包含字母、数字和特殊符号');
            }

            // 检查用户名是否已存在
            const existingUsername = await prisma.user.findFirst({
                where: { username: data.username }
            });

            if (existingUsername) {
                throw new Error('用户名已被使用');
            }

            // 检查手机号是否已存在
            const existingPhone = await prisma.user.findFirst({
                where: { phone: data.phone }
            });

            if (existingPhone) {
                throw new Error('手机号已被注册');
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(data.password, 10);

            // 创建用户
            const user = await prisma.user.create({
                data: {
                    username: data.username,
                    phone: data.phone,
                    password: hashedPassword,
                    user_plan: 'free',
                    user_piont: '0'
                }
            });

            // 生成JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                user_id: user.id,
                user_name: user.username,
                user_email: user.email || '',
                user_phonenumber: user.phone || '',
                user_plan: user.user_plan || 'free',
                user_piont: user.user_piont || '0',
                token
            };
        } catch (error) {
            throw error;
        }
    }

    // 用户登录
    static async login(data: LoginData): Promise<UserResponse> {
        try {
            // 查找用户（支持用户名或手机号登录）
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: data.username },
                        { phone: data.username }
                    ]
                }
            });

            if (!user) {
                throw new Error('用户名或密码错误');
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(data.password, user.password);
            if (!isValidPassword) {
                throw new Error('用户名或密码错误');
            }

            // 生成JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                user_id: user.id,
                user_name: user.username,
                user_email: user.email || '',
                user_phonenumber: user.phone || '',
                user_plan: user.user_plan || 'free',
                user_piont: user.user_piont || '0',
                token
            };
        } catch (error) {
            throw error;
        }
    }

    // 验证JWT token
    static async verifyToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (!user) {
                throw new Error('用户不存在');
            }

            return {
                user_id: user.id,
                user_name: user.username,
                user_email: user.email,
                user_phonenumber: user.phone,
                user_plan: user.user_plan,
                user_piont: user.user_piont
            };
        } catch (error) {
            throw new Error('无效的token');
        }
    }

    // 获取用户信息
    static async getUserById(userId: number) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    user_plan: true,
                    user_piont: true,
                    created_at: true
                }
            });

            if (!user) {
                throw new Error('用户不存在');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
} 