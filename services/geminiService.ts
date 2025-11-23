import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Character, Message, Moment } from "../types";

// Helper to get API Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Generate Chat Response
export const generateChatResponse = async (
  character: Character,
  history: Message[],
  userMessage: string,
  scene: 'phone' | 'activity',
  location?: string
): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  let systemInstruction = `你正在扮演 ${character.name}。
  语言要求：必须完全使用中文（简体）。
  
  你的性格：${character.personality}。
  你的外貌：${character.appearance}。
  你的说话风格：${character.speakingStyle}。
  你与用户的关系：${character.relationship}。
  
  当前场景：${scene === 'phone' ? '我们在手机聊天软件（微信）上聊天。' : `我们在现实生活中的地点：${location || '某个地方'}。`}
  `;

  if (scene === 'phone') {
    systemInstruction += `
    手机模式严格规则：
    1. 禁止使用括号 () 或星号 * 来描述动作或心理活动。
    2. 只发送你在短信中会打出来的文字。
    3. 可以适当使用 Emoji 表情。
    4. 保持回复相对简短、日常。
    5. 把用户当作亲密的朋友。
    6. 语言：中文。
    `;
  } else {
    systemInstruction += `
    活动模式严格规则：
    1. 你必须使用括号 () 来详细描述你的肢体动作、面部表情和心理活动。
    2. 例如：(害羞地移开视线) 我觉得那样也行...
    3. 结合环境描写。
    4. 与环境 "${location}" 互动。
    5. 语言：中文。
    `;
  }

  // Convert history to prompt format
  const conversationHistory = history.map(msg => 
    `${msg.sender === 'user' ? '用户' : character.name}: ${msg.text}`
  ).join('\n');

  const prompt = `${conversationHistory}\n用户: ${userMessage}\n${character.name}:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "(网络小差，请重试)";
  }
};

// Generate a "Moment" (Social Post)
export const generateMoment = async (character: Character): Promise<Moment> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `生成一条 ${character.name} 的朋友圈内容。
      语境：日常生活。
      格式：JSON 对象，包含 'content' (朋友圈文案，中文)。`,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      authorId: character.id,
      content: data.content || "今天天气真不错~",
      images: [`https://picsum.photos/seed/${Date.now()}/400/300`],
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
  } catch (error) {
    console.error("Generate Moment Error:", error);
    return {
      id: Date.now().toString(),
      authorId: character.id,
      content: "今天心情很好！☀️",
      images: [],
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
  }
};

// Generate Image wrapper
export const getBackgroundUrl = (keyword: string): string => {
   return `https://picsum.photos/seed/${keyword}/800/600`;
}