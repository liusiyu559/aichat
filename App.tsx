import React, { useState, useCallback } from 'react';
import { Smartphone, MapPin, Settings, PlusCircle, Users, Palette } from 'lucide-react';
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
      content: 'The sunset colors reminded me of that painting we saw...',
      images: ['https://picsum.photos/seed/art/300/300'],
      timestamp: Date.now() - 1000000,
      likes: ['Me'],
      comments: []
    }
  ]);

  // Handle Sending Messages
  const handleSendMessage = useCallback(async (text: string, type: 'text' | 'image' | 'transfer' = 'text', fromMode: 'phone' | 'activity') => {
    if (!activeCharId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: type === 'transfer' ? `Transferred ¥100.00` : text,
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
                type === 'transfer' ? "(User sent money)" : (type === 'image' ? "(User sent an image)" : text),
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
              const liked = m.likes.includes('Me');
              return {
                  ...m,
                  likes: liked ? m.likes.filter(l => l !== 'Me') : [...m.likes, 'Me']
              }
          }
          return m;
      }))
  }

  // --- Views ---

  const renderDashboard = () => (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url('https://picsum.photos/seed/oilpaintingbg/1600/900?blur=4')` }}
      />
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-sepia-[.3]"></div>
      
      <div className="relative z-10 text-center mb-10 p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl">
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-2 tracking-widest text-oil-gold oil-text-shadow">
          SoulMate OS
        </h1>
        <p className="font-serif italic text-oil-paper text-lg opacity-90">Where memories are painted in eternal colors.</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Phone Button */}
        <button 
          onClick={() => setMode('phone')}
          className="group relative overflow-hidden rounded-xl border-4 border-oil-gold/40 hover:border-oil-gold transition-all duration-500 shadow-2xl bg-oil-dark/80"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20"></div>
          <div className="relative p-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-oil-gold to-yellow-700 p-5 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 border-2 border-white/20">
              <Smartphone size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-oil-paper mb-2">Connect</h2>
            <p className="font-body text-oil-canvas/80 text-center italic">
              "A whisper across the digital canvas..." <br/>
              <span className="text-xs uppercase tracking-widest not-italic mt-2 block opacity-60">Open Messenger</span>
            </p>
          </div>
        </button>

        {/* Activity Button */}
        <button 
          onClick={() => {
              if (characters.length > 0) {
                  setActiveCharId(characters[0].id);
                  setMode('activity');
              } else {
                  alert("Please craft a muse first.");
              }
          }}
          className="group relative overflow-hidden rounded-xl border-4 border-oil-gold/40 hover:border-oil-gold transition-all duration-500 shadow-2xl bg-oil-dark/80"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20"></div>
          <div className="relative p-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-oil-red to-pink-900 p-5 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 border-2 border-white/20">
              <MapPin size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-oil-paper mb-2">Encounter</h2>
            <p className="font-body text-oil-canvas/80 text-center italic">
              "Step into the frame of reality..." <br/>
              <span className="text-xs uppercase tracking-widest not-italic mt-2 block opacity-60">Start Activity</span>
            </p>
          </div>
        </button>
      </div>

      <div className="relative z-10 mt-16 flex gap-6">
        <button 
            onClick={() => setMode('setup')}
            className="flex items-center gap-3 bg-oil-paper text-oil-dark px-8 py-3 rounded-full hover:bg-white transition-colors duration-300 font-serif font-bold border-2 border-oil-gold shadow-lg"
        >
            <Palette size={20} />
            Craft Muse
        </button>
        <div className="flex items-center gap-3 bg-oil-dark/60 backdrop-blur text-oil-paper px-8 py-3 rounded-full border border-oil-gold/30 font-serif">
            <Users size={20} />
            {characters.length} Painted Souls
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-oil-dark canvas-bg">
      {mode === 'dashboard' && renderDashboard()}
      
      {mode === 'setup' && (
        <SetupInterface 
          onSave={handleCreateChar} 
          onCancel={() => setMode('dashboard')} 
        />
      )}

      {mode === 'phone' && (
        <div className="flex items-center justify-center h-full p-4 bg-black/60 backdrop-blur-sm">
             {/* Phone Container stylized as a physical object/frame */}
            <div className="h-full w-full max-w-[420px] max-h-[850px] bg-wx-bg rounded-[40px] shadow-2xl relative border-8 border-gray-800 overflow-hidden ring-4 ring-oil-gold/30">
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