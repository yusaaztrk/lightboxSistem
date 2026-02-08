import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Pencil, Trash2, Check, AlertCircle, Plus, X } from 'lucide-react';
import { InputGroup } from '../../components/admin/InputGroup';

const MemberSettings: React.FC = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [newMembershipType, setNewMembershipType] = useState({ name: '', discountPercentage: 5 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [m, mt] = await Promise.all([
                api.getMembers(),
                api.getMembershipTypes()
            ]);
            setMembers(m || []);
            setMembershipTypes(mt || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveMember = async (id: number) => {
        if (!confirm("Üyeliği onaylamak istiyor musunuz?")) return;
        try {
            await api.approveMember(id);
            loadData();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Bu üyeyi silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteMember(id);
            loadData();
        } catch (e) { alert("Hata oluştu."); }
    };

    const handleAddMembershipType = async () => {
        if (!newMembershipType.name) return;
        try {
            await api.createMembershipType(newMembershipType);
            loadData();
            setNewMembershipType({ name: '', discountPercentage: 5 });
        } catch (e) { alert("Hata"); }
    };

    const handleUpdateMembershipType = async () => {
        if (!editingItem) return;
        try {
            await api.updateMembershipType(editingItem.id, editingItem);
            setIsEditModalOpen(false);
            loadData();
        } catch (e) { alert("Hata"); }
    };

    const handleDeleteMembershipType = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteMembershipType(id);
            loadData();
        } catch (e) { alert("Hata"); }
    };

    if (loading) return <div className="text-brand-cyan animate-pulse">Yükleniyor...</div>;

    return (
        <div className="space-y-12">

            {/* Membership Types Section */}
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">Üyelik Tipleri</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Tip Adı</th>
                                    <th className="p-6">İndirim</th>
                                    <th className="p-6 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {membershipTypes.map(t => (
                                    <tr key={t.id} className="hover:bg-white/5 transition">
                                        <td className="p-6 font-bold text-white">{t.name}</td>
                                        <td className="p-6 text-brand-orange font-mono font-bold">%{t.discountPercentage}</td>
                                        <td className="p-6 text-right flex justify-end gap-3">
                                            <button onClick={() => { setEditingItem(t); setIsEditModalOpen(true); }} className="text-admin-text-muted hover:text-white transition"><Pencil size={18} /></button>
                                            <button onClick={() => handleDeleteMembershipType(t.id)} className="text-red-500 hover:text-red-400 transition"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-admin-card border border-admin-border rounded-3xl p-8">
                        <h3 className="text-xs font-black text-brand-orange uppercase tracking-[0.2em] mb-6">Yeni Tip Ekle</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Tip Adı</label>
                                <input placeholder="Örn: Kurumsal" value={newMembershipType.name} onChange={e => setNewMembershipType({ ...newMembershipType, name: e.target.value })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-orange transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">İndirim (%)</label>
                                <input type="number" value={newMembershipType.discountPercentage} onChange={e => setNewMembershipType({ ...newMembershipType, discountPercentage: Number(e.target.value) })} className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-orange transition" />
                            </div>
                            <button onClick={handleAddMembershipType} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 rounded-xl transition shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                <Plus size={16} /> Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members List Section */}
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">Üyeler</h1>
                <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Tarih</th>
                                <th className="p-6">Ad Soyad</th>
                                <th className="p-6">Telefon</th>
                                <th className="p-6">Firma</th>
                                <th className="p-6">Tip / İndirim</th>
                                <th className="p-6">Durum</th>
                                <th className="p-6 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {members.map(m => (
                                <tr key={m.id} className="hover:bg-white/5 transition">
                                    <td className="p-6 text-admin-text-muted font-mono text-xs">{new Date(m.createdAt).toLocaleString('tr-TR')}</td>
                                    <td className="p-6 font-bold text-white">{m.fullName}</td>
                                    <td className="p-6 text-admin-text-muted font-mono">{m.phoneNumber}</td>
                                    <td className="p-6 text-white">{m.companyName || '-'}</td>
                                    <td className="p-6 text-brand-orange font-bold">
                                        {m.membershipType} <span className="text-admin-text-muted font-mono font-normal opacity-50">({m.discount}%)</span>
                                    </td>
                                    <td className="p-6">
                                        {m.isApproved
                                            ? <span className="bg-brand-cyan/10 text-brand-cyan px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Check size={12} /> ONAYLI</span>
                                            : <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={12} /> BEKLİYOR</span>
                                        }
                                    </td>
                                    <td className="p-6 text-right flex justify-end gap-2">
                                        {!m.isApproved && (
                                            <button onClick={() => handleApproveMember(m.id)} className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-brand-cyan/20 transition">ONAYLA</button>
                                        )}
                                        <button onClick={() => handleDeleteMember(m.id)} className="p-2 text-red-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal for Membership Types */}
            {isEditModalOpen && editingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-admin-dark border border-admin-border rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">DÜZENLE</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <InputGroup label="Tip Adı" value={editingItem.name} onChange={v => setEditingItem({ ...editingItem, name: v.toString() })} isText />
                            <InputGroup label="İndirim (%)" value={editingItem.discountPercentage} onChange={v => setEditingItem({ ...editingItem, discountPercentage: Number(v) })} />
                            <div className="pt-6 flex gap-4">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition uppercase tracking-widest text-xs">İptal</button>
                                <button onClick={handleUpdateMembershipType} className="flex-1 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-bold py-4 rounded-xl transition shadow-lg shadow-brand-cyan/20 uppercase tracking-widest text-xs">Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberSettings;
