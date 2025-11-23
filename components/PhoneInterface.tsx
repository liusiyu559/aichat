import React, { useState, useRef, useEffect } from 'react';
import { Mic, Plus, Smile, Image as ImageIcon, Wallet, ChevronLeft, MoreHorizontal, MessageCircle, Heart, RefreshCw } from 'lucide-react';
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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
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
        <span className="font-serif font-bold text-lg text-white drop-shadow-md">微信</span>
        <div className="flex space-x-4 items-center">
            <button onClick={() => setView('moments')} className="text-white font-serif font-bold text-sm hover:text-oil-base transition drop-shadow">朋友圈</button>
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
                        <p className="text-sm text-oil-wood/80 truncate font-body italic">{lastMsg ? lastMsg.text : '等待消息...'}</p>
                    </div>
                </div>
            )
        })}
      </div>
        
      {/* Bottom Nav */}
      <div className="h-16 bg-white border-t border-oil-sun/20 flex items-center justify-around pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-oil-meadow">
              <MessageCircle size={24} className="fill-current" />
              <span className="text-[10px] font-serif font-bold mt-1">微信</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition">
              <span className="text-lg font-display font-bold">通讯录</span>
          </div>
          <div className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition">
              <span className="text-lg font-display font-bold">我</span>
          </div>
      </div>
      
      {/* Exit Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-24 right-4 bg-oil-contrast text-white px-4 py-2 rounded-full shadow-lg z-50 text-xs font-serif border border-white/20 hover:bg-oil-deepSea transition"
      >
        锁屏
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-0 custom-scrollbar">
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
                                            <div className="text-sm font-serif">转账</div>
                                            <div className="text-xs opacity-80 font-mono">¥ {msg.amount || 100.00}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] bg-white/20 px-1 font-serif">微信支付</div>
                                </div>
                            )}
                            {msg.type === 'image' && (
                                <img src={msg.imageUrl} alt="sent" className="rounded max-h-48 border border-white/20" />
                            )}
                        </div>

                        {msg.sender === 'user' && (
                             <div className="w-10 h-10 rounded-lg bg-oil-contrast text-white ml-2 flex items-center justify-center overflow-hidden border border-white/30 shadow-sm">
                                <span className="text-xs font-serif">我</span>
                             </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-gray-100 border-t border-gray-200 p-2 pb-4 z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600">
                        <Mic size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1 bg-white h-9 rounded px-3 text-sm border-none outline-none"
                    />
                    <Smile size={26} className="text-gray-600" />
                    <button onClick={() => setShowPlusMenu(!showPlusMenu)}>
                         <Plus size={26} className="text-gray-600 p-0.5 border-2 border-gray-600 rounded-full" />
                    </button>
                </div>

                {/* Plus Menu */}
                {showPlusMenu && (
                    <div className="grid grid-cols-4 gap-4 p-4 mt-2 border-t border-gray-200">
                        <div className="flex flex-col items-center gap-2 text-gray-500" onClick={() => {
                            onSendMessage('https://picsum.photos/seed/photo/300/400', 'image');
                            setShowPlusMenu(false);
                        }}>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-300">
                                <ImageIcon size={24} />
                            </div>
                            <span className="text-xs">相册</span>
                        </div>
                         <div className="flex flex-col items-center gap-2 text-gray-500" onClick={() => {
                            onSendMessage('', 'transfer');
                            setShowPlusMenu(false);
                        }}>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-300">
                                <Wallet size={24} />
                            </div>
                            <span className="text-xs">转账</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderMoments = () => (
      <div className="flex flex-col h-full bg-white relative">
         {/* Header */}
          <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset flex items-center px-3 pt-2 relative z-10">
                <button onClick={() => setView('chatList')} className="p-2 hover:bg-white/10 rounded-full transition text-white absolute left-2">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-serif font-bold text-lg text-white w-full text-center">朋友圈</span>
                <button 
                  onClick={onRefreshMoments} 
                  className="absolute right-4 text-white hover:text-oil-base transition"
                >
                  <RefreshCw size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Cover */}
                <div className="relative h-48 bg-gray-300">
                     <img src="https://picsum.photos/seed/cover/800/400" alt="cover" className="w-full h-full object-cover" />
                     <div className="absolute -bottom-6 right-4 flex items-end gap-3">
                         <span className="text-white font-bold drop-shadow-md mb-8 text-lg">我</span>
                         <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-white overflow-hidden">
                             <img src="https://picsum.photos/seed/me/200/200" alt="me" />
                         </div>
                     </div>
                </div>

                <div className="mt-12 px-4 pb-8 space-y-8">
                    {moments.map(moment => {
                        const author = characters.find(c => c.id === moment.authorId) || { name: '我', avatar: 'https://picsum.photos/seed/me/200/200' };
                        return (
                            <div key={moment.id} className="flex gap-3 border-b border-gray-100 pb-4">
                                <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded bg-gray-200 object-cover" />
                                <div className="flex-1">
                                    <h4 className="text-[#576b95] font-bold text-[15px]">{author.name}</h4>
                                    <p className="text-[15px] text-[#333] mt-1">{moment.content}</p>
                                    {moment.images.length > 0 && (
                                        <div className="mt-2 grid grid-cols-3 gap-1 max-w-[200px]">
                                            {moment.images.map((img, idx) => (
                                                <img key={idx} src={img} alt="post" className="w-full h-20 object-cover bg-gray-100" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-400">1小时前</span>
                                        <button 
                                            onClick={() => onLikeMoment(moment.id)}
                                            className={`p-1 rounded ${moment.likes.includes('Me') ? 'text-red-500' : 'text-[#576b95]'}`}
                                        >
                                            <Heart size={18} fill={moment.likes.includes('Me') ? "currentColor" : "none"}/>
                                        </button>
                                    </div>
                                    {moment.likes.length > 0 && (
                                        <div className="bg-[#f7f7f7] mt-2 p-2 rounded text-xs text-[#576b95] font-bold">
                                            <Heart size={12} className="inline mr-1"/>
                                            {moment.likes.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
      </div>
  )

  return (
    <div className="h-full w-full overflow-hidden">
      {view === 'chatList' && renderChatList()}
      {view === 'chatRoom' && renderChatRoom()}
      {view === 'moments' && renderMoments()}
    </div>
  );
};

export default PhoneInterface;