import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, Send } from 'lucide-react';
import { clearCart, getCartItems, removeCartItem, subscribeCart } from '../services/cart';
import { api } from '../services/api';

const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState(() => getCartItems());
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return subscribeCart(() => setItems(getCartItems()));
  }, []);

  const total = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0), 0), [items]);

  const getItemSummary = (configurationDetails: string) => {
    try {
      const c: any = JSON.parse(configurationDetails || '{}');
      const width = c.width != null ? `${c.width}` : null;
      const height = c.height != null ? `${c.height}` : null;
      const dims = width && height ? `${width}x${height} cm` : null;

      const profile = c.profile ? `${c.profile}` : null;
      const backplate = c.backplate ? `${c.backplate}` : null;
      const ledType = c.ledType ? `${c.ledType}` : null;

      const lines = [
        dims,
        profile ? `Profil: ${profile}` : null,
        backplate ? `Zemin: ${backplate}` : null,
        ledType ? `LED: ${ledType}` : null,
      ].filter(Boolean) as string[];

      return lines;
    } catch {
      return [] as string[];
    }
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, '');

  const createOrders = async () => {
    if (items.length === 0) return;
    if (!fullName.trim()) {
      alert('Ad Soyad gerekli');
      return;
    }
    if (!phone.trim()) {
      alert('Telefon gerekli');
      return;
    }

    setSubmitting(true);
    try {
      const createdIds: number[] = [];
      for (const item of items) {
        const order = {
          customerName: fullName,
          customerPhone: phone,
          dimensions: '-',
          price: item.price,
          configurationDetails: item.configurationDetails,
          costDetails: item.costDetails || null,
          status: 'Pending',
        };
        const created = await api.createOrder(order as any);
        createdIds.push(created.id);
      }
      clearCart();

      const firstId = createdIds[0];
      if (firstId) navigate(`/order/${firstId}`);
    } catch (e) {
      console.error(e);
      alert('Siparişler oluşturulurken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareWhatsApp = () => {
    const lines: string[] = [];
    lines.push('Merhaba, sepetimdeki ürünler:');
    items.forEach((i, idx) => {
      lines.push(`${idx + 1}) ${i.title} - $${(i.price || 0).toFixed(2)}`);
    });
    lines.push(`Toplam: $${total.toFixed(2)}`);
    if (fullName.trim()) lines.push(`Ad Soyad: ${fullName}`);
    if (phone.trim()) lines.push(`Telefon: ${phone}`);
    if (note.trim()) lines.push(`Not: ${note}`);

    const txt = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${txt}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans p-6 md:p-10">
      <div className="public-app max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </button>

          <button
            onClick={() => {
              if (confirm('Sepet temizlensin mi?')) clearCart();
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-black uppercase tracking-widest"
          >
            <Trash2 className="w-4 h-4" /> Sepeti Temizle
          </button>
        </div>

        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Sepet</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-sm text-[var(--app-muted)] font-bold">Sepet boş.</div>
          ) : (
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {i.previewImageUrl ? (
                      <img
                        src={i.previewImageUrl}
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-black/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-white/10 bg-black/20 flex-shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div className="font-black text-sm truncate">{i.title}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {new Date(i.createdAt).toLocaleString('tr-TR')}
                      </div>

                      {getItemSummary(i.configurationDetails).length > 0 && (
                        <div className="mt-2 text-[11px] text-gray-400 font-bold">
                          {getItemSummary(i.configurationDetails).map((line, idx) => (
                            <div key={idx} className="truncate">{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-black text-emerald-400">${(i.price || 0).toFixed(2)}</div>
                    <button
                      onClick={() => removeCartItem(i.id)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[var(--app-border)] flex items-center justify-between">
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Toplam</div>
                <div className="text-2xl font-black text-emerald-400">${total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Ad Soyad</div>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Telefon</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Not</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none min-h-[90px]" />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={createOrders}
              disabled={submitting || items.length === 0}
              className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {submitting ? 'İŞLENİYOR...' : 'SİPARİŞLERİ OLUŞTUR'}
            </button>

            <button
              onClick={shareWhatsApp}
              disabled={items.length === 0}
              className="flex-1 bg-white/5 border border-white/10 text-[var(--app-text)] font-black py-4 rounded-2xl hover:bg-white/10 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> WhatsApp Paylaş
            </button>
          </div>

          <div className="text-[10px] text-gray-500 font-bold">
            Telefon: {normalizePhone(phone)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
