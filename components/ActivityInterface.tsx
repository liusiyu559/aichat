import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Feather } from 'lucide-react';
import { Character, Message } from '../types';
import { getBackgroundUrl } from '../services/geminiService';

interface ActivityInterfaceProps {
  character: Character;
  chatHistory: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

const ActivityInterface: React.FC<ActivityInterfaceProps> = ({
  character,
  chatHistory,
  onSendMessage,
  onBack
}) => {
  const [inputText, setInputText] = useState('');
  const [background, setBackground] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use bright, sunny scenic terms
    const places = ['sunny beach cafe', 'vibrant flower garden', 'venice canal sunset', 'royal gold palace'];
    const place = places[Math.floor(Math.random() * places.length)];
    setBackground(getBackgroundUrl(place));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div 
      className="w-full h-full relative bg-cover bg-center flex flex-col justify-between overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
        {/* Sunny Filter Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-oil-sun/20 to-oil-water/20 mix-blend-overlay pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center text-white">
            <button 
                onClick={onBack} 
                className="bg-white/30 hover:bg-white/50 p-3 rounded-full border border-white/50 transition backdrop-blur-md group shadow-lg"
            >
                <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-white/30 px-8 py-2 rounded-full border border-white/50 backdrop-blur-md shadow-lg">
                <span className="font-display font-bold text-lg tracking-[0.2em] text-white uppercase drop-shadow-md">Story Mode</span>
            </div>
            <div className="w-12"></div>
        </div>

        {/* Character Standee */}
        <div className="absolute inset-x-0 bottom-[-5%] top-20 flex justify-center items-end pointer-events-none z-0">
             <div className="absolute bottom-0 w-[400px] h-[100px] bg-oil-sun/30 blur-[60px] rounded-full mix-blend-screen"></div>
             <img 
                src={character.standee} 
                alt="character" 
                className="max-h-[95%] object-contain drop-shadow-2xl transition-transform duration-1000" 
             />
        </div>

        {/* Dialogue UI - Glass/Light Style */}
        <div className="relative z-20 w-full p-6 pb-10 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white/80 border border-white/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-1 relative backdrop-blur-xl">
                {/* Decorative Gold Corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-oil-sun rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-oil-sun rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-oil-sun rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-oil-sun rounded-br-lg"></div>

                <div className="p-6 rounded-xl h-[35vh] flex flex-col relative overflow-hidden">
                    
                    {/* History */}
                    <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar relative z-10" ref={scrollRef}>
                        {chatHistory.length === 0 && (
                            <div className="text-center text-oil-contrast/60 font-serif italic mt-10">
                                The sun is warm. What do you want to say?
                            </div>
                        )}
                        {chatHistory.slice(-8).map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs font-display font-bold text-oil-sunset mb-1 uppercase tracking-wider shadow-sm">
                                    {msg.sender === 'ai' ? character.name : 'You'}
                                </span>
                                <div className={`max-w-[90%] px-5 py-3 rounded-xl text-lg font-body leading-relaxed shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-oil-water/20 text-oil-deepSea border border-oil-water/30' 
                                    : 'bg-white/60 text-oil-contrast font-medium border border-white'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="mt-4 pt-4 border-t border-oil-sun/30 flex items-center gap-3 relative z-10">
                        <Feather className="text-oil-sunset" size={24} />
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Write your action..."
                            className="flex-1 bg-transparent border-none outline-none text-oil-contrast font-serif text-lg placeholder-oil-contrast/40"
                        />
                        <button 
                            onClick={handleSend}
                            className="bg-gradient-to-r from-oil-sunset to-oil-sun text-white px-8 py-2 rounded-full hover:scale-105 transition font-display font-bold tracking-widest uppercase text-sm shadow-lg border border-white/40"
                        >
                            Act
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ActivityInterface;