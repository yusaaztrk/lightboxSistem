import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, Send, Download, ChevronDown, ChevronUp, Check, Loader2, Tag } from 'lucide-react';
import { clearCart, getCartItems, removeCartItem, subscribeCart } from '../services/cart';
import { api } from '../services/api';
import { generateReceiptPdf } from '../services/pdfGenerator';

const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState(() => getCartItems());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Discount State
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ percentage: number; owner: string } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // New states for checkout
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '' });
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [confirmedOrderIds, setConfirmedOrderIds] = useState<number[]>([]);
  const [adminPhone, setAdminPhone] = useState('905000000000');



  useEffect(() => {
    api.getSystemSettings().then(s => {
      const val = (s as any).whatsAppNumber || (s as any).WhatsAppNumber;
      if (val) setAdminPhone(val);
    }).catch(err => console.error("Failed to fetch admin settings", err));

    return subscribeCart(() => setItems(getCartItems()));
  }, []);

  const total = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0), 0), [items]);

  const discountedTotal = useMemo(() => {
    if (!appliedDiscount) return total;
    return total * (1 - appliedDiscount.percentage / 100);
  }, [total, appliedDiscount]);

  const getItemDetails = (configurationDetails: string) => {
    try {
      const c: any = JSON.parse(configurationDetails || '{}');
      const details: { label: string; value: string }[] = [];

      if (c.width != null && c.height != null) {
        details.push({ label: 'Boyutlar', value: `${c.width}x${c.height} cm` });
      }
      if (c.profile) {
        details.push({ label: 'Profil', value: c.profile === 'DOUBLE' ? 'Çift Taraflı' : 'Tek Taraflı' });
      }
      if (c.backplate) {
        details.push({ label: 'Zemin', value: c.backplate });
      }
      if (c.ledType) {
        details.push({ label: 'LED', value: c.ledType === 'INNER' ? 'İç Aydınlatma' : 'Dış Aydınlatma' });
      }
      if (c.depth != null && c.depth > 0) {
        details.push({ label: 'Derinlik', value: `${c.depth} cm` });
      }
      if (c.type) {
        details.push({ label: 'Tür', value: c.type === 'FABRIC_ONLY' ? 'Kumaş Baskı' : 'Lightbox' });
      }
      if (c.hasFeet) {
        details.push({ label: 'Montaj', value: 'Ayaklı' });
      }
      if (c.frameColor) {
        details.push({ label: 'Profil Rengi', value: c.frameColor });
      }

      return details;
    } catch {
      return [];
    }
  };

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

  const handleApplyDiscount = async () => {
    if (!discountCode) return;

    if (!customerData.phone || customerData.phone.length < 10) {
      setDiscountError('İndirim kodu için telefon numarası giriniz.');
      return;
    }

    setIsValidating(true);
    setDiscountError('');
    try {
      const result = await api.validateDiscountCode(discountCode, customerData.phone);
      setAppliedDiscount(result);
    } catch (error: any) {
      setAppliedDiscount(null);
      if (error.response && error.response.data) {
        setDiscountError(typeof error.response.data === 'string' ? error.response.data : 'Geçersiz kod veya hata.');
      } else {
        setDiscountError('Geçersiz veya kullanılmış kod.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckMembership = async (phoneNumber: string) => {
    if (phoneNumber.length < 10) return;

    setIsCheckingMembership(true);
    try {
      const result = await api.checkMembership(phoneNumber);
      if (result.hasMembership) {
        setAppliedDiscount({
          percentage: result.discount,
          owner: result.memberName
        });
      }
    } catch (error) {
      console.warn("Membership check failed", error);
    } finally {
      setIsCheckingMembership(false);
    }
  };

  const handleConfirmCart = async () => {
    if (!customerData.name || !customerData.phone) {
      alert("Lütfen isim ve telefon bilgilerini eksiksiz giriniz.");
      return;
    }

    setIsValidating(true);
    try {
      const orderIds: number[] = [];
      for (const item of items) {
        const itemPrice = appliedDiscount
          ? item.price * (1 - appliedDiscount.percentage / 100)
          : item.price;

        const order = {
          customerName: customerData.name,
          customerPhone: customerData.phone,
          dimensions: item.title,
          price: itemPrice,
          configurationDetails: item.configurationDetails,
          costDetails: item.costDetails || '',
          status: 'Pending'
        };
        const created = await api.createOrder(order);
        orderIds.push(created.id);
      }
      setConfirmedOrderIds(orderIds);
      setIsConfirmed(true);
      alert("Siparişleriniz başarıyla onaylandı ve admin paneline iletildi.");
    } catch (error) {
      console.error(error);
      alert("Sipariş onaylanırken bir hata oluştu.");
    } finally {
      setIsValidating(false);
    }
  };

  const generateCartDocument = () => {
    generateReceiptPdf({
      customerName: customerData.name,
      customerPhone: customerData.phone,
      items: items.map(i => ({ title: i.title, price: i.price || 0 })),
      orderIds: confirmedOrderIds,
      subtotal: total,
      discountPercentage: appliedDiscount?.percentage ?? null,
      total: discountedTotal
    });

    // Ask user if they want to clear the cart after downloading
    setTimeout(() => {
      if (confirm('Belge indirildi! Sepeti temizlemek ister misiniz?')) {
        clearCart();
      }
    }, 500);
  };

  const shareWhatsApp = () => {
    const lines: string[] = [];
    lines.push('🚀 *YENİ SİPARİŞ ALINDI*');
    lines.push('─────────────────');
    lines.push(`👤 *Müşteri:* ${customerData.name}`);
    lines.push(`📞 *Telefon:* ${customerData.phone}`);
    lines.push('─────────────────');

    items.forEach((i, idx) => {
      const displayPrice = appliedDiscount
        ? (i.price || 0) * (1 - appliedDiscount.percentage / 100)
        : (i.price || 0);

      lines.push(`${idx + 1}) *${i.title}* — $${displayPrice.toFixed(2)}`);
      if (confirmedOrderIds[idx]) {
        // Add tracking link for each order
        lines.push(`🔗 ${window.location.origin}/order/${confirmedOrderIds[idx]}`);
      }
    });

    lines.push('─────────────────');
    if (appliedDiscount) {
      lines.push(`Ara Toplam: $${total.toFixed(2)}`);
      lines.push(`İndirim: %${appliedDiscount.percentage} (-$${(total - discountedTotal).toFixed(2)})`);
    }
    lines.push(`💰 *TOPLAM: $${discountedTotal.toFixed(2)}*`);

    const txt = encodeURIComponent(lines.join('\n'));
    // Open WhatsApp to the ADMIN phone number
    window.open(`https://wa.me/${adminPhone}?text=${txt}`, '_blank');

    setTimeout(() => {
      if (confirm('Sipariş WhatsApp\'tan admin numarasına iletildi! Sepeti temizlemek ister misiniz?')) {
        clearCart();
        navigate('/');
      }
    }, 500);
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

        {/* Sepet Detayları */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Sepet</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-sm text-[var(--app-muted)] font-bold">Sepet boş.</div>
          ) : (
            <div className="space-y-3">
              {items.map(i => {
                const details = getItemDetails(i.configurationDetails);
                const isExpanded = expandedItemId === i.id;
                return (
                  <div key={i.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all group">
                    <div className="flex items-center justify-between gap-4 p-4">
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
                        {/* Detayları Gör Butonu */}
                        <button
                          onClick={() => setExpandedItemId(isExpanded ? null : i.id)}
                          className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition text-[10px] font-black text-indigo-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Gizle' : 'Detayları Gör'}
                        </button>
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

                    {/* Expanded Details */}
                    {isExpanded && details.length > 0 && (
                      <div className="border-t border-white/5 bg-white/[0.02] px-6 py-4 animate-in slide-in-from-top-1 duration-200">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ürün Detayları</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {details.map((d, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{d.label}</div>
                              <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                                {d.label === 'Profil Rengi' && d.value.startsWith('#') ? (
                                  <>
                                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: d.value }} />
                                    <span className="font-mono text-xs">{d.value}</span>
                                  </>
                                ) : (
                                  d.value
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Toplam & İndirim Bölümü */}
              <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
                {appliedDiscount && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Ara Toplam</div>
                      <div className="text-lg font-bold text-gray-400 line-through">${total.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1">
                        <Tag className="w-3 h-3" /> %{appliedDiscount.percentage} İndirim
                      </div>
                      <div className="text-lg font-bold text-red-400">-${(total - discountedTotal).toFixed(2)}</div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Toplam</div>
                  <div className="text-2xl font-black text-emerald-400">${discountedTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* İndirim Kodu Bölümü */}
        {items.length > 0 && !appliedDiscount && (
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-indigo-400" />
              <div className="text-xs font-black uppercase tracking-widest">İndirim</div>
            </div>
            <div className="space-y-4">
              {/* İndirim Kodu */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">İNDİRİM KODU</label>
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="KODU GİRİNİZ"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--app-text)] font-mono font-bold outline-none focus:border-indigo-500 transition-colors uppercase"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={!discountCode || isValidating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl transition disabled:opacity-50"
                  >
                    {isValidating ? <Loader2 className="animate-spin w-4 h-4" /> : 'UYGULA'}
                  </button>
                </div>
              </div>


              {discountError && <p className="text-red-500 text-xs font-bold">{discountError}</p>}
            </div>
          </div>
        )}

        {/* İndirim Uygulandı Bilgisi */}
        {appliedDiscount && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-black text-emerald-400">
                {appliedDiscount.owner ? `${appliedDiscount.owner} için %${appliedDiscount.percentage} İndirim Uygulandı!` : `%${appliedDiscount.percentage} İndirim Uygulandı!`}
              </div>
              <div className="text-[10px] text-gray-400 font-bold mt-0.5">İndirimli fiyat sepet toplamına yansıtılmıştır.</div>
            </div>
          </div>
        )}

        {/* Müşteri Bilgileri ve Onay */}
        {items.length > 0 && !isConfirmed && (
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className={`w-5 h-5 text-indigo-400 ${isCheckingMembership ? 'animate-spin' : ''}`} />
              <h2 className="text-lg font-black uppercase tracking-tighter">İletişim Bilgileri</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">AD SOYAD</label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={e => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">TELEFON</label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomerData(prev => ({ ...prev, phone: val }));
                    if (val.length >= 10) handleCheckMembership(val);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Örn: 05xx xxx xx xx"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmCart}
              disabled={isValidating || !customerData.name || customerData.phone.length < 10}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {isValidating ? <Loader2 className="animate-spin w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              SEPETİ ONAYLA
            </button>
          </div>
        )}

        {/* Aksiyon Butonları - Sadece Onaydan Sonra */}
        {items.length > 0 && isConfirmed && (
          <div className="flex flex-col gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-5 flex items-center gap-3 mb-2">
              <Check className="w-6 h-6 text-indigo-400" />
              <div>
                <div className="text-sm font-black text-indigo-400 uppercase">SİPARİŞİNİZ OLUŞTURULDU</div>
                <div className="text-[10px] text-gray-400 font-bold mt-0.5">Aşağıdaki butonları kullanarak belgenizi alabilir veya bize iletebilirsiniz.</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!confirmedOrderIds.length) return;
                navigate(`/order/${confirmedOrderIds[0]}`);
              }}
              className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              Siparişinizi Görüntüle
            </button>

            <button
              onClick={generateCartDocument}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              <Download className="w-5 h-5" /> Belgeyi İndir
            </button>

            <button
              onClick={shareWhatsApp}
              className="w-full bg-[#25D366] text-white font-black py-5 rounded-2xl hover:bg-[#20BD5A] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              <Send className="w-5 h-5" /> WS'dan Paylaş
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
