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

export enum Weather {
  SUNNY = 'Sunny',
  RAINY = 'Rainy',
  CLOUDY = 'Cloudy',
  NIGHT = 'Night'
}

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Xia Wei',
    avatar: 'https://picsum.photos/seed/xiawei/200/200',
    standee: 'https://picsum.photos/seed/xiaweistand/400/800',
    personality: 'Tsundere, protective but sharp-tongued. Secretly cares deeply.',
    appearance: 'Black long hair, usually wears streetwear.',
    speakingStyle: 'Short sentences, uses sarcasm. Rarely admits feelings directly.',
    relationship: 'Childhood friend'
  }
];