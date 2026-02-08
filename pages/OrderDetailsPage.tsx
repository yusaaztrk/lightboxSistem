import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Order, CalculationBreakdown, ConfigOptions, LedLayoutResult } from '../types';
import { generateProductionPdf } from '../services/pdfGenerator';
import { ArrowLeft, User, Phone, Calendar, Ruler, CheckCircle, Package, Receipt, Info, Printer } from 'lucide-react';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'AUTO' | 'Horizontal' | 'Vertical'>('AUTO');

    const pickLayoutForPdf = (b: CalculationBreakdown): LedLayoutResult | null => {
        if (layoutMode === 'AUTO') return b.selectedLayout;
        if (b.selectedLayout?.direction === layoutMode) return b.selectedLayout;
        if (b.alternativeLayout?.direction === layoutMode) return b.alternativeLayout;
        return b.selectedLayout;
    };

    const selectAdapterForLayout = async (totalLedMeters: number) => {
        const [settings, adapters] = await Promise.all([
            api.getSystemSettings(),
            api.getAdapterPrices()
        ]);

        const totalAmperes = totalLedMeters * (settings.amperesPerMeter || 1);
        const safetyAmperes = totalAmperes * 1.2;

        const sorted = (adapters || []).slice().sort((a, b) => a.amperage - b.amperage);
        let selected = sorted.find(a => a.amperage >= safetyAmperes) || null;
        if (!selected && sorted.length > 0) selected = sorted[sorted.length - 1];

        return {
            adapterName: selected?.name || '-',
            requiredAmperes: totalAmperes,
            selectedAmperes: selected?.amperage || 0
        };
    };

    useEffect(() => {
        if (!id) return;
        api.getOrder(id)
            .then(data => setOrder(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Yükleniyor...</div>;
    if (!order) return <div className="p-10 text-center text-red-500 font-bold">Sipariş bulunamadı.</div>;

    let config: ConfigOptions | null = null;
    let breakdown: CalculationBreakdown | null = null;

    try {
        config = JSON.parse(order.configurationDetails || '{}');
        breakdown = JSON.parse(order.costDetails || '{}');
    } catch (e) {
        console.error("Parse error", e);
    }

    const discountMeta: any = (config as any)?.discount || null;

    const handleDelete = async () => {
        if (!window.confirm("Bu siparişi silmek istediğinize emin misiniz?")) return;
        try {
            await api.deleteOrder(order!.id);
            navigate('/admin/orders');
        } catch (e) {
            console.error(e);
            alert("Silme işlemi başarısız.");
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            if (!order) return;
            const updatedOrder = { ...order, status: newStatus };
            await api.updateOrder(order.id, updatedOrder);
            setOrder(updatedOrder);
        } catch (e) {
            console.error(e);
            alert("Durum güncelleme başarısız.");
        }
    };



    const handleDownloadPdf = async () => {
        if (!order || !breakdown || !config) return;
        setIsGeneratingPdf(true);
        try {
            const chosenLayout = pickLayoutForPdf(breakdown);
            const adapterInfo = chosenLayout
                ? await selectAdapterForLayout(chosenLayout.totalLedMeters || 0)
                : { adapterName: breakdown.adapterName, requiredAmperes: breakdown.requiredAmperes, selectedAmperes: breakdown.selectedAmperes };

            await generateProductionPdf(order, breakdown, config, {
                layoutOverride: chosenLayout,
                adapterNameOverride: adapterInfo.adapterName,
                requiredAmperesOverride: adapterInfo.requiredAmperes,
                selectedAmperesOverride: adapterInfo.selectedAmperes
            });
        } catch (e) {
            console.error("PDF Generation Error:", e);
            alert("PDF oluşturulurken bir hata oluştu.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/orders')} className="p-3 bg-admin-card border border-admin-border rounded-xl hover:bg-white/5 transition text-admin-text-muted hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Sipariş #{order.id}</h1>
                        <p className="text-xs text-admin-text-muted font-bold tracking-widest">DETAYLI MALİYET VE YAPILANDIRMA</p>
                    </div>
                </div>

                {discountMeta && typeof discountMeta === 'object' && (
                    <div className="bg-admin-card border border-admin-border rounded-2xl p-4">
                        <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">İndirim</div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Eski</div>
                                <div className="mt-1 text-white font-black">${Number(discountMeta.from || 0).toFixed(2)}</div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">İndirim</div>
                                <div className="mt-1 text-red-400 font-black">-%{Number(discountMeta.percentage || 0)} (${Number(discountMeta.amount || 0).toFixed(2)})</div>
                                {discountMeta.code ? (
                                    <div className="text-[10px] text-admin-text-muted font-bold mt-1">Kod: {String(discountMeta.code)}</div>
                                ) : null}
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Yeni</div>
                                <div className="mt-1 text-emerald-400 font-black">${Number(discountMeta.to || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <select
                        value={layoutMode}
                        onChange={(e) => setLayoutMode(e.target.value as any)}
                        className="px-4 py-3 rounded-xl bg-admin-card border border-admin-border text-white text-xs font-black uppercase tracking-widest outline-none"
                    >
                        <option value="AUTO">OTOMATİK (UCUZ)</option>
                        <option value="Horizontal">YATAY</option>
                        <option value="Vertical">DİKEY</option>
                    </select>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition shadow-lg ${isGeneratingPdf ? 'bg-gray-600 cursor-not-allowed' : 'bg-brand-cyan hover:bg-brand-cyan-hover shadow-brand-cyan/20'
                            }`}
                    >
                        <Printer className="w-4 h-4" />
                        {isGeneratingPdf ? 'PDF HAZIRLANIYOR...' : 'ÜRETİM PDF'}
                    </button>

                    <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' :
                        order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
                        }`}>
                        {order.status === 'Pending' ? 'Bekliyor' :
                            order.status === 'Completed' ? 'Onaylandı' :
                                order.status === 'Shipped' ? 'Kargolandı' : 'İptal'}
                    </span>

                    <div className="flex items-center gap-2 bg-admin-card p-1 rounded-xl border border-admin-border">
                        {order.status !== 'Completed' && order.status !== 'Shipped' && (
                            <button
                                onClick={() => handleStatusUpdate('Completed')}
                                className="px-4 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-black hover:bg-brand-cyan/20 transition uppercase"
                            >
                                ONAYLA
                            </button>
                        )}
                        {order.status === 'Completed' && (
                            <button
                                onClick={() => handleStatusUpdate('Shipped')}
                                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-black hover:bg-blue-500/20 transition uppercase"
                            >
                                KARGOLA
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500/20 transition uppercase"
                        >
                            SİL
                        </button>
                    </div>
                </div>
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Config */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <div className="bg-admin-card rounded-3xl p-8 shadow-2xl border border-admin-border">
                        <h3 className="text-xs font-black text-brand-orange uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            Müşteri Bilgileri
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {order.customerName?.charAt(0)}
                                </div>
                                <div className='overflow-hidden'>
                                    <div className="text-sm font-black text-white truncate">{order.customerName}</div>
                                    <div className="text-xs text-admin-text-muted font-bold tracking-wider">MÜŞTERİ</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-black text-admin-text-muted uppercase mb-1">Telefon</div>
                                    <div className="text-xs font-bold text-white font-mono truncate" title={order.customerPhone}>{order.customerPhone}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-black text-admin-text-muted uppercase mb-1">Tarih</div>
                                    <div className="text-xs font-bold text-white">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Summary */}
                    <div className="bg-admin-card rounded-3xl p-8 shadow-2xl border border-admin-border">
                        <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            Ürün Özellikleri
                        </h3>
                        {config && (
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 border-b border-white/5">
                                    <span className="text-sm text-admin-text-muted font-bold">Boyutlar</span>
                                    <span className="text-sm font-black text-white font-mono">{config.width}x{config.height} cm</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-white/5">
                                    <span className="text-sm text-admin-text-muted font-bold">Derinlik</span>
                                    <span className="text-sm font-bold text-white">{config.depth} cm ({config.profile === 'DOUBLE' ? 'Çift' : 'Tek'} Yön)</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-white/5">
                                    <span className="text-sm text-admin-text-muted font-bold">Profil Rengi</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: config.frameColor }} />
                                    </div>
                                </div>
                                <div className="flex justify-between p-3 border-b border-white/5">
                                    <span className="text-sm text-admin-text-muted font-bold">Aydınlatma</span>
                                    <span className="text-sm font-bold text-white">{config.isLightOn ? 'Var' : 'Yok'} ({config.ledType === 'INNER' ? 'İç' : 'Dış'})</span>
                                </div>
                                <div className="flex justify-between p-3">
                                    <span className="text-sm text-admin-text-muted font-bold">Arkalık</span>
                                    <span className="text-sm font-bold text-white">{config.backplate}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle & Right: BOM & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Images */}
                    {config && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-admin-card rounded-3xl p-6 shadow-2xl border border-admin-border">
                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">ÖN YÜZ GÖRSELİ</div>
                                {(config as any).userImageUrl ? (
                                    <img src={(config as any).userImageUrl} className="w-full h-64 object-contain bg-black/20 rounded-2xl border border-white/5" />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 text-admin-text-muted font-bold">Görsel yok</div>
                                )}
                            </div>

                            <div className="bg-admin-card rounded-3xl p-6 shadow-2xl border border-admin-border">
                                <div className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-4">ARKA YÜZ GÖRSELİ</div>
                                {(config as any).backImageUrl ? (
                                    <img src={(config as any).backImageUrl} className="w-full h-64 object-contain bg-black/20 rounded-2xl border border-white/5" />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 text-admin-text-muted font-bold">Görsel yok</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cost Breakdown Table */}
                    <div className="bg-[#0f0f10] text-white rounded-3xl p-8 shadow-2xl border border-admin-border">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Receipt className="w-5 h-6 text-brand-orange" /> Maliyet Analizi
                            </h3>
                            <div className="text-right">
                                <div className="text-[10px] text-admin-text-muted font-black uppercase tracking-widest">TOPLAM TUTAR</div>
                                <div className="text-4xl font-black text-brand-cyan tracking-tighter">${order.price.toFixed(2)}</div>
                            </div>
                        </div>

                        {breakdown ? (
                            <div className="space-y-6">
                                {/* Raw Materials Section */}
                                <div>
                                    <div className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Ham Maliyetler (BOM)</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* Profile */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">Profil ({(breakdown.perimeter ?? 0).toFixed(2)}m)</span>
                                                <span className="font-mono font-bold text-white">${(breakdown.profileCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Birim: ${(breakdown.profileCost && breakdown.perimeter ? (breakdown.profileCost / breakdown.perimeter).toFixed(2) : '0.00')} / metre</div>
                                        </div>

                                        {/* Backing */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">Zemin ({(breakdown.areaM2 ?? 0).toFixed(2)}m²)</span>
                                                <span className="font-mono font-bold text-white">${(breakdown.backingCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Malzeme: {config?.backplate || '-'}</div>
                                        </div>

                                        {/* LED */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">LED Aydınlatma</span>
                                                <span className="font-mono font-bold text-white">${(breakdown.ledCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                Tip: {config?.ledType || '-'} <br />
                                                Kullanılan: {breakdown.selectedLayout?.totalLedMeters?.toFixed(2) ?? '0.00'} metre
                                            </div>
                                        </div>

                                        {/* Adapter */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">Adaptör</span>
                                                <span className="font-mono font-bold text-white">${(breakdown.adapterCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {breakdown.adapterName || '-'} <br />
                                                Gerekli: {(breakdown.requiredAmperes ?? 0).toFixed(1)}A / Seçilen: {(breakdown.selectedAmperes ?? 0).toFixed(1)}A
                                            </div>
                                        </div>

                                        {/* Print */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">UV Baskı</span>
                                                <span className="font-mono font-bold text-white">${(breakdown.printCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Alan: {(breakdown.areaM2 ?? 0).toFixed(2)}m²</div>
                                        </div>

                                        {/* Other */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-admin-text-muted text-xs font-bold uppercase">Diğer (Kablo, Köşe)</span>
                                                <span className="font-mono font-bold text-white">${((breakdown.cableCost ?? 0) + (breakdown.cornerPieceCost ?? 0)).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between px-6 py-4 bg-brand-cyan/5 rounded-xl border border-brand-cyan/20">
                                        <span className="text-brand-cyan text-xs font-black uppercase tracking-widest">Ham Toplam (BOM)</span>
                                        <span className="text-brand-cyan font-mono font-bold text-lg">${(breakdown.rawMaterialTotal ?? 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Labor & Profit */}
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                                    <div className="p-4 rounded-2xl border border-brand-orange/20 bg-brand-orange/5">
                                        <div className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">İşçilik</div>
                                        <div className="text-2xl font-mono font-bold text-white">${(breakdown.laborCost ?? 0).toFixed(2)}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5">
                                        <div className="text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-1">Kâr Marjı</div>
                                        <div className="text-2xl font-mono font-bold text-white">${(breakdown.profitMargin ?? 0).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-10">Maliyet detayı bulunamadı.</div>
                        )}
                    </div>

                    {/* Additional Notes (if any in config) */}
                    {(config as any)?.note && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl">
                            <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Müşteri Notu
                            </h4>
                            <p className="text-sm text-yellow-100 font-medium">{(config as any).note}</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default OrderDetailsPage;
