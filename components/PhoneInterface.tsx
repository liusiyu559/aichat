import React, { useState, useRef, useEffect } from 'react';
import { Plus, Smile, Image as ImageIcon, Wallet, ChevronLeft, MoreHorizontal, MessageCircle, Heart, RefreshCw, Sticker as StickerIcon, User, Edit3, X, Save, Phone, Aperture, Settings, FileText, Mic, MicOff, ImagePlus, Camera, MapPin, Trash2, Repeat, Check } from 'lucide-react';
import { Character, Message, Moment, PhoneView, UserProfile, Sticker } from '../types';

interface PhoneInterfaceProps {
  characters: Character[];
  userProfile: UserProfile;
  onUpdateUserProfile: (p: UserProfile) => void;
  activeCharacterId: string | null;
  chatHistory: Record<string, Message[]>;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'transfer' | 'sticker', amount?: number) => void;
  onSelectCharacter: (id: string) => void;
  onBack: () => void;
  moments: Moment[];
  onRefreshMoments: () => void;
  onPostMoment: (text: string, image?: File) => void;
  onLikeMoment: (momentId: string) => void;
  onCommentMoment: (momentId: string, text: string) => void;
  stickers: Sticker[];
  onAddSticker: (file: File) => void;
  onUploadPhoto: (file: File) => void;
  onCreateCharacter: () => void;
  onEditCharacter: (id: string) => void;
  onUpdateChatBackground: (id: string, file: File) => void;
  onUpdateMemory: (newMemory: string[]) => void;
  onEnterActivity: () => void; // New
  onDeleteMessage: (msgId: string) => void; // New
  onEditMessage: (msgId: string, newText: string) => void; // New
  onRegenerateMessage: (msgId: string) => void; // New
}

