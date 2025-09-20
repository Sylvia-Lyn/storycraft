/**
 * Prompt管理云函数测试脚本
 */

const testData = {
    // 测试创建prompt
    createPrompt: {
        action: 'create',
        name: '角色生成模板',
        description: '用于生成小说角色的prompt模板',
        category: '角色生成',
        content: '请根据以下信息生成一个角色：\n姓名：{name}\n年龄：{age}\n背景：{background}\n性格特点：{personality}',
        variables: ['name', 'age', 'background', 'personality'],
        model: 'deepseek-r1',
        language: 'zh-CN',
        isActive: true,
        isDefault: true,
        createdBy: 'admin',
        tags: ['角色', '生成', '模板']
    },

    // 测试获取列表
    listPrompts: {
        action: 'list',
        page: 1,
        limit: 10
    },

    // 测试更新prompt
    updatePrompt: {
        action: 'update',
        id: 'prompt_id_here', // 需要替换为实际的ID
        name: '角色生成模板（更新）',
        description: '更新后的角色生成模板',
        isActive: false
    },

    // 测试删除prompt
    deletePrompt: {
        action: 'delete',
        id: 'prompt_id_here' // 需要替换为实际的ID
    },

    // 测试切换状态
    toggleActive: {
        action: 'toggle_active',
        id: 'prompt_id_here' // 需要替换为实际的ID
    }
};

// 模拟HTTP请求格式
const httpEvent = {
    httpMethod: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:3000'
    },
    body: JSON.stringify(testData.createPrompt)
};

// 导入主函数
const { main } = require('./index.js');

// 运行测试
async function runTest() {
    console.log('开始测试Prompt管理云函数...');
    
    try {
        // 测试创建prompt
        console.log('\n=== 测试创建prompt ===');
        const createEvent = {
            ...httpEvent,
            body: JSON.stringify(testData.createPrompt)
        };
        const createResult = await main(createEvent, {});
        console.log('创建结果:', JSON.parse(createResult.body));
        
        // 如果有返回ID，更新测试数据
        const createResponse = JSON.parse(createResult.body);
        if (createResponse.success && createResponse.data && createResponse.data.id) {
            const promptId = createResponse.data.id;
            testData.updatePrompt.id = promptId;
            testData.deletePrompt.id = promptId;
            testData.toggleActive.id = promptId;
            
            // 测试获取列表
            console.log('\n=== 测试获取prompt列表 ===');
            const listEvent = {
                ...httpEvent,
                body: JSON.stringify(testData.listPrompts)
            };
            const listResult = await main(listEvent, {});
            console.log('列表结果:', JSON.parse(listResult.body));
            
            // 测试更新prompt
            console.log('\n=== 测试更新prompt ===');
            const updateEvent = {
                ...httpEvent,
                body: JSON.stringify(testData.updatePrompt)
            };
            const updateResult = await main(updateEvent, {});
            console.log('更新结果:', JSON.parse(updateResult.body));
            
            // 测试切换状态
            console.log('\n=== 测试切换状态 ===');
            const toggleEvent = {
                ...httpEvent,
                body: JSON.stringify(testData.toggleActive)
            };
            const toggleResult = await main(toggleEvent, {});
            console.log('切换结果:', JSON.parse(toggleResult.body));
            
            // 测试删除prompt
            console.log('\n=== 测试删除prompt ===');
            const deleteEvent = {
                ...httpEvent,
                body: JSON.stringify(testData.deletePrompt)
            };
            const deleteResult = await main(deleteEvent, {});
            console.log('删除结果:', JSON.parse(deleteResult.body));
        }
        
        console.log('\n测试完成！');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    runTest();
}

module.exports = { testData, runTest };
