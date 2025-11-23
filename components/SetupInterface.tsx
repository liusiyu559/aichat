import React, { useState } from 'react';
import { Character } from '../types';
import { Save, User, X } from 'lucide-react';

interface SetupInterfaceProps {
  onSave: (char: Character) => void;
  onCancel: () => void;
  existingChar?: Character;
}

const SetupInterface: React.FC<SetupInterfaceProps> = ({ onSave, onCancel, existingChar }) => {
  const [formData, setFormData] = useState<Partial<Character>>(existingChar || {
    name: '',
    personality: '',
    appearance: '',
    speakingStyle: '',
    relationship: 'Friend',
    avatar: 'https://picsum.photos/200',
    standee: 'https://picsum.photos/400/800'
  });

  const handleChange = (field: keyof Character, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.name && formData.personality) {
      onSave({
        id: existingChar?.id || Date.now().toString(),
        name: formData.name!,
        personality: formData.personality!,
        appearance: formData.appearance || 'Average',
        speakingStyle: formData.speakingStyle || 'Normal',
        relationship: formData.relationship || 'Friend',
        avatar: formData.avatar!,
        standee: formData.standee!
      });
    }
  };

  return (
    <div className="h-full bg-oil-dark p-6 overflow-y-auto canvas-bg flex justify-center items-center">
      <div className="w-full max-w-2xl bg-oil-canvas border-8 border-double border-oil-dark shadow-2xl p-8 relative">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-paper-texture opacity-50 pointer-events-none"></div>

        <button onClick={onCancel} className="absolute top-4 right-4 text-oil-dark hover:text-oil-red transition relative z-10">
            <X size={28} />
        </button>

        <h2 className="text-4xl font-display font-bold text-oil-dark mb-8 text-center border-b-2 border-oil-dark pb-4 tracking-widest relative z-10">
          Character Dossier
        </h2>
        
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-display font-bold text-oil-amber mb-1 uppercase tracking-wider">Name</label>
                <input 
                  className="w-full p-3 bg-transparent border-b-2 border-oil-dark/30 focus:border-oil-dark outline-none font-serif text-xl placeholder-gray-400 transition-colors"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Enter name..."
                />
              </div>

              <div>
                <label className="block text-sm font-display font-bold text-oil-amber mb-1 uppercase tracking-wider">Archetype / Role</label>
                <input 
                  className="w-full p-3 bg-transparent border-b-2 border-oil-dark/30 focus:border-oil-dark outline-none font-serif text-xl placeholder-gray-400"
                  value={formData.relationship}
                  onChange={e => handleChange('relationship', e.target.value)}
                  placeholder="e.g. Childhood Friend"
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-display font-bold text-oil-amber mb-2 uppercase tracking-wider">Personality & Soul</label>
            <textarea 
              className="w-full p-4 bg-white/40 border border-oil-dark/20 rounded-lg focus:border-oil-dark outline-none h-32 font-body text-lg resize-none shadow-inner"
              value={formData.personality}
              onChange={e => handleChange('personality', e.target.value)}
              placeholder="Describe their inner world, quirks, and nature..."
            />
          </div>

          <div>
            <label className="block text-sm font-display font-bold text-oil-amber mb-2 uppercase tracking-wider">Visual Description</label>
            <input 
              className="w-full p-3 bg-white/40 border border-oil-dark/20 rounded-lg focus:border-oil-dark outline-none font-body text-lg"
              value={formData.appearance}
              onChange={e => handleChange('appearance', e.target.value)}
              placeholder="Detailed physical traits..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Portrait URL</label>
                <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-oil-gold overflow-hidden bg-gray-300 shadow-md">
                        <img src={formData.avatar} className="w-full h-full object-cover" alt="prev"/>
                    </div>
                    <input 
                    className="flex-1 p-2 border border-gray-300 rounded bg-white/50 text-xs font-mono"
                    value={formData.avatar}
                    onChange={e => handleChange('avatar', e.target.value)}
                    />
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Full Body URL</label>
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-16 rounded border-2 border-oil-gold overflow-hidden bg-gray-300 shadow-md">
                         <img src={formData.standee} className="w-full h-full object-cover" alt="prev"/>
                    </div>
                    <input 
                    className="flex-1 p-2 border border-gray-300 rounded bg-white/50 text-xs font-mono"
                    value={formData.standee}
                    onChange={e => handleChange('standee', e.target.value)}
                    />
                </div>
              </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-oil-dark/10 mt-4">
            <button 
              onClick={onCancel}
              className="px-6 py-2 text-oil-dark font-serif hover:underline"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-oil-dark text-oil-gold rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 font-display font-bold tracking-widest uppercase border border-oil-gold"
            >
              <Save size={18} />
              Inscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupInterface;