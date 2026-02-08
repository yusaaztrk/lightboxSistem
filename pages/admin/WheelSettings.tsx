import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SpinWheelItem, CustomerLead } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const WheelSettings: React.FC = () => {
    const [wheelItems, setWheelItems] = useState<SpinWheelItem[]>([]);
    const [leads, setLeads] = useState<CustomerLead[]>([]);
    const [newWheelItem, setNewWheelItem] = useState<Partial<SpinWheelItem>>({ label: '', discountPercentage: 10, probability: 10, colorHex: '#ff0000', isLoss: false });
    const [loading, setLoading] = useState(true);
    const [wheelEnabled, setWheelEnabled] = useState(true);
    const [togglingWheel, setTogglingWheel] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [w, l, status] = await Promise.all([
                api.getWheelConfig(),
                api.getLeads(),
                api.getWheelStatus()
            ]);
            setWheelItems(w || []);
            setLeads(l || []);
            setWheelEnabled(status.isEnabled);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleWheelEnabled = async () => {
        setTogglingWheel(true);
        try {
            const newVal = !wheelEnabled;
            await api.updateSystemSettings({ isWheelEnabled: newVal } as any);
            setWheelEnabled(newVal);
        } catch (e) {
            alert('Ayar değiştirilemedi.');
        } finally {
            setTogglingWheel(false);
        }
    };

    const handleAdd = async () => {
        if (!newWheelItem.label) return;
        try {
            await api.addWheelItem(newWheelItem);
            loadData();
            setNewWheelItem({ label: '', discountPercentage: 10, probability: 10, colorHex: '#ff0000', isLoss: false });
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteWheelItem = async (id: number) => {
        if (!confirm("Emin misiniz?")) return;
        try {
            await api.deleteWheelItem(id);
            loadData();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteLead = async (id: number) => {
        if (!confirm("Emin misiniz?")) return;
        try {
            await api.deleteLead(id);
            loadData();
        } catch (e) { alert("Hata oluştu."); }
    };

    if (loading) return <div className="text-brand-cyan animate-pulse">Yükleniyor...</div>;

    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Çark Ayarları</h1>
                    <button
                        onClick={toggleWheelEnabled}
                        disabled={togglingWheel}
                        className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition flex items-center gap-2 ${wheelEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'} disabled:opacity-50`}
                    >
                        <div className={`w-3 h-3 rounded-full ${wheelEnabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {togglingWheel ? '...' : wheelEnabled ? 'ÇARK AÇIK' : 'ÇARK KAPALI'}
                    </button>
                </div>

                {/* Wheel Config */}
                <div className="space-y-6">
                    <div className="bg-admin-card border border-admin-border rounded-3xl p-8">
                        <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.2em] mb-6">Yeni Dilim Ekle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Etiket</label>
                                <input placeholder="Örn: %10 İndirim" value={newWheelItem.label} onChange={e => setNewWheelItem({ ...newWheelItem, label: e.target.value })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-cyan transition" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Oran (%)</label>
                                <input type="number" placeholder="10" value={newWheelItem.discountPercentage} onChange={e => setNewWheelItem({ ...newWheelItem, discountPercentage: Number(e.target.value) })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-cyan transition" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">İhtimal</label>
                                <input type="number" placeholder="20" value={newWheelItem.probability} onChange={e => setNewWheelItem({ ...newWheelItem, probability: Number(e.target.value) })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-cyan transition" />
                            </div>
                            <div className="md:col-span-1 flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    checked={newWheelItem.isLoss}
                                    onChange={e => setNewWheelItem({ ...newWheelItem, isLoss: e.target.checked })}
                                    className="w-5 h-5 accent-brand-cyan cursor-pointer"
                                />
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">PAS (BOŞ)</label>
                            </div>

                            <button onClick={handleAdd} className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-black py-3 rounded-xl transition shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                <Plus size={16} /> Ekle
                            </button>
                        </div>
                    </div>

                    <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Etiket</th>
                                    <th className="p-6">İndirim</th>
                                    <th className="p-6">İhtimal</th>
                                    <th className="p-6">Durum</th>
                                    <th className="p-6 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {wheelItems.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5 transition">
                                        <td className="p-6 font-bold text-white">{item.label}</td>
                                        <td className="p-6 text-brand-orange font-mono font-bold">%{item.discountPercentage}</td>
                                        <td className="p-6 text-admin-text-muted">{item.probability}</td>
                                        <td className="p-6">
                                            {item.isLoss ? <span className="text-red-500 text-[10px] font-black uppercase bg-red-500/10 px-2 py-1 rounded">BOŞ</span> : <span className="text-brand-cyan text-[10px] font-black uppercase bg-brand-cyan/10 px-2 py-1 rounded">KAZANÇ</span>}
                                        </td>
                                        <td className="p-6 text-right flex justify-end gap-2">
                                            <button onClick={() => handleDeleteWheelItem(item.id)} className="text-red-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">Çekiliş Sonuçları</h1>
                <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-[10px] font-black text-brand-orange uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Tarih</th>
                                <th className="p-6">Telefon</th>
                                <th className="p-6">Kazanılan</th>
                                <th className="p-6">İndirim Kodu</th>
                                <th className="p-6 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-white/5 transition">
                                    <td className="p-6 text-admin-text-muted font-mono text-xs">{new Date(lead.createdAt).toLocaleString('tr-TR')}</td>
                                    <td className="p-6 font-bold text-white">{lead.phoneNumber}</td>
                                    <td className="p-6 text-brand-cyan font-bold">{lead.wonPrizeLabel}</td>
                                    <td className="p-6 text-admin-text-muted font-mono tracking-widest">{lead.discountCode || '-'}</td>
                                    <td className="p-6 text-right">
                                        <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WheelSettings;
