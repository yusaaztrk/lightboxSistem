import React, { useState, useEffect } from 'react';
import { X, User, Phone, Briefcase, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface MembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        companyName: '',
        membershipTypeId: 1 // Default to 1 (Müşteri)
    });
    const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            import('../services/api').then(m => m.api.getMembershipTypes().then(setMembershipTypes).catch(console.error));
        }
    }, [isOpen]);

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Ensure it starts with 0
        let formatted = digits;
        if (digits.length > 0 && digits[0] !== '0') {
            formatted = '0' + digits;
        }

        // Apply TR mask: 05XX XXX XX XX
        if (formatted.length > 11) formatted = formatted.substring(0, 11);

        // 0555 555 55 55
        let display = formatted;
        if (formatted.length > 4) {
            display = `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
        }
        if (formatted.length > 7) {
            display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
        }
        if (formatted.length > 9) {
            display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9)}`;
        }

        return { display, raw: formatted };
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { display } = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: display });
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Validation
        const rawPhone = formData.phone.replace(/\s/g, '');
        if (!/^05\d{9}$/.test(rawPhone)) {
            setError("Lütfen geçerli bir telefon numarası giriniz: 05XX XXX XX XX");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.registerMember({
                ...formData,
                phone: rawPhone, // Send raw or display? Let's check backend. Backend compares check logic. Standardizing on Display format with spaces might be safer if that's what other parts use, OR raw. Let's send Display format to keep consistent with UI or raw?
                // Actually existing leads might be mixed. Let's stick to the masked string "05XX XXX XX XX" as the standard identity string if possible, or clean raw.
                // Re-reading request: "sistemin heryerinde telefon numarası formatı türkiyye göre olacak".
                // I will save it formatted: "05XX XXX XX XX".
                phoneNumber: formData.phone
            });
            setSuccessMessage("Başvurunuz alındı! Admin onayından sonra SMS ile bilgilendirileceksiniz.");
            setTimeout(onClose, 3000);
        } catch (err: any) {
            console.error("Submission error", err);
            // Fix: Handle object error
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === 'string') setError(data);
                else if (data.title) setError(data.title);
                else if (data.errors) setError(Object.values(data.errors).flat().join(', '));
                else setError("Bir hata oluştu.");
            } else {
                setError("Bir hata oluştu.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successMessage) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl p-8 shadow-2xl text-center max-w-sm">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--app-text)] mb-2">BAŞVURU ALINDI</h3>
                    <p className="text-[var(--app-muted)] text-sm">{successMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--app-muted)] hover:text-[var(--app-text)]"><X size={20} /></button>

                <h2 className="text-2xl font-black text-[var(--app-text)] uppercase italic tracking-tighter mb-1">ÜYELİK BAŞVURUSU</h2>
                <p className="text-[var(--app-muted)] text-xs font-bold uppercase tracking-widest mb-6">Müşteri veya Bayi olarak kaydolun</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Üyelik Tipi</label>
                        <div className="grid grid-cols-2 gap-3">
                            {membershipTypes.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, membershipTypeId: type.id })}
                                    className={`py-3 rounded-xl text-xs font-black transition-all border ${formData.membershipTypeId === type.id ? 'border-indigo-500 bg-indigo-500/20 text-[var(--app-text)] shadow-lg shadow-indigo-500/10' : 'border-[var(--app-border)] text-[var(--app-muted)] hover:bg-[var(--app-border)]'}`}
                                >
                                    {type.name.toUpperCase()}
                                </button>
                            ))}
                            {membershipTypes.length === 0 && <span className="text-[var(--app-muted)] text-xs">Yükleniyor...</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Ad Soyad</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-muted)]" />
                            <input
                                required
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
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-muted)]" />
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className="w-full pl-11 pr-4 py-4 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 transition-colors"
                                placeholder="05XX XXX XX XX"
                                maxLength={14}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--app-muted)] uppercase tracking-widest ml-1">Firma Adı</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-muted)]" />
                            <input
                                required
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full pl-11 pr-4 py-4 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Firma ünvanınız"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-4 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'BAŞVURU YAP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MembershipModal;
