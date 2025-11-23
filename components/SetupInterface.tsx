import React, { useState, useRef } from 'react';
import { Character, BackgroundItem } from '../types';
import { Save, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface SetupInterfaceProps {
  onSave: (char: Character) => void;
  onCancel: () => void;
  existingChar?: Character;
  backgroundLibrary?: BackgroundItem[];
  onAddBackground?: (name: string, file: File) => void;
  onRemoveBackground?: (id: string) => void;
}

const SetupInterface: React.FC<SetupInterfaceProps> = ({ 
    onSave, 
    onCancel, 
    existingChar,
    backgroundLibrary = [],
    onAddBackground,
    onRemoveBackground
}) => {
  const [formData, setFormData] = useState<Partial<Character>>(existingChar || {
    name: '',
    personality: '',
    appearance: '',
    speakingStyle: '',
    relationship: '朋友',
    background: '',
    chatFrequency: 'medium',
    gender: 'female',
    avatar: 'https://picsum.photos/200',
    standee: 'https://picsum.photos/400/800'
  });

  const [newBgName, setNewBgName] = useState('');
  const bgInputRef = useRef<HTMLInputElement>(null);

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
        background: formData.background || '无',
        chatFrequency: formData.chatFrequency || 'medium',
        gender: (formData.gender as 'male' | 'female' | 'other') || 'female',
        avatar: formData.avatar!,
        standee: formData.standee!,
        memory: existingChar?.memory || [],
      });
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-oil-sunset via-oil-sun to-oil-water p-6 overflow-y-auto flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md border-4 border-oil-sun/50 rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button onClick={onCancel} className="absolute top-4 right-4 text-oil-contrast hover:text-oil-sunset transition relative z-10">
            <X size={28} />
        </button>

        <h2 className="text-4xl font-display font-bold text-oil-contrast mb-8 text-center border-b-2 border-oil-sun/30 pb-4 tracking-widest relative z-10">
          角色设定
        </h2>
        
        <div className="space-y-6 relative z-10">
          {/* Character Details Form */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-display font-bold text-oil-sunset mb-1 uppercase tracking-wider">聊天频率</label>
                <select 
                    className="w-full p-3 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none font-body text-lg text-oil-contrast"
                    value={formData.chatFrequency || 'medium'}
                    onChange={e => handleChange('chatFrequency', e.target.value)}
                >
                    <option value="high">活跃 (秒回、话多)</option>
                    <option value="medium">正常 (张弛有度)</option>
                    <option value="low">高冷 (惜字如金)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-display font-bold text-oil-sunset mb-1 uppercase tracking-wider">性别 (影响语音)</label>
                <select 
                    className="w-full p-3 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none font-body text-lg text-oil-contrast"
                    value={formData.gender || 'female'}
                    onChange={e => handleChange('gender', e.target.value)}
                >
                    <option value="female">女性</option>
                    <option value="male">男性</option>
                    <option value="other">其他</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-display font-bold text-oil-sunset mb-2 uppercase tracking-wider">性格与灵魂</label>
            <textarea 
              className="w-full p-4 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none h-24 font-body text-lg resize-none shadow-inner text-oil-contrast"
              value={formData.personality || ''}
              onChange={e => handleChange('personality', e.target.value)}
              placeholder="描述他/她的内心世界、性格特点..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-display font-bold text-oil-sunset mb-2 uppercase tracking-wider">经历/过往</label>
            <textarea 
              className="w-full p-4 bg-white border border-oil-sun/20 rounded-xl focus:border-oil-sunset outline-none h-24 font-body text-lg resize-none shadow-inner text-oil-contrast"
              value={formData.background || ''}
              onChange={e => handleChange('background', e.target.value)}
              placeholder="他/她的过去，以及你们共同的回忆..."
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

          {/* Background Library Section */}
          <div className="pt-8 border-t border-oil-sun/20">
              <h3 className="text-xl font-display font-bold text-oil-contrast mb-4">剧情模式场景库</h3>
              <p className="text-xs text-gray-500 mb-4">上传场景图片并命名（例如：卧室、海边），AI将根据对话自动切换场景。</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {backgroundLibrary.map(bg => (
                      <div key={bg.id} className="relative group rounded-lg overflow-hidden shadow-md h-24">
                          <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                              <span className="text-white text-xs font-bold truncate">{bg.name}</span>
                          </div>
                          {onRemoveBackground && (
                            <button 
                                onClick={() => onRemoveBackground(bg.id)}
                                className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 size={12} />
                            </button>
                          )}
                      </div>
                  ))}
                  
                  {/* Add New BG Button */}
                  {onAddBackground && (
                      <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 p-2 hover:bg-gray-50 transition">
                          <input 
                             placeholder="场景名称 (如: 卧室)"
                             className="w-full text-xs p-1 border rounded text-center"
                             value={newBgName}
                             onChange={e => setNewBgName(e.target.value)}
                          />
                          <button 
                            onClick={() => {
                                if (newBgName) bgInputRef.current?.click();
                                else alert("请先输入场景名称");
                            }}
                            className="flex items-center gap-1 text-xs text-oil-sun font-bold"
                          >
                              <Plus size={14}/> 上传图片
                          </button>
                          <input 
                            type="file" 
                            ref={bgInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={e => {
                                if (e.target.files?.[0]) {
                                    onAddBackground(newBgName, e.target.files[0]);
                                    setNewBgName('');
                                }
                            }}
                          />
                      </div>
                  )}
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