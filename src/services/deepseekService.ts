/**
 * DeepSeek API服务
 * 负责与DeepSeek API通信
 */

// DeepSeek API密钥
const DEEPSEEK_API_KEY = "sk-657e30eb77ba48e0834a0821dcd8279f";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * 生成DeepSeek AI内容
 * @param prompt 用户输入的提示
 * @returns 生成的文本内容
 */
export const generateDeepSeekContent = async (prompt: string): Promise<string> => {
  console.log("[DeepSeek] 开始生成内容");
  console.log("[DeepSeek] 提示词:", prompt);

  try {
    console.log("[DeepSeek] 准备发送请求到:", API_URL);
    console.log("[DeepSeek] 请求头:", {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY.substring(0, 8)}...`
    });

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    console.log("[DeepSeek] 请求体:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log("[DeepSeek] 收到响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DeepSeek] API错误响应:", errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log("[DeepSeek] 成功解析响应数据");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[DeepSeek] 响应数据格式错误:", data);
      throw new Error("API响应格式错误");
    }

    const content = data.choices[0].message.content;
    console.log("[DeepSeek] 生成的内容:", content);
    return content;
  } catch (error) {
    console.error("[DeepSeek] API调用失败:", error);
    if (error instanceof Error) {
      console.error("[DeepSeek] 错误详情:", error.message);
      console.error("[DeepSeek] 错误堆栈:", error.stack);
    }
    return "抱歉，在生成内容时发生错误。请稍后再试。";
  }
}

/**
 * 检查DeepSeek API是否可用
 * @returns API状态
 */
export const checkDeepSeekApiStatus = async (): Promise<boolean> => {
  console.log("[DeepSeek] 开始检查API状态");
  try {
    console.log("[DeepSeek] 发送状态检查请求到:", `${API_URL}?check=true`);
    const response = await fetch(`${API_URL}?check=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      }
    });
    console.log("[DeepSeek] 状态检查响应:", response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error("[DeepSeek] API状态检查失败:", error);
    if (error instanceof Error) {
      console.error("[DeepSeek] 错误详情:", error.message);
      console.error("[DeepSeek] 错误堆栈:", error.stack);
    }
    return false;
  }
} 