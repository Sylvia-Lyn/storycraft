const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
    env: 'stroycraft-1ghmi4ojd3b4a20b'
});

const db = app.database();
const auth = app.auth();

// 模拟测试数据
const testUserId = 'test_user_123';
const testWorkData = {
    name: '测试作品',
    content: {
        blocks: [
            {
                type: 'paragraph',
                data: {
                    text: '这是一个测试作品的内容。'
                }
            }
        ]
    },
    type: 'script'
};

// 测试函数
async function testWorksManager() {
    console.log('开始测试作品管理系统...\n');

    try {
        // 1. 测试创建作品
        console.log('1. 测试创建作品...');
        const createResult = await testCreateWork();
        if (createResult.success) {
            console.log('✅ 创建作品成功:', createResult.data);
            const workId = createResult.data.id;

            // 2. 测试获取作品列表
            console.log('\n2. 测试获取作品列表...');
            const listResult = await testGetWorks();
            if (listResult.success) {
                console.log('✅ 获取作品列表成功:', listResult.data.length, '个作品');
            }

            // 3. 测试获取单个作品
            console.log('\n3. 测试获取单个作品...');
            const getResult = await testGetWork(workId);
            if (getResult.success) {
                console.log('✅ 获取单个作品成功:', getResult.data.name);
            }

            // 4. 测试更新作品
            console.log('\n4. 测试更新作品...');
            const updateResult = await testUpdateWork(workId);
            if (updateResult.success) {
                console.log('✅ 更新作品成功');
            }

            // 5. 测试保存作品内容
            console.log('\n5. 测试保存作品内容...');
            const saveResult = await testSaveWorkContent(workId);
            if (saveResult.success) {
                console.log('✅ 保存作品内容成功');
            }

            // 6. 测试删除作品
            console.log('\n6. 测试删除作品...');
            const deleteResult = await testDeleteWork(workId);
            if (deleteResult.success) {
                console.log('✅ 删除作品成功');
            }
        }

        console.log('\n🎉 所有测试完成！');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 测试创建作品
async function testCreateWork() {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'createWork',
                data: testWorkData
            }
        });

        console.log('创建作品结果:', result);
        return result.result;
    } catch (error) {
        console.error('创建作品失败:', error);
        return { success: false, error: error.message };
    }
}

// 测试获取作品列表
async function testGetWorks() {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'getWorks'
            }
        });

        console.log('获取作品列表结果:', result);
        return result.result;
    } catch (error) {
        console.error('获取作品列表失败:', error);
        return { success: false, error: error.message };
    }
}

// 测试获取单个作品
async function testGetWork(workId) {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'getWork',
                data: { id: workId }
            }
        });

        console.log('获取单个作品结果:', result);
        return result.result;
    } catch (error) {
        console.error('获取单个作品失败:', error);
        return { success: false, error: error.message };
    }
}

// 测试更新作品
async function testUpdateWork(workId) {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'updateWork',
                data: {
                    id: workId,
                    name: '更新后的测试作品'
                }
            }
        });

        console.log('更新作品结果:', result);
        return result.result;
    } catch (error) {
        console.error('更新作品失败:', error);
        return { success: false, error: error.message };
    }
}

// 测试保存作品内容
async function testSaveWorkContent(workId) {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'saveWorkContent',
                data: {
                    id: workId,
                    content: {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: {
                                    text: '这是更新后的作品内容。'
                                }
                            }
                        ]
                    },
                    isAutoSave: false
                }
            }
        });

        console.log('保存作品内容结果:', result);
        return result.result;
    } catch (error) {
        console.error('保存作品内容失败:', error);
        return { success: false, error: error.message };
    }
}

// 测试删除作品
async function testDeleteWork(workId) {
    try {
        const result = await app.callFunction({
            name: 'works_manager',
            data: {
                action: 'deleteWork',
                data: { id: workId }
            }
        });

        console.log('删除作品结果:', result);
        return result.result;
    } catch (error) {
        console.error('删除作品失败:', error);
        return { success: false, error: error.message };
    }
}

// 运行测试
testWorksManager(); 