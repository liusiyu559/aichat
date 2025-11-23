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
    <div className="flex flex-col h-full bg-wx-bg bg-paper-texture">
      {/* Header */}
      <div className="h-14 bg-wx-bg border-b border-gray-300 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
        <span className="font-serif font-bold text-lg text-oil-dark">Messages</span>
        <div className="flex space-x-4 items-center">
            <button onClick={() => setView('moments')} className="text-oil-dark font-serif font-bold text-sm hover:text-oil-amber transition">Journal</button>
            <div className="w-8 h-8 rounded-full bg-oil-dark/10 flex items-center justify-center">
                <Plus size={20} className="text-oil-dark" />
            </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                    className="flex items-center p-4 border-b border-gray-300/50 active:bg-oil-gold/10 cursor-pointer transition-colors"
                >
                    <div className="relative">
                         <img src={char.avatar} alt={char.name} className="w-14 h-14 rounded-xl object-cover border border-oil-gold/30 shadow-sm" />
                    </div>
                    
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-serif font-bold text-oil-dark text-lg truncate">{char.name}</h3>
                            <span className="text-xs text-gray-500 font-serif">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate font-body italic">{lastMsg ? lastMsg.text : 'Awaiting correspondence...'}</p>
                    </div>
                </div>
            )
        })}
      </div>
        
      {/* Bottom Nav Simulation */}
      <div className="h-16 bg-wx-bg border-t border-gray-300 flex items-center justify-around pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-wx-greenDark">
              <MessageCircle size={24} className="fill-current" />
              <span className="text-[10px] font-serif font-bold mt-1">Chats</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-amber transition">
              <span className="text-lg font-display font-bold">Contacts</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-amber transition">
              <span className="text-lg font-display font-bold">Me</span>
          </div>
      </div>
      
      {/* Exit Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-24 right-4 bg-oil-red text-wx-bg px-4 py-2 rounded-full shadow-lg z-50 text-xs font-serif border border-white/20"
      >
        Close Device
      </button>
    </div>
  );

  const renderChatRoom = () => {
    if (!activeChar) return null;
    return (
        <div className="flex flex-col h-full bg-wx-chatBg bg-paper-texture relative">
            {/* Header */}
            <div className="h-14 bg-wx-bg border-b border-gray-300/50 flex items-center justify-between px-3 shadow-sm z-10">
                <button onClick={() => setView('chatList')} className="p-2 hover:bg-black/5 rounded-full transition">
                    <ChevronLeft size={24} className="text-oil-dark" />
                </button>
                <span className="font-serif font-bold text-lg text-oil-dark">{activeChar.name}</span>
                <MoreHorizontal size={24} className="text-oil-dark" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <img src={activeChar.avatar} alt="AI" className="w-10 h-10 rounded-lg mr-2 self-start border border-gray-300" />
                        )}
                        
                        <div className={`max-w-[70%] rounded-lg p-3 text-[15px] shadow-sm relative font-body ${
                            msg.sender === 'user' 
                                ? 'bg-wx-green text-oil-canvas border border-wx-greenDark/20' 
                                : 'bg-wx-bg text-oil-dark border border-gray-200'
                        }`}>
                            {/* Triangle/Caret */}
                            <div className={`absolute top-3 w-0 h-0 border-[6px] border-transparent ${
                                msg.sender === 'user'
                                ? 'border-l-wx-green -right-[11px]'
                                : 'border-r-wx-bg -left-[11px]'
                            }`}></div>

                            {msg.type === 'text' && msg.text}
                            {msg.type === 'transfer' && (
                                <div className="bg-orange-600 text-white p-2 rounded w-48 shadow-inner">
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
                             <div className="w-10 h-10 rounded-lg bg-oil-dark text-white ml-2 flex items-center justify-center overflow-hidden border border-gray-600">
                                <span className="text-xs font-serif">Me</span>
                             </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="min-h-[60px] bg-wx-bg border-t border-gray-300 flex items-center px-3 py-2 space-x-2">
                <Mic size={28} className="text-oil-dark p-1 border border-oil-dark rounded-full" />
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Write a message..."
                    className="flex-1 bg-white/50 border border-gray-300 rounded px-3 py-2 text-base outline-none focus:border-wx-greenDark font-body placeholder-gray-500"
                />
                <Smile size={28} className="text-oil-dark" />
                {inputText ? (
                    <button 
                        onClick={handleSend} 
                        className="bg-wx-greenDark text-white px-4 py-1.5 rounded text-sm font-serif shadow-md hover:bg-wx-green transition"
                    >
                        Send
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <Plus size={28} className="text-oil-dark p-1 border border-oil-dark rounded-full hover:bg-black/5 cursor-pointer" />
                    </div>
                )}
            </div>

            {/* Simulated Tools */}
             <div className="absolute bottom-20 right-4 flex space-x-2">
                 <button onClick={() => onSendMessage("Here is some money", "transfer")} className="bg-orange-600 p-2.5 rounded-full shadow-lg text-white border border-white/20 hover:scale-105 transition" title="Transfer">
                    <Wallet size={20} />
                 </button>
                  <label className="bg-oil-deepBlue p-2.5 rounded-full shadow-lg text-white cursor-pointer border border-white/20 hover:scale-105 transition" title="Send Image">
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
      <div className="flex flex-col h-full bg-wx-bg bg-paper-texture relative">
          {/* Header */}
          <div className="h-14 bg-wx-bg/90 backdrop-blur-sm flex items-center justify-between px-3 sticky top-0 z-20 shadow-sm">
                <button onClick={() => setView('chatList')} className="flex items-center text-oil-dark">
                    <ChevronLeft size={24} />
                    <span className="font-serif font-bold ml-1">Moments</span>
                </button>
                <button onClick={onRefreshMoments} className="p-2">
                   <div className="w-5 h-5 rounded-full border-2 border-oil-dark/60 animate-spin-slow opacity-60"></div>
                </button>
          </div>

          {/* Cover Photo */}
          <div className="h-64 relative">
               <img src="https://picsum.photos/seed/vintageoil/800/400" className="w-full h-full object-cover sepia-[.3]" alt="cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               <div className="absolute bottom-[-16px] right-4 flex items-end">
                   <span className="text-white font-serif font-bold drop-shadow-md mb-6 mr-4 text-lg">My Journal</span>
                   <div className="w-20 h-20 bg-wx-bg rounded-lg border-2 border-white overflow-hidden shadow-lg">
                       <div className="w-full h-full bg-oil-dark text-white flex items-center justify-center font-serif text-2xl">M</div>
                   </div>
               </div>
          </div>

          {/* Feed */}
          <div className="mt-12 px-4 pb-20 space-y-8">
              {moments.map(moment => {
                  const author = characters.find(c => c.id === moment.authorId) || { name: 'Me', avatar: '' };
                  return (
                      <div key={moment.id} className="flex border-b border-gray-300/50 pb-6">
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            {author.avatar ? (
                                <img src={author.avatar} className="w-full h-full rounded bg-gray-200 border border-gray-300" alt="ava" />
                            ) : (
                                <div className="w-full h-full bg-oil-dark text-white rounded flex items-center justify-center">Me</div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                              <h4 className="text-oil-deepBlue font-serif font-bold text-base mb-1">{author.name}</h4>
                              <p className="text-sm mb-3 font-body leading-relaxed text-gray-800">{moment.content}</p>
                              {moment.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                      {moment.images.map((img, idx) => (
                                          <div key={idx} className="relative group overflow-hidden rounded border border-gray-200">
                                              <img src={img} className="w-48 h-48 object-cover transition-transform duration-700 group-hover:scale-110" alt="post" />
                                              <div className="absolute inset-0 bg-oil-gold/10 mix-blend-overlay"></div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-2 font-serif">
                                  <span>{new Date(moment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <button 
                                    className="bg-gray-200/50 px-3 py-1 rounded-full text-oil-deepBlue cursor-pointer hover:bg-gray-200 transition flex items-center gap-1" 
                                    onClick={() => onLikeMoment(moment.id)}
                                  >
                                      <Heart size={14} className={moment.likes.includes('Me') ? "fill-oil-red text-oil-red" : ""} />
                                      {moment.likes.length > 0 && <span>{moment.likes.length}</span>}
                                  </button>
                              </div>
                              {(moment.likes.length > 0 || moment.comments.length > 0) && (
                                  <div className="bg-gray-100/80 mt-3 p-3 rounded text-sm font-body border border-gray-200">
                                      {moment.likes.length > 0 && (
                                          <div className="text-oil-deepBlue text-xs mb-1 border-b border-gray-200 pb-1">
                                              <Heart size={10} className="inline mr-1" />
                                              {moment.likes.join(', ')}
                                          </div>
                                      )}
                                      {moment.comments.map((c, i) => (
                                          <div key={i} className="text-xs mt-1">
                                              <span className="text-oil-deepBlue font-bold">{c.author}:</span> {c.content}
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
        <div className="absolute top-0 w-full h-8 bg-wx-bg z-50 flex justify-between px-6 items-center text-[10px] font-bold text-oil-dark pointer-events-none rounded-t-[32px]">
             <span className="font-mono">14:26</span>
             <div className="flex space-x-1.5 items-center">
                 <div className="flex space-x-0.5 items-end h-3">
                    <div className="w-1 h-1 bg-oil-dark rounded-sm"></div>
                    <div className="w-1 h-2 bg-oil-dark rounded-sm"></div>
                    <div className="w-1 h-3 bg-oil-dark rounded-sm"></div>
                 </div>
                 <div className="w-6 h-3 border border-oil-dark rounded-sm relative">
                     <div className="absolute inset-0.5 bg-oil-dark"></div>
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