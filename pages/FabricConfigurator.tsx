import React, { useState, useRef, useEffect } from 'react';
import { Box, ShoppingBag, Upload, Eye, EyeOff, LayoutGrid, Settings, ArrowLeft, Sparkles, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfigOptions, ProfileType, PricingFactors, ProfileColor } from '../types';
import { DEFAULT_CONFIG, INITIAL_PRICING } from '../constants';
import Lightbox3D from '../components/Lightbox3D';
import { api } from '../services/api';
import OrderModal, { CustomerData } from '../components/OrderModal';
import LuckyWheel from '../components/LuckyWheel';
import MembershipModal from '../components/MembershipModal';
import { User } from 'lucide-react';

const FabricConfigurator: React.FC = () => {
    const [config, setConfig] = useState<ConfigOptions>({ ...DEFAULT_CONFIG, depth: 0 }); // Depth 0 for fabric view? Or default?
    const [factors, setFactors] = useState<PricingFactors>(INITIAL_PRICING);
    const [finalPrice, setFinalPrice] = useState<number>(0);
    const [availableColors, setAvailableColors] = useState<ProfileColor[]>([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isWheelOpen, setIsWheelOpen] = useState(false);
    const [isMembershipOpen, setIsMembershipOpen] = useState(false);

    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ... (rest of handler)

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

    // ... (rest of effects)

    useEffect(() => {
        const fetchSettings = async () => {
            // ...
            try {
                const settingsData = await api.getSettings();
                setFactors(settingsData);

                const colors = await api.getProfileColors();
                setAvailableColors(colors || []);
                if (colors && colors.length > 0) {
                    updateConfig('frameColor', colors[0].hexCode);
                    updateConfig('profileColorId', colors[0].id);
                }
            } catch (err) {
                console.warn("Using default pricing", err);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const widthM = config.width / 100;
        const heightM = config.height / 100;
        const area = widthM * heightM;

        const cost = area * factors.pricePerSqMeterPrinting * (config.profile === ProfileType.DOUBLE ? 2 : 1);
        const margin = factors.fabricProfitMarginPercentage || 30;

        let price = cost * (1 + (margin / 100));

        if (config.hasFeet) {
            price += (factors.standPrice || 0);
        }

        setFinalPrice(price);
    }, [config.width, config.height, factors, config.hasFeet, config.profile]);

    const updateConfig = (key: keyof ConfigOptions, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleOrderSubmit = async (customerData: CustomerData) => {
        // ...
        const order = {
            customerName: customerData.fullName,
            customerPhone: customerData.phone,
            dimensions: `${config.width}x${config.height}`,
            price: finalPrice,
            configurationDetails: JSON.stringify({ ...config, type: 'FABRIC_ONLY', note: customerData.note }),
            status: 'Pending'
        };

        try {
            await api.createOrder(order);
            alert("Sipariş alındı!");
            setIsOrderModalOpen(false);
            navigate('/');
        } catch (error) {
            alert("Hata oluştu.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans flex flex-col md:flex-row">
            <LuckyWheel isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} />

            <MembershipModal isOpen={isMembershipOpen} onClose={() => setIsMembershipOpen(false)} />

            {/* Floating Operations */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
                <button
                    onClick={() => setIsMembershipOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all"
                    title="Bayi Başvurusu"
                >
                    <User className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setIsWheelOpen(true)}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-full shadow-2xl shadow-pink-500/40 hover:scale-110 active:scale-95 transition-all animate-bounce"
                >
                    <Gift className="w-8 h-8" />
                </button>
            </div>

            {/* LEFT PANEL: 3D View */}
            <div className="flex-1 relative p-4 md:p-8 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 md:mb-8 z-10 bg-white/[0.03] p-4 rounded-3xl border border-white/5 backdrop-blur-3xl">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black uppercase italic">Sadece Kumaş</h1>
                            <span className="text-xs text-gray-500 font-bold tracking-widest">Hızlı Baskı Hesabı</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black uppercase block">TAHMİNİ TUTAR</span>
                        <span className="text-xl font-black text-emerald-400">${finalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {/* 3D Box */}
                <div className="flex-1 relative min-h-[300px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#08080a]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
                    {/* Use Lightbox3D */}
                    <Lightbox3D config={{ ...config, depth: 5 }} isMockupMode={false} />

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 backdrop-blur-xl px-2 py-2 rounded-full border border-white/10 shadow-xl">
                        <div className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-bold text-gray-300 border border-white/5">
                            Önizleme Modu
                        </div>
                        <button
                            onClick={() => updateConfig('isLightOn', !config.isLightOn)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Sparkles className={`w-3 h-3 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}
                        </button>
                        <button
                            onClick={() => updateConfig('hasFeet', !config.hasFeet)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${config.hasFeet ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Box className="w-3 h-3" /> {config.hasFeet ? 'AYAKLI MOD' : 'DUVAR MONTAJ'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Controls */}
            <div className="w-full md:w-[400px] bg-[#08080a] border-l border-white/5 p-6 md:p-10 flex flex-col gap-8 shadow-2xl z-20 overflow-y-auto custom-scrollbar">
                <div>
                    <h2 className="text-xl font-black uppercase italic text-white mb-2">Ölçüler</h2>
                    <p className="text-sm text-gray-500">Baskı yapılacak alanın boyutlarını giriniz.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">TABLO TİPİ</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => updateConfig('profile', ProfileType.SINGLE)} className={`py-4 rounded-xl text-[10px] font-black transition-all border ${config.profile === ProfileType.SINGLE ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>TEK TARAFLI</button>
                            <button onClick={() => updateConfig('profile', ProfileType.DOUBLE)} className={`py-4 rounded-xl text-[10px] font-black transition-all border ${config.profile === ProfileType.DOUBLE ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>ÇİFT TARAFLI</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">GENİŞLİK (CM)</label>
                        <input type="number" value={config.width} onChange={(e) => updateConfig('width', Number(e.target.value))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white text-xl focus:border-emerald-500 transition-colors outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">YÜKSEKLİK (CM)</label>
                        <input type="number" value={config.height} onChange={(e) => updateConfig('height', Number(e.target.value))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white text-xl focus:border-emerald-500 transition-colors outline-none" />
                    </div>
                </div>

                {/* Image Upload Section */}
                <div className="pt-4 border-t border-white/5">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">TASARIM GÖRSELİ</h3>

                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 group">
                        <Upload className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs uppercase tracking-wider">Görsel Seç</span>
                    </button>

                    {config.userImageUrl && (
                        <div className="mt-3 flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                            <img src={config.userImageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Görsel Yüklendi</span>
                                <span className="text-[9px] text-gray-400">Üzerine tıklayarak değiştirebilirsiniz</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Color Selection */}
                <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-3 block">PROFİL RENGİ</label>
                    <div className="grid grid-cols-5 gap-3">
                        {availableColors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => {
                                    updateConfig('frameColor', color.hexCode);
                                    updateConfig('profileColorId', color.id);
                                }}
                                className={`w-10 h-10 rounded-full border-2 transition-all shadow-lg ${config.profileColorId === color.id ? 'border-indigo-500 scale-110 shadow-indigo-500/50' : 'border-white/10 hover:border-white/30 hover:scale-105'}`}
                                style={{ backgroundColor: color.hexCode }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-auto bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-gray-400">Toplam Tutar</span>
                        <span className="text-3xl font-black text-emerald-400">${finalPrice.toFixed(2)}</span>
                    </div>
                    <button onClick={() => setIsOrderModalOpen(true)} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-500 transition shadow-xl shadow-emerald-600/20 active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> SİPARİŞ OLUŞTUR
                    </button>
                </div>
            </div>

            <OrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onSubmit={handleOrderSubmit}
                finalPrice={finalPrice}
            />
        </div>
    );
};

export default FabricConfigurator;
