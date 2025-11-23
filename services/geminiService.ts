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
  const modelId = "gemini-2.5-flash"; // Fast and good for chat

  let systemInstruction = `You are roleplaying as ${character.name}. 
  Your personality: ${character.personality}.
  Your appearance: ${character.appearance}.
  Your speaking style: ${character.speakingStyle}.
  Your relationship to the user: ${character.relationship}.
  
  Current Context: ${scene === 'phone' ? 'We are chatting on a mobile messenger app (like WeChat).' : `We are hanging out in real life at: ${location || 'a random place'}.`}
  `;

  if (scene === 'phone') {
    systemInstruction += `
    CRITICAL RULES FOR PHONE MODE:
    1. DO NOT describe actions or internal thoughts in parentheses or asterisks.
    2. Only send what you would type in a text message.
    3. You can use emojis.
    4. Keep messages relatively short and casual.
    5. Treat the user as a close friend/contact.
    `;
  } else {
    systemInstruction += `
    CRITICAL RULES FOR ACTIVITY MODE:
    1. You MUST describe your physical actions, facial expressions, and internal thoughts using parentheses ().
    2. Example: (Looks away shyly) I guess that's okay.
    3. Be descriptive about the environment if relevant.
    4. Interact with the environment "${location}".
    `;
  }

  // Convert history to prompt format
  const conversationHistory = history.map(msg => 
    `${msg.sender === 'user' ? 'User' : character.name}: ${msg.text}`
  ).join('\n');

  const prompt = `${conversationHistory}\nUser: ${userMessage}\n${character.name}:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // slightly creative
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "(Network error, please try again)";
  }
};

// Generate Scene Background Description (for Activity Mode)
export const generateSceneDescription = async (
  locationType: string
): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Describe a visual scene background for a visual novel. Location: ${locationType}. 
      Return ONLY the visual description suitable for an image generator prompt. detailed, anime style, background art.`,
    });
    return response.text || "A beautiful room";
  } catch (e) {
    return "A general room background";
  }
};

// Generate a "Moment" (Social Post)
export const generateMoment = async (character: Character): Promise<Moment> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a realistic social media post for ${character.name}.
      Context: They are living their daily life.
      Format: JSON object with 'content' (text of post).`,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      authorId: character.id,
      content: data.content || "Just chilling...",
      images: [`https://picsum.photos/seed/${Date.now()}/400/300`], // Placeholder for stability
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
  } catch (e) {
    return {
      id: Date.now().toString(),
      authorId: character.id,
      content: "Lovely day today! ☀️",
      images: [],
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
  }
};

// Generate Image (Simulated wrapper or actual if desired, used for backgrounds if key allows)
// Using placeholder logic mostly to ensure speed/reliability in this demo format, 
// but code is structured to allow switching to imagen.
export const getBackgroundUrl = (keyword: string): string => {
   return `https://picsum.photos/seed/${keyword}/800/600`;
}