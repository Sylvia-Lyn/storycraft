import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('正在测试数据库连接...');

        // 测试连接
        await prisma.$connect();
        console.log('✅ 数据库连接成功！');

        // 获取用户表信息
        const users = await prisma.user.findMany({
            take: 5
        });
        console.log(`📊 当前用户表中有 ${users.length} 条记录`);

        if (users.length > 0) {
            console.log('📋 前5条用户记录:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}, 用户名: ${user.username}, 手机号: ${user.phone || '未设置'}`);
            });
        }

        // 尝试创建测试用户
        console.log('\n正在创建测试用户...');
        const testUser = await prisma.user.create({
            data: {
                username: 'test_user_' + Date.now(),
                password: '$2a$10$test.hash.password',
                phone: '1380000' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                user_plan: 'free',
                user_piont: '0'
            }
        });
        console.log('✅ 测试用户创建成功！');
        console.log(`   用户ID: ${testUser.id}`);
        console.log(`   用户名: ${testUser.username}`);
        console.log(`   手机号: ${testUser.phone}`);

        // 删除测试用户
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('✅ 测试用户已删除');

    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);

        if (error.code === 'P1001') {
            console.log('💡 提示: 请检查数据库服务器是否正在运行，以及连接字符串是否正确');
        } else if (error.code === 'P1002') {
            console.log('💡 提示: 请检查数据库用户名和密码是否正确');
        } else if (error.code === 'P1003') {
            console.log('💡 提示: 请检查数据库名称是否正确');
        }
    } finally {
        await prisma.$disconnect();
        console.log('🔌 数据库连接已关闭');
    }
}

testConnection(); 