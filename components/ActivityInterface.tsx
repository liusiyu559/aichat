import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Feather, Eye, EyeOff, MoreVertical, Edit3, Trash2, Repeat } from 'lucide-react';
import { Character, Message, BackgroundItem } from '../types';
import { analyzeContextForScene, getBackgroundUrl } from '../services/geminiService';

interface ActivityInterfaceProps {
  character: Character;
  chatHistory: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  backgroundLibrary: BackgroundItem[];
  onDeleteMessage: (msgId: string) => void; // New
  onEditMessage: (msgId: string, newText: string) => void; // New
  onRegenerateMessage: (msgId: string) => void; // New
}

const ActivityInterface: React.FC<ActivityInterfaceProps> = ({
  character,
  chatHistory,
  onSendMessage,
  onBack,
  backgroundLibrary,
  onDeleteMessage,
  onEditMessage,
  onRegenerateMessage
}) => {
  const [inputText, setInputText] = useState('');
  const [background, setBackground] = useState('');
  const [hideUI, setHideUI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Message Actions State
  const [hoverMsgId, setHoverMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgText, setEditMsgText] = useState('');

  // Analyze context to update background
  useEffect(() => {
     const updateBackground = async () => {
         const msgs = chatHistory.filter(m => m.scene === 'activity');
         if ((msgs.length > 0 && msgs.length % 5 === 0) || !background) { 
            const keyword = await analyzeContextForScene(msgs, backgroundLibrary);
            const customBg = backgroundLibrary.find(b => b.name === keyword);
            if (customBg) {
                setBackground(customBg.url);
            } else {
                const fallback = backgroundLibrary[0]?.url || getBackgroundUrl(keyword);
                setBackground(fallback);
            }
         }
     }
     updateBackground();
  }, [chatHistory, background, backgroundLibrary]);

  const activityMessages = chatHistory.filter(m => m.scene === 'activity');

  useEffect(() => {
    if (scrollRef.current && !hideUI) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activityMessages, hideUI]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const renderFormattedText = (text: string) => {
      const lines = text.split('\n');
      return lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              return <p key={lineIdx} className="text-oil-meadow font-medium my-1 block font-body opacity-100">{trimmed}</p>
          } 
          else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
              return <p key={lineIdx} className="text-oil-sunset italic my-1 font-serif text-sm block">{trimmed}</p>
          } 
          else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
               return <p key={lineIdx} className="text-black font-bold text-base my-2 font-serif tracking-wide block">{trimmed}</p>
          }
          else {
              if (trimmed.includes('"')) {
                  const parts = trimmed.split('"');
                  return (
                      <p key={lineIdx} className="text-black mb-1 font-serif">
                          {parts.map((part, i) => (
                              <span key={i} className={i % 2 !== 0 ? "font-bold" : ""}>
                                  {i % 2 !== 0 ? `"${part}"` : part}
                              </span>
                          ))}
                      </p>
                  )
              }
              return <p key={lineIdx} className="text-gray-900 mb-1 font-serif">{trimmed}</p>
          }
      });
  };

  return (
    <div 
      className="w-full h-full relative bg-cover bg-center flex flex-col justify-between overflow-hidden transition-all duration-1000"
      style={{ backgroundImage: `url(${background})` }}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-oil-sun/5 to-oil-water/5 mix-blend-overlay pointer-events-none"></div>

        {/* Top Controls */}
        <div className="relative z-30 p-4 flex justify-between items-start text-white">
            <button 
                onClick={onBack} 
                className={`bg-black/20 hover:bg-black/40 p-3 rounded-full backdrop-blur-md transition ${hideUI ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
            >
                <ArrowLeft size={24} className="text-white" />
            </button>
            
            <button 
                onClick={() => setHideUI(!hideUI)}
                className="bg-black/20 hover:bg-black/40 p-3 rounded-full backdrop-blur-md transition"
            >
                {hideUI ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
        </div>

        {/* Character Standee */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex justify-center items-end pointer-events-none z-10">
             <div className="absolute bottom-0 w-[500px] h-[200px] bg-black/40 blur-[80px] rounded-full mix-blend-multiply opacity-50"></div>
             <img 
                src={character.standee} 
                alt="character" 
                className="max-h-[95%] max-w-[90%] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-1000" 
             />
        </div>

        {/* Full Chat History */}
        {!hideUI && (
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-24 pointer-events-none">
                 <div 
                    ref={scrollRef}
                    className="flex flex-col w-full h-[75vh] overflow-y-auto pointer-events-auto custom-scrollbar px-4 md:px-20 lg:px-40 pb-4"
                 >
                    {activityMessages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`w-full mb-4 animate-fade-in-up flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group relative`}
                            onMouseEnter={() => setHoverMsgId(msg.id)}
                            onMouseLeave={() => setHoverMsgId(null)}
                        >
                             {/* Actions (Visible on Hover) */}
                             {hoverMsgId === msg.id && !editingMsgId && (
                                 <div className={`absolute -top-8 ${msg.sender === 'user' ? 'right-0' : 'left-0'} flex gap-1 bg-black/50 backdrop-blur rounded p-1`}>
                                     {msg.type === 'text' && (
                                         <button onClick={() => {setEditingMsgId(msg.id); setEditMsgText(msg.text);}} className="p-1 text-white hover:text-oil-sun"><Edit3 size={14}/></button>
                                     )}
                                     {msg.sender === 'ai' && (
                                          <button onClick={() => onRegenerateMessage(msg.id)} className="p-1 text-white hover:text-oil-sun"><Repeat size={14}/></button>
                                     )}
                                     <button onClick={() => onDeleteMessage(msg.id)} className="p-1 text-white hover:text-red-400"><Trash2 size={14}/></button>
                                 </div>
                             )}

                             {/* Message Content */}
                             {msg.sender === 'user' ? (
                                 <div className="bg-oil-deepSea/60 backdrop-blur-sm text-white px-6 py-3 rounded-xl max-w-[80%] shadow-lg border border-white/10 text-right pointer-events-auto">
                                     {editingMsgId === msg.id ? (
                                        <div className="flex flex-col gap-2 pointer-events-auto">
                                            <textarea 
                                                className="bg-white/20 text-white p-2 rounded border border-white/30 outline-none resize-none" 
                                                value={editMsgText} 
                                                onChange={e => setEditMsgText(e.target.value)}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditingMsgId(null)} className="text-xs text-white/70">取消</button>
                                                <button onClick={() => {onEditMessage(msg.id, editMsgText); setEditingMsgId(null);}} className="text-xs font-bold text-oil-sun">保存</button>
                                            </div>
                                        </div>
                                     ) : (
                                        <p className="font-serif leading-relaxed text-base">{msg.text}</p>
                                     )}
                                 </div>
                             ) : (
                                 <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl w-full max-w-[95%] shadow-md border border-white/40 text-left pointer-events-auto">
                                      <span className="text-[10px] font-bold text-oil-sun mb-2 block uppercase tracking-widest">{character.name}</span>
                                      <div className="leading-relaxed">
                                         {editingMsgId === msg.id ? (
                                            <div className="flex flex-col gap-2 pointer-events-auto">
                                                <textarea 
                                                    className="bg-white border p-2 rounded outline-none resize-none text-black" 
                                                    value={editMsgText} 
                                                    onChange={e => setEditMsgText(e.target.value)}
                                                    rows={4}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setEditingMsgId(null)} className="text-xs text-gray-500">取消</button>
                                                    <button onClick={() => {onEditMessage(msg.id, editMsgText); setEditingMsgId(null);}} className="text-xs font-bold text-oil-sun">保存</button>
                                                </div>
                                            </div>
                                         ) : (
                                            renderFormattedText(msg.text)
                                         )}
                                      </div>
                                 </div>
                             )}
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* Input Bar - Hidden when UI is hidden */}
        {!hideUI && (
            <div className={`absolute bottom-0 inset-x-0 z-40 p-4 transition-transform duration-300 translate-y-0`}>
                <div className="max-w-3xl mx-auto flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-2 pl-4 shadow-2xl">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="描述动作或对话..."
                        className="flex-1 bg-transparent border-none outline-none text-white font-medium placeholder-white/50 text-sm shadow-black drop-shadow-md"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-10 h-10 bg-oil-sun text-oil-contrast rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
                    >
                        <Feather size={18} />
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ActivityInterface;