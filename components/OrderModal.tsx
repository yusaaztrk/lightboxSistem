import React, { useState } from 'react';
import { X, Phone, User, MessageSquare, Check, Loader2 } from 'lucide-react';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customerData: CustomerData) => Promise<void>;
    finalPrice: number;
}

export interface CustomerData {
    fullName: string;
    phone: string;
    note: string;
    discountedPrice?: number;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSubmit, finalPrice }) => {
    const [formData, setFormData] = useState<CustomerData>({
        fullName: '',
        phone: '',
        note: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ percentage: number; owner: string } | null>(null);
    const [discountError, setDiscountError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');
        let formatted = digits;
        if (digits.length > 0 && digits[0] !== '0') formatted = '0' + digits;
        if (formatted.length > 11) formatted = formatted.substring(0, 11);
        let display = formatted;
        if (formatted.length > 4) display = `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
        if (formatted.length > 7) display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
        if (formatted.length > 9) display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9)}`;
        return { display, raw: formatted };
    };

    const normalizePhone = (value: string) => value.replace(/\D/g, '');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { display } = formatPhoneNumber(e.target.value);
        setFormData(prev => ({ ...prev, phone: display }));
    };

    if (!isOpen) return null;

    const finalPriceAfterDiscount = appliedDiscount
        ? finalPrice * (1 - appliedDiscount.percentage / 100)
        : finalPrice;

    const handleApplyDiscount = async () => {
        if (!discountCode) return;
        if (!formData.phone || formData.phone.length < 10) {
            setDiscountError('Lütfen önce geçerli bir telefon numarası giriniz.');
            return;
        }

        setIsValidating(true);
        setDiscountError('');
        try {
            const result = await import('../services/api').then(m => m.api.validateCode(discountCode, normalizePhone(formData.phone)));
            setAppliedDiscount(result);
        } catch (error: any) {
            setAppliedDiscount(null);
            if (error.response && error.response.data) {
                setDiscountError(typeof error.response.data === 'string' ? error.response.data : 'Geçersiz kod veya numara hatası.');
            } else {
                setDiscountError('Geçersiz veya kullanılmış kod.');
            }
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalNote = appliedDiscount
                ? `[İNDİRİM KODU: ${discountCode} (%${appliedDiscount.percentage})] ${formData.note}`
                : formData.note;

            await onSubmit({
                ...formData,
                note: finalNote,
                discountedPrice: appliedDiscount ? finalPriceAfterDiscount : undefined,
            });
        } catch (error) {
            console.error("Submission error", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-[var(--app-text)] uppercase tracking-tighter italic">Siparişi Tamamla</h2>
                        <p className="text-[var(--app-muted)] text-xs font-bold uppercase tracking-widest mt-1">Son Adım</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--app-muted)] hover:text-[var(--app-text)] transition bg-[var(--app-border)] p-2 rounded-xl hover:opacity-80">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                        <span className="text-indigo-300 text-xs font-black uppercase tracking-widest block">Ödenecek Tutar</span>
                        {appliedDiscount && (
                            <span className="text-xs text-gray-500 line-through font-bold">${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        )}
                    </div>
                    <span className="text-3xl font-black text-[var(--app-text)] tracking-tighter">${finalPriceAfterDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Ad Soyad</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                required
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-11 pr-4 py-4 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Telefon</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                onBlur={() => { }} // Disabled auto-check in favor of manual button
                                className="w-full pl-11 pr-28 py-4 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 transition-colors"
                                placeholder="05XX XXX XX XX"
                                maxLength={14}
                            />
                            {/* Manual Check Button */}
                            <button
                                type="button"
                                onClick={async () => {
                                    if (formData.phone.length < 13) return;
                                    try {
                                        const status = await import('../services/api').then(m => m.api.checkMembership(normalizePhone(formData.phone)));
                                        if (status.hasMembership && status.discount > 0) {
                                            setAppliedDiscount({ percentage: status.discount, owner: formData.phone });
                                            // Optional success toast?
                                        } else {
                                            alert("Bu numara için aktif üyelik veya indirim bulunamadı.");
                                        }
                                    } catch (e) { console.error(e); }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition uppercase tracking-wider"
                            >
                                KONTROL ET
                            </button>
                        </div>
                    </div>

                    {/* Discount Code Section - Now Below Phone */}
                    <div className="pt-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">İNDİRİM KODU</label>
                        <div className="flex gap-2">
                            <input
                                value={discountCode}
                                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                                placeholder="KODU GİRİNİZ"
                                className="flex-1 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-4 py-3 text-[var(--app-text)] font-mono font-bold outline-none focus:border-indigo-500 transition-colors uppercase"
                                disabled={!!appliedDiscount}
                            />
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                disabled={!discountCode || isValidating || !!appliedDiscount}
                                className="bg-[var(--app-border)] hover:opacity-80 text-[var(--app-text)] font-bold px-4 rounded-xl transition disabled:opacity-50"
                            >
                                {isValidating ? <Loader2 className="animate-spin w-4 h-4" /> : 'UYGULA'}
                            </button>
                        </div>
                        {discountError && <p className="text-red-500 text-xs mt-2 font-bold">{discountError}</p>}
                        {appliedDiscount && (
                            <p className="text-emerald-400 text-xs mt-2 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {discountCode ? `%${appliedDiscount.percentage} İndirim Uygulandı!` : `%${appliedDiscount.percentage} ÜYELİK İNDİRİMİ UYGULANDI`}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Sipariş Notu (Opsiyonel)</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                            <textarea
                                value={formData.note}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                className="w-full pl-11 pr-4 py-4 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-none"
                                placeholder="Varsa özel istekleriniz..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> İŞLENİYOR...
                            </>
                        ) : (
                            <>
                                SİPARİŞİ ONAYLA <Check className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;
