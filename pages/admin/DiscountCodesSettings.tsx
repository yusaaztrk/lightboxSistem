import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Trash2, Plus, RefreshCcw } from 'lucide-react';

const DiscountCodesSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<any[]>([]);

  const [form, setForm] = useState<{ discountPercentage: number; code: string; label: string }>({
    discountPercentage: 10,
    code: '',
    label: 'MANUAL'
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getDiscountCodes();
      setCodes(list || []);
    } catch (e: any) {
      setError(e?.message || 'Yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (form.discountPercentage <= 0 || form.discountPercentage > 100) {
      alert('İndirim oranı 1-100 arasında olmalıdır.');
      return;
    }

    try {
      await api.createDiscountCode({
        discountPercentage: Number(form.discountPercentage),
        code: form.code ? form.code.trim().toUpperCase() : null,
        label: form.label ? form.label.trim() : null
      });

      setForm({ discountPercentage: 10, code: '', label: 'MANUAL' });
      await load();
    } catch (e: any) {
      alert(e?.response?.data || 'Kod oluşturulamadı.');
    }
  };

  const stats = useMemo(() => {
    const total = codes.length;
    const used = codes.filter(c => c.isUsed).length;
    const active = total - used;
    return { total, used, active };
  }, [codes]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">İndirim Kodları</h1>
          <p className="text-admin-text-muted text-xs font-bold tracking-widest mt-2">Telefon + indirim oranı ile manuel kod oluşturun. Kodlar tek kullanımlıktır.</p>
        </div>
        <button
          onClick={load}
          className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-admin-border text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
          <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Toplam</div>
          <div className="text-2xl font-black text-white mt-2">{stats.total}</div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
          <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Aktif</div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.active}</div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
          <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Kullanılmış</div>
          <div className="text-2xl font-black text-red-400 mt-2">{stats.used}</div>
        </div>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-3xl p-8 space-y-6">
        <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.2em]">Yeni Kod Oluştur</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">İndirim (%)</label>
            <input
              type="number"
              value={form.discountPercentage}
              onChange={e => setForm(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
              className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand-cyan transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Kod (ops.)</label>
            <input
              value={form.code}
              onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Örn: BAYI20"
              className="w-full bg-white/5 border border-admin-border rounded-xl px-4 py-3 text-sm font-mono font-black text-white outline-none focus:border-brand-cyan transition uppercase"
            />
          </div>
          <button
            onClick={handleCreate}
            className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-black py-3 rounded-xl transition shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Oluştur
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-brand-cyan animate-pulse">Yükleniyor...</div>
      ) : error ? (
        <div className="text-red-400 font-bold">{error}</div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-[10px] font-black text-brand-cyan uppercase tracking-widest">
              <tr>
                <th className="p-6">Tarih</th>
                <th className="p-6">Etiket</th>
                <th className="p-6">Kod</th>
                <th className="p-6">İndirim</th>
                <th className="p-6">Durum</th>
                <th className="p-6 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {codes.map((c: any) => (
                <tr key={c.id} className="hover:bg-white/5 transition">
                  <td className="p-6 text-admin-text-muted font-mono text-xs">{new Date(c.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="p-6 font-bold text-white">{c.wonPrizeLabel || '-'}</td>
                  <td className="p-6 font-mono font-black tracking-widest text-white">{c.discountCode}</td>
                  <td className="p-6 text-brand-orange font-mono font-bold">%{c.discountPercentage}</td>
                  <td className="p-6">
                    {c.isUsed ? (
                      <span className="text-red-400 text-[10px] font-black uppercase bg-red-500/10 px-2 py-1 rounded">KULLANILDI</span>
                    ) : (
                      <span className="text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 px-2 py-1 rounded">AKTİF</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={async () => {
                        if (!confirm('Silmek istediğinize emin misiniz?')) return;
                        await api.deleteDiscountCode(c.id);
                        await load();
                      }}
                      className="text-red-500 hover:text-red-400 transition"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiscountCodesSettings;
