/**
 * DeepSeek API服务
 * 负责与DeepSeek API通信
 */

// DeepSeek API密钥
const DEEPSEEK_API_KEY = "sk-a66b3a944d5441469d3bd013b8f43cf7";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * 生成DeepSeek AI内容
 * @param prompt 用户输入的提示
 * @returns 生成的文本内容
 */
export async function generateDeepSeekContent(prompt: string): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API调用失败:", error);
    return "抱歉，在生成内容时发生错误。请稍后再试。";
  }
}

/**
 * 检查DeepSeek API是否可用
 * @returns API状态
 */
export async function checkDeepSeekApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}?check=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error("DeepSeek API状态检查失败:", error);
    return false;
  }
} 