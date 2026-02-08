import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProfileCost } from '../../types';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { InputGroup } from '../../components/admin/InputGroup';

const ProfileSettings: React.FC = () => {
    const [profiles, setProfiles] = useState<ProfileCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProfileCost | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getProfileCosts();
            setProfiles(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem({ id: 0, name: '', depthCm: 8, isDoubleSided: false, pricePerMeter: 0 } as ProfileCost);
        setIsEditModalOpen(true);
    };

    const handleEdit = (item: ProfileCost) => {
        setEditingItem({ ...item });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) {
            await api.deleteProfileCost(id);
            loadData();
        }
    };

    const handleSave = async () => {
        if (!editingItem) return;
        try {
            if (editingItem.id === 0) {
                await api.createProfileCost(editingItem);
            } else {
                await api.updateProfileCost(editingItem.id, editingItem);
            }
            setIsEditModalOpen(false);
            loadData();
        } catch (e) {
            alert('Hata oluştu');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Profil Ayarları</h1>
                    <p className="text-admin-text-muted text-sm mt-1">Kasa profilleri ve birim fiyatları</p>
                </div>
                <button onClick={handleCreate} className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-black py-3 px-6 rounded-xl transition shadow-lg shadow-brand-cyan/20 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Plus size={16} /> Yeni Profil
                </button>
            </div>

            <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Ad / Tanım</th>
                            <th className="p-6">Derinlik (cm)</th>
                            <th className="p-6">Tip</th>
                            <th className="p-6">Birim Fiyat ($/m)</th>
                            <th className="p-6 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                        {profiles.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition">
                                <td className="p-6 font-bold text-white">{p.name || '-'}</td>
                                <td className="p-6 text-admin-text-muted font-mono">{p.depthCm}</td>
                                <td className="p-6 text-admin-text-muted">{p.isDoubleSided ? 'Çift Taraf' : 'Tek Taraf'}</td>
                                <td className="p-6 text-brand-orange font-mono font-bold">${p.pricePerMeter}</td>
                                <td className="p-6 text-right flex justify-end gap-3">
                                    <button onClick={() => handleEdit(p)} className="text-admin-text-muted hover:text-white transition"><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && editingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-admin-dark border border-admin-border rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                {editingItem.id === 0 ? 'YENİ PROFİL' : 'PROFİL DÜZENLE'}
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <InputGroup label="Ad / Tanım" value={editingItem.name} onChange={v => setEditingItem({ ...editingItem, name: v.toString() })} isText />
                            <InputGroup label="Birim Fiyat ($/m)" value={editingItem.pricePerMeter} onChange={v => setEditingItem({ ...editingItem, pricePerMeter: Number(v) })} />
                            <InputGroup label="Derinlik (cm)" value={editingItem.depthCm} onChange={v => setEditingItem({ ...editingItem, depthCm: Number(v) })} />

                            <div className="bg-admin-card p-4 rounded-xl border border-admin-border flex items-center justify-between">
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Çift Taraf</label>
                                <input
                                    type="checkbox"
                                    checked={editingItem.isDoubleSided}
                                    onChange={e => setEditingItem({ ...editingItem, isDoubleSided: e.target.checked })}
                                    className="w-5 h-5 accent-brand-cyan rounded cursor-pointer"
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition uppercase tracking-widest text-xs">İptal</button>
                                <button onClick={handleSave} className="flex-1 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-bold py-4 rounded-xl transition shadow-lg shadow-brand-cyan/20 uppercase tracking-widest text-xs">Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;