const PhoneInterface: React.FC<PhoneInterfaceProps> = ({
  characters,
  userProfile,
  onUpdateUserProfile,
  activeCharacterId,
  chatHistory,
  onSendMessage,
  onSelectCharacter,
  onBack,
  moments,
  onRefreshMoments,
  onPostMoment,
  onLikeMoment,
  onCommentMoment,
  stickers,
  onAddSticker,
  onUploadPhoto,
  onCreateCharacter,
  onEditCharacter,
  onUpdateChatBackground,
  onUpdateMemory,
  onEnterActivity,
  onDeleteMessage,
  onEditMessage,
  onRegenerateMessage
}) => {
  const [view, setView] = useState<PhoneView>('chatList');
  const [inputText, setInputText] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Header Plus Menu (Chat List)
  const [showHomePlusMenu, setShowHomePlusMenu] = useState(false);
  
  // Chat Settings Menu
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [editedMemory, setEditedMemory] = useState<string>('');

  // UI Toggle (Double Click)
  const [isUIHidden, setIsUIHidden] = useState(false);

  // Post Moment State
  const [showPostMoment, setShowPostMoment] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);

  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null); // For Speech Recognition
  
  // User Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);

  // Message Context Menu
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgText, setEditMsgText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, activeCharacterId, view]);

  // Voice Call Logic
  useEffect(() => {
    let interval: any;
    if (isCalling) {
        // Start timer
        interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        // Start Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'zh-CN';

            recognition.onstart = () => console.log("Voice started");
            recognition.onend = () => {
                if (isCalling && !isMuted) {
                    try { recognition.start(); } catch(e) {}
                }
            };

            recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const text = event.results[last][0].transcript;
                if (text && text.trim()) {
                    setUserSpeaking(true);
                    onSendMessage(text);
                    setTimeout(() => setUserSpeaking(false), 2000);
                }
            };
            
            try {
                recognition.start();
                recognitionRef.current = recognition;
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    } else {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
    return () => {
        clearInterval(interval);
        if (recognitionRef.current) recognitionRef.current.stop();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, [isCalling, isMuted]);

  const activeChar = characters.find(c => c.id === activeCharacterId);
  const activeMessages = activeCharacterId ? (chatHistory[activeCharacterId] || []).filter(m => m.scene === 'phone') : [];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleTransfer = () => {
      const amount = parseFloat(transferAmount);
      if (amount > 0) {
          onSendMessage('', 'transfer', amount);
          setShowTransferModal(false);
          setTransferAmount('');
          setShowPlusMenu(false);
      }
  }

  const handleAddComment = (momentId: string) => {
      const text = commentInputs[momentId];
      if (text && text.trim()) {
          onCommentMoment(momentId, text);
          setCommentInputs(prev => ({ ...prev, [momentId]: '' }));
      }
  }

  // --- Views ---

  const renderChatList = () => (
    <div className="flex flex-col h-full bg-wx-bg relative">
      <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset border-b border-white/20 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm pt-2">
        <span className="font-serif font-bold text-lg text-white drop-shadow-md">微信</span>
        <div className="relative">
             <button onClick={() => setShowHomePlusMenu(!showHomePlusMenu)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition cursor-pointer">
                <Plus size={20} className="text-white" />
            </button>
            {showHomePlusMenu && (
                <div className="absolute top-10 right-0 bg-gray-800 text-white rounded shadow-xl py-2 w-32 z-50">
                    <button 
                        onClick={() => { onCreateCharacter(); setShowHomePlusMenu(false); }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 w-full text-sm"
                    >
                        <User size={16}/>
                        <span>添加角色</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-oil-base/50">
        {characters.map(char => {
            const msgs = chatHistory[char.id]?.filter(m => m.scene === 'phone') || [];
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
                        <p className="text-sm text-oil-wood/80 truncate font-body italic">{lastMsg ? (lastMsg.type === 'image' ? '[图片]' : (lastMsg.type === 'sticker' ? '[表情包]' : (lastMsg.type === 'transfer' ? '[转账]' : lastMsg.text))) : '等待消息...'}</p>
                    </div>
                </div>
            )
        })}
      </div>
        
      <div className="h-16 bg-white border-t border-oil-sun/20 flex items-center justify-around pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <button onClick={() => setView('chatList')} className="flex flex-col items-center text-oil-meadow cursor-pointer">
              <MessageCircle size={24} className="fill-current" />
              <span className="text-[10px] font-serif font-bold mt-1">微信</span>
          </button>
          <button onClick={() => setView('moments')} className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition cursor-pointer">
              <Aperture size={24} />
              <span className="text-[10px] font-serif font-bold mt-1">朋友圈</span>
          </button>
          <button onClick={() => setView('me')} className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition cursor-pointer">
              <User size={24} />
              <span className="text-[10px] font-serif font-bold mt-1">我</span>
          </button>
      </div>
      
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
        <div 
            className="flex flex-col h-full bg-wx-bg relative select-none"
            onDoubleClick={() => setIsUIHidden(!isUIHidden)}
        >
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-70 pointer-events-none" 
                style={{ 
                    backgroundImage: activeChar.chatBackground 
                        ? `url(${activeChar.chatBackground})` 
                        : "url('https://www.transparenttextures.com/patterns/canvas-orange.png')",
                    backgroundColor: activeChar.chatBackground ? 'transparent' : '#fffbf0'
                }}
            ></div>

            {/* Header */}
            {!isUIHidden && (
                <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset border-b border-white/20 flex items-center justify-between px-3 shadow-md z-10 pt-2 relative">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setView('chatList')} className="p-2 hover:bg-white/10 rounded-full transition">
                            <ChevronLeft size={24} className="text-white" />
                        </button>
                        <span className="font-serif font-bold text-lg text-white drop-shadow-sm">{activeChar.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Story Mode Button */}
                        <button onClick={onEnterActivity} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white" title="进入剧情模式">
                            <MapPin size={20} />
                        </button>
                        <button onClick={() => setShowChatSettings(!showChatSettings)} className="p-2 hover:bg-white/10 rounded-full">
                            <MoreHorizontal size={24} className="text-white" />
                        </button>
                    </div>

                    {showChatSettings && (
                        <div className="absolute top-14 right-2 bg-white rounded-lg shadow-xl w-40 py-2 z-50 border border-gray-100">
                            <button onClick={() => {onEditCharacter(activeChar.id); setShowChatSettings(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                                <Settings size={16}/> 设置人物
                            </button>
                            <button onClick={() => {
                                setEditedMemory(activeChar.memory ? activeChar.memory.join('\n') : '');
                                setShowMemory(true); 
                                setShowChatSettings(false);
                            }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                                <FileText size={16}/> 编辑记忆
                            </button>
                            <button onClick={() => bgInputRef.current?.click()} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                                <ImagePlus size={16}/> 设置背景
                            </button>
                            <input 
                                type="file" 
                                ref={bgInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    if(e.target.files?.[0]) {
                                        onUpdateChatBackground(activeChar.id, e.target.files[0]);
                                        setShowChatSettings(false);
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {showMemory && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full h-[60%] p-6 flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">编辑记忆 (AI根据此记忆对话)</h3>
                            <button onClick={() => setShowMemory(false)}><X size={20}/></button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">您可以手动修改AI对您的记忆摘要。每行一条。</p>
                        <textarea 
                            className="flex-1 border p-2 rounded text-sm mb-4 resize-none focus:border-oil-sunset outline-none"
                            value={editedMemory}
                            onChange={(e) => setEditedMemory(e.target.value)}
                        />
                        <button 
                            onClick={() => {
                                onUpdateMemory(editedMemory.split('\n').filter(s => s.trim() !== ''));
                                setShowMemory(false);
                            }}
                            className="bg-oil-sunset text-white py-2 rounded font-bold hover:bg-orange-600"
                        >
                            保存记忆
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-0 custom-scrollbar" onClick={() => setContextMenuMsgId(null)}>
                {activeMessages.map((msg, index) => {
                    const showTime = index === 0 || (msg.timestamp - activeMessages[index - 1].timestamp > 5 * 60 * 1000); // 5 mins
                    return (
                        <div key={msg.id}>
                            {showTime && (
                                <div className="text-center text-xs text-gray-400 my-2 font-mono">
                                    {new Date(msg.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                            <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative group`}>
                                {msg.sender === 'ai' && (
                                    <img src={activeChar.avatar} alt="AI" className="w-10 h-10 rounded-lg mr-2 self-start border border-white shadow-sm" />
                                )}
                                
                                <div 
                                    className={`max-w-[70%] rounded-lg p-3 text-[15px] shadow-md relative font-body ${
                                        msg.sender === 'user' 
                                            ? 'bg-oil-meadow text-white border border-oil-meadow' 
                                            : 'bg-white text-oil-contrast border border-oil-sun/30'
                                    }`}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenuMsgId(msg.id);
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenuMsgId(contextMenuMsgId === msg.id ? null : msg.id);
                                    }}
                                >
                                    {(msg.type === 'text' || msg.type === 'transfer') && (
                                        <div className={`absolute top-3 w-0 h-0 border-[6px] border-transparent ${
                                            msg.sender === 'user'
                                            ? 'border-l-oil-meadow -right-[11px]'
                                            : 'border-r-white -left-[11px]'
                                        }`}></div>
                                    )}

                                    {editingMsgId === msg.id ? (
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <textarea 
                                                className="text-black p-1 rounded border text-sm"
                                                value={editMsgText}
                                                onChange={e => setEditMsgText(e.target.value)}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditingMsgId(null)} className="text-xs text-gray-500">取消</button>
                                                <button onClick={() => {onEditMessage(msg.id, editMsgText); setEditingMsgId(null);}} className="text-xs text-blue-500 font-bold">保存</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.type === 'text' && msg.text}
                                            {msg.type === 'transfer' && (
                                                <div className="bg-oil-sunset text-white p-2 rounded w-48 shadow-inner">
                                                    <div className="flex items-center">
                                                        <div className="border-2 border-white rounded-full p-1 mr-2">
                                                            <span className="text-xs font-bold font-serif">¥</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-serif">转账</div>
                                                            <div className="text-xs opacity-80 font-mono">¥ {msg.amount?.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-[10px] bg-white/20 px-1 font-serif">微信支付</div>
                                                </div>
                                            )}
                                            {(msg.type === 'image' || msg.type === 'sticker') && (
                                                <img src={msg.imageUrl} alt="sent" className="rounded max-h-48 border border-white/20 bg-white" />
                                            )}
                                        </>
                                    )}

                                    {/* Context Menu Popup */}
                                    {contextMenuMsgId === msg.id && !editingMsgId && (
                                        <div className="absolute -bottom-12 left-0 z-50 bg-gray-800 text-white text-xs rounded shadow-lg flex overflow-hidden whitespace-nowrap">
                                            {msg.type === 'text' && (
                                                <button onClick={() => {setEditingMsgId(msg.id); setEditMsgText(msg.text); setContextMenuMsgId(null);}} className="px-3 py-2 hover:bg-gray-700 flex items-center gap-1">
                                                    <Edit3 size={12}/> 编辑
                                                </button>
                                            )}
                                            {msg.sender === 'ai' && (
                                                <button onClick={() => {onRegenerateMessage(msg.id); setContextMenuMsgId(null);}} className="px-3 py-2 hover:bg-gray-700 flex items-center gap-1">
                                                    <Repeat size={12}/> 重成
                                                </button>
                                            )}
                                            <button onClick={() => {onDeleteMessage(msg.id); setContextMenuMsgId(null);}} className="px-3 py-2 hover:bg-gray-700 text-red-400 flex items-center gap-1">
                                                <Trash2 size={12}/> 删除
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <img src={userProfile.avatar} alt="Me" className="w-10 h-10 rounded-lg ml-2 self-start border border-white shadow-sm object-cover" />
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isUIHidden && (
                <div className="bg-gray-100 border-t border-gray-200 p-2 pb-4 z-10">
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => {
                                setCallDuration(0);
                                setIsCalling(true);
                            }}
                            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-200 hover:text-green-600 transition"
                        >
                            <Phone size={18} />
                        </button>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 bg-white h-9 rounded px-3 text-sm border-none outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <button onClick={() => setShowStickerPanel(!showStickerPanel)}>
                            <Smile size={26} className="text-gray-600 cursor-pointer hover:text-oil-sunset" />
                        </button>
                        <button onClick={() => setShowPlusMenu(!showPlusMenu)}>
                            <Plus size={26} className="text-gray-600 p-0.5 border-2 border-gray-600 rounded-full hover:border-oil-sunset hover:text-oil-sunset" />
                        </button>
                        <button onClick={handleSend} className="bg-oil-meadow text-white px-3 py-1 rounded text-sm font-bold shadow-sm hover:bg-oil-greenDark">
                            发送
                        </button>
                    </div>

                    {/* Sticker Panel */}
                    {showStickerPanel && (
                        <div className="h-40 bg-gray-50 border-t mt-2 p-2 overflow-y-auto grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded hover:bg-gray-100 cursor-pointer" 
                                onClick={() => stickerInputRef.current?.click()}>
                                <Plus size={20} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400">上传表情</span>
                                <input 
                                    type="file" 
                                    ref={stickerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if(e.target.files?.[0]) onAddSticker(e.target.files[0]);
                                    }}
                                />
                            </div>
                            {stickers.map(s => (
                                <img 
                                    key={s.id} 
                                    src={s.url} 
                                    alt="sticker"
                                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 border border-gray-200 bg-white" 
                                    onClick={() => {
                                        onSendMessage(s.url, 'sticker');
                                        setShowStickerPanel(false);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Plus Menu */}
                    {showPlusMenu && (
                        <div className="grid grid-cols-4 gap-4 p-4 mt-2 border-t border-gray-200">
                            <div className="flex flex-col items-center gap-2 text-gray-500 cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <ImageIcon size={24} />
                                </div>
                                <span className="text-xs">相册</span>
                                <input 
                                    type="file" 
                                    ref={photoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if(e.target.files?.[0]) {
                                            onUploadPhoto(e.target.files[0]);
                                            setShowPlusMenu(false);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-col items-center gap-2 text-gray-500 cursor-pointer" onClick={() => {
                                setShowTransferModal(true);
                            }}>
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <Wallet size={24} />
                                </div>
                                <span className="text-xs">转账</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {showTransferModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-xs p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-center">请输入转账金额</h3>
                        <div className="flex items-center border-b-2 border-oil-meadow mb-6">
                            <span className="text-2xl font-bold mr-2">¥</span>
                            <input 
                                type="number" 
                                className="w-full text-2xl p-2 outline-none"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowTransferModal(false)} className="flex-1 py-2 text-gray-500">取消</button>
                            <button onClick={handleTransfer} className="flex-1 py-2 bg-oil-meadow text-white rounded font-bold">确定</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Voice Call Interface */}
            {isCalling && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] bg-gray-900 z-50 flex flex-col items-center pt-24 pb-12 text-white">
                     <div className="flex-1 flex flex-col items-center">
                         <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform duration-500 ${userSpeaking ? 'scale-105 ring-4 ring-green-400/50' : ''}`}>
                             <img src={activeChar.avatar} alt={activeChar.name} className="w-full h-full object-cover" />
                         </div>
                         <h2 className="text-3xl font-serif font-bold mb-2">{activeChar.name}</h2>
                         <p className="text-white/70 animate-pulse">{callDuration > 0 ? formatDuration(callDuration) : '正在呼叫...'}</p>
                         
                         <div className="h-16 flex items-center justify-center mt-12 gap-1">
                             {userSpeaking ? (
                                 [...Array(10)].map((_, i) => (
                                     <div key={i} className="w-1.5 bg-green-400 rounded-full animate-[bounce_0.5s_infinite]" style={{ height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 0.05}s` }}></div>
                                 ))
                             ) : (
                                 [...Array(5)].map((_, i) => (
                                     <div key={i} className="w-1 bg-white/30 rounded-full animate-pulse" style={{ height: '10px' }}></div>
                                 ))
                             )}
                         </div>
                         <p className="mt-4 text-xs text-white/50">{userSpeaking ? "正在聆听..." : "请说话..."}</p>
                     </div>

                     <div className="flex gap-12 items-center">
                         <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full ${isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'}`}>
                            {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
                         </button>

                         <button 
                            onClick={() => setIsCalling(false)}
                            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 shadow-lg transition transform hover:scale-110"
                        >
                             <Phone size={36} className="rotate-[135deg]" />
                         </button>
                     </div>
                </div>
            )}
        </div>
    );
  };

  const renderMoments = () => (
      <div className="flex flex-col h-full bg-white relative">
         {/* Header */}
          <div className="h-16 bg-gradient-to-r from-oil-sun via-oil-sunset to-oil-sunset flex items-center px-3 pt-2 relative z-10">
                <span className="font-serif font-bold text-lg text-white w-full text-center">朋友圈</span>
                <div className="absolute right-4 flex gap-4">
                    <button onClick={() => setShowPostMoment(true)} className="text-white hover:text-oil-base transition">
                        <Camera size={20} />
                    </button>
                    <button 
                      onClick={onRefreshMoments} 
                      className="text-white hover:text-oil-base transition"
                    >
                      <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="relative h-48 bg-gray-300">
                     <img src="https://picsum.photos/seed/cover/800/400" alt="cover" className="w-full h-full object-cover" />
                     <div className="absolute -bottom-6 right-4 flex items-end gap-3">
                         <span className="text-white font-bold drop-shadow-md mb-8 text-lg">{userProfile.name}</span>
                         <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-white overflow-hidden">
                             <img src={userProfile.avatar} alt="me" className="w-full h-full object-cover"/>
                         </div>
                     </div>
                </div>

                <div className="mt-12 px-4 pb-8 space-y-8">
                    {moments.map(moment => {
                        const author = characters.find(c => c.id === moment.authorId) || (moment.authorId === 'user' ? { name: userProfile.name, avatar: userProfile.avatar, id: 'user' } : null) || { name: 'Unknown', avatar: '', id: 'unknown' };
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
                                        <span className="text-xs text-gray-400">刚刚</span>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => onLikeMoment(moment.id)}
                                                className={`p-1 rounded ${moment.likes.includes('我') ? 'text-red-500' : 'text-[#576b95]'}`}
                                            >
                                                <Heart size={18} fill={moment.likes.includes('我') ? "currentColor" : "none"}/>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#f7f7f7] mt-2 rounded p-2">
                                         {moment.likes.length > 0 && (
                                            <div className="text-xs text-[#576b95] font-bold border-b border-white/50 pb-1 mb-1">
                                                <Heart size={12} className="inline mr-1"/>
                                                {moment.likes.join(', ')}
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            {moment.comments.map((comment, idx) => {
                                                const isMyComment = comment.author === userProfile.name;
                                                const targetName = isMyComment ? author.name : userProfile.name;
                                                
                                                return (
                                                    <div key={idx} className="text-xs text-gray-700">
                                                        <span className="text-[#576b95] font-bold">{comment.author}</span>
                                                        <span className="text-gray-500 mx-1">回复</span>
                                                        <span className="text-[#576b95] font-bold">{targetName}</span>
                                                        : {comment.content}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <input 
                                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none"
                                                placeholder="评论..."
                                                value={commentInputs[moment.id] || ''}
                                                onChange={e => setCommentInputs(prev => ({...prev, [moment.id]: e.target.value}))}
                                                onKeyDown={e => e.key === 'Enter' && handleAddComment(moment.id)}
                                            />
                                            <button onClick={() => handleAddComment(moment.id)} className="text-xs text-[#576b95]">发送</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showPostMoment && (
                 <div className="absolute inset-0 bg-white z-50 p-4">
                     <div className="flex justify-between items-center mb-4">
                         <button onClick={() => setShowPostMoment(false)} className="text-gray-600">取消</button>
                         <button 
                            onClick={() => {
                                if (postText.trim()) {
                                    onPostMoment(postText, postImage || undefined);
                                    setShowPostMoment(false);
                                    setPostText('');
                                    setPostImage(null);
                                }
                            }}
                            className={`px-4 py-1 rounded text-white text-sm font-bold ${postText.trim() ? 'bg-green-500' : 'bg-gray-300'}`}
                         >
                             发表
                         </button>
                     </div>
                     <textarea 
                        className="w-full h-32 outline-none resize-none text-base"
                        placeholder="这一刻的想法..."
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                     />
                     <div className="grid grid-cols-3 gap-2 mt-4">
                         {postImage && (
                             <div className="relative h-24 w-24">
                                 <img src={URL.createObjectURL(postImage)} className="w-full h-full object-cover rounded" alt="upload" />
                                 <button onClick={() => setPostImage(null)} className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1"><X size={12}/></button>
                             </div>
                         )}
                         <div 
                            className="h-24 w-24 bg-gray-100 flex items-center justify-center cursor-pointer"
                            onClick={() => postImageRef.current?.click()}
                         >
                             <Plus size={30} className="text-gray-400" />
                         </div>
                         <input 
                            type="file" 
                            className="hidden" 
                            ref={postImageRef}
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && setPostImage(e.target.files[0])}
                         />
                     </div>
                 </div>
            )}

          <div className="h-16 bg-white border-t border-oil-sun/20 flex items-center justify-around pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
              <button onClick={() => setView('chatList')} className="flex flex-col items-center text-gray-400 hover:text-oil-meadow transition cursor-pointer">
                  <MessageCircle size={24} />
                  <span className="text-[10px] font-bold mt-1">微信</span>
              </button>
              <button onClick={() => setView('moments')} className="flex flex-col items-center text-oil-meadow cursor-pointer">
                  <Aperture size={24} className="fill-current" />
                  <span className="text-[10px] font-bold mt-1">朋友圈</span>
              </button>
              <button onClick={() => setView('me')} className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition cursor-pointer">
                  <User size={24} />
                  <span className="text-[10px] font-bold mt-1">我</span>
              </button>
          </div>
      </div>
  )

  const renderMe = () => (
      <div className="flex flex-col h-full bg-gray-100">
           <div className="h-16 bg-white flex items-center px-4 pt-2 sticky top-0 shadow-sm z-10">
                <span className="font-serif font-bold text-lg w-full">我</span>
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               <div className="bg-white p-6 rounded-xl flex gap-4 items-center shadow-sm mb-6">
                   <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                       <img src={userProfile.avatar} alt="Me" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                       <h2 className="text-xl font-bold font-serif">{userProfile.name}</h2>
                       <p className="text-xs text-gray-500 mt-1">微信号: ai_soulmate_user</p>
                   </div>
                   <button onClick={() => {
                       setProfileForm(userProfile);
                       setIsEditingProfile(true);
                   }} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 hover:text-oil-sunset transition">
                       <Edit3 size={20} />
                   </button>
               </div>

               {isEditingProfile && (
                   <div className="absolute inset-0 bg-white z-50 overflow-y-auto p-6 animate-fade-in-up">
                       <div className="flex justify-between items-center mb-8">
                           <h3 className="text-2xl font-bold font-display text-oil-contrast">编辑个人资料</h3>
                           <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-gray-100 rounded-full">
                               <X size={24} />
                           </button>
                       </div>

                       <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">昵称</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 border-b border-gray-300 focus:border-oil-sunset outline-none font-serif text-lg"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">头像 URL</label>
                                <div className="flex gap-2">
                                     <img src={profileForm.avatar} alt="prev" className="w-10 h-10 rounded object-cover bg-gray-200"/>
                                     <input 
                                        className="flex-1 p-2 bg-gray-50 border rounded text-xs font-mono"
                                        value={profileForm.avatar}
                                        onChange={e => setProfileForm({...profileForm, avatar: e.target.value})}
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">立绘 URL (活动模式)</label>
                                <div className="flex gap-2">
                                     <img src={profileForm.standee} alt="prev" className="w-8 h-10 rounded object-cover bg-gray-200"/>
                                     <input 
                                        className="flex-1 p-2 bg-gray-50 border rounded text-xs font-mono"
                                        value={profileForm.standee}
                                        onChange={e => setProfileForm({...profileForm, standee: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">我的性格</label>
                                <textarea 
                                    className="w-full p-3 bg-gray-50 border rounded outline-none h-20 text-sm"
                                    value={profileForm.personality}
                                    onChange={e => setProfileForm({...profileForm, personality: e.target.value})}
                                    placeholder="温柔，随和..."
                                />
                            </div>

                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">我的经历/背景</label>
                                <textarea 
                                    className="w-full p-3 bg-gray-50 border rounded outline-none h-24 text-sm"
                                    value={profileForm.background}
                                    onChange={e => setProfileForm({...profileForm, background: e.target.value})}
                                    placeholder="我是一个..."
                                />
                            </div>

                            <button 
                                onClick={() => {
                                    onUpdateUserProfile(profileForm);
                                    setIsEditingProfile(false);
                                }}
                                className="w-full py-3 bg-oil-sunset text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                保存
                            </button>
                       </div>
                   </div>
               )}
           </div>

            <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around pb-2">
                <button onClick={() => setView('chatList')} className="flex flex-col items-center text-gray-400 hover:text-oil-meadow transition cursor-pointer">
                    <MessageCircle size={24} />
                    <span className="text-[10px] font-bold mt-1">微信</span>
                </button>
                <button onClick={() => setView('moments')} className="flex flex-col items-center text-gray-400 hover:text-oil-sunset transition cursor-pointer">
                  <Aperture size={24} />
                  <span className="text-[10px] font-bold mt-1">朋友圈</span>
                </button>
                <button onClick={() => setView('me')} className="flex flex-col items-center text-oil-meadow cursor-pointer">
                     <User size={24} />
                    <span className="text-[10px] font-bold mt-1">我</span>
                </button>
            </div>
      </div>
  )

  return (
    <div className="h-full w-full overflow-hidden">
      {view === 'chatList' && renderChatList()}
      {view === 'chatRoom' && renderChatRoom()}
      {view === 'moments' && renderMoments()}
      {view === 'me' && renderMe()}
    </div>
  );
};

export default PhoneInterface;