import React from 'react';
import { Box, Settings, User, LayoutGrid, Scissors, Sun, Moon, ShoppingCart, X, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getThemeMode, subscribeThemeMode, toggleThemeMode } from '../services/theme';
import { getCartItems, getCartCount, subscribeCart, removeCartItem, clearCart, CartItem, updateCartItemNote } from '../services/cart';
import { api } from '../services/api';
import { generateReceiptPdf } from '../services/pdfGenerator';

interface PublicHeaderProps {
    price?: number;
    onOpenMember: () => void;
    activePage: 'lightbox' | 'fabric';
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ price, onOpenMember, activePage }) => {
    const navigate = useNavigate();
    const [themeMode, setThemeMode] = React.useState<'dark' | 'light'>(() => getThemeMode());
    const [cartCount, setCartCount] = React.useState<number>(() => getCartCount());
    const [cartOpen, setCartOpen] = React.useState(false);
    const [cartItems, setCartItems] = React.useState<CartItem[]>(() => getCartItems());

    const [customerData, setCustomerData] = React.useState({ name: '', phone: '' });
    const [isCheckingMembership, setIsCheckingMembership] = React.useState(false);
    const [appliedDiscount, setAppliedDiscount] = React.useState<{ percentage: number; owner: string } | null>(null);
    const [discountError, setDiscountError] = React.useState('');
    const [discountCode, setDiscountCode] = React.useState('');
    const [isValidatingCode, setIsValidatingCode] = React.useState(false);
    const [hasCheckedDiscount, setHasCheckedDiscount] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [confirmedOrderIds, setConfirmedOrderIds] = React.useState<number[]>([]);
    const [confirmedItems, setConfirmedItems] = React.useState<CartItem[]>([]);
    const [isConfirmed, setIsConfirmed] = React.useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
    const [confirmationData, setConfirmationData] = React.useState<null | {
        customerName: string;
        customerPhone: string;
        items: CartItem[];
        orderIds: number[];
        subtotal: number;
        discountPercentage?: number | null;
        total: number;
    }>(null);
    const [adminPhone, setAdminPhone] = React.useState('905000000000');

    const persistDiscountState = React.useCallback((next: {
        discountCode: string;
        appliedDiscount: { percentage: number; owner: string } | null;
        hasCheckedDiscount: boolean;
    }) => {
        try {
            sessionStorage.setItem('lightbox_discount_state', JSON.stringify(next));
        } catch { }
    }, []);

    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem('lightbox_last_confirmation');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed?.confirmationData) return;

            setConfirmationData(parsed.confirmationData);
            setIsConfirmationModalOpen(true);
        } catch {
            // ignore
        }
    }, []);

    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem('lightbox_discount_state');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (typeof parsed?.discountCode === 'string') setDiscountCode(parsed.discountCode);
            if (parsed?.appliedDiscount) setAppliedDiscount(parsed.appliedDiscount);
            if (typeof parsed?.hasCheckedDiscount === 'boolean') setHasCheckedDiscount(parsed.hasCheckedDiscount);
        } catch {
            // ignore
        }
    }, []);

    React.useEffect(() => {
        const unsubTheme = subscribeThemeMode(() => setThemeMode(getThemeMode()));
        const unsubCart = subscribeCart(() => {
            setCartCount(getCartCount());
            setCartItems(getCartItems());
        });

        const onOpenCartDrawer = () => {
            setCartOpen(true);
        };
        window.addEventListener('open-cart-drawer', onOpenCartDrawer);

        api.getSystemSettings().then(s => {
            const val = (s as any).whatsAppNumber || (s as any).WhatsAppNumber;
            if (val) setAdminPhone(val);
        }).catch(() => { });

        return () => {
            unsubTheme();
            unsubCart();
            window.removeEventListener('open-cart-drawer', onOpenCartDrawer);
        };
    }, []);

    const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0), 0);
    const drawerItems = isConfirmed ? confirmedItems : cartItems;
    const drawerSubtotal = drawerItems.reduce((s, i) => s + (i.price || 0), 0);
    const discountedTotal = appliedDiscount ? drawerSubtotal * (1 - appliedDiscount.percentage / 100) : drawerSubtotal;
    const discountAmount = appliedDiscount ? Math.max(0, drawerSubtotal - discountedTotal) : 0;

    const getItemSummary = (configurationDetails: string) => {
        try {
            const c: any = JSON.parse(configurationDetails || '{}');
            const width = c.width != null ? `${c.width}` : null;
            const height = c.height != null ? `${c.height}` : null;
            const dims = width && height ? `${width}x${height} cm` : null;

            const profile = c.profile ? `${c.profile}` : null;
            const backplate = c.backplate ? `${c.backplate}` : null;
            const ledType = c.ledType ? `${c.ledType}` : null;

            return [
                dims,
                profile ? `Profil: ${profile}` : null,
                backplate ? `Zemin: ${backplate}` : null,
                ledType ? `LED: ${ledType}` : null,
            ].filter(Boolean) as string[];
        } catch {
            return [] as string[];
        }
    };

    const resetCheckoutState = () => {
        setAppliedDiscount(null);
        setDiscountError('');
        setDiscountCode('');
        setIsValidatingCode(false);
        setHasCheckedDiscount(false);
        setIsSubmitting(false);
        setConfirmedOrderIds([]);
        setConfirmedItems([]);
        setIsConfirmed(false);
        setCustomerData({ name: '', phone: '' });
        try { sessionStorage.removeItem('lightbox_discount_state'); } catch { }
    };

    const handleCheckMembership = async (e?: React.MouseEvent) => {
        try { (e as any)?.preventDefault?.(); } catch { }
        if (!customerData.name || !customerData.phone || customerData.phone.length < 10) {
            setDiscountError('İsim soyisim ve telefon zorunludur.');
            return;
        }

        setDiscountError('');
        setIsCheckingMembership(true);
        try {
            const result = await api.checkMembership(customerData.phone);
            if (result.hasMembership && result.discount > 0) {
                const next = { percentage: result.discount, owner: result.memberName || '' };
                setAppliedDiscount(next);
                setHasCheckedDiscount(true);
                persistDiscountState({ discountCode, appliedDiscount: next, hasCheckedDiscount: true });
            } else {
                setAppliedDiscount(null);
                setDiscountError('Üyelik indirimi bulunamadı veya üyelik onaysız.');
                setHasCheckedDiscount(true);
                persistDiscountState({ discountCode, appliedDiscount: null, hasCheckedDiscount: true });
            }
        } catch {
            setDiscountError('Üyelik sorgulanamadı.');
        } finally {
            setIsCheckingMembership(false);
        }
    };

    const handleValidateDiscountCode = async (e?: React.MouseEvent) => {
        try { (e as any)?.preventDefault?.(); } catch { }
        if (!discountCode) return;

        setIsValidatingCode(true);
        setDiscountError('');
        try {
            const res = await api.validateDiscountCode(discountCode, '');
            const next = { percentage: res.percentage, owner: res.owner };
            setAppliedDiscount(next);
            setHasCheckedDiscount(true);
            persistDiscountState({ discountCode, appliedDiscount: next, hasCheckedDiscount: true });
        } catch (e: any) {
            setAppliedDiscount(null);
            setHasCheckedDiscount(false);
            persistDiscountState({ discountCode, appliedDiscount: null, hasCheckedDiscount: false });
            if (e?.response?.data) {
                setDiscountError(typeof e.response.data === 'string' ? e.response.data : 'Geçersiz kod.');
            } else {
                setDiscountError('Geçersiz veya kullanılmış kod.');
            }
        } finally {
            setIsValidatingCode(false);
        }
    };

    const handleCreateOrders = async () => {
        if (!cartItems.length) return;
        if (!customerData.name || !customerData.phone || customerData.phone.length < 10) {
            setDiscountError('İsim soyisim ve telefon zorunludur.');
            return;
        }

        if (!hasCheckedDiscount) {
            setDiscountError('Önce indirim/üyelik kontrolü yapınız.');
            return;
        }

        setIsSubmitting(true);
        setDiscountError('');
        try {
            const snapshotItems = cartItems.map(i => ({ ...i }));
            const orderIds: number[] = [];
            const orderAccessCodes: Record<number, string> = {};
            for (const item of snapshotItems) {
                const itemPrice = appliedDiscount
                    ? (item.price || 0) * (1 - appliedDiscount.percentage / 100)
                    : (item.price || 0);

                const originalItemPrice = item.price || 0;
                const itemDiscountAmount = appliedDiscount ? Math.max(0, originalItemPrice - itemPrice) : 0;

                const order = {
                    customerName: customerData.name,
                    customerPhone: customerData.phone,
                    dimensions: item.title,
                    price: itemPrice,
                    configurationDetails: (() => {
                        try {
                            const cfg: any = JSON.parse(item.configurationDetails || '{}');
                            if (item.note) cfg.note = item.note;
                            if (appliedDiscount) {
                                cfg.discount = {
                                    code: discountCode || null,
                                    percentage: appliedDiscount.percentage,
                                    amount: itemDiscountAmount,
                                    from: originalItemPrice,
                                    to: itemPrice
                                };
                            }
                            return JSON.stringify(cfg);
                        } catch {
                            return item.configurationDetails;
                        }
                    })(),
                    costDetails: item.costDetails || '',
                    status: 'Pending'
                };

                const created = await api.createOrder(order);
                orderIds.push(created.id);

                try {
                    const cfg = JSON.parse((created as any).configurationDetails || '{}');
                    const accessCode = cfg?.accessCode;
                    if (created?.id && typeof accessCode === 'string' && accessCode.length > 0) {
                        orderAccessCodes[created.id] = accessCode;
                    }
                } catch { }
            }

            try {
                sessionStorage.setItem('lightbox_order_access_codes', JSON.stringify(orderAccessCodes));
            } catch { }

            const snapshotSubtotal = snapshotItems.reduce((s, i) => s + (i.price || 0), 0);
            const snapshotTotal = appliedDiscount
                ? snapshotSubtotal * (1 - appliedDiscount.percentage / 100)
                : snapshotSubtotal;

            setConfirmationData({
                customerName: customerData.name,
                customerPhone: customerData.phone,
                items: snapshotItems,
                orderIds,
                subtotal: snapshotSubtotal,
                discountPercentage: appliedDiscount?.percentage ?? null,
                total: snapshotTotal
            });
            try {
                sessionStorage.setItem('lightbox_last_confirmation', JSON.stringify({
                    confirmationData: {
                        customerName: customerData.name,
                        customerPhone: customerData.phone,
                        items: snapshotItems,
                        orderIds,
                        subtotal: snapshotSubtotal,
                        discountPercentage: appliedDiscount?.percentage ?? null,
                        total: snapshotTotal
                    }
                }));
            } catch { }

            try { window.dispatchEvent(new Event('order-confirmation')); } catch { }

            setIsConfirmationModalOpen(true);

            // Keep legacy confirmed state for any dependent UI, but close drawer.
            setConfirmedItems(snapshotItems);
            setConfirmedOrderIds(orderIds);
            setIsConfirmed(true);
            setCartOpen(false);

            // Next order must re-check discount and cart should be cleared
            clearCart();
        } catch {
            setDiscountError('Sipariş oluşturulurken hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadReceiptPdf = () => {
        if (!confirmationData) return;
        generateReceiptPdf({
            customerName: confirmationData.customerName,
            customerPhone: confirmationData.customerPhone,
            items: confirmationData.items.map(i => ({ title: i.title, price: i.price || 0, note: i.note })),
            orderIds: confirmationData.orderIds,
            subtotal: confirmationData.subtotal,
            discountPercentage: confirmationData.discountPercentage ?? null,
            total: confirmationData.total
        });
    };

    const handleShareWhatsApp = () => {
        if (!confirmationData) return;
        const lines: string[] = [];
        lines.push('*YENİ SİPARİŞ ALINDI*');
        lines.push('─────────────────');
        lines.push(`Müşteri: ${confirmationData.customerName}`);
        lines.push(`Telefon: ${confirmationData.customerPhone}`);
        lines.push('─────────────────');

        confirmationData.items.forEach((i, idx) => {
            lines.push(`${idx + 1}) ${i.title} — $${(i.price || 0).toFixed(2)}`);
            if (i.note) {
                lines.push(`Not: ${i.note}`);
            }
            if (confirmationData.orderIds[idx]) {
                let url = `${window.location.origin}/order/${confirmationData.orderIds[idx]}`;
                try {
                    const raw = sessionStorage.getItem('lightbox_order_access_codes');
                    if (raw) {
                        const map = JSON.parse(raw);
                        const code = map?.[confirmationData.orderIds[idx]];
                        if (typeof code === 'string' && code.length > 0) {
                            url += `?code=${encodeURIComponent(code)}`;
                        }
                    }
                } catch { }
                lines.push(url);
            }
        });

        lines.push('─────────────────');
        if (confirmationData.discountPercentage != null && confirmationData.discountPercentage > 0) {
            lines.push(`Ara Toplam: $${confirmationData.subtotal.toFixed(2)}`);
            lines.push(`İndirim: %${confirmationData.discountPercentage}`);
        }
        lines.push(`TOPLAM: $${confirmationData.total.toFixed(2)}`);

        const txt = encodeURIComponent(lines.join('\n'));
        window.open(`https://wa.me/${adminPhone}?text=${txt}`, '_blank');
    };

    const cartDrawer = (
        <div className="fixed inset-0 z-[70] flex items-stretch" onClick={() => setCartOpen(false)}>
            <div
                className="w-full max-w-md bg-[var(--app-surface-2)] border-r border-[var(--app-border)] shadow-2xl overflow-hidden h-[100dvh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-black text-[var(--app-text)] uppercase tracking-tighter">Sepet</h3>
                        <span className="text-xs text-[var(--app-muted)] font-bold">({drawerItems.length})</span>
                    </div>
                    <button
                        onClick={() => {
                            setCartOpen(false);
                        }}
                        className="text-[var(--app-muted)] hover:text-[var(--app-text)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {drawerItems.length === 0 ? (
                            <p className="text-[var(--app-muted)] text-sm text-center py-8 font-bold">Sepet boş</p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {drawerItems.map(item => (
                                        <div key={item.id} className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-3">
                                            <div className="flex items-center gap-3">
                                                {item.previewImageUrl ? (
                                                    <img src={item.previewImageUrl} className="w-12 h-12 rounded-lg object-cover border border-[var(--app-border)] flex-shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-[var(--app-border)] flex-shrink-0 flex items-center justify-center">
                                                        <Box className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-[var(--app-text)] truncate">{item.title}</div>
                                                    {getItemSummary(item.configurationDetails).length > 0 && (
                                                        <div className="text-[10px] text-[var(--app-muted)] font-bold mt-1">
                                                            {getItemSummary(item.configurationDetails).slice(0, 3).join(' • ')}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-emerald-500 font-black mt-1">${(item.price || 0).toFixed(2)}</div>
                                                </div>
                                                <button onClick={() => removeCartItem(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--app-muted)] hover:text-red-400 transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {!isConfirmed && (
                                                <div className="mt-3">
                                                    <input
                                                        value={item.note || ''}
                                                        onChange={e => updateCartItemNote(item.id, e.target.value)}
                                                        placeholder="Ürün Notu (opsiyonel)"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500 transition"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-4 space-y-3">
                                    <div className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest">İletişim Bilgileri</div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            value={customerData.name}
                                            onChange={e => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ad Soyad"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                value={customerData.phone}
                                                onChange={e => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Telefon"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCheckMembership}
                                                disabled={isCheckingMembership}
                                                className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest disabled:opacity-60"
                                            >
                                                {isCheckingMembership ? '...' : 'Kontrol Et'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-white/10">
                                        <div className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Tag className="w-3 h-3" /> İndirim Kodu
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={discountCode}
                                                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="KOD"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition uppercase"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleValidateDiscountCode}
                                                disabled={isValidatingCode || !discountCode}
                                                className="px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest disabled:opacity-60"
                                            >
                                                {isValidatingCode ? '...' : 'Uygula'}
                                            </button>
                                        </div>
                                    </div>

                                    {appliedDiscount && (
                                        <div className="text-xs font-black text-emerald-400">
                                            %{appliedDiscount.percentage} indirim uygulandı
                                        </div>
                                    )}
                                    {discountError && (
                                        <div className="text-xs font-bold text-red-400">{discountError}</div>
                                    )}

                                    {isConfirmed && confirmedOrderIds.length > 0 && (
                                        <div className="text-xs font-bold text-[var(--app-muted)]">
                                            Sipariş No: {confirmedOrderIds.map(id => `#${id}`).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                </div>

                {(drawerItems.length > 0 || isConfirmed) && (
                    <div className="p-4 border-t border-[var(--app-border)] space-y-3">
                        {appliedDiscount ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-[var(--app-muted)] font-black uppercase tracking-widest">Ham Fiyat</span>
                                    <span className="text-sm font-black text-[var(--app-text)]">${drawerSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-[var(--app-muted)] font-black uppercase tracking-widest">İndirim ({discountCode || '-'})</span>
                                    <span className="text-sm font-black text-red-400">-%{appliedDiscount.percentage} (${discountAmount.toFixed(2)})</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <span className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Toplam</span>
                                    <span className="text-xl font-black text-emerald-400">${discountedTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Toplam</span>
                                <span className="text-xl font-black text-emerald-400">${discountedTotal.toFixed(2)}</span>
                            </div>
                        )}

                        {!isConfirmed ? (
                            <button
                                type="button"
                                onClick={handleCreateOrders}
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-500 transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-60"
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Siparişi Oluştur'}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={handleDownloadReceiptPdf}
                                    className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl hover:bg-white/10 transition uppercase tracking-widest text-xs"
                                >
                                    Fiş PDF İndir
                                </button>
                                <button
                                    type="button"
                                    onClick={handleShareWhatsApp}
                                    className="w-full bg-[#25D366] text-white font-black py-3 rounded-xl hover:bg-[#20BD5A] transition uppercase tracking-widest text-xs"
                                >
                                    WhatsApp ile Gönder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetCheckoutState();
                                        setCartOpen(false);
                                    }}
                                    className="w-full bg-[var(--app-border)] text-[var(--app-muted)] font-bold py-2 rounded-xl hover:opacity-80 transition text-xs uppercase tracking-widest"
                                >
                                    Kapat
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex-1 bg-black/60" />
        </div>
    );

    const confirmationModal = (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative w-full max-w-lg bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between">
                    <div>
                        <div className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Siparişiniz Alındı</div>
                        <div className="text-lg font-black text-[var(--app-text)] uppercase tracking-tighter">Onay</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsConfirmationModalOpen(false);
                            setConfirmationData(null);
                            try { sessionStorage.removeItem('lightbox_last_confirmation'); } catch { }
                            resetCheckoutState();
                        }}
                        className="text-[var(--app-muted)] hover:text-[var(--app-text)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {confirmationData && (
                        <>
                            <div className="text-xs font-bold text-[var(--app-muted)]">
                                Sipariş No: {confirmationData.orderIds.map(id => `#${id}`).join(', ')}
                            </div>

                            <div className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-4 space-y-2">
                                {confirmationData.items.map((it, idx) => (
                                    <div key={it.id} className="text-xs font-bold text-[var(--app-text)]">
                                        {idx + 1}) {it.title} — ${(it.price || 0).toFixed(2)}$
                                        {it.note ? <div className="text-[10px] text-[var(--app-muted)] font-bold mt-1">Not: {it.note}</div> : null}
                                        {confirmationData.orderIds[idx] ? (
                                            <div className="text-[10px] text-indigo-400 font-black mt-1 break-all">
                                                {(() => {
                                                    let url = `${window.location.origin}/order/${confirmationData.orderIds[idx]}`;
                                                    try {
                                                        const raw = sessionStorage.getItem('lightbox_order_access_codes');
                                                        if (raw) {
                                                            const map = JSON.parse(raw);
                                                            const code = map?.[confirmationData.orderIds[idx]];
                                                            if (typeof code === 'string' && code.length > 0) {
                                                                url += `?code=${encodeURIComponent(code)}`;
                                                            }
                                                        }
                                                    } catch { }
                                                    return url;
                                                })()}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Toplam</span>
                                <span className="text-xl font-black text-emerald-400">${confirmationData.total.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={handleDownloadReceiptPdf}
                                    className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl hover:bg-white/10 transition uppercase tracking-widest text-xs"
                                >
                                    Fiş PDF İndir
                                </button>
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="w-full bg-[#25D366] text-white font-black py-3 rounded-xl hover:bg-[#20BD5A] transition uppercase tracking-widest text-xs"
                                >
                                    WhatsApp ile Gönder
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="z-30 w-full">
            {cartOpen && cartDrawer}

            {isConfirmationModalOpen && confirmationModal}

            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-8 z-10 bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-8">
                    {/* Logo Area */}
                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo_new.png" alt="Lightbox Master" className="h-14 w-auto object-contain" />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => navigate('/lightbox')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activePage === 'lightbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> LIGHTBOX
                        </button>
                        <button
                            onClick={() => navigate('/fabric')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activePage === 'fabric' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Scissors className="w-4 h-4" /> KUMAŞ HESAPLA
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Price Display */}
                    {price !== undefined && (
                        <div className="flex flex-col items-end pr-6 border-r border-white/10 mr-2">
                            <span className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">TAHMİNİ TUTAR</span>
                            <span className="text-xl font-black text-emerald-400 tracking-tighter">${price.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Cart button with popup */}
                        <button
                            onClick={() => setCartOpen(!cartOpen)}
                            className="relative p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group"
                            title="Sepet"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-400" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 border border-emerald-200/20">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                const next = toggleThemeMode();
                                setThemeMode(next);
                            }}
                            className="p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group"
                            title="Tema"
                        >
                            {themeMode === 'light' ? (
                                <Moon className="w-5 h-5 text-gray-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        <button
                            onClick={onOpenMember}
                            className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl hover:scale-105 transition group"
                            title="Üye Ol / Giriş Yap"
                        >
                            <User className="w-5 h-5 text-indigo-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-xl">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo_new.png" alt="Lightbox Master" className="h-10 w-auto object-contain" />
                    </div>

                </div>

                {/* Mobile Nav & Actions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => navigate('/lightbox')}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black transition-all border ${activePage === 'lightbox' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                    >
                        <LayoutGrid className="w-3 h-3" /> LIGHTBOX
                    </button>

                    <button
                        onClick={() => navigate('/fabric')}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black transition-all border ${activePage === 'fabric' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                    >
                        <Scissors className="w-3 h-3" /> KUMAŞ
                    </button>

                    <div className="w-[1px] h-8 bg-white/10 mx-1 flex-shrink-0" />

                    <button
                        onClick={() => { const next = toggleThemeMode(); setThemeMode(next); }}
                        className="flex-shrink-0 p-3 bg-white/5 border border-white/10 rounded-xl"
                        title="Tema"
                    >
                        {themeMode === 'light' ? (
                            <Moon className="w-4 h-4 text-gray-400" />
                        ) : (
                            <Sun className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    <button
                        onClick={onOpenMember}
                        className="flex-shrink-0 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                    >
                        <User className="w-4 h-4 text-indigo-400" />
                    </button>

                    <button
                        onClick={() => setCartOpen(!cartOpen)}
                        className="relative flex-shrink-0 p-3 bg-white/5 border border-white/10 rounded-xl"
                        title="Sepet"
                    >
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 border border-emerald-200/20">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicHeader;
