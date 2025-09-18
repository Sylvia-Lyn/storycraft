/**
 * 客户端调用示例
 * 展示如何调用小说转剧本生成API
 */

// 配置信息
//const API_BASE_URL = 'https://stroycraft-1ghmi4ojd3b4a20b.tcb.qcloud.la';
const API_BASE_URL = 'stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com'
const API_KEY = 'storycraft_script_2024_secure'; // 与云函数中设置的API密钥一致

/**
 * 调用小说转剧本生成API
 * @param {string} novelContent 小说内容
 * @param {Object} options 选项
 * @returns {Promise<Object>} 生成结果
 */
async function generateScript(novelContent, options = {}) {
    const url = `${API_BASE_URL}/script_generator`;
    
    const requestBody = {
        novel_content: novelContent,
        options: {
            model: 'deepseek-r1',
            language: 'zh-CN',
            style: '古风情感',
            max_scenes: 5,
            include_dialogue: true,
            ...options
        }
    };
    
    try {
        console.log('🚀 发送请求到API...');
        console.log('请求URL:', url);
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(960000) // 3 minutes timeout for complex AI processing
        });
        
        console.log('📡 响应状态:', response.status, response.statusText);
        console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ 剧本生成成功！');
            console.log('处理时间:', result.processing_time + '秒');
            console.log('请求ID:', result.request_id);
            console.log('元数据:', result.metadata);
            return result.data;
        } else {
            console.error('❌ 剧本生成失败:', result.error);
            console.error('错误代码:', result.code);
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ API调用失败:', error);
        
        // 处理特定的连接错误
        if (error.cause && error.cause.code === 'ECONNRESET') {
            console.error('💡 连接被重置，可能是由于请求超时或服务器负载过高');
            console.error('💡 建议：1) 减少请求内容长度 2) 稍后重试 3) 检查网络连接');
        } else if (error.name === 'AbortError') {
            console.error('💡 请求超时，请检查网络连接或减少请求内容');
        }
        
        throw error;
    }
}

/**
 * 健康检查
 * @returns {Promise<Object>} 健康状态
 */
async function healthCheck() {
    const url = `${API_BASE_URL}/script_generator`;
    
    try {
        console.log('🔍 发送健康检查请求到:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                action: 'health_check'
            })
        });
        
        console.log('📡 响应状态:', response.status, response.statusText);
        console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));
        
        // 获取响应文本
        const responseText = await response.text();
        console.log('📄 响应内容:', responseText);
        
        if (!responseText.trim()) {
            throw new Error('服务器返回空响应');
        }
        
        const result = JSON.parse(responseText);
        
        if (result.success) {
            console.log('✅ API健康检查通过');
            console.log('版本:', result.version);
            console.log('时间戳:', result.timestamp);
        } else {
            console.error('❌ API健康检查失败');
        }
        
        return result;
    } catch (error) {
        console.error('❌ 健康检查失败:', error);
        console.error('错误详情:', error.message);
        throw error;
    }
}

/**
 * 示例：生成剧本
 */
async function example() {
    // 示例小说内容（简化版本，减少请求大小）
    const novelContent = `
    在一个阳光明媚的下午，李明走进了那家熟悉的咖啡厅。他看到了坐在角落里的张雨，心中涌起一阵复杂的情绪。

    "好久不见。"李明走到张雨面前，轻声说道。

    张雨抬起头，眼中闪过一丝惊讶，然后露出了淡淡的笑容："是啊，好久不见了。"

    两人陷入了短暂的沉默。咖啡厅里播放着轻柔的音乐。

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

    两人相视而笑，然后各自走向不同的方向。
    `;
    
    try {
        // 1. 健康检查
        console.log('=== 健康检查 ===');
        await healthCheck();
        
        // 2. 生成剧本
        console.log('\n=== 生成剧本 ===');
        const script = await generateScript(novelContent, {
            model: 'deepseek-r1',
            language: 'zh-CN',
            style: '现代情感',
            max_scenes: 1  // 减少到1个场景，加快处理速度
        });
        
        // 3. 输出结果
        console.log('\n=== 生成结果 ===');
        console.log('剧本标题:', script.outline?.title);
        console.log('剧本大纲:', script.outline?.summary);
        console.log('角色数量:', script.characters?.length);
        console.log('场景数量:', script.scenes?.length);
        
        // 4. 详细输出
        console.log('\n=== 角色设定 ===');
        script.characters?.forEach((char, index) => {
            console.log(`${index + 1}. ${char.name}`);
            console.log(`   描述: ${char.description}`);
            console.log(`   性格: ${char.personality}`);
            console.log(`   角色: ${char.role}`);
            console.log('');
        });
        
        console.log('\n=== 分幕剧本 ===');
        script.scenes?.forEach((scene, index) => {
            console.log(`第${scene.scene_number}幕: ${scene.title}`);
            console.log(`场景: ${scene.setting?.time} - ${scene.setting?.location}`);
            console.log(`角色: ${scene.characters?.join(', ')}`);
            console.log(`对话数量: ${scene.dialogue?.length || 0}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('示例执行失败:', error);
    }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('⚠️  请先设置正确的API密钥');
        console.log('在client-example.js文件中修改API_KEY变量');
    } else {
        example();
    }
}

module.exports = {
    generateScript,
    healthCheck,
    example
};
