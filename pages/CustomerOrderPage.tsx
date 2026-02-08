import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Order, ConfigOptions, CalculationBreakdown } from '../types';
import { ArrowLeft, Calendar, Phone, Ruler, User, Printer } from 'lucide-react';

const CustomerOrderPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.getOrder(id)
            .then(setOrder)
            .finally(() => setLoading(false));
    }, [id]);

    const { config, breakdown } = useMemo(() => {
        let parsedConfig: ConfigOptions | null = null;
        let parsedBreakdown: CalculationBreakdown | null = null;

        if (!order) return { config: parsedConfig, breakdown: parsedBreakdown };

        try {
            parsedConfig = JSON.parse(order.configurationDetails || '{}');
        } catch { /* ignore */ }

        try {
            parsedBreakdown = JSON.parse(order.costDetails || '{}');
        } catch { /* ignore */ }

        return { config: parsedConfig, breakdown: parsedBreakdown };
    }, [order]);

    if (loading) return <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex items-center justify-center font-bold">Yükleniyor...</div>;
    if (!order) return <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex items-center justify-center font-bold">Sipariş bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans p-6 md:p-10">
            <div className="public-app max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between print-hidden">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-black uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs font-black uppercase tracking-widest"
                        >
                            <Printer className="w-4 h-4" /> Yazdır
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sipariş No</div>
                        <div className="text-xl font-black">#{order.id}</div>
                    </div>
                </div>

                <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Siparişiniz Alındı</h1>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Bilgileriniz kayıt altına alındı. En kısa sürede iletişime geçeceğiz.</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Toplam Tutar</div>
                            <div className="text-3xl font-black text-emerald-400">${order.price.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><User className="w-4 h-4" /> Müşteri</div>
                            <div className="mt-2 font-bold text-white truncate">{order.customerName || '-'}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Phone className="w-4 h-4" /> Telefon</div>
                            <div className="mt-2 font-bold text-white font-mono truncate">{order.customerPhone || '-'}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Calendar className="w-4 h-4" /> Tarih</div>
                            <div className="mt-2 font-bold text-white">{new Date(order.createdAt).toLocaleString('tr-TR')}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Ruler className="w-4 h-4" /> Ölçüler</div>
                            <div className="mt-2 font-bold text-white font-mono">{config?.width}x{config?.height} cm</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Ön Yüz Görseli</div>
                        {config?.userImageUrl ? (
                            <img src={config.userImageUrl} className="w-full aspect-video object-contain bg-black/30 rounded-2xl border border-white/10" />
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center bg-black/30 rounded-2xl border border-white/10 text-gray-500 font-bold">Görsel yok</div>
                        )}
                    </div>

                    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Arka Yüz Görseli</div>
                        {config?.backImageUrl ? (
                            <img src={config.backImageUrl} className="w-full aspect-video object-contain bg-black/30 rounded-2xl border border-white/10" />
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center bg-black/30 rounded-2xl border border-white/10 text-gray-500 font-bold">Görsel yok</div>
                        )}
                    </div>
                </div>

                {breakdown?.selectedLayout && (
                    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-8">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">LED Dizim Bilgisi (Sistem Seçimi)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Yön</div>
                                <div className="mt-2 font-bold text-white">{breakdown.selectedLayout.direction}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Şerit Sayısı</div>
                                <div className="mt-2 font-bold text-white">{breakdown.selectedLayout.stripCount}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Toplam LED</div>
                                <div className="mt-2 font-bold text-white font-mono">{breakdown.selectedLayout.totalLedMeters.toFixed(2)} m</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrderPage;
