import React, { useState, useRef, useEffect } from 'react';
import { Mic, Plus, Smile, Image as ImageIcon, Wallet, Phone, MoreHorizontal, Heart, MessageCircle, ChevronLeft } from 'lucide-react';
import { Character, Message, Moment, PhoneView } from '../types';

interface PhoneInterfaceProps {
  characters: Character[];
  activeCharacterId: string | null;
  chatHistory: Record<string, Message[]>;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'transfer') => void;
  onSelectCharacter: (id: string) => void;
  onBack: () => void;
  moments: Moment[];
  onRefreshMoments: () => void;
  onLikeMoment: (momentId: string) => void;
}

const PhoneInterface: React.FC<PhoneInterfaceProps> = ({
  characters,
  activeCharacterId,
  chatHistory,
  onSendMessage,
  onSelectCharacter,
  onBack,
  moments,
  onRefreshMoments,
  onLikeMoment
}) => {
  const [view, setView] = useState<PhoneView>('chatList');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, activeCharacterId, view]);

  const activeChar = characters.find(c => c.id === activeCharacterId);
  const activeMessages = activeCharacterId ? (chatHistory[activeCharacterId] || []) : [];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- Views ---

  const renderChatList = () => (
    <div className="flex flex-col h-full bg-wx-bg">
      {/* Header - Sunset Gradient */}
      <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset border-b border-white/20 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm pt-2">
        <span className="font-serif font-bold text-lg text-white drop-shadow-md">Messages</span>
        <div className="flex space-x-4 items-center">
            <button onClick={() => setView('moments')} className="text-white font-serif font-bold text-sm hover:text-oil-base transition drop-shadow">Journal</button>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition">
                <Plus size={20} className="text-white" />
            </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-oil-base/50">
        {characters.map(char => {
            const msgs = chatHistory[char.id] || [];
            const lastMsg = msgs[msgs.length - 1];
            return (
                <div 
                    key={char.id} 
                    onClick={() => {
                        onSelectCharacter(char.id);
                        setView('chatRoom');
                    }}
                    className="flex items-center p-4 border-b border-oil-sun/20 active:bg-oil-sun/10 cursor-pointer transition-colors"
                >
                    <div className="relative">
                         <img src={char.avatar} alt={char.name} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md" />
                    </div>
                    
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-serif font-bold text-oil-contrast text-lg truncate">{char.name}</h3>
                            <span className="text-xs text-oil-wood/60 font-serif">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                        </div>
                        <p className="text-sm text-oil-wood/80 truncate font-body italic">{lastMsg ? lastMsg.text : 'Awaiting correspondence...'}</p>
                    </div>
                </div>
            )
        })}
      </div>
        
      {/* Bottom Nav */}
      <div className="h-16 bg-white border-t border-oil-sun/20 flex items-center justify-around pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-oil-meadow">
              <MessageCircle size={24} className="fill-current" />
              <span className="text-[10px] font-serif font-bold mt-1">Chats</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition">
              <span className="text-lg font-display font-bold">Contacts</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition">
              <span className="text-lg font-display font-bold">Me</span>
          </div>
      </div>
      
      {/* Exit Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-24 right-4 bg-oil-contrast text-white px-4 py-2 rounded-full shadow-lg z-50 text-xs font-serif border border-white/20 hover:bg-oil-deepSea transition"
      >
        Close Device
      </button>
    </div>
  );

  const renderChatRoom = () => {
    if (!activeChar) return null;
    return (
        <div className="flex flex-col h-full bg-wx-bg relative">
             {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] opacity-50 pointer-events-none"></div>

            {/* Header - Sunset Gradient */}
            <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset border-b border-white/20 flex items-center justify-between px-3 shadow-md z-10 pt-2">
                <button onClick={() => setView('chatList')} className="p-2 hover:bg-white/10 rounded-full transition">
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <span className="font-serif font-bold text-lg text-white drop-shadow-sm">{activeChar.name}</span>
                <MoreHorizontal size={24} className="text-white" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-0">
                {activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <img src={activeChar.avatar} alt="AI" className="w-10 h-10 rounded-lg mr-2 self-start border border-white shadow-sm" />
                        )}
                        
                        <div className={`max-w-[70%] rounded-lg p-3 text-[15px] shadow-md relative font-body ${
                            msg.sender === 'user' 
                                ? 'bg-oil-meadow text-white border border-oil-meadow' 
                                : 'bg-white text-oil-contrast border border-oil-sun/30'
                        }`}>
                            {/* Triangle/Caret */}
                            <div className={`absolute top-3 w-0 h-0 border-[6px] border-transparent ${
                                msg.sender === 'user'
                                ? 'border-l-oil-meadow -right-[11px]'
                                : 'border-r-white -left-[11px]'
                            }`}></div>

                            {msg.type === 'text' && msg.text}
                            {msg.type === 'transfer' && (
                                <div className="bg-oil-sunset text-white p-2 rounded w-48 shadow-inner">
                                    <div className="flex items-center">
                                        <div className="border-2 border-white rounded-full p-1 mr-2">
                                            <span className="text-xs font-bold font-serif">¥</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-serif">Transfer</div>
                                            <div className="text-xs opacity-80 font-mono">¥ {msg.amount || 100.00}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] bg-white/20 px-1 font-serif">WeChat Pay</div>
                                </div>
                            )}
                            {msg.type === 'image' && (
                                <img src={msg.imageUrl} alt="sent" className="rounded max-h-48 border border-white/20" />
                            )}
                        </div>

                        {msg.sender === 'user' && (
                             <div className="w-10 h-10 rounded-lg bg-oil-contrast text-white ml-2 flex items-center justify-center overflow-hidden border border-white/30 shadow-sm">
                                <span className="text-xs font-serif">Me</span>
                             </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="min-h-[60px] bg-white border-t border-oil-sun/20 flex items-center px-3 py-2 space-x-2 z-10">
                <Mic size={28} className="text-oil-wood p-1 border border-oil-wood rounded-full" />
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Write a message..."
                    className="flex-1 bg-oil-base/50 border border-oil-sun/30 rounded px-3 py-2 text-base outline-none focus:border-oil-meadow font-body placeholder-oil-wood/40 text-oil-contrast"
                />
                <Smile size={28} className="text-oil-wood" />
                {inputText ? (
                    <button 
                        onClick={handleSend} 
                        className="bg-oil-meadow text-white px-4 py-1.5 rounded text-sm font-serif shadow-md hover:bg-wx-greenDark transition"
                    >
                        Send
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <Plus size={28} className="text-oil-wood p-1 border border-oil-wood rounded-full hover:bg-black/5 cursor-pointer" />
                    </div>
                )}
            </div>

            {/* Simulated Tools */}
             <div className="absolute bottom-20 right-4 flex space-x-2">
                 <button onClick={() => onSendMessage("Here is some money", "transfer")} className="bg-oil-sunset p-2.5 rounded-full shadow-lg text-white border border-white/20 hover:scale-105 transition" title="Transfer">
                    <Wallet size={20} />
                 </button>
                  <label className="bg-oil-deepSea p-2.5 rounded-full shadow-lg text-white cursor-pointer border border-white/20 hover:scale-105 transition" title="Send Image">
                    <ImageIcon size={20} />
                    <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                onSendMessage(ev.target?.result as string, 'image');
                            };
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }} />
                 </label>
             </div>
        </div>
    );
  };

  const renderMoments = () => (
      <div className="flex flex-col h-full bg-wx-bg relative">
          {/* Header */}
          <div className="h-16 bg-white/80 backdrop-blur-sm flex items-center justify-between px-3 sticky top-0 z-20 shadow-sm pt-2">
                <button onClick={() => setView('chatList')} className="flex items-center text-oil-contrast">
                    <ChevronLeft size={24} />
                    <span className="font-serif font-bold ml-1">Moments</span>
                </button>
                <button onClick={onRefreshMoments} className="p-2">
                   <div className="w-5 h-5 rounded-full border-2 border-oil-sunset/60 animate-spin-slow opacity-60"></div>
                </button>
          </div>

          {/* Cover Photo */}
          <div className="h-64 relative group">
               <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
               <div className="absolute bottom-[-24px] right-4 flex items-end z-10">
                   <span className="text-white font-serif font-bold drop-shadow-md mb-8 mr-4 text-lg">My Journal</span>
                   <div className="w-20 h-20 bg-white rounded-lg border-2 border-white overflow-hidden shadow-xl">
                       <div className="w-full h-full bg-gradient-to-br from-oil-sun to-oil-sunset text-white flex items-center justify-center font-serif text-2xl">Me</div>
                   </div>
               </div>
          </div>

          {/* Feed */}
          <div className="mt-12 px-4 pb-20 space-y-8 bg-oil-base/30">
              {moments.map(moment => {
                  const author = characters.find(c => c.id === moment.authorId) || { name: 'Me', avatar: '' };
                  return (
                      <div key={moment.id} className="flex border-b border-oil-sun/20 pb-6 pt-4">
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            {author.avatar ? (
                                <img src={author.avatar} className="w-full h-full rounded bg-gray-200 border border-white shadow-sm" alt="ava" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-oil-sun to-oil-sunset text-white rounded flex items-center justify-center shadow-sm">Me</div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                              <h4 className="text-oil-deepSea font-serif font-bold text-base mb-1">{author.name}</h4>
                              <p className="text-sm mb-3 font-body leading-relaxed text-oil-contrast/90">{moment.content}</p>
                              {moment.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                      {moment.images.map((img, idx) => (
                                          <div key={idx} className="relative group overflow-hidden rounded border border-white/50 shadow-sm">
                                              <img src={img} className="w-48 h-48 object-cover transition-transform duration-700 group-hover:scale-110" alt="post" />
                                          </div>
                                      ))}
                                  </div>
                              )}
                              <div className="flex justify-between items-center text-xs text-oil-wood/60 mt-2 font-serif">
                                  <span>{new Date(moment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <button 
                                    className="bg-white/60 px-3 py-1 rounded-full text-oil-deepSea cursor-pointer hover:bg-white transition flex items-center gap-1 shadow-sm" 
                                    onClick={() => onLikeMoment(moment.id)}
                                  >
                                      <Heart size={14} className={moment.likes.includes('Me') ? "fill-oil-sunset text-oil-sunset" : ""} />
                                      {moment.likes.length > 0 && <span>{moment.likes.length}</span>}
                                  </button>
                              </div>
                              {(moment.likes.length > 0 || moment.comments.length > 0) && (
                                  <div className="bg-white/60 mt-3 p-3 rounded text-sm font-body border border-white shadow-inner">
                                      {moment.likes.length > 0 && (
                                          <div className="text-oil-deepSea text-xs mb-1 border-b border-oil-sun/20 pb-1">
                                              <Heart size={10} className="inline mr-1" />
                                              {moment.likes.join(', ')}
                                          </div>
                                      )}
                                      {moment.comments.map((c, i) => (
                                          <div key={i} className="text-xs mt-1">
                                              <span className="text-oil-deepSea font-bold">{c.author}:</span> {c.content}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-white font-sans rounded-[32px]">
        {/* Notch Area Sim */}
        <div className="absolute top-0 w-full h-8 bg-black/20 z-50 flex justify-between px-6 items-center text-[10px] font-bold text-white pointer-events-none rounded-t-[32px] backdrop-blur-sm">
             <span className="font-mono">14:26</span>
             <div className="flex space-x-1.5 items-center">
                 <div className="flex space-x-0.5 items-end h-3">
                    <div className="w-1 h-1 bg-white rounded-sm"></div>
                    <div className="w-1 h-2 bg-white rounded-sm"></div>
                    <div className="w-1 h-3 bg-white rounded-sm"></div>
                 </div>
                 <div className="w-6 h-3 border border-white rounded-sm relative">
                     <div className="absolute inset-0.5 bg-white"></div>
                 </div>
             </div>
        </div>

        {view === 'chatList' && renderChatList()}
        {view === 'chatRoom' && renderChatRoom()}
        {view === 'moments' && renderMoments()}
    </div>
  );
};

export default PhoneInterface;