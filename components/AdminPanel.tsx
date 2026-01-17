
import React from 'react';
import { PricingFactors, BackplateType, LedType } from '../types';
import { Save, RefreshCcw, X, Plus, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  factors: PricingFactors;
  onUpdate: (newFactors: PricingFactors) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ factors, onUpdate, onClose }) => {
  const [localFactors, setLocalFactors] = React.useState<PricingFactors>(factors);
  const [newSpacing, setNewSpacing] = React.useState<string>('');

  const handleFramePriceChange = (key: string, value: number) => {
    setLocalFactors(prev => ({
      ...prev,
      framePrices: { ...prev.framePrices, [key]: value }
    }));
  };

  const handleBackplateChange = (type: BackplateType, value: number) => {
    setLocalFactors(prev => ({
      ...prev,
      backplatePrices: { ...prev.backplatePrices, [type]: value }
    }));
  };

  const handleLedChange = (type: LedType, value: number) => {
    setLocalFactors(prev => ({
      ...prev,
      ledPrices: { ...prev.ledPrices, [type]: value }
    }));
  };

  const addSpacingOption = () => {
    const val = parseInt(newSpacing);
    if (!isNaN(val) && !localFactors.ledSpacingOptions.includes(val)) {
      setLocalFactors(prev => ({
        ...prev,
        ledSpacingOptions: [...prev.ledSpacingOptions, val].sort((a, b) => a - b)
      }));
      setNewSpacing('');
    }
  };

  const removeSpacingOption = (val: number) => {
    setLocalFactors(prev => ({
      ...prev,
      ledSpacingOptions: prev.ledSpacingOptions.filter(o => o !== val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-[#0f0f12] w-full max-w-5xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Sistem <span className="text-indigo-500">Yönetimi</span></h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-black">Maliyetler ve Teknik Parametreler</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-10 overflow-y-auto custom-scrollbar">
          
          {/* KASA FİYATLARI */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">KASA (MT TÜL)</h3>
            <div className="space-y-4">
              {Object.keys(localFactors.framePrices).sort().map(key => (
                <label key={key} className="block space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase">{key.replace('_', ' ')}</span>
                  <input type="number" value={localFactors.framePrices[key]} onChange={(e) => handleFramePriceChange(key, Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
                </label>
              ))}
            </div>
          </div>

          {/* ZEMİN & LED */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">ZEMİN (M2)</h3>
            {(Object.keys(localFactors.backplatePrices) as BackplateType[]).map(type => (
              <label key={type} className="block space-y-2">
                <span className="text-[10px] text-gray-500 uppercase">{type.replace(/_/g, ' ')}</span>
                <input type="number" value={localFactors.backplatePrices[type]} onChange={(e) => handleBackplateChange(type, Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
              </label>
            ))}

            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mt-10 mb-4">LED (MT TÜL)</h3>
            {(Object.keys(localFactors.ledPrices) as LedType[]).map(type => (
              <label key={type} className="block space-y-2">
                <span className="text-[10px] text-gray-500 uppercase">{type === 'INNER' ? 'İÇ MEKAN' : 'DIŞ MEKAN'}</span>
                <input type="number" value={localFactors.ledPrices[type]} onChange={(e) => handleLedChange(type, Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
              </label>
            ))}
          </div>

          {/* LED ARALIK AYARLARI */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">LED ARALIK SEÇENEKLERİ (CM)</h3>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Örn: 12" 
                value={newSpacing} 
                onChange={(e) => setNewSpacing(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black outline-none focus:border-cyan-500 transition-colors"
              />
              <button onClick={addSpacingOption} className="p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {localFactors.ledSpacingOptions.map(opt => (
                <div key={opt} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-sm font-black text-white">{opt} cm</span>
                  <button onClick={() => removeSpacingOption(opt)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DİĞERLERİ */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-4">DİĞER GİDERLER</h3>
            <label className="block space-y-2">
              <span className="text-[10px] text-gray-500 uppercase">BASKI (M2)</span>
              <input type="number" value={localFactors.pricePerSqMeterPrinting} onChange={(e) => setLocalFactors({...localFactors, pricePerSqMeterPrinting: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] text-gray-500 uppercase">KÖŞE APARATI (ADET)</span>
              <input type="number" value={localFactors.cornerPiecePrice} onChange={(e) => setLocalFactors({...localFactors, cornerPiecePrice: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] text-gray-500 uppercase">SABİT EKSTRA GİDER</span>
              <input type="number" value={localFactors.cablePrice} onChange={(e) => setLocalFactors({...localFactors, cablePrice: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-black" />
            </label>
          </div>
        </div>

        <div className="p-10 bg-white/5 border-t border-white/5 flex gap-4">
          <button onClick={() => onUpdate(localFactors)} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-xl uppercase tracking-widest">
            <Save className="w-5 h-5" /> KAYDET VE GÜNCELLE
          </button>
          <button onClick={onClose} className="px-10 py-5 bg-white/5 text-gray-400 font-black rounded-2xl hover:bg-white/10 transition uppercase tracking-widest text-xs">
            VAZGEÇ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
