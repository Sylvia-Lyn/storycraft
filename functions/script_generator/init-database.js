/**
 * 数据库初始化脚本
 * 用于创建必要的数据库集合和索引
 */

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
    env: 'stroycraft-1ghmi4ojd3b4a20b'
});

const db = app.database();

/**
 * 初始化数据库集合
 */
async function initDatabase() {
    console.log('🚀 开始初始化数据库...');
    
    try {
        // 1. 创建 script_tasks 集合
        await createScriptTasksCollection();
        
        // 2. 创建索引
        await createIndexes();
        
        console.log('✅ 数据库初始化完成！');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        throw error;
    }
}

/**
 * 创建 script_tasks 集合
 */
async function createScriptTasksCollection() {
    console.log('📝 创建 script_tasks 集合...');
    
    try {
        // 通过添加一个示例文档来创建集合
        const sampleTask = {
            task_id: 'sample_task_init',
            status: 'completed',
            progress: 100,
            message: '数据库初始化示例任务',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: {
                model: 'deepseek-r1',
                language: 'zh-CN'
            },
            novel_content_length: 0,
            result: {
                success: true,
                data: {
                    outline: { title: '示例大纲' },
                    characters: [],
                    scenes: []
                }
            }
        };
        
        await db.collection('script_tasks').doc('sample_task_init').set(sampleTask);
        console.log('✅ script_tasks 集合创建成功');
        
        // 删除示例文档
        await db.collection('script_tasks').doc('sample_task_init').remove();
        console.log('✅ 示例文档已清理');
        
    } catch (error) {
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
            console.log('⚠️ 集合已存在或创建失败');
        } else {
            throw error;
        }
    }
}

/**
 * 创建数据库索引
 */
async function createIndexes() {
    console.log('📊 创建数据库索引...');
    
    try {
        // 注意：CloudBase 的索引创建可能需要通过控制台进行
        // 这里只是记录需要创建的索引
        
        const indexes = [
            {
                collection: 'script_tasks',
                fields: ['status'],
                name: 'status_index'
            },
            {
                collection: 'script_tasks',
                fields: ['created_at'],
                name: 'created_at_index'
            },
            {
                collection: 'script_tasks',
                fields: ['status', 'created_at'],
                name: 'status_created_at_index'
            }
        ];
        
        console.log('📋 建议创建的索引:');
        indexes.forEach(index => {
            console.log(`  - 集合: ${index.collection}, 字段: ${index.fields.join(', ')}, 名称: ${index.name}`);
        });
        
        console.log('💡 请通过 CloudBase 控制台手动创建这些索引');
        
    } catch (error) {
        console.warn('⚠️ 索引创建失败:', error);
    }
}

/**
 * 验证数据库连接
 */
async function verifyDatabase() {
    console.log('🔍 验证数据库连接...');
    
    try {
        // 尝试读取集合信息
        const collections = await db.getCollections();
        console.log('✅ 数据库连接正常');
        console.log('📋 现有集合:', collections.map(c => c.name));
        
        // 测试 script_tasks 集合
        const testDoc = await db.collection('script_tasks').limit(1).get();
        console.log('✅ script_tasks 集合可访问');
        
    } catch (error) {
        console.error('❌ 数据库验证失败:', error);
        throw error;
    }
}

/**
 * 清理过期任务
 */
async function cleanupExpiredTasks() {
    console.log('🧹 清理过期任务...');
    
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const expiredTasks = await db.collection('script_tasks')
            .where({
                created_at: db.command.lt(oneWeekAgo)
            })
            .get();
        
        if (expiredTasks.data.length > 0) {
            console.log(`🗑️ 找到 ${expiredTasks.data.length} 个过期任务`);
            
            for (const task of expiredTasks.data) {
                await task.ref.remove();
            }
            
            console.log('✅ 过期任务清理完成');
        } else {
            console.log('✅ 没有过期任务需要清理');
        }
        
    } catch (error) {
        console.warn('⚠️ 清理过期任务失败:', error);
    }
}

// 主函数
async function main() {
    try {
        await verifyDatabase();
        await initDatabase();
        await cleanupExpiredTasks();
        
        console.log('🎉 数据库初始化脚本执行完成！');
        
    } catch (error) {
        console.error('💥 脚本执行失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    initDatabase,
    verifyDatabase,
    cleanupExpiredTasks
};
