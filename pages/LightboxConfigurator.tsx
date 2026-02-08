import React, { useState, useRef, useEffect } from 'react';

import {

    Settings, Box, ShoppingBag, Upload, Eye, EyeOff,

    Image as ImageIcon, CheckCircle2, LayoutGrid, Sparkles, Home, Gift, User

} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { ConfigOptions, ShapeType, ProfileType, PricingFactors, MockupScene, CalculationBreakdown, BackingCost, ProfileCost, ProfileColor } from '../types';

import { DEFAULT_CONFIG, INITIAL_PRICING, DEPTH_OPTIONS, MOCKUP_SCENES } from '../constants';

import Lightbox3D from '../components/Lightbox3D';

import MockupViewer from '../components/MockupViewer';

import PublicHeader from '../components/PublicHeader';

import CostBreakdownAccordion from '../components/CostBreakdownAccordion';

import LedVisualization from '../components/LedVisualization';

import { api } from '../services/api';
import { addCartItem } from '../services/cart';

import MembershipModal from '../components/MembershipModal';

import AddToCartModal from '../components/AddToCartModal';

import { compressImageToThumbnail } from '../utils/imageCompression';




interface Props {

    // Any props if needed, or Router props

}



const LIGHTBOX_CONFIG_CACHE = 'lightbox_config_cache';

const loadCachedConfig = (): ConfigOptions | null => {
    try {
        const raw = localStorage.getItem(LIGHTBOX_CONFIG_CACHE);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            delete parsed.userImageUrl;
            delete parsed.backImageUrl;
        }
        return parsed;
    } catch { return null; }
};

