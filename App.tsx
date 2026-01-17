import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Settings, Box, ShoppingBag, X, Upload, Eye, EyeOff,
  Image as ImageIcon, CheckCircle2, LayoutGrid, Maximize2,
  LucideImage, Calculator, Layers, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfigOptions, ShapeType, ProfileType, PricingFactors, MockupScene } from './types';
import { DEFAULT_CONFIG, INITIAL_PRICING, DEPTH_OPTIONS, MOCKUP_SCENES } from './constants';
import { calculatePrice } from './services/priceCalculator';
import Lightbox3D from './components/Lightbox3D';
import MockupViewer from './components/MockupViewer';
import { api } from './services/api';

const App: React.FC = () => {
  const [config, setConfig] = useState<ConfigOptions>(DEFAULT_CONFIG);
  const [factors, setFactors] = useState<PricingFactors>(INITIAL_PRICING);
  const [selectedScene, setSelectedScene] = useState<MockupScene | null>(null);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => calculatePrice(config, factors), [config, factors]);

  useEffect(() => {
    api.getSettings().then(data => {
      setFactors(data);
    }).catch(err => {
      console.warn("Using default pricing (API offline?)", err);
    });
  }, []);

  const updateConfig = (key: keyof ConfigOptions, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateConfig('userImageUrl', event.target?.result as string);
        updateConfig('viewMode', 'finish');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Settings Panel Content (shared between desktop sidebar and mobile inline) ---
  const SettingsPanelContent = () => (
    <div className="p-6 md:p-10 space-y-10 md:space-y-12 pb-32">
      {/* Tasarım Yükleme Alanı */}
      <section className="bg-indigo-600/5 p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-indigo-500/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

        {/* Mobile Layout: Compact horizontal */}
        <div className="relative z-10 md:hidden">
          <h3 className="text-sm font-black text-white uppercase tracking-tighter italic text-center mb-3">TASARIMINIZI YÜKLEYİN</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-sm">
              <Upload className="w-4 h-4" /> GÖRSEL SEÇ
            </button>
          </div>
          {config.userImageUrl && (
            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">GÖRSEL HAZIR</span>
            </div>
          )}
        </div>

        {/* Desktop Layout: Original centered design */}
        <div className="relative z-10 hidden md:block text-center">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
            <ImageIcon className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">TASARIMINIZI YÜKLEYİN</h3>
          <p className="text-[10px] text-gray-500 mt-2 mb-8 font-bold uppercase tracking-widest italic">JPEG, PNG Formatları</p>

          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
            <Upload className="w-5 h-5" /> GÖRSEL SEÇ
          </button>

          {config.userImageUrl && (
            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 py-3 rounded-xl border border-emerald-500/10">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">GÖRSEL HAZIR</span>
            </div>
          )}
        </div>
      </section>

      {/* Konfigürasyon Seçenekleri */}
      <div className="space-y-10 md:space-y-12 px-1 md:px-2">
        <div className="grid grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">GENİŞLİK (CM)</span>
            <input type="number" value={config.width} onChange={(e) => updateConfig('width', Number(e.target.value))} className="w-full px-4 md:px-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg md:text-xl transition-all" />
          </div>
          <div className="space-y-3 md:space-y-4">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">YÜKSEKLİK (CM)</span>
            <input type="number" value={config.height} onChange={(e) => updateConfig('height', Number(e.target.value))} className="w-full px-4 md:px-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg md:text-xl transition-all" />
          </div>
        </div>

        <section className="space-y-4 md:space-y-6">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">TABLO TİPİ</label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button onClick={() => updateConfig('profile', ProfileType.SINGLE)} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.profile === ProfileType.SINGLE ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>TEK TARAFLI</button>
            <button onClick={() => updateConfig('profile', ProfileType.DOUBLE)} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.profile === ProfileType.DOUBLE ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>ÇİFT TARAFLI</button>
          </div>
        </section>



        <section className="space-y-4 md:space-y-6">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">KASA DERİNLİĞİ (CM)</label>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {DEPTH_OPTIONS.map(d => (
              <button key={d} onClick={() => updateConfig('depth', d)} className={`py-3 md:py-4 rounded-xl text-[10px] font-black transition-all ${config.depth === d ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{d}</button>
            ))}
          </div>
        </section>

        <section className="space-y-4 md:space-y-6">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">ZEMİN MALZEMESİ</label>
          <div className="space-y-2 md:space-y-3">
            {[
              { id: 'MDF_4MM', label: '4 MM MDF' },
              { id: 'DEKOTA_4_5MM', label: '4.5 MM DEKOTA' },
              { id: 'KOMPOZIT_4MM', label: '4 MM KOMPOZİT' }
            ].map(opt => (
              <button key={opt.id} onClick={() => updateConfig('backplate', opt.id)} className={`w-full py-4 md:py-5 px-6 md:px-8 rounded-2xl text-[10px] font-black text-left transition-all border flex items-center justify-between ${config.backplate === opt.id ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>
                {opt.label}
                {config.backplate === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]" />}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 md:space-y-6">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">LED KULLANIMI</label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button onClick={() => updateConfig('ledType', 'INNER')} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.ledType === 'INNER' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-gray-500'}`}>İÇ MEKAN</button>
            <button onClick={() => updateConfig('ledType', 'OUTER')} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.ledType === 'OUTER' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-gray-500'}`}>DIŞ MEKAN</button>
          </div>
        </section>

        {/* Fiyat ve Sipariş Onay */}
        <div className="mt-10 md:mt-16 p-8 md:p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] md:rounded-[3rem] shadow-inner">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1 leading-none">ÖDEME TUTARI</span>
              <span className="text-3xl md:text-4xl font-black text-white tracking-tighter italic leading-none">${result.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end opacity-40">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">TESLİMAT</span>
              <span className="text-xs font-black text-white leading-none italic uppercase">3-5 GÜN</span>
            </div>
          </div>
          <button onClick={async () => {
            const order = {
              customerName: "Misafir Kullanıcı", // In a real app, you'd ask for this
              dimensions: `${config.width}x${config.height}`,
              price: result.totalPrice,
              configurationDetails: JSON.stringify(config),
              status: 'Pending'
            };

            try {
              await api.createOrder(order);
              alert("Siparişiniz başarıyla alındı!");
            } catch (error) {
              console.error(error);
              alert("Sipariş oluşturulurken bir hata oluştu.");
            }
          }} className="w-full bg-white text-black font-black py-5 md:py-6 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 md:gap-4 shadow-2xl uppercase tracking-tighter text-base md:text-lg group active:scale-[0.98]">
            SİPARİŞİ TAMAMLA <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE LAYOUT: Single scrollable page */}
      <div className="md:hidden min-h-screen w-full bg-[#050507] text-gray-200 font-sans overflow-x-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-center z-10 bg-white/[0.03] p-4 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">
                  Lightbox<span className="text-indigo-500">Master</span>
                </h1>
                <span className="text-gray-500 text-[8px] font-black uppercase tracking-[0.3em] mt-0.5 block">Studio Engine v10.0</span>
              </div>
            </div>
            <button onClick={() => navigate('/admin')} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group shadow-lg">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 3D STUDIO STAGE */}
        <div className="px-4">
          <div className="relative h-[300px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent)] pointer-events-none" />
            <Lightbox3D config={config} isMockupMode={false} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl z-20">
              <button onClick={() => updateConfig('viewMode', 'finish')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${config.viewMode === 'finish' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-gray-500'}`}>
                <Eye className="w-3 h-3" /> ATÖLYE
              </button>
              <button onClick={() => updateConfig('viewMode', 'technical')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${config.viewMode === 'technical' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-gray-500'}`}>
                <EyeOff className="w-3 h-3" /> TEKNİK
              </button>
              <button
                onClick={() => updateConfig('isLightOn', !config.isLightOn)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                <Sparkles className={`w-3 h-3 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}
              </button>
            </div>
          </div>
        </div>

        {/* MOCKUP SEÇENEKLERİ */}
        <div className="mt-8 mb-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                <LayoutGrid className="w-4 h-4 text-indigo-500" /> MEKAN SİMÜLASYONU
              </h2>
              <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-widest font-bold">Ürünü Farklı Ortamlarda Test Edin</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MOCKUP_SCENES.map((scene) => (
              <div
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`group relative h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedScene?.id === scene.id ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-white/5'}`}
              >
                <img src={scene.url} alt={scene.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">{scene.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AYARLAR - Inline on Mobile */}
        <div className="bg-[#08080a] border-t border-white/5">
          <SettingsPanelContent />
        </div>
      </div>

      {/* DESKTOP LAYOUT: Side-by-side panels */}
      <div className="hidden md:flex h-screen w-screen bg-[#050507] text-gray-200 font-sans overflow-hidden">
        {/* SOL PANEL: Atölye Sahnesi */}
        <div className="flex-1 relative p-8 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Header */}
          <div className="flex justify-between items-center mb-8 z-10 bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">
                  Lightbox<span className="text-indigo-500">Master</span>
                </h1>
                <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1 block">Studio Engine v10.0</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end pr-6 border-r border-white/10">
                <span className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">GÜNCEL FİYAT</span>
                <span className="text-xl font-black text-indigo-400 tracking-tighter">${result.totalPrice.toLocaleString()}</span>
              </div>
              <button onClick={() => navigate('/admin')} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group shadow-lg">
                <Settings className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* 3D STUDIO STAGE */}
          <div className="relative h-[550px] min-h-[450px] w-full rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent)] pointer-events-none" />
            <Lightbox3D config={config} isMockupMode={false} />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2.5 bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl z-20">
              <button onClick={() => updateConfig('viewMode', 'finish')} className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black transition-all ${config.viewMode === 'finish' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-gray-500 hover:text-white'}`}>
                <Eye className="w-4 h-4" /> ATÖLYE GÖRÜNÜMÜ
              </button>
              <button onClick={() => updateConfig('viewMode', 'technical')} className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black transition-all ${config.viewMode === 'technical' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-gray-500 hover:text-white'}`}>
                <EyeOff className="w-4 h-4" /> TEKNİK ŞEMA
              </button>
              <button
                onClick={() => updateConfig('isLightOn', !config.isLightOn)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                <Sparkles className={`w-4 h-4 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}
              </button>
            </div>
          </div>

          {/* MOCKUP SEÇENEKLERİ */}
          <div className="mt-14 mb-10 px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <LayoutGrid className="w-5 h-5 text-indigo-500" /> MEKAN SİMÜLASYONU
                </h2>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Ürünü Farklı Ortamlarda Test Edin</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-5">
              {MOCKUP_SCENES.map((scene) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className={`group relative h-32 rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedScene?.id === scene.id ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  <img src={scene.url} alt={scene.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">{scene.title}</span>
                  </div>
                  {selectedScene?.id === scene.id && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,1)]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: Müşteri Tercihleri (Kaydırılabilir Menü) */}
        <div className="w-[440px] bg-[#08080a] h-full border-l border-white/5 flex flex-col shadow-2xl z-20 overflow-y-auto custom-scrollbar">
          <SettingsPanelContent />
        </div>
      </div>

      {selectedScene && <MockupViewer config={config} scene={selectedScene} onClose={() => setSelectedScene(null)} />}
    </>
  );
};

export default App;
