import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { Character, Message, Moment, UserProfile, BackgroundItem } from "../types";

// Helper to get API Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert URL to Gemini Inline Data Part
const urlToPart = async (url: string): Promise<Part | null> => {
  try {
    // If already Base64
    if (url.startsWith('data:')) {
      const match = url.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        };
      }
    }

    // If Remote URL (try to fetch)
    // Note: This relies on the server supporting CORS. Catbox usually does.
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    
    return new Promise<Part | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const match = base64data.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          resolve({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        } else {
          resolve(null);
        }
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Error processing image url:", e);
    return null;
  }
};

// Summarize conversation into long-term memory
export const summarizeMemory = async (
  characterName: string,
  userName: string,
  messages: Message[]
): Promise<string> => {
  const ai = getClient();
  const conversationText = messages.map(m => `${m.sender === 'user' ? userName : characterName}: ${m.text}`).join('\n');
  
  const prompt = `
  请总结以下 ${characterName} 和 ${userName} 之间的对话内容。
  提取关键事件、情感变化和重要信息，浓缩成一段 50-100 字的记忆片段。
  直接输出总结，不要包含其他套话。
  
  对话内容：
  ${conversationText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Memory Summarization Error:", error);
    return "";
  }
};

// Generate Chat Response
export const generateChatResponse = async (
  character: Character,
  userProfile: UserProfile,
  history: Message[],
  userMessage: string,
  scene: 'phone' | 'activity',
  location?: string
): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  let frequencyInstruction = "";
  if (scene === 'phone') {
      switch (character.chatFrequency) {
        case 'high':
          frequencyInstruction = "聊天频率：活跃。必须回复 5 到 10 条独立的消息。每条消息字数控制在 16-30 字之间。消息之间用 '|||' 分隔。";
          break;
        case 'low':
          frequencyInstruction = "聊天频率：高冷。回复 0 到 2 条消息。每条消息字数控制在 3-16 字之间。消息之间用 '|||' 分隔。";
          break;
        default:
          frequencyInstruction = "聊天频率：正常。回复 3 到 5 条消息。每条消息字数控制在 16-30 字之间。消息之间用 '|||' 分隔。";
          break;
      }
  }

  // Incorporate Long-Term Memory
  const memoryContext = character.memory && character.memory.length > 0 
    ? `【长期记忆/过往经历】：\n${character.memory.join('\n')}` 
    : "【长期记忆】：暂无";

  let systemInstruction = `你正在扮演 ${character.name}。
  语言要求：必须完全使用中文（简体）。
  
  【你的角色设定】
  性别：${character.gender === 'male' ? '男' : '女'}
  性格：${character.personality}。
  外貌：${character.appearance}。
  说话风格：${character.speakingStyle}。
  经历/背景：${character.background}。
  与用户的关系：${character.relationship}。

  ${memoryContext}

  【对话对象（用户）设定】
  名字：${userProfile.name}
  性格：${userProfile.personality}
  外貌：${userProfile.appearance}
  经历：${userProfile.background}
  
  当前场景：${scene === 'phone' ? '我们在手机聊天软件（微信）上聊天。' : `我们在现实生活中的地点：${location || '某个地方'}。`}
  `;

  if (scene === 'phone') {
    systemInstruction += `
    【手机聊天模式严格规则】：
    1. 绝对禁止使用括号 ()、[] 或星号 * 来描述任何动作、表情或心理活动。
    2. 必须完全模拟真实的线上聊天。
    3. ${frequencyInstruction}
    4. 只有纯文字内容。可以适当使用 Emoji。
    5. 把用户当作亲密的朋友/伴侣。
    `;
  } else {
    systemInstruction += `
    【剧情/活动模式严格规则】：
    1. **核心原则**：你必须严格使用第一人称“我”来指代${character.name}。
    2. **绝对禁忌**：你绝对**不可以**代替用户（${userProfile.name}）说话、描写用户的动作或心理活动。你只能描写${character.name}自己的言行和心理。
    3. **格式严格要求**：
       - 动作、神态描写必须写在圆括号 () 内。
       - 心理活动必须写在方括号 [] 内。
       - 说话内容写在双引号 "" 内。
       - **重要**：每种类型的内容（动作、心理、对话）必须分别单独起一行。不要写在同一行。
    4. 结合环境描写，与环境 "${location}" 互动。
    5. 像写第一人称小说一样展开剧情。
    `;
  }

  // Handle Multimodal Input (Last message image)
  const lastMsg = history[history.length - 1];
  const parts: Part[] = [];

  // Construct text history
  const conversationHistory = history.map(msg => {
    // If it's the last message and it's an image, we handle it separately below via parts
    if (msg.id === lastMsg.id && (msg.type === 'image' || msg.type === 'sticker')) {
        return `${msg.sender === 'user' ? userProfile.name : character.name}: [发送了一张图片/表情包]`;
    }
    const content = msg.type === 'image' ? '[图片]' : (msg.type === 'sticker' ? '[表情包]' : (msg.type === 'transfer' ? `[转账 ${msg.amount}元]` : msg.text));
    return `${msg.sender === 'user' ? userProfile.name : character.name}: ${content}`;
  }).join('\n');

  // Add History Context
  parts.push({ text: `${conversationHistory}\n${character.name}:` });

  // If the last message was an image/sticker from user, add the image data
  if (lastMsg && lastMsg.sender === 'user' && (lastMsg.type === 'image' || lastMsg.type === 'sticker') && lastMsg.imageUrl) {
      const imagePart = await urlToPart(lastMsg.imageUrl);
      if (imagePart) {
          parts.push(imagePart);
          parts.push({ text: "\n(用户发送了这张图片/表情包，请根据图片内容和上下文进行回复)" });
      }
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: parts }],
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
      角色性格：${character.personality}。
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

// Reply to a Moment Comment
export const generateCommentReply = async (character: Character, userProfile: UserProfile, momentContent: string, userComment: string): Promise<string> => {
  const ai = getClient();
  const prompt = `
    你正在扮演 ${character.name}。
    你在朋友圈发了一条动态：“${momentContent}”
    你的好友 ${userProfile.name} 评论说：“${userComment}”
    请根据你的性格回复这条评论。回复要简短自然，像在朋友圈回复朋友一样。
    直接输出回复内容，不要包含名字前缀。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "哈哈";
  } catch (error) {
    return "😂";
  }
};

// Analyze conversation to generate a scene background keyword
export const analyzeContextForScene = async (history: Message[], availableScenes: BackgroundItem[]): Promise<string> => {
    const ai = getClient();
    const recentMsgs = history.slice(-10).map(m => m.text).join('\n');
    const sceneNames = availableScenes.map(s => s.name).join(', ');
    
    const prompt = `Based on the conversation below, determine which scene from the available list best matches the current context.
    
    Available Scenes: [${sceneNames}]
    
    Conversation:
    ${recentMsgs}
    
    Return ONLY the exact name of the scene from the list. If none match perfectly, choose the closest one or "Cozy Room".
    Location Name:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const result = response.text?.trim() || "";
        // Find match
        const match = availableScenes.find(s => result.includes(s.name));
        return match ? match.name : "Cozy Room";
    } catch (e) {
        return "Cozy Room";
    }
}

// Generate Image wrapper
export const getBackgroundUrl = (keyword: string): string => {
   // Use keyword + 'interior' or 'scenery' to get better picsum results
   const safeKeyword = encodeURIComponent(keyword + ' scenery');
   return `https://picsum.photos/seed/${safeKeyword}/800/1000`;
}