const LightboxConfigurator: React.FC<Props> = () => {

    const [config, setConfig] = useState<ConfigOptions>(() => loadCachedConfig() || DEFAULT_CONFIG);

    const [factors, setFactors] = useState<PricingFactors>(INITIAL_PRICING);

    const [breakdown, setBreakdown] = useState<CalculationBreakdown | null>(null);

    const [selectedScene, setSelectedScene] = useState<MockupScene | null>(null);

    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0, z: 0 });

    const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);





    // Dynamic Data States

    const [profileCosts, setProfileCosts] = useState<ProfileCost[]>([]);

    const [availableBackings, setAvailableBackings] = useState<BackingCost[]>([]);

    const [availableColors, setAvailableColors] = useState<ProfileColor[]>([]);



    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const backFileInputRef = useRef<HTMLInputElement>(null);



    useEffect(() => {

        const fetchSettings = async () => {

            try {

                const settingsData = await api.getSettings();

                setFactors(settingsData);



                try {

                    const [profiles, backings, colors] = await Promise.all([

                        api.getProfileCosts(),

                        api.getBackingCosts(),

                        api.getProfileColors()

                    ]);



                    if (profiles && profiles.length > 0) {

                        setProfileCosts(profiles);

                        // Ensure we have a valid profileId selected

                        const currentDoubleSided = config.profile === ProfileType.DOUBLE;

                        const matchingProfile = profiles.find(p => p.isDoubleSided === currentDoubleSided);

                        if (matchingProfile) {

                            updateConfig('profileId', matchingProfile.id);

                            updateConfig('depth', matchingProfile.depthCm);

                        }

                    }



                    if (colors && colors.length > 0) {

                        setAvailableColors(colors);

                        updateConfig('frameColor', colors[0].hexCode);

                        updateConfig('profileColorId', colors[0].id);

                    }



                    if (backings && backings.length > 0) {

                        setAvailableBackings(backings);

                        const currentBackingExists = backings.some(b => b.materialType === config.backplate);

                        if (!currentBackingExists) {

                            updateConfig('backplate', backings[0].materialType);

                        }



                        const selectedMaterial = currentBackingExists ? config.backplate : backings[0].materialType;

                        const selectedBacking = backings.find(b => b.materialType === selectedMaterial);

                        if (selectedBacking && selectedBacking.ledSpacingCm != null) {

                            updateConfig('ledSpacing', selectedBacking.ledSpacingCm);

                        }

                    }

                } catch (innerErr) {

                    console.error("Error fetching dynamic parameters:", innerErr);

                }



            } catch (err) {

                console.warn("Using default pricing (API offline?)", err);

            }

        };

        fetchSettings();

    }, []);



    // Debounced calculation

    useEffect(() => {

        const calculate = async () => {

            try {

                const data = await api.calculateDetails(config);

                setBreakdown(data);

            } catch (error) {

                console.error("Calculation failed", error);

            }

        };



        const timeoutId = setTimeout(calculate, 500);

        return () => clearTimeout(timeoutId);

    }, [config]);



    const updateConfig = (key: keyof ConfigOptions, value: any) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            try {
                const cacheNext: any = { ...next };
                delete cacheNext.userImageUrl;
                delete cacheNext.backImageUrl;
                localStorage.setItem(LIGHTBOX_CONFIG_CACHE, JSON.stringify(cacheNext));
            } catch { }
            return next;
        });
    };



    const applyBackingLedSpacing = (materialType: string) => {

        const backing = availableBackings.find(b => b.materialType === materialType);

        if (backing && backing.ledSpacingCm != null) {

            updateConfig('ledSpacing', backing.ledSpacingCm);

        }

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



    // --- Settings Panel Content ---

    const SettingsPanelContent = () => (

        <div className="p-6 md:p-10 space-y-10 md:space-y-12 pb-8 md:pb-32">

            {/* Tasarım Yükleme Alanı */}

            <section className="bg-indigo-600/5 p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-indigo-500/10 relative overflow-hidden group">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />

                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />



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



            {config.profile === ProfileType.DOUBLE && (

                <section className="bg-indigo-600/5 p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-indigo-500/10 relative overflow-hidden group">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />

                    <input type="file" ref={backFileInputRef} onChange={handleBackImageUpload} accept="image/*" className="hidden" />



                    <div className="relative z-10 md:hidden">

                        <h3 className="text-sm font-black text-white uppercase tracking-tighter italic text-center mb-3">ARKA YÜZ GÖRSELİ</h3>

                        <div className="flex items-center gap-3">

                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20 flex-shrink-0">

                                <ImageIcon className="w-6 h-6 text-indigo-400" />

                            </div>

                            <button onClick={() => backFileInputRef.current?.click()} className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-sm">

                                <Upload className="w-4 h-4" /> GÖRSEL SEÇ

                            </button>

                        </div>

                        {config.backImageUrl && (

                            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">

                                <CheckCircle2 className="w-3 h-3" />

                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">GÖRSEL HAZIR</span>

                            </div>

                        )}

                    </div>



                    <div className="relative z-10 hidden md:block text-center">

                        <div className="w-20 h-20 bg-indigo-600/20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">

                            <ImageIcon className="w-10 h-10 text-indigo-400" />

                        </div>

                        <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">ARKA YÜZ GÖRSELİ</h3>

                        <p className="text-[10px] text-gray-500 mt-2 mb-8 font-bold uppercase tracking-widest italic">JPEG, PNG Formatları</p>



                        <button onClick={() => backFileInputRef.current?.click()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98]">

                            <Upload className="w-5 h-5" /> GÖRSEL SEÇ

                        </button>



                        {config.backImageUrl && (

                            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 py-3 rounded-xl border border-emerald-500/10">

                                <CheckCircle2 className="w-4 h-4" />

                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">GÖRSEL HAZIR</span>

                            </div>

                        )}

                    </div>

                </section>

            )}



            {/* Konfigürasyon Seçenekleri */}

            <div className="space-y-10 md:space-y-12 px-1 md:px-2">

                <div className="grid grid-cols-2 gap-6 md:gap-8">

                    <div className="space-y-3 md:space-y-4">

                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">GENİŞLİK (CM)</span>

                        <input type="number" value={config.width} onChange={(e) => { const val = e.target.valueAsNumber; if (!isNaN(val)) updateConfig('width', val); }} className="w-full px-4 md:px-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg md:text-xl transition-all" />

                    </div>

                    <div className="space-y-3 md:space-y-4">

                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">YÜKSEKLİK (CM)</span>

                        <input type="number" value={config.height} onChange={(e) => { const val = e.target.valueAsNumber; if (!isNaN(val)) updateConfig('height', val); }} className="w-full px-4 md:px-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg md:text-xl transition-all" />

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

                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">PROFİL SEÇİMİ</label>

                    <div className="grid grid-cols-3 gap-2 md:gap-3">

                        {profileCosts

                            .filter(p => p.isDoubleSided === (config.profile === ProfileType.DOUBLE))

                            .sort((a, b) => a.depthCm - b.depthCm)

                            .map(p => (

                                <button

                                    key={p.id}

                                    onClick={() => {

                                        updateConfig('depth', p.depthCm);

                                        updateConfig('profileId', p.id);

                                    }}

                                    className={`py-3 md:py-4 px-2 rounded-xl text-[10px] font-black transition-all border flex flex-col items-center justify-center gap-1 ${config.profileId === p.id

                                        ? 'bg-indigo-600 text-white shadow-xl border-indigo-500'

                                        : 'bg-white/5 text-gray-500 hover:bg-white/10 border-transparent'}`}

                                >

                                    <span className="uppercase tracking-tighter text-[9px] opacity-70">{p.name || `${p.depthCm}cm`}</span>

                                    <span className="text-xs">{p.depthCm} CM</span>

                                </button>

                            ))}

                    </div>

                </section>



                <section className="space-y-4 md:space-y-6">

                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">ZEMİN MALZEMESİ</label>

                    <div className="space-y-2 md:space-y-3">

                        {availableBackings.length > 0 ? (

                            availableBackings.map(opt => (

                                <button key={opt.id} onClick={() => { updateConfig('backplate', opt.materialType); applyBackingLedSpacing(opt.materialType); }} className={`w-full py-4 md:py-5 px-6 md:px-8 rounded-2xl text-[10px] font-black text-left transition-all border flex items-center justify-between ${config.backplate === opt.materialType ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>

                                    {opt.displayName}

                                    {config.backplate === opt.materialType && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]" />}

                                </button>

                            ))

                        ) : <p className="text-red-500 text-xs">Yüklenemedi...</p>}

                    </div>

                </section>



                <section className="space-y-4 md:space-y-6">

                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">LED KULLANIMI</label>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">

                        <button onClick={() => updateConfig('ledType', 'INNER')} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.ledType === 'INNER' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-gray-500'}`}>İÇ MEKAN</button>

                        <button onClick={() => updateConfig('ledType', 'OUTER')} className={`py-4 md:py-5 rounded-2xl text-[10px] font-black transition-all border ${config.ledType === 'OUTER' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-gray-500'}`}>DIŞ MEKAN</button>

                    </div>

                </section>



                <section className="space-y-4 md:space-y-6">

                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">PROFİL RENGİ</label>

                    <div className="flex flex-wrap gap-4">

                        {availableColors.map(color => (

                            <button

                                key={color.id}

                                onClick={() => {

                                    updateConfig('frameColor', color.hexCode);

                                    updateConfig('profileColorId', color.id);

                                }}

                                className={`w-12 h-12 rounded-full border-2 transition-all shadow-lg ${config.profileColorId === color.id ? 'border-indigo-500 scale-110 shadow-indigo-500/50' : 'border-white/10 hover:border-white/30 hover:scale-105'}`}

                                style={{ backgroundColor: color.hexCode }}

                                title={color.name}

                            />

                        ))}

                    </div>

                </section>



                {breakdown && breakdown.selectedLayout && (

                    <LedVisualization

                        config={config}

                        layout={breakdown.selectedLayout}

                        alternativeLayout={breakdown.alternativeLayout}

                    />

                )}







                <div className="p-4 md:p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] shadow-inner mt-4">

                    {breakdown ? (

                        <button

                            onClick={() => setIsAddToCartModalOpen(true)}

                            className="w-full bg-white text-black font-black py-3.5 md:py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-2xl uppercase tracking-widest text-xs group active:scale-[0.98]"

                        >

                            SEPETE EKLE <ShoppingBag className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                        </button>

                    ) : (

                        <div className="text-center text-gray-500 font-bold p-4">Hesaplanıyor...</div>

                    )}

                </div>

            </div>

        </div>

    );





    const [isMembershipOpen, setIsMembershipOpen] = useState(false);



    return (

        <>

            <div className="public-app">



                <MembershipModal isOpen={isMembershipOpen} onClose={() => setIsMembershipOpen(false)} />



                {/* Floating Operations REMOVED (Moved to Header) */}



                <div className="md:hidden min-h-screen w-full bg-[var(--app-bg)] text-[var(--app-text)] font-sans overflow-y-auto overflow-x-hidden">

                    <div className="p-4">

                        <PublicHeader

                            price={breakdown?.finalPrice || 0}

                            onOpenMember={() => setIsMembershipOpen(true)}

                            activePage="lightbox"

                        />

                    </div>



                    <div className="px-4">

                        <div className="relative h-[300px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent)] pointer-events-none" />

                            <Lightbox3D config={config} isMockupMode={false} cameraOffset={cameraOffset} />

                        </div>

                        <div className="mt-4 flex justify-center">
                            <div className="flex gap-2 p-1.5 bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl">
                                <button
                                    type="button"
                                    onClick={() => updateConfig('isLightOn', !config.isLightOn)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Sparkles className={`w-3 h-3 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateConfig('hasFeet', !config.hasFeet)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black transition-all ${config.hasFeet ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Box className="w-3 h-3" /> {config.hasFeet ? 'AYAKLI MOD' : 'DUVAR MONTAJ'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">KAMERA</div>
                            <input
                                type="range"
                                min={-2}
                                max={2}
                                step={0.01}
                                value={cameraOffset.y}
                                onChange={e => setCameraOffset(prev => ({ ...prev, y: Number(e.target.value) }))}
                                className="w-full"
                            />
                            <input
                                type="range"
                                min={-2}
                                max={2}
                                step={0.01}
                                value={cameraOffset.x}
                                onChange={e => setCameraOffset(prev => ({ ...prev, x: Number(e.target.value) }))}
                                className="w-full mt-2"
                            />
                            <input
                                type="range"
                                min={-5}
                                max={5}
                                step={0.01}
                                value={cameraOffset.z}
                                onChange={e => setCameraOffset(prev => ({ ...prev, z: Number(e.target.value) }))}
                                className="w-full mt-2"
                            />
                        </div>

                        <div className="mt-14 mb-10 px-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                        <LayoutGrid className="w-5 h-5 text-indigo-500" /> MEKAN SİMÜLASYONU
                                    </h2>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Ürünü Farklı Ortamlarda Test Edin</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {MOCKUP_SCENES.map((scene) => (
                                    <div
                                        key={scene.id}
                                        onClick={() => setSelectedScene(scene)}
                                        className={`group relative h-36 rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedScene?.id === scene.id ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-white/5 hover:border-white/20'}`}
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



                    <div className="bg-[var(--app-surface)] border-t border-[var(--app-border)] mt-8">

                        <SettingsPanelContent />

                    </div>

                </div>



                <div className="hidden md:flex h-screen w-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans overflow-hidden">

                    <div className="flex-1 relative p-8 flex flex-col overflow-y-auto custom-scrollbar">

                        <PublicHeader

                            price={breakdown?.finalPrice || 0}

                            onOpenMember={() => setIsMembershipOpen(true)}

                            activePage="lightbox"

                        />



                        <div className="relative h-[800px] min-h-[600px] w-full rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent)] pointer-events-none" />

                            <Lightbox3D config={config} isMockupMode={false} cameraOffset={cameraOffset} />

                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2.5 bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl z-20">



                                <button

                                    onClick={() => updateConfig('isLightOn', !config.isLightOn)}

                                    className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black transition-all ${config.isLightOn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-gray-500 hover:text-white'}`}

                                >

                                    <Sparkles className={`w-4 h-4 ${config.isLightOn ? 'fill-yellow-400' : ''}`} /> {config.isLightOn ? 'IŞIK AÇIK' : 'IŞIK KAPALI'}

                                </button>

                                <button

                                    onClick={() => updateConfig('hasFeet', !config.hasFeet)}

                                    className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black transition-all ${config.hasFeet ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'text-gray-500 hover:text-white'}`}

                                >

                                    <Box className="w-4 h-4" /> {config.hasFeet ? 'AYAKLI MOD' : 'DUVAR MONTAJ'}

                                </button>

                            </div>

                        </div>

                        <div className="mt-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">KAMERA</div>
                            <input
                                type="range"
                                min={-2}
                                max={2}
                                step={0.01}
                                value={cameraOffset.y}
                                onChange={e => setCameraOffset(prev => ({ ...prev, y: Number(e.target.value) }))}
                                className="w-full"
                            />
                            <input
                                type="range"
                                min={-2}
                                max={2}
                                step={0.01}
                                value={cameraOffset.x}
                                onChange={e => setCameraOffset(prev => ({ ...prev, x: Number(e.target.value) }))}
                                className="w-full mt-2"
                            />
                            <input
                                type="range"
                                min={-5}
                                max={5}
                                step={0.01}
                                value={cameraOffset.z}
                                onChange={e => setCameraOffset(prev => ({ ...prev, z: Number(e.target.value) }))}
                                className="w-full mt-2"
                            />
                        </div>



                        <div className="mt-14 mb-10 px-4">

                            <div className="flex items-center justify-between mb-8">

                                <div>

                                    <h2 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">

                                        <LayoutGrid className="w-5 h-5 text-indigo-500" /> MEKAN SİMÜLASYONU

                                    </h2>

                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Ürünü Farklı Ortamlarda Test Edin</p>

                                </div>

                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">

                                {MOCKUP_SCENES.map((scene) => (

                                    <div

                                        key={scene.id}

                                        onClick={() => setSelectedScene(scene)}

                                        className={`group relative h-36 md:h-32 rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedScene?.id === scene.id ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-white/5 hover:border-white/20'}`}

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



                    <div className="w-[440px] bg-[var(--app-surface)] h-full border-l border-[var(--app-border)] flex flex-col shadow-2xl z-20 overflow-y-auto custom-scrollbar">

                        {SettingsPanelContent()}

                    </div>

                </div>



                {selectedScene && <MockupViewer config={config} scene={selectedScene} onClose={() => setSelectedScene(null)} />}

                <AddToCartModal
                    isOpen={isAddToCartModalOpen}
                    onClose={() => setIsAddToCartModalOpen(false)}
                    onConfirm={async () => {
                        if (!breakdown) return;

                        let thumbnailUrl = config.userImageUrl;

                        // Compress image to thumbnail if it exists
                        if (config.userImageUrl) {
                            try {
                                thumbnailUrl = await compressImageToThumbnail(config.userImageUrl, 200, 200, 0.6);
                                console.log('Image compressed for cart storage');
                            } catch (error) {
                                console.warn('Failed to compress image, using original:', error);
                            }
                        }

                        addCartItem({
                            type: 'lightbox',
                            title: `Lightbox ${config.width}x${config.height} cm`,
                            price: breakdown.finalPrice,
                            configurationDetails: JSON.stringify(config),
                            costDetails: JSON.stringify(breakdown),
                            previewImageUrl: thumbnailUrl,
                        });

                        try { localStorage.removeItem(LIGHTBOX_CONFIG_CACHE); } catch { }
                        setConfig(DEFAULT_CONFIG);
                        setBreakdown(null);
                        try { window.dispatchEvent(new Event('open-cart-drawer')); } catch { }
                    }}
                    productInfo={{
                        title: `Lightbox ${config.width}x${config.height} cm`,
                        price: breakdown?.finalPrice || 0,
                        width: config.width,
                        height: config.height,
                        type: 'lightbox',
                        imageUrl: config.userImageUrl,
                        profileType: config.profile,
                        profileDepth: config.depth,
                        backingType: availableBackings.find(b => b.materialType === config.backplate)?.displayName || 'Bilinmiyor',
                        ledUsage: config.ledType === 'INNER' ? 'indoor' : 'outdoor'
                    }}
                />

            </div>

        </>

    );

};



export default LightboxConfigurator;

