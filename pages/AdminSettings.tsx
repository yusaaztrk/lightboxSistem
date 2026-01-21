import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProfileCost, BackingCost, AdapterPrice } from '../types';
import { Save, Trash2, AlertCircle, RotateCcw } from 'lucide-react';

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'profiles' | 'backing' | 'adapters'>('general');
    const [settings, setSettings] = useState<any>(null);
    const [profiles, setProfiles] = useState<ProfileCost[]>([]);
    const [backing, setBacking] = useState<BackingCost[]>([]);
    const [adapters, setAdapters] = useState<AdapterPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, p, b, a] = await Promise.all([
                api.getSystemSettings(),
                api.getProfileCosts(),
                api.getBackingCosts(),
                api.getAdapterPrices()
            ]);
            setSettings(s);
            setProfiles(p);
            setBacking(b);
            setAdapters(a);
        } catch (e: any) {
            console.error("Failed to load data", e);
            setError(e.message || "Bilinmeyen bir hata oluştu. Backend bağlantısını kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        try {
            await api.updateSystemSettings(settings);
            alert("Genel ayarlar kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        }
    };

    if (loading) return <div className="p-10 text-gray-400 font-bold animate-pulse">Yükleniyor...</div>;

    if (error) return (
        <div className="p-8 pb-20 bg-[#0a0a0c] min-h-full rounded-3xl">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Sistem Ayarları</h1>
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex items-start gap-4 mt-8">
                <AlertCircle className="text-red-500 w-8 h-8 flex-shrink-0 mt-1" />
                <div>
                    <h2 className="font-bold text-xl text-red-500 mb-2">Veri Yükleme Hatası</h2>
                    <p className="text-gray-400 mb-6 text-sm">Sunucudan veriler alınırken bir sorun oluştu. Lütfen backend sunucusunun çalıştığından ve veritabanı bağlantısının doğru olduğundan emin olun.</p>
                    <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-red-300 mb-6 overflow-x-auto whitespace-pre-wrap">
                        {error}
                    </div>
                    <button onClick={loadAll} className="bg-red-500 px-6 py-3 rounded-xl text-white font-black text-xs hover:bg-red-600 transition flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-red-500/20">
                        <RotateCcw size={16} /> Tekrar Dene
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 text-gray-200 pb-20 bg-[#0a0a0c] min-h-full rounded-3xl">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Sistem Ayarları</h1>
            <p className="text-sm text-gray-500 font-bold mb-8 uppercase tracking-widest">Fiyatlandırma ve teknik parametreler</p>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
                <button onClick={() => setActiveTab('general')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'general' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>GENEL</button>
                <button onClick={() => setActiveTab('profiles')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'profiles' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>PROFİLLER</button>
                <button onClick={() => setActiveTab('backing')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'backing' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>ZEMİN</button>
                <button onClick={() => setActiveTab('adapters')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'adapters' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}>ADAPTÖRLER</button>
            </div>

            {/* General Settings */}
            {activeTab === 'general' && settings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">SABİT GİDERLER ($)</h3>
                        {/* Render inputs for settings */}
                        <InputGroup label="Kablo Sabit Gider" value={settings.cableFixedCost} onChange={v => setSettings({ ...settings, cableFixedCost: v })} />
                        <InputGroup label="Köşebent (Adet)" value={settings.cornerPiecePrice} onChange={v => setSettings({ ...settings, cornerPiecePrice: v })} />
                        <InputGroup label="Baskı (m²)" value={settings.printCostPerM2} onChange={v => setSettings({ ...settings, printCostPerM2: v })} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">ORANLAR & LED</h3>
                        <InputGroup label="İşçilik Oranı (%)" value={settings.laborRatePercentage} onChange={v => setSettings({ ...settings, laborRatePercentage: v })} />
                        <InputGroup label="Kâr Marjı (%)" value={settings.profitMarginPercentage} onChange={v => setSettings({ ...settings, profitMarginPercentage: v })} />
                        <InputGroup label="Amper / Metre" value={settings.amperesPerMeter} onChange={v => setSettings({ ...settings, amperesPerMeter: v })} />
                        <InputGroup label="LED (İç) $/m" value={settings.ledIndoorPricePerMeter} onChange={v => setSettings({ ...settings, ledIndoorPricePerMeter: v })} />
                        <InputGroup label="LED (Dış) $/m" value={settings.ledOutdoorPricePerMeter} onChange={v => setSettings({ ...settings, ledOutdoorPricePerMeter: v })} />
                    </div>
                    <div className="md:col-span-2">
                        <button onClick={handleSaveSettings} className="bg-indigo-600 text-white font-black py-4 px-8 rounded-xl hover:bg-indigo-500 transition shadow-lg uppercase tracking-widest text-xs flex items-center gap-2">
                            <Save size={16} /> Ayarları Kaydet
                        </button>
                    </div>
                </div>
            )}

            {/* Profile List */}
            {activeTab === 'profiles' && (
                <div className="space-y-4">
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">Ad / Tanım</th>
                                    <th className="p-4">Derinlik (cm)</th>
                                    <th className="p-4">Tip</th>
                                    <th className="p-4">Birim Fiyat ($/m)</th>
                                    <th className="p-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {profiles.map(p => (
                                    <tr key={p.id}>
                                        <td className="p-4 font-bold text-white">{p.name || '-'}</td>
                                        <td className="p-4 text-gray-400">{p.depthCm}</td>
                                        <td className="p-4 text-gray-400">{p.isDoubleSided ? 'Çift Taraf' : 'Tek Taraf'}</td>
                                        <td className="p-4 text-emerald-400 font-mono font-bold">${p.pricePerMeter}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={async () => {
                                                if (confirm('Silmek istediğine emin misin?')) {
                                                    await api.deleteProfileCost(p.id);
                                                    loadAll();
                                                }
                                            }} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Adapters List */}
            {activeTab === 'adapters' && (
                <div className="space-y-4">
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">Adaptör Adı</th>
                                    <th className="p-4">Amper (A)</th>
                                    <th className="p-4">Watt (W)</th>
                                    <th className="p-4">Fiyat ($)</th>
                                    <th className="p-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {adapters.map(a => (
                                    <tr key={a.id}>
                                        <td className="p-4 font-bold text-white">{a.name}</td>
                                        <td className="p-4 text-gray-400">{a.amperage} A</td>
                                        <td className="p-4 text-gray-400">{a.wattage} W</td>
                                        <td className="p-4 text-emerald-400 font-mono font-bold">${a.price}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={async () => {
                                                if (confirm('Silmek istediğine emin misin?')) {
                                                    await api.deleteAdapterPrice(a.id);
                                                    loadAll();
                                                }
                                            }} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Backing List */}
            {activeTab === 'backing' && (
                <div className="space-y-4">
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">Malzeme Kodu</th>
                                    <th className="p-4">Görnen Ad</th>
                                    <th className="p-4">M² Fiyatı ($)</th>
                                    <th className="p-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {backing.map(b => (
                                    <tr key={b.id}>
                                        <td className="p-4 font-bold text-gray-400">{b.materialType}</td>
                                        <td className="p-4 text-white font-bold">{b.displayName}</td>
                                        <td className="p-4 text-emerald-400 font-mono font-bold">${b.pricePerM2}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={async () => {
                                                if (confirm('Silmek istediğine emin misin?')) {
                                                    await api.deleteBackingCost(b.id);
                                                    loadAll();
                                                }
                                            }} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</label>
        <input
            type="number"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full bg-transparent text-white font-mono font-bold text-lg outline-none border-b border-white/20 focus:border-indigo-500 transition-colors py-1"
        />
    </div>
);

export default AdminSettings;
