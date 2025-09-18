/**
 * 测试修复后的云函数
 * 用于验证500错误是否已解决
 */

const API_BASE_URL = 'https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com';

async function testHealthCheck() {
    console.log('🔍 测试健康检查接口...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/script_generator/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 健康检查响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 健康检查成功:', JSON.stringify(result, null, 2));
            return true;
        } else {
            console.error('❌ 健康检查失败:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ 健康检查请求失败:', error);
        return false;
    }
}

async function testTaskSubmission() {
    console.log('🔍 测试任务提交...');
    
    const testContent = `
    这是一个测试小说内容。
    主角小明是一个普通的大学生，他有一个梦想。
    他想要成为一名优秀的程序员。
    经过努力学习，他终于实现了自己的梦想。
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/script_generator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                novel_content: testContent,
                options: {
                    model: 'deepseek-r1',
                    language: 'zh-CN',
                    max_scenes: 3
                }
            })
        });
        
        console.log('📡 任务提交响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 任务提交成功:', JSON.stringify(result, null, 2));
            return result.task_id;
        } else {
            const errorText = await response.text();
            console.error('❌ 任务提交失败:', response.status, response.statusText);
            console.error('错误详情:', errorText);
            return null;
        }
    } catch (error) {
        console.error('❌ 任务提交请求失败:', error);
        return null;
    }
}

async function testTaskStatusQuery(taskId) {
    if (!taskId) {
        console.log('⏭️ 跳过状态查询测试（无任务ID）');
        return;
    }
    
    console.log('🔍 测试任务状态查询...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/script_generator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'status',
                task_id: taskId
            })
        });
        
        console.log('📡 状态查询响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 状态查询成功:', JSON.stringify(result, null, 2));
        } else {
            const errorText = await response.text();
            console.error('❌ 状态查询失败:', response.status, response.statusText);
            console.error('错误详情:', errorText);
        }
    } catch (error) {
        console.error('❌ 状态查询请求失败:', error);
    }
}

async function runTests() {
    console.log('🚀 开始测试修复后的云函数...\n');
    
    // 1. 健康检查
    const healthOk = await testHealthCheck();
    console.log('');
    
    if (!healthOk) {
        console.log('❌ 健康检查失败，停止测试');
        return;
    }
    
    // 2. 任务提交
    const taskId = await testTaskSubmission();
    console.log('');
    
    // 3. 状态查询
    await testTaskStatusQuery(taskId);
    console.log('');
    
    console.log('🏁 测试完成');
}

// 运行测试
runTests().catch(console.error);
