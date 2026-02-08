import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProfileCost, BackingCost, AdapterPrice, ProfileColor, SpinWheelItem, CustomerLead } from '../types';
import { Save, Trash2, AlertCircle, RotateCcw, Pencil, X, Palette, Plus, Gift, Database, Check } from 'lucide-react';

const InputGroup = ({ label, value, onChange, isText }: { label: string, value: string | number, onChange: (v: string | number) => void, isText?: boolean }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
        <input
            type={isText ? "text" : "number"}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-transparent text-gray-900 font-mono font-bold text-lg outline-none border-b border-gray-200 focus:border-emerald-500 transition-colors py-1"
        />
    </div>
);

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'profiles' | 'backing' | 'adapters' | 'profileColors' | 'wheel' | 'leads' | 'members' | 'membershipTypes'>('general');
    const [settings, setSettings] = useState<any>(null);
    const [profiles, setProfiles] = useState<ProfileCost[]>([]);
    const [backing, setBacking] = useState<BackingCost[]>([]);
    const [adapters, setAdapters] = useState<AdapterPrice[]>([]);

    // Profile Colors State
    const [profileColors, setProfileColors] = useState<ProfileColor[]>([]);
    const [newColor, setNewColor] = useState<Partial<ProfileColor>>({ name: '', hexCode: '#000000', cmykCode: '' });

    // Wheel & Leads State
    const [wheelItems, setWheelItems] = useState<SpinWheelItem[]>([]);
    const [leads, setLeads] = useState<CustomerLead[]>([]);
    const [newWheelItem, setNewWheelItem] = useState<Partial<SpinWheelItem>>({ label: '', discountPercentage: 10, probability: 10, colorHex: '#ff0000', isLoss: false });

    // Membership State
    const [members, setMembers] = useState<any[]>([]);
    const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
    const [newMembershipType, setNewMembershipType] = useState({ name: '', discountPercentage: 5 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editType, setEditType] = useState<'profile' | 'backing' | 'adapter' | 'membershipType' | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, p, b, a, colors, w, l, m, mt] = await Promise.all([
                api.getSystemSettings(),
                api.getProfileCosts(),
                api.getBackingCosts(),
                api.getAdapterPrices(),
                api.getProfileColors(),
                api.getWheelConfig(),
                api.getLeads(),
                api.getMembers(),
                api.getMembershipTypes() // Helper needed in api.ts? Or use existing logic? Let's check api.ts
            ]);
            setSettings(s);
            setProfiles(p);
            setBacking(b);
            setAdapters(a);
            setProfileColors(colors || []);
            setWheelItems(w || []);
            setLeads(l || []);
            setMembers(m || []);
            setMembershipTypes(mt || []); // Assuming we add this call
        } catch (e: any) {
            console.error("Failed to load data", e);
            setError(e.message || "Bilinmeyen bir hata oluştu. Backend bağlantısını kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to approve
    const handleApproveMember = async (id: number) => {
        if (!confirm("Üyeliği onaylamak istiyor musunuz?")) return;
        try {
            await api.approveMember(id);
            loadAll();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleAddMembershipType = async () => {
        if (!newMembershipType.name) return;
        try {
            await api.createMembershipType(newMembershipType);
            await loadAll();
            setNewMembershipType({ name: '', discountPercentage: 5 });
        } catch (e) { alert("Tip eklenirken hata."); }
    };

    const handleDeleteMembershipType = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteMembershipType(id);
            await loadAll();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleAddColor = async () => {
        if (!newColor.name || !newColor.hexCode) return;
        try {
            await api.addProfileColor(newColor as ProfileColor);
            await loadAll();
            setNewColor({ name: '', hexCode: '#000000', cmykCode: '' });
        } catch (e) { alert("Renk eklenirken hata oluştu."); }
    };

    const handleDeleteColor = async (id: number) => {
        if (!confirm("Bu rengi silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteProfileColor(id);
            await loadAll();
        } catch (e) { alert("Renk silinirken hata oluştu."); }
    };

    const handleAddWheelItem = async () => {
        if (!newWheelItem.label) return;
        try {
            await api.addWheelItem(newWheelItem);
            await loadAll();
            setNewWheelItem({ label: '', discountPercentage: 10, probability: 10, colorHex: '#ff0000', isLoss: false });
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteWheelItem = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteWheelItem(id);
            await loadAll();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteLead = async (id: number) => {
        if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteLead(id);
            await loadAll();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Bu üyeyi silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteMember(id);
            await loadAll();
        } catch (e) { alert("Hata oluştu."); }
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

    const openEditModal = (item: any, type: 'profile' | 'backing' | 'adapter') => {
        setEditingItem({ ...item }); // Clone to avoid direct mutation
        setEditType(type);
        setIsEditModalOpen(true);
    };

    const handleCreateComp = (type: 'profile' | 'backing' | 'adapter') => {
        setEditType(type);
        if (type === 'profile') {
            setEditingItem({ id: 0, name: '', depthCm: 8, isDoubleSided: false, pricePerMeter: 0 } as ProfileCost);
        } else if (type === 'backing') {
            setEditingItem({ id: 0, materialType: '', displayName: '', pricePerM2: 0, ledSpacingCm: null } as BackingCost);
        } else if (type === 'adapter') {
            setEditingItem({ id: 0, name: '', amperage: 0, wattage: 0, price: 0 } as AdapterPrice);
        }
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingItem || !editType) return;

        try {
            const isNew = !editingItem.id || editingItem.id === 0;

            if (editType === 'profile') {
                if (isNew) {
                    await api.createProfileCost(editingItem);
                } else {
                    await api.updateProfileCost(editingItem.id, editingItem);
                }
            } else if (editType === 'backing') {
                if (isNew) {
                    await api.createBackingCost(editingItem);
                } else {
                    await api.updateBackingCost(editingItem.id, editingItem);
                }
            } else if (editType === 'adapter') {
                if (isNew) {
                    await api.createAdapterPrice(editingItem);
                } else {
                    await api.updateAdapterPrice(editingItem.id, editingItem);
                }
            } else if (editType === 'membershipType') {
                if (isNew) {
                    await api.createMembershipType(editingItem);
                } else {
                    await api.updateMembershipType(editingItem.id, editingItem);
                }
            }

            setIsEditModalOpen(false);
            setEditingItem(null);
            setEditType(null);
            loadAll(); // Refresh list
        } catch (error) {
            console.error("Update failed", error);
            alert("İşlem başarısız oldu.");
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Ayarları</h1>
                <p className="text-sm text-gray-500 mb-8">Fiyatlandırma, teknik parametreler ve diğer yapılandırmalar</p>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-100 mb-8 overflow-x-auto">
                    <button onClick={() => setActiveTab('general')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'general' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>GENEL</button>
                    <button onClick={() => setActiveTab('profiles')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'profiles' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>PROFİLLER</button>
                    <button onClick={() => setActiveTab('backing')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'backing' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ZEMİN</button>
                    <button onClick={() => setActiveTab('adapters')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'adapters' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ADAPTÖRLER</button>
                    <button onClick={() => setActiveTab('profileColors')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'profileColors' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>RENKLER</button>
                    <button onClick={() => setActiveTab('wheel')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'wheel' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ÇARK</button>
                    <button onClick={() => setActiveTab('leads')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'leads' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ÇEKİLİŞ SONUÇLARI</button>
                    <button onClick={() => setActiveTab('members')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'members' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ÜYELER</button>
                    <button onClick={() => setActiveTab('membershipTypes')} className={`pb-4 px-4 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'membershipTypes' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>ÜYELİK TİPLERİ</button>
                </div>

                {/* General Settings */}
                {activeTab === 'general' && settings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">SABİT GİDERLER ($)</h3>
                            <InputGroup label="Kablo Sabit Gider" value={settings.cableFixedCost} onChange={v => setSettings({ ...settings, cableFixedCost: v })} />
                            <InputGroup label="Köşebent (Adet)" value={settings.cornerPiecePrice} onChange={v => setSettings({ ...settings, cornerPiecePrice: v })} />
                            <InputGroup label="Baskı (m²)" value={settings.printCostPerM2} onChange={v => setSettings({ ...settings, printCostPerM2: v })} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">ORANLAR & LED</h3>
                            <InputGroup label="İşçilik Oranı (%)" value={settings.laborRatePercentage} onChange={v => setSettings({ ...settings, laborRatePercentage: v })} />
                            <InputGroup label="Kâr Marjı (%)" value={settings.profitMarginPercentage} onChange={v => setSettings({ ...settings, profitMarginPercentage: v })} />
                            <InputGroup label="Kumaş Kâr Marjı (%)" value={settings.fabricProfitMarginPercentage} onChange={v => setSettings({ ...settings, fabricProfitMarginPercentage: v })} />
                            <InputGroup label="Ayak (Takım) Ücreti" value={settings.standPrice} onChange={v => setSettings({ ...settings, standPrice: v })} />
                            <InputGroup label="Amper / Metre" value={settings.amperesPerMeter} onChange={v => setSettings({ ...settings, amperesPerMeter: v })} />
                            <InputGroup label="LED Dizim Aralığı (Varsayılan cm)" value={settings.defaultLedSpacingCm ?? 15} onChange={v => setSettings({ ...settings, defaultLedSpacingCm: v })} />
                            <InputGroup label="LED (İç) $/m" value={settings.ledIndoorPricePerMeter} onChange={v => setSettings({ ...settings, ledIndoorPricePerMeter: v })} />
                            <InputGroup label="LED (Dış) $/m" value={settings.ledOutdoorPricePerMeter} onChange={v => setSettings({ ...settings, ledOutdoorPricePerMeter: v })} />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button onClick={handleSaveSettings} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs flex items-center gap-2">
                                <Save size={16} /> Ayarları Kaydet
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile List */}
                {activeTab === 'profiles' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => handleCreateComp('profile')} className="bg-white/5 hover:bg-white/10 text-white font-black py-3 px-6 rounded-xl transition flex items-center gap-2 text-xs uppercase tracking-widest border border-white/5">
                                <Pencil size={14} /> Yeni Profil Ekle
                            </button>
                        </div>
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
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditModal(p, 'profile')} className="text-indigo-400 hover:text-white transition"><Pencil size={16} /></button>
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
                        <div className="flex justify-end">
                            <button onClick={() => handleCreateComp('adapter')} className="bg-white/5 hover:bg-white/10 text-white font-black py-3 px-6 rounded-xl transition flex items-center gap-2 text-xs uppercase tracking-widest border border-white/5">
                                <Pencil size={14} /> Yeni Adaptör Ekle
                            </button>
                        </div>
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
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditModal(a, 'adapter')} className="text-indigo-400 hover:text-white transition"><Pencil size={16} /></button>
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
                        <div className="flex justify-end">
                            <button onClick={() => handleCreateComp('backing')} className="bg-white/5 hover:bg-white/10 text-white font-black py-3 px-6 rounded-xl transition flex items-center gap-2 text-xs uppercase tracking-widest border border-white/5">
                                <Pencil size={14} /> Yeni Zemin Ekle
                            </button>
                        </div>
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Malzeme Kodu</th>
                                        <th className="p-4">Görnen Ad</th>
                                        <th className="p-4">M² Fiyatı ($)</th>
                                        <th className="p-4">LED Aralığı (cm)</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {backing.map(b => (
                                        <tr key={b.id}>
                                            <td className="p-4 font-bold text-gray-400">{b.materialType}</td>
                                            <td className="p-4 text-white font-bold">{b.displayName}</td>
                                            <td className="p-4 text-emerald-400 font-mono font-bold">${b.pricePerM2}</td>
                                            <td className="p-4 text-gray-400 font-mono">{(b as any).ledSpacingCm ?? '-'}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openEditModal(b, 'backing')} className="text-indigo-400 hover:text-white transition"><Pencil size={16} /></button>
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

                {/* Profile Colors List */}
                {activeTab === 'profileColors' && (
                    <div className="space-y-6">
                        {/* ... (Existing Color content) */}
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-4">YENİ RENK EKLE</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Renk Adı</label>
                                    <input placeholder="Örn: Altın" value={newColor.name} onChange={e => setNewColor({ ...newColor, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-pink-500 transition" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hex Kodu</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={newColor.hexCode} onChange={e => setNewColor({ ...newColor, hexCode: e.target.value })} className="h-11 w-12 bg-transparent cursor-pointer rounded-lg border border-white/10" />
                                        <input value={newColor.hexCode} onChange={e => setNewColor({ ...newColor, hexCode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-pink-500 transition" />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">CMYK (Opsiyonel)</label>
                                    <input placeholder="0,0,100,0" value={newColor.cmykCode} onChange={e => setNewColor({ ...newColor, cmykCode: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-pink-500 transition" />
                                </div>
                                <button onClick={handleAddColor} className="bg-pink-600 hover:bg-pink-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                    <Plus size={16} /> Ekle
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profileColors.map(color => (
                                <div key={color.id} className="bg-[#0a0a0c] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/10 shadow-lg" style={{ backgroundColor: color.hexCode }}></div>
                                        <div>
                                            <div className="font-bold text-white">{color.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-1">{color.hexCode}</div>
                                            {color.cmykCode && <div className="text-[9px] text-gray-600 font-mono">{color.cmykCode}</div>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteColor(color.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Wheel Settings */}
                {activeTab === 'wheel' && (
                    <div className="space-y-6">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-4">ÇARK DİLİMİ EKLE</h3>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Etiket</label>
                                    <input placeholder="Örn: %10 İndirim" value={newWheelItem.label} onChange={e => setNewWheelItem({ ...newWheelItem, label: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Oran (%)</label>
                                    <input type="number" placeholder="10" value={newWheelItem.discountPercentage} onChange={e => setNewWheelItem({ ...newWheelItem, discountPercentage: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">İhtimal</label>
                                    <input type="number" placeholder="20" value={newWheelItem.probability} onChange={e => setNewWheelItem({ ...newWheelItem, probability: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition" />
                                </div>
                                <div className="md:col-span-1 flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={newWheelItem.isLoss}
                                        onChange={e => setNewWheelItem({ ...newWheelItem, isLoss: e.target.checked })}
                                        className="w-5 h-5 accent-purple-500"
                                    />
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PAS (BOŞ)</label>
                                </div>

                                <button onClick={handleAddWheelItem} className="bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                    <Plus size={16} /> Ekle
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Etiket</th>
                                        <th className="p-4">İndirim</th>
                                        <th className="p-4">İhtimal (Ağırlık)</th>
                                        <th className="p-4">Durum</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {wheelItems.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-4 font-bold text-white">{item.label}</td>
                                            <td className="p-4 text-emerald-400 font-mono font-bold">%{item.discountPercentage}</td>
                                            <td className="p-4 text-gray-400">{item.probability}</td>
                                            <td className="p-4">
                                                {item.isLoss ? <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-black uppercase">BOŞ</span> : <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-[10px] font-black uppercase">KAZANÇ</span>}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleDeleteWheelItem(item.id)} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Leads Data */}
                {activeTab === 'leads' && (
                    <div className="space-y-4">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Tarih</th>
                                        <th className="p-4">Telefon</th>
                                        <th className="p-4">Kazanılan</th>
                                        <th className="p-4">İndirim Kodu</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.map(lead => (
                                        <tr key={lead.id}>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{new Date(lead.createdAt).toLocaleString('tr-TR')}</td>
                                            <td className="p-4 font-bold text-white">{lead.phoneNumber}</td>
                                            <td className="p-4 text-purple-400 font-bold">{lead.wonPrizeLabel}</td>
                                            <td className="p-4 text-emerald-400 font-mono font-bold tracking-widest">{lead.discountCode || '-'}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MEMBERSHIP TYPES */}
                {activeTab === 'membershipTypes' && (
                    <div className="space-y-6">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">YENİ ÜYELİK TİPİ EKLE</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tip Adı</label>
                                    <input placeholder="Örn: Kurumsal" value={newMembershipType.name} onChange={e => setNewMembershipType({ ...newMembershipType, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">İndirim Oranı (%)</label>
                                    <input type="number" placeholder="20" value={newMembershipType.discountPercentage} onChange={e => setNewMembershipType({ ...newMembershipType, discountPercentage: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition" />
                                </div>
                                <button onClick={handleAddMembershipType} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                    <Plus size={16} /> Ekle
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Tip Adı</th>
                                        <th className="p-4">İndirim</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {membershipTypes.map(t => (
                                        <tr key={t.id}>
                                            <td className="p-4 font-bold text-white">{t.name}</td>
                                            <td className="p-4 text-emerald-400 font-mono font-bold">%{t.discountPercentage}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => {
                                                    setEditingItem({ ...t });
                                                    setEditType('membershipType');
                                                    setIsEditModalOpen(true);
                                                }} className="text-indigo-400 hover:text-white transition"><Pencil size={16} /></button>
                                                <button onClick={() => handleDeleteMembershipType(t.id)} className="text-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MEMBERS LIST */}
                {activeTab === 'members' && (
                    <div className="space-y-4">
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Tarih</th>
                                        <th className="p-4">Ad Soyad</th>
                                        <th className="p-4">Telefon</th>
                                        <th className="p-4">Firma</th>
                                        <th className="p-4">Tip</th>
                                        <th className="p-4">Durum</th>
                                        <th className="p-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {members.map(m => (
                                        <tr key={m.id}>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{new Date(m.createdAt).toLocaleString('tr-TR')}</td>
                                            <td className="p-4 font-bold text-white">{m.fullName}</td>
                                            <td className="p-4 text-gray-400 font-mono">{m.phoneNumber}</td>
                                            <td className="p-4 text-gray-400">{m.companyName || '-'}</td>
                                            <td className="p-4 text-gray-400">{m.membershipType} ({m.discount}%)</td>
                                            <td className="p-4">
                                                {m.isApproved
                                                    ? <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Check size={12} /> ONAYLI</span>
                                                    : <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={12} /> BEKLİYOR</span>
                                                }
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {!m.isApproved && (
                                                    <button onClick={() => handleApproveMember(m.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition">ONAYLA</button>
                                                )}
                                                <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-white transition p-2"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {isEditModalOpen && editingItem && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                                    {editingItem.id === 0 ? 'YENİ EKLE' : 'DÜZENLE'}
                                </h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                {/* Dynamic inputs based on type */}

                                {editType === 'profile' && (
                                    <>
                                        <InputGroup label="Ad / Tanım" value={editingItem.name} onChange={v => setEditingItem({ ...editingItem, name: v.toString() })} isText />
                                        <InputGroup label="Birim Fiyat ($/m)" value={editingItem.pricePerMeter} onChange={v => setEditingItem({ ...editingItem, pricePerMeter: v })} />
                                        <InputGroup label="Derinlik (cm)" value={editingItem.depthCm} onChange={v => setEditingItem({ ...editingItem, depthCm: v })} />
                                        {/* Checkbox for Double Sided */}
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Çift Taraf</label>
                                            <input
                                                type="checkbox"
                                                checked={editingItem.isDoubleSided}
                                                onChange={e => setEditingItem({ ...editingItem, isDoubleSided: e.target.checked })}
                                                className="w-5 h-5 accent-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {editType === 'backing' && (
                                    <>
                                        <InputGroup label="Görünen Ad" value={editingItem.displayName} onChange={v => setEditingItem({ ...editingItem, displayName: v.toString() })} isText />
                                        <InputGroup label="Malzeme Kodu" value={editingItem.materialType} onChange={v => setEditingItem({ ...editingItem, materialType: v.toString() })} isText />
                                        <InputGroup label="M² Fiyatı ($)" value={editingItem.pricePerM2} onChange={v => setEditingItem({ ...editingItem, pricePerM2: v })} />
                                        <InputGroup label="LED Aralığı (cm)" value={editingItem.ledSpacingCm ?? ''} onChange={v => setEditingItem({ ...editingItem, ledSpacingCm: v === '' ? null : Number(v) })} />
                                    </>
                                )}

                                {editType === 'adapter' && (
                                    <>
                                        <InputGroup label="Adaptör Adı" value={editingItem.name} onChange={v => setEditingItem({ ...editingItem, name: v.toString() })} isText />
                                        <InputGroup label="Amper (A)" value={editingItem.amperage} onChange={v => setEditingItem({ ...editingItem, amperage: v })} />
                                        <InputGroup label="Watt (W)" value={editingItem.wattage} onChange={v => setEditingItem({ ...editingItem, wattage: v })} />
                                        <InputGroup label="Fiyat ($)" value={editingItem.price} onChange={v => setEditingItem({ ...editingItem, price: v })} />
                                    </>
                                )}

                                {editType === 'membershipType' && (
                                    <>
                                        <InputGroup label="Tip Adı" value={editingItem.name} onChange={v => setEditingItem({ ...editingItem, name: v.toString() })} isText />
                                        <InputGroup label="İndirim Oranı (%)" value={editingItem.discountPercentage} onChange={v => setEditingItem({ ...editingItem, discountPercentage: v })} />
                                    </>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition">İptal</button>
                                    <button onClick={handleSaveEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-500/20">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminSettings;
