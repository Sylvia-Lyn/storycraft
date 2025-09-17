/**
 * 测试文件
 * 用于测试小说转剧本生成API的功能
 */

// 模拟测试数据
const testNovelContent = `
在一个阳光明媚的下午，李明走进了那家熟悉的咖啡厅。他看到了坐在角落里的张雨，心中涌起一阵复杂的情绪。

"好久不见。"李明走到张雨面前，轻声说道。

张雨抬起头，眼中闪过一丝惊讶，然后露出了淡淡的笑容："是啊，好久不见了。"

两人陷入了短暂的沉默。咖啡厅里播放着轻柔的音乐，其他顾客的谈话声此起彼伏。

"你最近怎么样？"李明打破了沉默。

"还不错，工作很忙，但还算充实。"张雨回答，"你呢？"

"我也还好，就是有时候会想起以前的事情。"李明看着窗外，声音有些低沉。

张雨沉默了一会儿，然后说："我也是。"

这时，服务员走了过来，询问他们是否需要点餐。李明点了一杯拿铁，张雨要了一杯卡布奇诺。

"你还记得我们第一次见面的时候吗？"张雨突然问道。

李明点了点头："当然记得，也是在这样的咖啡厅里。"

"那时候我们都还很年轻，对未来充满了憧憬。"张雨的声音中带着一丝怀念。

"是啊，时间过得真快。"李明感慨道。

两人继续聊着过去的事情，仿佛回到了从前。咖啡厅里的氛围变得温馨而怀旧。

"如果时光可以倒流，你会选择不同的路吗？"张雨问道。

李明思考了一会儿，然后说："也许吧，但我觉得现在的我们，都是最好的我们。"

张雨笑了，那是李明很久没有见过的笑容："你说得对。"

夕阳西下，咖啡厅里的灯光渐渐亮起。两人知道，这次见面可能又是很久的分别。

"保重。"李明站起身，准备离开。

"你也是。"张雨也站了起来。

两人相视而笑，然后各自走向不同的方向。咖啡厅里，音乐依然在播放，仿佛在诉说着这个关于重逢和分别的故事。
`;

// 测试配置
const testConfig = {
    model: 'deepseek-r1',
    language: 'zh-CN',
    style: '现代情感',
    max_scenes: 3,
    include_dialogue: true
};

/**
 * 测试内容处理功能
 */
async function testContentProcessing() {
    console.log('=== 测试内容处理功能 ===');
    
    const contentProcessor = require('./contentProcessor');
    
    try {
        const result = await contentProcessor.processNovelContent(testNovelContent);
        
        console.log('处理结果:');
        console.log('- 字数:', result.word_count);
        console.log('- 句子数:', result.sentence_count);
        console.log('- 角色数:', result.characters.length);
        console.log('- 场景数:', result.scenes.length);
        
        console.log('\n提取的角色:');
        result.characters.forEach((char, index) => {
            console.log(`${index + 1}. ${char.name} (出现${char.frequency}次)`);
        });
        
        console.log('\n场景分割:');
        result.scenes.forEach((scene, index) => {
            console.log(`场景${scene.scene_number}: ${scene.content.substring(0, 50)}...`);
        });
        
        return result;
    } catch (error) {
        console.error('内容处理测试失败:', error);
        throw error;
    }
}

/**
 * 测试AI服务功能
 */
async function testAIService() {
    console.log('\n=== 测试AI服务功能 ===');
    
    const aiService = require('./aiService');
    const contentProcessor = require('./contentProcessor');
    
    try {
        // 先处理内容
        const processedContent = await contentProcessor.processNovelContent(testNovelContent);
        
        // 测试大纲生成
        console.log('生成大纲...');
        const outline = await aiService.generateOutline(processedContent, testConfig.model, testConfig.language);
        console.log('大纲生成结果:', outline);
        
        // 测试角色设定生成
        console.log('\n生成角色设定...');
        const characters = await aiService.generateCharacterProfiles(processedContent, testConfig.model, testConfig.language);
        console.log('角色设定生成结果:', characters);
        
        // 测试分幕剧本生成
        console.log('\n生成分幕剧本...');
        const scenes = await aiService.generateScenes(processedContent, characters, testConfig.model, testConfig.language);
        console.log('分幕剧本生成结果:', scenes);
        
        return { outline, characters, scenes };
    } catch (error) {
        console.error('AI服务测试失败:', error);
        throw error;
    }
}

/**
 * 测试完整API功能
 */
async function testFullAPI() {
    console.log('\n=== 测试完整API功能 ===');
    
    // 模拟事件对象
    const mockEvent = {
        novel_content: testNovelContent,
        options: testConfig,
        headers: {
            authorization: 'Bearer test_api_key_1234567890'
        }
    };
    
    // 模拟上下文对象
    const mockContext = {
        requestId: 'test_request_123'
    };
    
    try {
        // 导入主函数
        const { main } = require('./index');
        
        console.log('调用主函数...');
        const result = await main(mockEvent, mockContext);
        
        console.log('API调用结果:');
        console.log('- 成功:', result.success);
        console.log('- 处理时间:', result.processing_time);
        console.log('- 请求ID:', result.request_id);
        
        if (result.success) {
            console.log('- 大纲标题:', result.data.outline?.title);
            console.log('- 角色数量:', result.data.characters?.length);
            console.log('- 场景数量:', result.data.scenes?.length);
            console.log('- 元数据:', result.metadata);
        } else {
            console.log('- 错误:', result.error);
            console.log('- 错误代码:', result.code);
        }
        
        return result;
    } catch (error) {
        console.error('完整API测试失败:', error);
        throw error;
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    console.log('开始运行小说转剧本生成API测试...\n');
    
    try {
        // 测试内容处理
        await testContentProcessing();
        
        // 测试AI服务（需要配置API密钥）
        // await testAIService();
        
        // 测试完整API（需要配置API密钥）
        // await testFullAPI();
        
        console.log('\n✅ 所有测试完成！');
    } catch (error) {
        console.error('\n❌ 测试失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testContentProcessing,
    testAIService,
    testFullAPI,
    runAllTests
};
