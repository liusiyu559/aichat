import React, { useState, useCallback } from 'react';
import { Smartphone, MapPin, X } from 'lucide-react';
import { AppMode, Character, Message, Moment, INITIAL_CHARACTERS, UserProfile, INITIAL_USER_PROFILE, Sticker, BackgroundItem, INITIAL_BACKGROUNDS, INITIAL_STICKERS } from './types';
import PhoneInterface from './components/PhoneInterface';
import ActivityInterface from './components/ActivityInterface';
import SetupInterface from './components/SetupInterface';
import { generateChatResponse, generateMoment, generateCommentReply, summarizeMemory } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  
  // Custom Background Library State
  const [backgroundLibrary, setBackgroundLibrary] = useState<BackgroundItem[]>(INITIAL_BACKGROUNDS);
  
  // Stickers State
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);

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

  // Helper for file upload to Base64
  const handleFileUpload = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const handleAddSticker = async (file: File) => {
    try {
        const url = await handleFileUpload(file);
        setStickers(prev => [...prev, { id: Date.now().toString(), url }]);
    } catch (error) {
        console.error("Upload failed", error);
    }
  };

  const handleAddBackground = async (name: string, file: File) => {
      try {
          const url = await handleFileUpload(file);
          setBackgroundLibrary(prev => [...prev, { id: Date.now().toString(), name, url }]);
      } catch (e) {
          console.error("Upload BG failed", e);
      }
  };

  const handleRemoveBackground = (id: string) => {
      setBackgroundLibrary(prev => prev.filter(b => b.id !== id));
  };

  // Helper to update a character (e.g., adding memory or changing background)
  const updateCharacter = (id: string, updates: Partial<Character>) => {
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Helper to trigger AI response
  const triggerAIResponse = async (charId: string, history: Message[], userText: string, scene: 'phone' | 'activity') => {
      const character = characters.find(c => c.id === charId);
      if (!character) return;

      const responseText = await generateChatResponse(
          character,
          userProfile,
          history,
          userText,
          scene
      );

      // Handle Multi-Message Split for Phone Mode
      if (scene === 'phone' && responseText.includes('|||')) {
          const parts = responseText.split('|||').filter(p => p.trim() !== '');
          for (let i = 0; i < parts.length; i++) {
              const delay = 500 + Math.random() * 1500; 
              await new Promise(resolve => setTimeout(resolve, delay));

              const aiMessage: Message = {
                  id: (Date.now() + i).toString(),
                  sender: 'ai',
                  text: parts[i].trim(),
                  type: 'text',
                  timestamp: Date.now(),
                  scene: scene
              };

              setChatHistory(prev => ({
                  ...prev,
                  [charId]: [...(prev[charId] || []), aiMessage]
              }));
          }
      } else {
          const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: responseText,
              type: 'text',
              timestamp: Date.now(),
              scene: scene
          };

          setChatHistory(prev => ({
              ...prev,
              [charId]: [...(prev[charId] || []), aiMessage]
          }));
      }
  };

  // Handle Sending Messages
  const handleSendMessage = useCallback(async (text: string, type: 'text' | 'image' | 'transfer' | 'sticker' = 'text', fromMode: 'phone' | 'activity', amount?: number) => {
    if (!activeCharId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: type === 'transfer' ? `转账 ¥${amount?.toFixed(2)}` : (type === 'sticker' ? '[表情包]' : text),
      type: type,
      timestamp: Date.now(),
      amount: amount,
      imageUrl: (type === 'image' || type === 'sticker') ? text : undefined,
      scene: fromMode
    };

    let updatedHistory: Message[] = [];

    setChatHistory(prev => {
        const charHistory = prev[activeCharId] || [];
        const newHistory = [...charHistory, newMessage];
        updatedHistory = newHistory;
        
        // Memory Summarization Trigger (Every 20 messages)
        if (newHistory.length > 0 && newHistory.length % 20 === 0) {
            const character = characters.find(c => c.id === activeCharId);
            if (character) {
                const nowStr = new Date().toLocaleString();
                summarizeMemory(character.name, userProfile.name, newHistory.slice(-20))
                    .then(summary => {
                        if (summary) {
                            updateCharacter(character.id, {
                                memory: [...(character.memory || []), `【${nowStr}】 ${summary}`]
                            });
                        }
                    });
            }
        }
        
        return {
            ...prev,
            [activeCharId]: newHistory
        };
    });

    // Trigger AI
    await triggerAIResponse(activeCharId, updatedHistory, type === 'text' ? text : `[${type}]`, fromMode);

  }, [activeCharId, characters, chatHistory, userProfile]);

  // Message Actions
  const handleDeleteMessage = (msgId: string) => {
      if (!activeCharId) return;
      setChatHistory(prev => ({
          ...prev,
          [activeCharId]: prev[activeCharId]?.filter(m => m.id !== msgId) || []
      }));
  };

  const handleEditMessage = (msgId: string, newText: string) => {
      if (!activeCharId) return;
      setChatHistory(prev => ({
          ...prev,
          [activeCharId]: prev[activeCharId]?.map(m => m.id === msgId ? { ...m, text: newText } : m) || []
      }));
  };

  const handleRegenerateMessage = async (msgId: string) => {
      if (!activeCharId) return;
      const history = chatHistory[activeCharId] || [];
      const index = history.findIndex(m => m.id === msgId);
      if (index === -1) return;

      // Keep messages up to the one before this AI message
      // We assume regenerate is usually called on an AI message
      // If called on AI message, we want to regenerate it based on PREVIOUS history
      const prevHistory = history.slice(0, index);
      
      // Update state to remove this and subsequent messages temporarily
      setChatHistory(prev => ({
          ...prev,
          [activeCharId]: prevHistory
      }));

      // Find the last user input to retry, or just pass empty if it's a continuation?
      // Usually we re-send the request based on the history.
      // The context for AI includes the last user message.
      const lastUserMsg = [...prevHistory].reverse().find(m => m.sender === 'user');
      const scene = history[index].scene; // Keep same scene
      
      await triggerAIResponse(activeCharId, prevHistory, lastUserMsg ? lastUserMsg.text : "...", scene);
  };


  // --- Handlers ---

  const handleSaveChar = (char: Character) => {
    if (editingCharId) {
        setCharacters(prev => prev.map(c => c.id === editingCharId ? char : c));
        setEditingCharId(null);
    } else {
        setCharacters(prev => [...prev, char]);
    }
    setMode('dashboard'); 
  };

  const handleEditCharacter = (charId: string) => {
      setEditingCharId(charId);
      setMode('setup');
  };

  const handleUpdateChatBackground = async (charId: string, file: File) => {
      try {
          const url = await handleFileUpload(file);
          updateCharacter(charId, { chatBackground: url });
      } catch (e) {
          console.error("Background upload failed", e);
      }
  };

  const handleUpdateMemory = (charId: string, newMemory: string[]) => {
      updateCharacter(charId, { memory: newMemory });
  };

  const handleRefreshMoments = async () => {
    if (characters.length === 0) return;
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    const newMoment = await generateMoment(randomChar);
    setMoments(prev => [newMoment, ...prev]);
  };

  const handlePostMoment = async (text: string, image?: File) => {
      let imgUrl = undefined;
      if (image) {
          try {
              imgUrl = await handleFileUpload(image);
          } catch(e) {}
      }

      const newMoment: Moment = {
          id: Date.now().toString(),
          authorId: 'user', // Special ID for user
          content: text,
          images: imgUrl ? [imgUrl] : [],
          timestamp: Date.now(),
          likes: [],
          comments: []
      };
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

  const handleCommentMoment = async (id: string, comment: string) => {
     // 1. Add User Comment
     setMoments(prev => prev.map(m => {
         if (m.id === id) {
             return {
                 ...m,
                 comments: [...m.comments, { author: userProfile.name, content: comment }]
             }
         }
         return m;
     }));

     // 2. AI Reply
     const moment = moments.find(m => m.id === id);
     if (moment) {
        if (moment.authorId === 'user') {
            // If user posted, a random friend replies
             if (characters.length > 0) {
                 const randomChar = characters[Math.floor(Math.random() * characters.length)];
                 const reply = await generateCommentReply(randomChar, userProfile, moment.content, comment);
                 setTimeout(() => {
                     setMoments(prev => prev.map(m => {
                         if (m.id === id) {
                             return {
                                 ...m,
                                 comments: [...m.comments, { author: randomChar.name, content: reply }]
                             }
                         }
                         return m;
                     }));
                 }, 2000);
             }
        } else {
            // Reply from original author
            const author = characters.find(c => c.id === moment.authorId);
            if (author) {
                const reply = await generateCommentReply(author, userProfile, moment.content, comment);
                setTimeout(() => {
                    setMoments(prev => prev.map(m => {
                        if (m.id === id) {
                            return {
                                ...m,
                                comments: [...m.comments, { author: author.name, content: reply }]
                            }
                        }
                        return m;
                    }));
                }, 2000);
            }
        }
     }
  }

  const onUploadPhoto = async (file: File) => {
      try {
          const url = await handleFileUpload(file);
          handleSendMessage(url, 'image', 'phone');
      } catch (e) {
          console.error(e);
      }
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
      
      {/* Title Section */}
      <div className="relative z-10 text-center mb-16 p-6 bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl max-w-xl mx-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          AI SoulMate
        </h1>
        <p className="font-serif italic text-oil-base text-base drop-shadow-md">
          记忆的画布，绘着阳光与海。
        </p>
      </div>

      {/* Main Actions - Just ONE main button now (Contact) */}
      <div className="relative z-10 flex flex-row gap-12 items-center justify-center w-full px-4">
        
        {/* Phone Button */}
        <button 
          onClick={() => setMode('phone')}
          className="group relative w-32 h-32 md:w-40 md:h-40 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-white/60 shadow-[0_10px_30px_rgba(255,112,67,0.3)] hover:shadow-[0_20px_50px_rgba(255,112,67,0.5)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-oil-sun/10 to-oil-sunset/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="bg-gradient-to-br from-oil-sunset to-oil-sun p-4 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform duration-300">
             <Smartphone size={32} />
          </div>
          <span className="font-serif font-bold text-oil-contrast text-sm md:text-base">进入手机</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-oil-base canvas-bg font-sans">
      {mode === 'dashboard' && renderDashboard()}
      
      {mode === 'setup' && (
        <SetupInterface 
          onSave={handleSaveChar} 
          onCancel={() => setMode(editingCharId ? 'phone' : 'dashboard')} 
          existingChar={editingCharId ? characters.find(c => c.id === editingCharId) : undefined}
          backgroundLibrary={backgroundLibrary}
          onAddBackground={handleAddBackground}
          onRemoveBackground={handleRemoveBackground}
        />
      )}

      {mode === 'phone' && (
        <div className="flex items-center justify-center h-full p-0 md:p-4 bg-oil-contrast/40 backdrop-blur-sm">
             {/* Phone Container */}
            <div className="h-full w-full md:max-w-[420px] md:max-h-[850px] bg-wx-bg md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative md:border-[6px] md:border-oil-wood overflow-hidden ring-0 md:ring-4 ring-oil-sun/60">
                <PhoneInterface 
                    characters={characters}
                    userProfile={userProfile}
                    onUpdateUserProfile={setUserProfile}
                    activeCharacterId={activeCharId}
                    chatHistory={chatHistory}
                    onSelectCharacter={setActiveCharId}
                    onSendMessage={(txt, type, amt) => handleSendMessage(txt, type, 'phone', amt)}
                    onBack={() => setMode('dashboard')}
                    moments={moments}
                    onRefreshMoments={handleRefreshMoments}
                    onPostMoment={handlePostMoment}
                    onLikeMoment={handleLikeMoment}
                    onCommentMoment={handleCommentMoment}
                    stickers={stickers}
                    onAddSticker={(file) => handleAddSticker(file)}
                    onUploadPhoto={onUploadPhoto}
                    onCreateCharacter={() => {
                        setEditingCharId(null);
                        setMode('setup');
                    }}
                    onEditCharacter={handleEditCharacter}
                    onUpdateChatBackground={handleUpdateChatBackground}
                    onUpdateMemory={(mem) => activeCharId && handleUpdateMemory(activeCharId, mem)}
                    onEnterActivity={() => {
                        if (activeCharId) {
                            setMode('activity');
                        }
                    }}
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={handleEditMessage}
                    onRegenerateMessage={handleRegenerateMessage}
                />
            </div>
        </div>
      )}

      {mode === 'activity' && activeCharId && (
         <ActivityInterface 
            character={characters.find(c => c.id === activeCharId)!}
            chatHistory={chatHistory[activeCharId] || []}
            onSendMessage={(txt) => handleSendMessage(txt, 'text', 'activity')}
            onBack={() => setMode('phone')}
            backgroundLibrary={backgroundLibrary}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
         />
      )}
    </div>
  );
};

export default App;