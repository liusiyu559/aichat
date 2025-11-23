import React, { useState, useCallback } from 'react';
import { Smartphone, MapPin, Users, Palette } from 'lucide-react';
import { AppMode, Character, Message, Moment, INITIAL_CHARACTERS } from './types';
import PhoneInterface from './components/PhoneInterface';
import ActivityInterface from './components/ActivityInterface';
import SetupInterface from './components/SetupInterface';
import { generateChatResponse, generateMoment } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  
  // Shared Chat History keyed by Character ID
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  
  // Moments
  const [moments, setMoments] = useState<Moment[]>([
    {
      id: 'init-1',
      authorId: '1',
      content: '落日的余晖总是让人想起那幅油画...',
      images: ['https://picsum.photos/seed/art/300/300'],
      timestamp: Date.now() - 1000000,
      likes: ['我'],
      comments: []
    }
  ]);

  // Handle Sending Messages
  const handleSendMessage = useCallback(async (text: string, type: 'text' | 'image' | 'transfer' = 'text', fromMode: 'phone' | 'activity') => {
    if (!activeCharId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: type === 'transfer' ? `转账 ¥100.00` : text,
      type: type,
      timestamp: Date.now(),
      amount: type === 'transfer' ? 100 : undefined,
      imageUrl: type === 'image' ? text : undefined 
    };

    setChatHistory(prev => ({
      ...prev,
      [activeCharId]: [...(prev[activeCharId] || []), newMessage]
    }));

    const character = characters.find(c => c.id === activeCharId);
    if (character) {
            const currentHistory = [...(chatHistory[activeCharId] || []), newMessage];
            const responseText = await generateChatResponse(
                character,
                currentHistory,
                type === 'transfer' ? "(用户发起了转账)" : (type === 'image' ? "(用户发送了一张图片)" : text),
                fromMode
            );

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: responseText,
                type: 'text',
                timestamp: Date.now()
            };

            setChatHistory(prev => ({
                ...prev,
                [activeCharId]: [...(prev[activeCharId] || []), aiMessage]
            }));
    }
  }, [activeCharId, characters, chatHistory]);

  // --- Handlers ---

  const handleCreateChar = (char: Character) => {
    setCharacters(prev => [...prev, char]);
    setMode('dashboard');
  };

  const handleRefreshMoments = async () => {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    const newMoment = await generateMoment(randomChar);
    setMoments(prev => [newMoment, ...prev]);
  };

  const handleLikeMoment = (id: string) => {
      setMoments(prev => prev.map(m => {
          if (m.id === id) {
              const liked = m.likes.includes('我');
              return {
                  ...m,
                  likes: liked ? m.likes.filter(l => l !== '我') : [...m.likes, '我']
              }
          }
          return m;
      }))
  }

  // --- Views ---

  const renderDashboard = () => (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {/* Vibrant Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')` }} // Sunny beach/sunset vibe
      />
      {/* Colorful Overlay Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-oil-sunset/40 via-oil-sun/20 to-oil-water/40 mix-blend-overlay"></div>
      
      <div className="relative z-10 text-center mb-10 p-8 bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl max-w-2xl mx-4">
        <h1 className="text-6xl md:text-7xl font-display font-bold mb-2 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          AI 伴侣 OS
        </h1>
        <p className="font-serif italic text-oil-base text-xl drop-shadow-md">
          记忆的画布，绘着阳光与海。
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Phone Button - Warm/Sunset Theme */}
        <button 
          onClick={() => setMode('phone')}
          className="group relative overflow-hidden rounded-2xl border-2 border-white/50 hover:border-oil-sun transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(255,152,0,0.6)] bg-white/80 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-oil-sun/20 to-oil-sunset/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-oil-sunset to-oil-sun p-5 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 text-white">
              <Smartphone size={48} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-oil-contrast mb-2">联络</h2>
            <p className="font-body text-oil-wood/80 text-center italic">
              在金色的阳光下畅聊。
            </p>
          </div>
        </button>

        {/* Activity Button - Cool/Water Theme */}
        <button 
          onClick={() => {
              if (characters.length > 0) {
                  setActiveCharId(characters[0].id);
                  setMode('activity');
              } else {
                  alert("请先创造一个角色。");
              }
          }}
          className="group relative overflow-hidden rounded-2xl border-2 border-white/50 hover:border-oil-water transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(3,169,244,0.6)] bg-white/80 backdrop-blur-sm"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-oil-water/20 to-oil-deepSea/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-oil-water to-oil-deepSea p-5 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 text-white">
              <MapPin size={48} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-oil-contrast mb-2">探索</h2>
            <p className="font-body text-oil-wood/80 text-center italic">
              漫步在蔚蓝海岸。
            </p>
          </div>
        </button>
      </div>

      <div className="relative z-10 mt-16 flex gap-6">
        <button 
            onClick={() => setMode('setup')}
            className="flex items-center gap-3 bg-oil-base text-oil-contrast px-8 py-3 rounded-full hover:bg-white transition-colors duration-300 font-serif font-bold border border-oil-sun shadow-xl"
        >
            <Palette size={20} className="text-oil-sunset" />
            创造角色
        </button>
        <div className="flex items-center gap-3 bg-oil-deepSea/80 backdrop-blur text-white px-8 py-3 rounded-full border border-oil-water/50 font-serif shadow-lg">
            <Users size={20} />
            {characters.length} 位角色
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-oil-base canvas-bg">
      {mode === 'dashboard' && renderDashboard()}
      
      {mode === 'setup' && (
        <SetupInterface 
          onSave={handleCreateChar} 
          onCancel={() => setMode('dashboard')} 
        />
      )}

      {mode === 'phone' && (
        <div className="flex items-center justify-center h-full p-4 bg-oil-contrast/40 backdrop-blur-sm">
             {/* Phone Container - Vibrant Gold/Copper Frame */}
            <div className="h-full w-full max-w-[420px] max-h-[850px] bg-wx-bg rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative border-[6px] border-oil-wood overflow-hidden ring-4 ring-oil-sun/60">
                <PhoneInterface 
                    characters={characters}
                    activeCharacterId={activeCharId}
                    chatHistory={chatHistory}
                    onSelectCharacter={setActiveCharId}
                    onSendMessage={(txt, type) => handleSendMessage(txt, type, 'phone')}
                    onBack={() => setMode('dashboard')}
                    moments={moments}
                    onRefreshMoments={handleRefreshMoments}
                    onLikeMoment={handleLikeMoment}
                />
            </div>
        </div>
      )}

      {mode === 'activity' && activeCharId && (
         <ActivityInterface 
            character={characters.find(c => c.id === activeCharId)!}
            chatHistory={chatHistory[activeCharId] || []}
            onSendMessage={(txt) => handleSendMessage(txt, 'text', 'activity')}
            onBack={() => setMode('dashboard')}
         />
      )}
    </div>
  );
};

export default App;