import React, { useState } from 'react';
import { Character } from '../types';
import { Save, X } from 'lucide-react';

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
    relationship: '朋友',
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
        appearance: formData.appearance || '普通',
        speakingStyle: formData.speakingStyle || '正常',
        relationship: formData.relationship || '朋友',
        avatar: formData.avatar!,
        standee: formData.standee!
      });
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-oil-sunset via-oil-sun to-oil-water p-6 overflow-y-auto flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md border-4 border-oil-sun/50 rounded-3xl shadow-2xl p-8 relative">
        
        <button onClick={onCancel} className="absolute top-4 right-4 text-oil-contrast hover:text-oil-sunset transition relative z-10">
            <X size={28} />
        </button>

        <h2 className="text-4xl font-display font-bold text-oil-contrast mb-8 text-center border-b-2 border-oil-sun/30 pb-4 tracking-widest relative z-10">
          角色设定
        </h2>
        
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-display font-bold text-oil-sunset mb-1 uppercase tracking-wider">名字</label>
                <input 
                  className="w-full p-3 bg-white border-b-2 border-oil-sun/30 focus:border-oil-sunset outline-none font-serif text-xl placeholder-gray-300 transition-colors rounded-t-lg"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="输入名字..."
                />
              </div>

              <div>
                <label className="block text-sm font-display font-bold text-oil-sunset mb-1 uppercase tracking-wider">关系</label>
                <input 
                  className="w-full p-3 bg-white border-b-2 border-oil-sun/30 focus:border-oil-sunset outline-none font-serif text-xl placeholder-gray-300 rounded-t-lg"
                  value={formData.relationship || ''}
                  onChange={e => handleChange('relationship', e.target.value)}
                  placeholder="例如：青梅竹马"
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-display font-bold text-oil-sunset mb-2 uppercase tracking-wider">性格与灵魂</label>
            <textarea 
              className="w-full p-4 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none h-32 font-body text-lg resize-none shadow-inner text-oil-contrast"
              value={formData.personality || ''}
              onChange={e => handleChange('personality', e.target.value)}
              placeholder="描述他/她的内心世界、性格特点..."
            />
          </div>

          <div>
            <label className="block text-sm font-display font-bold text-oil-sunset mb-2 uppercase tracking-wider">外貌描述</label>
            <input 
              className="w-full p-3 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none font-body text-lg text-oil-contrast"
              value={formData.appearance || ''}
              onChange={e => handleChange('appearance', e.target.value)}
              placeholder="详细的身体特征、穿着..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">头像链接</label>
                <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-oil-sun overflow-hidden bg-gray-100 shadow-md">
                        <img src={formData.avatar} className="w-full h-full object-cover" alt="prev"/>
                    </div>
                    <input 
                    className="flex-1 p-2 border border-gray-200 rounded bg-white text-xs font-mono"
                    value={formData.avatar || ''}
                    onChange={e => handleChange('avatar', e.target.value)}
                    />
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">立绘链接</label>
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-16 rounded border-2 border-oil-sun overflow-hidden bg-gray-100 shadow-md">
                         <img src={formData.standee} className="w-full h-full object-cover" alt="prev"/>
                    </div>
                    <input 
                    className="flex-1 p-2 border border-gray-200 rounded bg-white text-xs font-mono"
                    value={formData.standee || ''}
                    onChange={e => handleChange('standee', e.target.value)}
                    />
                </div>
              </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-oil-sun/20 mt-4">
            <button 
              onClick={onCancel}
              className="px-6 py-2 text-oil-contrast font-serif hover:underline"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-oil-sunset to-oil-sun text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 font-display font-bold tracking-widest uppercase border border-white/30"
            >
              <Save size={18} />
              保存设定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupInterface;