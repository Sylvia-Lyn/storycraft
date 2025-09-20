/**
 * 测试数据库连接的简单脚本
 */

// 导入依赖
let cloudbase, app, db;

try {
    cloudbase = require('@cloudbase/node-sdk');
    console.log('✅ 成功导入 @cloudbase/node-sdk');

    // 初始化云开发
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });
    console.log('✅ 成功初始化云开发应用');

    db = app.database();
    console.log('✅ 成功获取数据库对象');
    
} catch (error) {
    console.error('❌ CloudBase SDK 初始化失败:', error?.message || error);
    process.exit(1);
}

// 测试数据库连接
async function testDatabaseConnection() {
    console.log('\n🧪 开始测试数据库连接...');
    
    try {
        // 测试简单的查询操作
        console.log('📊 测试查询 prompts 集合...');
        const result = await db.collection('prompts').limit(1).get();
        console.log('✅ 数据库查询成功');
        console.log('📋 查询结果:', result);
        
        // 测试集合是否存在
        console.log('\n📊 测试集合统计...');
        const countResult = await db.collection('prompts').count();
        console.log('✅ 集合统计成功');
        console.log('📊 集合中的文档数量:', countResult.total);
        
    } catch (error) {
        console.error('❌ 数据库连接测试失败:', error);
        
        if (error.code === 'INVALID_PARAM' && error.message.includes('secretId')) {
            console.log('\n💡 问题分析: 缺少腾讯云认证信息');
            console.log('🔧 解决方案:');
            console.log('1. 确保云函数已正确部署到腾讯云');
            console.log('2. 检查云函数的环境变量配置');
            console.log('3. 确保云函数有访问数据库的权限');
        } else if (error.message.includes('collection')) {
            console.log('\n💡 问题分析: prompts 集合不存在');
            console.log('🔧 解决方案:');
            console.log('1. 在腾讯云开发控制台创建 prompts 数据集合');
            console.log('2. 设置集合权限为"所有用户可读写"');
        }
        
        process.exit(1);
    }
}

// 运行测试
testDatabaseConnection();
