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

    // 1. Optimistic Update
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: type === 'transfer' ? `转账 ¥100.00` : text,
      type: type,
      timestamp: Date.now(),
      amount: type === 'transfer' ? 100 : undefined,
      imageUrl: type === 'image' ? text : undefined 
    };

    setChatHistory(prev => {
        const charHistory = prev[activeCharId] || [];
        return {
            ...prev,
            [activeCharId]: [...charHistory, newMessage]
        };
    });

    // 2. API Call
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

            setChatHistory(prev => {
                const charHistory = prev[activeCharId] || [];
                return {
                    ...prev,
                    [activeCharId]: [...charHistory, aiMessage]
                };
            });
    }
  }, [activeCharId, characters, chatHistory]);

  // --- Handlers ---

  const handleCreateChar = (char: Character) => {
    setCharacters(prev => [...prev, char]);
    setMode('dashboard');
  };

  const handleRefreshMoments = async () => {
    if (characters.length === 0) return;
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
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')` }}
      />
      {/* Colorful Overlay Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-oil-sunset/40 via-oil-sun/20 to-oil-water/40 mix-blend-overlay"></div>
      
      {/* Title Section - Adjusted Margin */}
      <div className="relative z-10 text-center mb-16 p-6 bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl max-w-xl mx-4 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          AI SoulMate
        </h1>
        <p className="font-serif italic text-oil-base text-base drop-shadow-md">
          记忆的画布，绘着阳光与海。
        </p>
      </div>

      {/* Main Actions - Resize to approx 1/8 screen height (~112px/28rem) */}
      <div className="relative z-10 flex flex-row gap-12 items-center justify-center w-full px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Phone Button */}
        <button 
          onClick={() => setMode('phone')}
          className="group relative w-28 h-28 md:w-32 md:h-32 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-white/60 shadow-[0_10px_30px_rgba(255,112,67,0.3)] hover:shadow-[0_20px_50px_rgba(255,112,67,0.5)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-oil-sun/10 to-oil-sunset/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="bg-gradient-to-br from-oil-sunset to-oil-sun p-3 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform duration-300">
             <Smartphone size={28} />
          </div>
          <span className="font-serif font-bold text-oil-contrast text-sm md:text-base">联络</span>
        </button>

        {/* Activity Button */}
        <button 
          onClick={() => {
              if (characters.length > 0) {
                  setActiveCharId(characters[0].id);
                  setMode('activity');
              } else {
                  alert("请先创造一个角色。");
              }
          }}
          className="group relative w-28 h-28 md:w-32 md:h-32 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-white/60 shadow-[0_10px_30px_rgba(41,182,246,0.3)] hover:shadow-[0_20px_50px_rgba(41,182,246,0.5)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-oil-water/10 to-oil-deepSea/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="bg-gradient-to-br from-oil-water to-oil-deepSea p-3 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform duration-300">
             <MapPin size={28} />
          </div>
          <span className="font-serif font-bold text-oil-contrast text-sm md:text-base">探索</span>
        </button>
      </div>

      {/* Footer / Setup Actions */}
      <div className="relative z-10 mt-16 flex flex-wrap justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <button 
            onClick={() => setMode('setup')}
            className="flex items-center gap-2 bg-oil-base/90 hover:bg-white text-oil-contrast px-5 py-2 rounded-full transition-all duration-300 font-serif font-bold border border-oil-sun shadow-lg text-xs md:text-sm"
        >
            <Palette size={14} className="text-oil-sunset" />
            创造角色
        </button>
        <div className="flex items-center gap-2 bg-oil-deepSea/80 backdrop-blur text-white px-5 py-2 rounded-full border border-oil-water/50 font-serif shadow-lg text-xs md:text-sm">
            <Users size={14} />
            {characters.length} 位角色
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-oil-base canvas-bg font-sans">
      {mode === 'dashboard' && renderDashboard()}
      
      {mode === 'setup' && (
        <SetupInterface 
          onSave={handleCreateChar} 
          onCancel={() => setMode('dashboard')} 
        />
      )}

      {mode === 'phone' && (
        <div className="flex items-center justify-center h-full p-0 md:p-4 bg-oil-contrast/40 backdrop-blur-sm">
             {/* Phone Container - Vibrant Gold/Copper Frame */}
            <div className="h-full w-full md:max-w-[420px] md:max-h-[850px] bg-wx-bg md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative md:border-[6px] md:border-oil-wood overflow-hidden ring-0 md:ring-4 ring-oil-sun/60">
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