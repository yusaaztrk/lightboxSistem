import React, { useState, useRef, useEffect } from 'react';

import { Box, ShoppingBag, Upload, Eye, EyeOff, LayoutGrid, Settings, Sparkles, Gift } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { ConfigOptions, ProfileType, PricingFactors, ProfileColor, MockupScene } from '../types';

import { DEFAULT_CONFIG, INITIAL_PRICING, MOCKUP_SCENES } from '../constants';

import Lightbox3D from '../components/Lightbox3D';

import MockupViewer from '../components/MockupViewer';

import PublicHeader from '../components/PublicHeader';

import { api } from '../services/api';
import { addCartItem } from '../services/cart';

import OrderModal, { CustomerData } from '../components/OrderModal';

import LuckyWheel from '../components/LuckyWheel';

import MembershipModal from '../components/MembershipModal';

import { User } from 'lucide-react';



const FABRIC_CONFIG_CACHE = 'fabric_config_cache';

const loadFabricCache = (): ConfigOptions | null => {
    try {
        const raw = localStorage.getItem(FABRIC_CONFIG_CACHE);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
};

const FabricConfigurator: React.FC = () => {

    const [config, setConfig] = useState<ConfigOptions>(() => loadFabricCache() || { ...DEFAULT_CONFIG, depth: 0 });

    const [factors, setFactors] = useState<PricingFactors>(INITIAL_PRICING);

    const [finalPrice, setFinalPrice] = useState<number>(0);

    const [availableColors, setAvailableColors] = useState<ProfileColor[]>([]);

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const [selectedScene, setSelectedScene] = useState<MockupScene | null>(null);

    const [isWheelOpen, setIsWheelOpen] = useState(false);

    const [isMembershipOpen, setIsMembershipOpen] = useState(false);



    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const backFileInputRef = useRef<HTMLInputElement>(null);



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



    const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = (event) => {

                updateConfig('backImageUrl', event.target?.result as string);

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

        setConfig(prev => {
            const next = { ...prev, [key]: value };
            try { localStorage.setItem(FABRIC_CONFIG_CACHE, JSON.stringify(next)); } catch { }
            return next;
        });

    };



    const handleOrderSubmit = async (customerData: CustomerData) => {

        // ...

        const order = {

            customerName: customerData.fullName,

            customerPhone: customerData.phone,

            dimensions: `${config.width}x${config.height}`,

            price: customerData.discountedPrice ?? finalPrice,

            configurationDetails: JSON.stringify({ ...config, type: 'FABRIC_ONLY', note: customerData.note }),

            status: 'Pending'

        };



        try {

            const created = await api.createOrder(order);

            setIsOrderModalOpen(false);

            navigate(`/order/${created.id}`);

        } catch (error) {

            alert("Hata oluştu.");

        }

    };



    return (

        <div className="public-app min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col md:flex-row">

            <LuckyWheel isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} />



            <MembershipModal isOpen={isMembershipOpen} onClose={() => setIsMembershipOpen(false)} />



            {/* LEFT PANEL: 3D View */}

            <div className="flex-1 relative p-4 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">

                {/* Header */}

                <PublicHeader

                    price={finalPrice}

                    onOpenWheel={() => setIsWheelOpen(true)}

                    onOpenMember={() => setIsMembershipOpen(true)}

                    activePage="fabric"

                />



                {/* 3D Box */}

                <div className="flex-1 relative min-h-[450px] w-full rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[var(--app-surface)]">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />

                    {/* Use Lightbox3D */}

                    <Lightbox3D config={{ ...config, depth: 5 }} isMockupMode={false} />



                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2.5 bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl z-20">

                        <div className="px-6 py-2 rounded-full bg-white/5 text-xs font-bold text-gray-300 border border-white/5 flex items-center">

                            Önizleme Modu

                        </div>

                        <button

                            onClick={() => updateConfig('isLightOn', !config.isLightOn)}

                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}

                        >

                            <Sparkles className={`w-3 h-3 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}

                        </button>

                        <button

                            onClick={() => updateConfig('hasFeet', !config.hasFeet)}

                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black transition-all ${config.hasFeet ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-500 hover:text-white'}`}

                        >

                            <Box className="w-3 h-3" /> {config.hasFeet ? 'AYAKLI MOD' : 'DUVAR MONTAJ'}

                        </button>

                    </div>

                </div>



                {/* Mekan Simülasyonu Grid */}

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

                            </div>

                        ))}

                    </div>

                </div>

            </div>



            {/* RIGHT PANEL: Controls */}

            <div className="w-full md:w-[400px] bg-[var(--app-surface)] border-l border-[var(--app-border)] p-6 md:p-10 flex flex-col gap-8 shadow-2xl z-20 overflow-y-auto custom-scrollbar">

                <div>

                    <h2 className="text-xl font-black uppercase italic text-[var(--app-text)] mb-2">Ölçüler</h2>

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



                {config.profile === ProfileType.DOUBLE && (

                    <div className="pt-4 border-t border-white/5">

                        <input type="file" ref={backFileInputRef} onChange={handleBackImageUpload} accept="image/*" className="hidden" />

                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">ARKA YÜZ GÖRSELİ</h3>



                        <button onClick={() => backFileInputRef.current?.click()} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 group">

                            <Upload className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />

                            <span className="text-xs uppercase tracking-wider">Görsel Seç</span>

                        </button>



                        {config.backImageUrl && (

                            <div className="mt-3 flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">

                                <img src={config.backImageUrl} alt="Back Preview" className="w-10 h-10 object-cover rounded-lg" />

                                <div className="flex-1">

                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Görsel Yüklendi</span>

                                    <span className="text-[9px] text-gray-400">Üzerine tıklayarak değiştirebilirsiniz</span>

                                </div>

                            </div>

                        )}

                    </div>

                )}



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

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                addCartItem({
                                    type: 'fabric',
                                    title: `Kumaş ${config.width}x${config.height} cm`,
                                    price: finalPrice,
                                    configurationDetails: JSON.stringify({ ...config, type: 'FABRIC_ONLY' }),
                                    previewImageUrl: config.userImageUrl || undefined,
                                });
                                alert('Sepete eklendi!');
                            }}
                            className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-xl uppercase tracking-widest text-xs active:scale-[0.98]"
                        >
                            <ShoppingBag className="w-4 h-4" /> SEPETE EKLE
                        </button>
                        <button onClick={() => setIsOrderModalOpen(true)} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-500 transition shadow-xl shadow-emerald-600/20 active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2 text-xs">
                            <ShoppingBag className="w-4 h-4" /> SİPARİŞ OLUŞTUR
                        </button>
                    </div>

                </div>

            </div>



            <OrderModal

                isOpen={isOrderModalOpen}

                onClose={() => setIsOrderModalOpen(false)}

                onSubmit={handleOrderSubmit}

                finalPrice={finalPrice}

            />



            {selectedScene && <MockupViewer config={config} scene={selectedScene} onClose={() => setSelectedScene(null)} />}

        </div>

    );

};



export default FabricConfigurator;

