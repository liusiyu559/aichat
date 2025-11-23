export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type: 'text' | 'image' | 'transfer' | 'voice' | 'sticker';
  timestamp: number;
  amount?: number; // For transfer
  imageUrl?: string; // For image or sticker
  scene: 'phone' | 'activity'; // NEW: Context of the message
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
  background: string; // Experience/History
  chatFrequency: string; // New: Frequency setting (e.g., 'high', 'medium', 'low')
  gender: 'male' | 'female' | 'other'; // New: Gender for Voice
  chatBackground?: string; // Custom background for phone chat
  memory: string[]; // List of summarized memories
}

export interface UserProfile {
  name: string;
  avatar: string;
  standee: string;
  personality: string;
  appearance: string;
  background: string;
}

export interface Sticker {
  id: string;
  url: string;
}

export interface BackgroundItem {
  id: string;
  name: string; // e.g., "Bedroom", "Beach"
  url: string;
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
export type PhoneView = 'chatList' | 'chatRoom' | 'moments' | 'contacts' | 'me';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: '1',
    name: '陈云川',
    avatar: 'https://files.catbox.moe/8s12f7.jpeg',
    standee: 'https://files.catbox.moe/2l76hv.png',
    personality: '糙汉，对你有着强烈的占有欲和生理欲望。白手起家，在S市手握半城命脉。30岁，身高198cm，肌肉发达，性格强势霸道，但也是个宠妻狂魔。',
    appearance: '198cm高大身材，肩宽腰窄，五官帅气硬朗，肌肉发达，通常穿着解开扣子的衬衫，充满雄性荷尔蒙。',
    speakingStyle: '粗俗白话，经常带脏字（TMD、老子等），心直口快，有话直说不遮掩，言语中充满欲望。',
    relationship: '合法丈夫',
    background: '半年前，你父亲因欠下巨额债务，为了借钱带你去了他的别墅。他对你一见钟情，当场撕毁欠条，强行拉着你扯了证结婚。虽然开始得很荒唐，但他确实把你捧在手心里。',
    chatFrequency: 'high',
    gender: 'male',
    memory: ['【初始设定】性格：糙汉霸道；经历：撕毁欠条强娶。']
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '我',
  avatar: 'https://picsum.photos/seed/me/200/200',
  standee: 'https://picsum.photos/seed/mestand/400/800',
  personality: '温柔，随和，富有同情心。',
  appearance: '身材匀称，眼神清澈。',
  background: '一名普通的大学生，正在探索这个世界。'
};

export const INITIAL_BACKGROUNDS: BackgroundItem[] = [
    { id: 'bg1', name: '夜晚卧室', url: 'https://files.catbox.moe/k6wjs8.png' },
    { id: 'bg2', name: '海边', url: 'https://files.catbox.moe/l0orzq.jpeg' },
    { id: 'bg3', name: '客厅', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80' },
    { id: 'bg4', name: '商场', url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?auto=format&fit=crop&w=1600&q=80' },
];

export const INITIAL_STICKERS: Sticker[] = [
    { id: 's1', url: 'https://files.catbox.moe/oqpdk2.jpg' },
    { id: 's2', url: 'https://files.catbox.moe/3ccltl.jpg' },
    { id: 's3', url: 'https://files.catbox.moe/obkwjp.jpg' },
    { id: 's4', url: 'https://files.catbox.moe/5788u9.jpg' },
    { id: 's5', url: 'https://files.catbox.moe/bbz1rq.jpg' },
    { id: 's6', url: 'https://files.catbox.moe/ihw69u.jpg' },
    { id: 's7', url: 'https://files.catbox.moe/oio9o4.jpg' },
    { id: 's8', url: 'https://files.catbox.moe/2d631z.jpg' },
    { id: 's9', url: 'https://files.catbox.moe/cxhm04.jpg' },
    { id: 's10', url: 'https://files.catbox.moe/0r3zrs.jpg' },
    { id: 's11', url: 'https://files.catbox.moe/nwpkui.jpg' },
    { id: 's12', url: 'https://files.catbox.moe/b0ruj0.jpg' },
    { id: 's13', url: 'https://files.catbox.moe/ix2ip7.jpg' },
    { id: 's14', url: 'https://files.catbox.moe/y0o5o7.jpg' },
    { id: 's15', url: 'https://files.catbox.moe/7d5oag.jpg' },
    { id: 's16', url: 'https://files.catbox.moe/58d2j3.jpg' },
    { id: 's17', url: 'https://files.catbox.moe/vnalp5.jpg' },
    { id: 's18', url: 'https://files.catbox.moe/tn3nz6.jpg' },
    { id: 's19', url: 'https://files.catbox.moe/6v9aph.jpg' },
    { id: 's20', url: 'https://files.catbox.moe/4yr1q5.jpg' },
    { id: 's21', url: 'https://files.catbox.moe/tknqt3.jpg' },
    { id: 's22', url: 'https://files.catbox.moe/a5i52e.jpg' },
    { id: 's23', url: 'https://files.catbox.moe/qn3okk.jpg' },
    { id: 's24', url: 'https://files.catbox.moe/knanvl.jpg' },
];
