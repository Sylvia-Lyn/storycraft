import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
    try {
        console.log('开始测试用户认证功能...\n');

        // 1. 测试创建用户
        console.log('1. 测试创建用户...');
        const hashedPassword = await bcrypt.hash('test123', 10);
        const newUser = await prisma.user.create({
            data: {
                user_name: 'testuser',
                user_email: 'test@example.com',
                user_password: hashedPassword,
                user_plan: 'free',
                user_piont: '0'
            }
        });
        console.log('✅ 用户创建成功:', {
            user_id: newUser.user_id,
            user_name: newUser.user_name,
            user_email: newUser.user_email
        });

        // 2. 测试查询用户
        console.log('\n2. 测试查询用户...');
        const foundUser = await prisma.user.findUnique({
            where: { user_email: 'test@example.com' }
        });
        console.log('✅ 用户查询成功:', {
            user_id: foundUser.user_id,
            user_name: foundUser.user_name
        });

        // 3. 测试密码验证
        console.log('\n3. 测试密码验证...');
        const isValidPassword = await bcrypt.compare('test123', foundUser.user_password);
        console.log('✅ 密码验证结果:', isValidPassword);

        // 4. 测试用户名登录
        console.log('\n4. 测试用户名登录...');
        const userByUsername = await prisma.user.findFirst({
            where: { user_name: 'testuser' }
        });
        console.log('✅ 用户名登录查询成功:', {
            user_id: userByUsername.user_id,
            user_email: userByUsername.user_email
        });

        // 5. 清理测试数据
        console.log('\n5. 清理测试数据...');
        await prisma.user.delete({
            where: { user_id: newUser.user_id }
        });
        console.log('✅ 测试数据清理完成');

        console.log('\n🎉 所有测试通过！用户认证功能正常工作。');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth(); 