import React from 'react';
import { useLocation } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';
import SiteTicker from './SiteTicker';
import { X } from 'lucide-react';
import { generateReceiptPdf } from '../services/pdfGenerator';
import { api } from '../services/api';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/login';

    const [adminPhone, setAdminPhone] = React.useState('905000000000');
    const [confirmationData, setConfirmationData] = React.useState<any | null>(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

    React.useEffect(() => {
        api.getSystemSettings().then(s => {
            const val = (s as any).whatsAppNumber || (s as any).WhatsAppNumber;
            if (val) setAdminPhone(val);
        }).catch(() => { });
    }, []);

    const syncConfirmationFromStorage = React.useCallback(() => {
        try {
            const raw = sessionStorage.getItem('lightbox_last_confirmation');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed?.confirmationData) return;
            setConfirmationData(parsed.confirmationData);
            setIsConfirmationOpen(true);
        } catch {
            // ignore
        }
    }, []);

    React.useEffect(() => {
        syncConfirmationFromStorage();
        const onConfirm = () => syncConfirmationFromStorage();
        window.addEventListener('order-confirmation', onConfirm);
        return () => window.removeEventListener('order-confirmation', onConfirm);
    }, [syncConfirmationFromStorage]);

    const closeConfirmation = () => {
        setIsConfirmationOpen(false);
        setConfirmationData(null);
        try { sessionStorage.removeItem('lightbox_last_confirmation'); } catch { }
    };

    const handleDownloadReceiptPdf = () => {
        if (!confirmationData) return;
        generateReceiptPdf({
            customerName: confirmationData.customerName,
            customerPhone: confirmationData.customerPhone,
            items: (confirmationData.items || []).map((i: any) => ({ title: i.title, price: i.price || 0, note: i.note })),
            orderIds: confirmationData.orderIds || [],
            subtotal: confirmationData.subtotal || 0,
            discountPercentage: confirmationData.discountPercentage ?? null,
            total: confirmationData.total || 0
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

        (confirmationData.items || []).forEach((i: any, idx: number) => {
            lines.push(`${idx + 1}) ${i.title} — $${(i.price || 0).toFixed(2)}`);
            if (i.note) lines.push(`Not: ${i.note}`);
            if (confirmationData.orderIds?.[idx]) {
                lines.push(`${window.location.origin}/order/${confirmationData.orderIds[idx]}`);
            }
        });

        lines.push('─────────────────');
        if (confirmationData.discountPercentage != null && confirmationData.discountPercentage > 0) {
            lines.push(`Ara Toplam: $${Number(confirmationData.subtotal || 0).toFixed(2)}`);
            lines.push(`İndirim: %${confirmationData.discountPercentage}`);
        }
        lines.push(`TOPLAM: $${Number(confirmationData.total || 0).toFixed(2)}`);

        const txt = encodeURIComponent(lines.join('\n'));
        window.open(`https://wa.me/${adminPhone}?text=${txt}`, '_blank');
    };

    const confirmationModal = isConfirmationOpen && confirmationData ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative w-full max-w-lg bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between">
                    <div>
                        <div className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Siparişiniz Alındı</div>
                        <div className="text-lg font-black text-[var(--app-text)] uppercase tracking-tighter">Onay</div>
                    </div>
                    <button type="button" onClick={closeConfirmation} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="text-xs font-bold text-[var(--app-muted)]">
                        Sipariş No: {(confirmationData.orderIds || []).map((id: number) => `#${id}`).join(', ')}
                    </div>

                    <div className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-4 space-y-2">
                        {(confirmationData.items || []).map((it: any, idx: number) => (
                            <div key={it.id || idx} className="text-xs font-bold text-[var(--app-text)]">
                                {idx + 1}) {it.title} — ${(it.price || 0).toFixed(2)}$
                                {it.note ? <div className="text-[10px] text-[var(--app-muted)] font-bold mt-1">Not: {it.note}</div> : null}
                                {confirmationData.orderIds?.[idx] ? (
                                    <div className="text-[10px] text-indigo-400 font-black mt-1 break-all">
                                        {window.location.origin}/order/{confirmationData.orderIds[idx]}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Toplam</span>
                        <span className="text-xl font-black text-emerald-400">${Number(confirmationData.total || 0).toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button type="button" onClick={handleDownloadReceiptPdf} className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl hover:bg-white/10 transition uppercase tracking-widest text-xs">
                            Fiş PDF İndir
                        </button>
                        <button type="button" onClick={handleShareWhatsApp} className="w-full bg-[#25D366] text-white font-black py-3 rounded-xl hover:bg-[#20BD5A] transition uppercase tracking-widest text-xs">
                            WhatsApp ile Gönder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdmin && <SiteTicker />}
            <div className="flex-1 flex flex-col relative">
                {confirmationModal}
                {children}
            </div>
            {!isAdmin && <WhatsAppButton />}
        </div>
    );
};

export default LayoutWrapper;
