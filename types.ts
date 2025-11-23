export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type: 'text' | 'image' | 'transfer' | 'voice';
  timestamp: number;
  amount?: number; // For transfer
  imageUrl?: string; // For image
}

export interface Character {
  id: string;
  name: string;
  avatar: string; // URL
  standee: string; // URL for full body in activity mode
  personality: string;
  appearance: string;
  speakingStyle: string;
  relationship: string;
}

export interface Moment {
  id: string;
  authorId: string; // 'user' or characterId
  content: string;
  images: string[];
  timestamp: number;
  likes: string[]; // List of names
  comments: { author: string; content: string }[];
}

export type AppMode = 'setup' | 'dashboard' | 'phone' | 'activity';
export type PhoneView = 'chatList' | 'chatRoom' | 'moments';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: '1',
    name: '夏薇',
    avatar: 'https://picsum.photos/seed/xiawei/200/200',
    standee: 'https://picsum.photos/seed/xiaweistand/400/800',
    personality: '傲娇，嘴硬心软，非常护短。内心细腻但表面强势。',
    appearance: '黑色长直发，通常穿着时尚的街头风格衣服。',
    speakingStyle: '短句，偶尔带点讽刺，很少直接承认自己的感情。',
    relationship: '青梅竹马'
  }
];