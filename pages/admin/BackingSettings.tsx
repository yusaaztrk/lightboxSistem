import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BackingCost } from '../../types';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { InputGroup } from '../../components/admin/InputGroup';

const BackingSettings: React.FC = () => {
    const [backing, setBacking] = useState<BackingCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BackingCost | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getBackingCosts();
            setBacking(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem({ id: 0, materialType: '', displayName: '', pricePerM2: 0, ledSpacingCm: null } as BackingCost);
        setIsEditModalOpen(true);
    };

    const handleEdit = (item: BackingCost) => {
        setEditingItem({ ...item });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) {
            await api.deleteBackingCost(id);
            loadData();
        }
    };

    const handleSave = async () => {
        if (!editingItem) return;
        try {
            if (editingItem.id === 0) {
                await api.createBackingCost(editingItem);
            } else {
                await api.updateBackingCost(editingItem.id, editingItem);
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Zemin Ayarları</h1>
                    <p className="text-admin-text-muted text-sm mt-1">Zemin malzemeleri ve maliyetleri</p>
                </div>
                <button onClick={handleCreate} className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-black py-3 px-6 rounded-xl transition shadow-lg shadow-brand-cyan/20 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Plus size={16} /> Yeni Zemin
                </button>
            </div>

            <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Malzeme Kodu</th>
                            <th className="p-6">Görünen Ad</th>
                            <th className="p-6">M² Fiyatı ($)</th>
                            <th className="p-6">LED Aralığı (cm)</th>
                            <th className="p-6 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                        {backing.map(b => (
                            <tr key={b.id} className="hover:bg-white/5 transition">
                                <td className="p-6 font-bold text-admin-text-muted">{b.materialType}</td>
                                <td className="p-6 text-white font-bold">{b.displayName}</td>
                                <td className="p-6 text-brand-orange font-mono font-bold">${b.pricePerM2}</td>
                                <td className="p-6 text-admin-text-muted font-mono">{b.ledSpacingCm ?? '-'}</td>
                                <td className="p-6 text-right flex justify-end gap-3">
                                    <button onClick={() => handleEdit(b)} className="text-admin-text-muted hover:text-white transition"><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-400 transition"><Trash2 size={18} /></button>
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
                                {editingItem.id === 0 ? 'YENİ ZEMİN' : 'ZEMİN DÜZENLE'}
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <InputGroup label="Görünen Ad" value={editingItem.displayName} onChange={v => setEditingItem({ ...editingItem, displayName: v.toString() })} isText />
                            <InputGroup label="Malzeme Kodu" value={editingItem.materialType} onChange={v => setEditingItem({ ...editingItem, materialType: v.toString() })} isText />
                            <InputGroup label="M² Fiyatı ($)" value={editingItem.pricePerM2} onChange={v => setEditingItem({ ...editingItem, pricePerM2: Number(v) })} />
                            <InputGroup label="LED Aralığı (cm)" value={editingItem.ledSpacingCm ?? ''} onChange={v => setEditingItem({ ...editingItem, ledSpacingCm: v === '' ? null : Number(v) })} />

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

export default BackingSettings;
