/**
 * 简单调试脚本
 * 用于验证数据库读写是否一致
 */

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
    env: 'stroycraft-1ghmi4ojd3b4a20b'
});

const db = app.database();

async function debugDatabase() {
    console.log('🔍 开始调试数据库读写一致性...');
    
    const testTaskId = `debug_${Date.now()}`;
    const testRecord = {
        task_id: testTaskId,
        status: 'test',
        message: '调试测试',
        created_at: new Date().toISOString()
    };
    
    try {
        // 1. 写入测试记录
        console.log('\n1. 写入测试记录...');
        console.log('任务ID:', testTaskId);
        
        await db.collection('script_tasks').doc(testTaskId).set(testRecord);
        console.log('✅ 写入成功');
        
        // 2. 立即读取测试记录
        console.log('\n2. 读取测试记录...');
        const readResult = await db.collection('script_tasks').doc(testTaskId).get();
        console.log('读取结果:');
        console.log('- exists:', readResult.exists);
        console.log('- id:', readResult.id);
        console.log('- data:', readResult.data());
        
        if (readResult.exists) {
            console.log('✅ 读写一致性正常');
        } else {
            console.log('❌ 读写不一致！写入成功但读取失败');
        }
        
        // 3. 列出所有记录
        console.log('\n3. 列出所有记录...');
        const allRecords = await db.collection('script_tasks').limit(10).get();
        console.log('记录总数:', allRecords.data.length);
        console.log('记录列表:');
        allRecords.data.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record.id}, 状态: ${record.status || '未知'}`);
        });
        
        // 4. 清理测试记录
        console.log('\n4. 清理测试记录...');
        await db.collection('script_tasks').doc(testTaskId).remove();
        console.log('✅ 测试记录已清理');
        
    } catch (error) {
        console.error('💥 调试过程出错:', error);
    }
}

debugDatabase().catch(console.error);
