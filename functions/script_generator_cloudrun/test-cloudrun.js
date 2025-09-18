/**
 * 云托管函数测试文件
 * 用于验证迁移后的功能是否正常
 */

const { main } = require('./index.js');

async function testHealthCheck() {
    console.log('=== 测试健康检查接口 ===');
    
    const event = {
        path: '/health',
        httpMethod: 'GET',
        queryStringParameters: {}
    };
    
    const context = {
        requestId: 'test-health-' + Date.now()
    };
    
    try {
        const result = await main(event, context);
        console.log('健康检查结果:', JSON.stringify(result, null, 2));
        
        if (result.success && result.deployment_type === 'cloudrun') {
            console.log('✅ 健康检查通过');
            return true;
        } else {
            console.log('❌ 健康检查失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 健康检查异常:', error);
        return false;
    }
}

async function testScriptGeneration() {
    console.log('\n=== 测试剧本生成功能 ===');
    
    const event = {
        novel_content: `在一个阳光明媚的早晨，小明走在去学校的路上。他心情很好，因为今天要考试，他昨晚复习得很充分。

"小明！"一个熟悉的声音从身后传来。小明回头一看，是他的好朋友小红。

"小红，早上好！"小明高兴地打招呼。

"你今天看起来很有信心呢。"小红笑着说。

"是的，我昨晚复习到很晚，应该没问题。"小明自信地回答。

两人一起走向学校，讨论着即将到来的考试。小明觉得有朋友的陪伴，考试也变得不那么紧张了。`,
        options: {
            model: 'deepseek-r1',
            language: 'zh-CN',
            max_scenes: 3
        },
        headers: {
            authorization: 'Bearer storycraft_script_2024_secure'
        }
    };
    
    const context = {
        requestId: 'test-script-' + Date.now()
    };
    
    try {
        const result = await main(event, context);
        console.log('剧本生成结果:', JSON.stringify(result, null, 2));
        
        if (result.success && result.data && result.data.outline && result.data.characters && result.data.scenes) {
            console.log('✅ 剧本生成成功');
            console.log(`- 大纲: ${result.data.outline.title || '未设置标题'}`);
            console.log(`- 角色数量: ${result.data.characters.length}`);
            console.log(`- 场景数量: ${result.data.scenes.length}`);
            console.log(`- 处理时间: ${result.processing_time}秒`);
            return true;
        } else {
            console.log('❌ 剧本生成失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 剧本生成异常:', error);
        return false;
    }
}

async function testValidation() {
    console.log('\n=== 测试输入验证 ===');
    
    // 测试空内容
    const event1 = {
        novel_content: '',
        headers: {
            authorization: 'Bearer storycraft_script_2024_secure'
        }
    };
    
    const context1 = {
        requestId: 'test-validation-1-' + Date.now()
    };
    
    try {
        const result1 = await main(event1, context1);
        if (!result1.success && result1.code === 'VALIDATION_ERROR') {
            console.log('✅ 空内容验证通过');
        } else {
            console.log('❌ 空内容验证失败');
        }
    } catch (error) {
        console.error('❌ 空内容验证异常:', error);
    }
    
    // 测试API密钥验证
    const event2 = {
        novel_content: '这是一个测试内容，长度足够通过验证。',
        headers: {
            authorization: 'Bearer invalid_key'
        }
    };
    
    const context2 = {
        requestId: 'test-validation-2-' + Date.now()
    };
    
    try {
        const result2 = await main(event2, context2);
        if (!result2.success && result2.code === 'AUTH_ERROR') {
            console.log('✅ API密钥验证通过');
        } else {
            console.log('❌ API密钥验证失败');
        }
    } catch (error) {
        console.error('❌ API密钥验证异常:', error);
    }
}

async function runAllTests() {
    console.log('开始云托管函数测试...\n');
    
    const results = [];
    
    // 运行所有测试
    results.push(await testHealthCheck());
    results.push(await testValidation());
    
    // 只有在设置了API密钥的情况下才测试剧本生成
    if (process.env.DEEPSEEK_API_KEY) {
        results.push(await testScriptGeneration());
    } else {
        console.log('\n⚠️  跳过剧本生成测试（未设置DEEPSEEK_API_KEY环境变量）');
    }
    
    // 统计结果
    const passed = results.filter(r => r === true).length;
    const total = results.length;
    
    console.log(`\n=== 测试结果 ===`);
    console.log(`通过: ${passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 所有测试通过！云托管函数迁移成功！');
        process.exit(0);
    } else {
        console.log('❌ 部分测试失败，请检查配置和代码');
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('测试运行失败:', error);
        process.exit(1);
    });
}

module.exports = {
    testHealthCheck,
    testScriptGeneration,
    testValidation,
    runAllTests
};
