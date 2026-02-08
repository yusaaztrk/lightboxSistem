import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProfileColor } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const ColorSettings: React.FC = () => {
    const [colors, setColors] = useState<ProfileColor[]>([]);
    const [newColor, setNewColor] = useState<Partial<ProfileColor>>({ name: '', hexCode: '#000000', cmykCode: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getProfileColors();
            setColors(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newColor.name || !newColor.hexCode) return;
        try {
            await api.addProfileColor(newColor as ProfileColor);
            await loadData();
            setNewColor({ name: '', hexCode: '#000000', cmykCode: '' });
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Emin misiniz?")) return;
        try {
            await api.deleteProfileColor(id);
            loadData();
        } catch (e) { alert("Hata oluştu."); }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Renk Ayarları</h1>
                    <p className="text-admin-text-muted text-sm mt-1">Profil renk seçenekleri</p>
                </div>
            </div>

            <div className="bg-admin-card border border-admin-border rounded-3xl p-8">
                <h3 className="text-xs font-black text-brand-orange uppercase tracking-[0.2em] mb-6">Yeni Renk Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Renk Adı</label>
                        <input placeholder="Örn: Altın" value={newColor.name} onChange={e => setNewColor({ ...newColor, name: e.target.value })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-orange transition" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Hex Kodu</label>
                        <div className="flex gap-2">
                            <input type="color" value={newColor.hexCode} onChange={e => setNewColor({ ...newColor, hexCode: e.target.value })} className="h-11 w-12 bg-transparent cursor-pointer rounded-lg border border-admin-border" />
                            <input value={newColor.hexCode} onChange={e => setNewColor({ ...newColor, hexCode: e.target.value })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-orange transition" />
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">CMYK (Opsiyonel)</label>
                        <input placeholder="0,0,100,0" value={newColor.cmykCode} onChange={e => setNewColor({ ...newColor, cmykCode: e.target.value })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-orange transition" />
                    </div>
                    <button onClick={handleAdd} className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 rounded-xl transition shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                        <Plus size={16} /> Ekle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colors.map(color => (
                    <div key={color.id} className="bg-admin-card border border-admin-border p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition hover:shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-white/10 shadow-lg" style={{ backgroundColor: color.hexCode }}></div>
                            <div>
                                <div className="font-bold text-white">{color.name}</div>
                                <div className="text-[10px] text-admin-text-muted font-mono mt-1">{color.hexCode}</div>
                                {color.cmykCode && <div className="text-[9px] text-admin-text-muted font-mono">{color.cmykCode}</div>}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(color.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColorSettings;
