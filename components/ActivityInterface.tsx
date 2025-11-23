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
    // Generate a random background type for this session
    const places = ['victorian bedroom', 'vintage cafe', 'european garden', 'antique library', 'opera house'];
    const place = places[Math.floor(Math.random() * places.length)];
    // Add "oil painting" to keyword to get relevant images if using generative, here using seeds that might look artsy
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
        {/* Artistic Filters Overlay */}
        <div className="absolute inset-0 bg-orange-100/20 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center text-white">
            <button 
                onClick={onBack} 
                className="bg-black/50 hover:bg-black/70 p-3 rounded-full border border-oil-gold/50 transition backdrop-blur-sm group"
            >
                <ArrowLeft size={24} className="text-oil-paper group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-black/50 px-6 py-2 rounded-full border border-oil-gold/30 backdrop-blur-md">
                <span className="font-display font-bold text-lg tracking-[0.2em] text-oil-gold uppercase">Story Mode</span>
            </div>
            <div className="w-12"></div>
        </div>

        {/* Character Standee */}
        <div className="absolute inset-x-0 bottom-[-5%] top-20 flex justify-center items-end pointer-events-none z-0">
             {/* Add a subtle glow/shadow behind character */}
             <div className="absolute bottom-0 w-[300px] h-[100px] bg-black/50 blur-[50px] rounded-full"></div>
             <img 
                src={character.standee} 
                alt="character" 
                className="max-h-[95%] object-contain drop-shadow-2xl transition-transform duration-1000" 
             />
        </div>

        {/* Dialogue UI - Storybook Style */}
        <div className="relative z-20 w-full p-6 pb-8 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-oil-canvas/95 border-4 border-double border-oil-gold rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1 relative">
                {/* Decorative Corners */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-oil-amber rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-oil-amber rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-oil-amber rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-oil-amber rounded-br-lg"></div>

                <div className="bg-oil-canvas p-4 rounded-lg h-[35vh] flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none"></div>
                    
                    {/* History */}
                    <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar relative z-10" ref={scrollRef}>
                        {chatHistory.length === 0 && (
                            <div className="text-center text-gray-500 font-serif italic mt-10">
                                The scene is set. Speak to begin the story...
                            </div>
                        )}
                        {chatHistory.slice(-8).map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs font-display font-bold text-oil-amber mb-1 uppercase tracking-wider">
                                    {msg.sender === 'ai' ? character.name : 'You'}
                                </span>
                                <div className={`max-w-[85%] px-4 py-2 rounded-lg text-lg font-body leading-relaxed ${
                                    msg.sender === 'user' 
                                    ? 'bg-oil-dark/10 text-oil-dark italic border-b-2 border-oil-dark/20' 
                                    : 'text-oil-dark font-medium'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="mt-4 pt-4 border-t border-oil-gold/30 flex items-center gap-3 relative z-10">
                        <Feather className="text-oil-gold" size={20} />
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Write your line..."
                            className="flex-1 bg-transparent border-none outline-none text-oil-dark font-serif text-lg placeholder-oil-dark/40"
                        />
                        <button 
                            onClick={handleSend}
                            className="bg-oil-dark text-oil-gold px-6 py-2 rounded-lg hover:bg-black transition font-display font-bold tracking-widest border border-oil-gold uppercase text-sm shadow-lg hover:shadow-oil-gold/20"
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