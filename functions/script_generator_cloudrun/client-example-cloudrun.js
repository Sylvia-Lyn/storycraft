/**
 * 云托管客户端调用示例
 * 展示如何从客户端调用迁移后的云托管函数
 */

// 模拟小程序环境中的调用方式
class CloudRunClient {
    constructor(envId) {
        this.envId = envId;
        this.serviceName = 'script_generator_cloudrun';
    }

    /**
     * 调用云托管函数
     * @param {Object} data 请求数据
     * @returns {Promise<Object>} 响应结果
     */
    async callScriptGenerator(data) {
        // 模拟 wx.cloud.Cloud 的调用方式
        const requestData = {
            path: "/",  // 请求路径
            header: {
                "X-WX-SERVICE": this.serviceName,  // 服务名称
                "Authorization": "Bearer storycraft_script_2024_secure",
                "Content-Type": "application/json"
            },
            method: "POST",
            data: data
        };

        console.log('调用云托管函数:', JSON.stringify(requestData, null, 2));
        
        // 这里应该使用实际的云托管调用
        // 在真实环境中，这里会是:
        // const c1 = new wx.cloud.Cloud({ resourceEnv: this.envId });
        // await c1.init();
        // return await c1.callContainer(requestData);
        
        // 模拟响应
        return {
            success: true,
            message: '这是模拟响应，实际部署后需要调用真实的云托管服务'
        };
    }

    /**
     * 健康检查
     * @returns {Promise<Object>} 健康状态
     */
    async healthCheck() {
        const requestData = {
            path: "/health",
            header: {
                "X-WX-SERVICE": this.serviceName,
                "Content-Type": "application/json"
            },
            method: "GET"
        };

        console.log('健康检查:', JSON.stringify(requestData, null, 2));
        
        // 模拟响应
        return {
            success: true,
            message: 'Script Generator CloudRun API is healthy',
            deployment_type: 'cloudrun'
        };
    }
}

// 使用示例
async function demonstrateUsage() {
    console.log('=== 云托管客户端调用示例 ===\n');

    const client = new CloudRunClient('stroycraft-1ghmi4ojd3b4a20b');

    // 1. 健康检查
    console.log('1. 健康检查:');
    try {
        const healthResult = await client.healthCheck();
        console.log('健康检查结果:', JSON.stringify(healthResult, null, 2));
    } catch (error) {
        console.error('健康检查失败:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 2. 剧本生成
    console.log('2. 剧本生成:');
    const scriptData = {
        novel_content: `在一个阳光明媚的早晨，小明走在去学校的路上。他心情很好，因为今天要考试，他昨晚复习得很充分。

"小明！"一个熟悉的声音从身后传来。小明回头一看，是他的好朋友小红。

"小红，早上好！"小明高兴地打招呼。

"你今天看起来很有信心呢。"小红笑着说。

"是的，我昨晚复习到很晚，应该没问题。"小明自信地回答。

两人一起走向学校，讨论着即将到来的考试。小明觉得有朋友的陪伴，考试也变得不那么紧张了。`,
        options: {
            model: 'deepseek-r1',
            language: 'zh-CN',
            max_scenes: 3,
            include_dialogue: true
        }
    };

    try {
        const scriptResult = await client.callScriptGenerator(scriptData);
        console.log('剧本生成结果:', JSON.stringify(scriptResult, null, 2));
    } catch (error) {
        console.error('剧本生成失败:', error);
    }
}

// 小程序中的实际调用代码示例
function generateMiniProgramCode() {
    console.log('\n=== 小程序中的实际调用代码 ===\n');
    
    const miniProgramCode = `
// 小程序中的云托管调用代码
Page({
  data: {
    novelContent: '',
    scriptResult: null,
    loading: false
  },

  // 生成剧本
  async generateScript() {
    if (!this.data.novelContent.trim()) {
      wx.showToast({
        title: '请输入小说内容',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 初始化云托管客户端
      const c1 = new wx.cloud.Cloud({
        resourceEnv: 'stroycraft-1ghmi4ojd3b4a20b'  // 环境ID
      });
      await c1.init();

      // 调用云托管函数
      const result = await c1.callContainer({
        path: '/',  // 请求路径
        header: {
          'X-WX-SERVICE': 'script_generator_cloudrun',  // 服务名称
          'Authorization': 'Bearer storycraft_script_2024_secure'
        },
        method: 'POST',
        data: {
          novel_content: this.data.novelContent,
          options: {
            model: 'deepseek-r1',
            language: 'zh-CN',
            max_scenes: 5,
            include_dialogue: true
          }
        }
      });

      if (result.success) {
        this.setData({
          scriptResult: result.data
        });
        wx.showToast({
          title: '生成成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.error || '生成失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('调用失败:', error);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 健康检查
  async checkHealth() {
    try {
      const c1 = new wx.cloud.Cloud({
        resourceEnv: 'stroycraft-1ghmi4ojd3b4a20b'
      });
      await c1.init();

      const result = await c1.callContainer({
        path: '/health',
        header: {
          'X-WX-SERVICE': 'script_generator_cloudrun'
        },
        method: 'GET'
      });

      console.log('健康检查结果:', result);
    } catch (error) {
      console.error('健康检查失败:', error);
    }
  }
});
`;

    console.log(miniProgramCode);
}

// 运行示例
if (require.main === module) {
    demonstrateUsage()
        .then(() => {
            generateMiniProgramCode();
        })
        .catch(error => {
            console.error('示例运行失败:', error);
        });
}

module.exports = {
    CloudRunClient,
    demonstrateUsage,
    generateMiniProgramCode
};
