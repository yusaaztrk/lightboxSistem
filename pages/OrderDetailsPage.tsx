import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Order, CalculationBreakdown, ConfigOptions } from '../types';
import { ArrowLeft, User, Phone, Calendar, Ruler, CheckCircle, Package, Receipt, Info } from 'lucide-react';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/orders')} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition text-gray-400 hover:text-indigo-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sipariş #{order.id}</h1>
                        <p className="text-sm text-gray-500 font-medium">Detaylı maliyet ve yapılandırma bilgisi</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                        }`}>
                        {order.status === 'Pending' ? 'Bekliyor' :
                            order.status === 'Completed' ? 'Onaylandı' :
                                order.status === 'Shipped' ? 'Kargolandı' : 'İptal'}
                    </span>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        {order.status !== 'Completed' && order.status !== 'Shipped' && (
                            <button
                                onClick={() => handleStatusUpdate('Completed')}
                                className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition"
                            >
                                ONAYLA
                            </button>
                        )}
                        {order.status === 'Completed' && (
                            <button
                                onClick={() => handleStatusUpdate('Shipped')}
                                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition"
                            >
                                KARGOLA
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition"
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
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User className="w-4 h-4" /> Müşteri Bilgileri
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {order.customerName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{order.customerName}</div>
                                    <div className="text-xs text-gray-500 font-medium">Müşteri</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Telefon</div>
                                    <div className="text-sm font-bold text-gray-900 font-mono">{order.customerPhone}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Tarih</div>
                                    <div className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Summary */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Ürün Özellikleri
                        </h3>
                        {config && (
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Boyutlar</span>
                                    <span className="text-sm font-bold text-gray-900">{config.width}x{config.height} cm</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Derinlik</span>
                                    <span className="text-sm font-bold text-gray-900">{config.depth} cm ({config.profile === 'DOUBLE' ? 'Çift' : 'Tek'} Yön)</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Profil Rengi</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: config.frameColor }} />
                                    </div>
                                </div>
                                <div className="flex justify-between p-3 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Aydınlatma</span>
                                    <span className="text-sm font-bold text-gray-900">{config.isLightOn ? 'Var' : 'Yok'} ({config.ledType === 'INNER' ? 'İç Mekan' : 'Dış Mekan'})</span>
                                </div>
                                <div className="flex justify-between p-3">
                                    <span className="text-sm text-gray-500 font-medium">Arkalık</span>
                                    <span className="text-sm font-bold text-gray-900">{config.backplate}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle & Right: BOM & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Cost Breakdown Table */}
                    <div className="bg-[#121214] text-white rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Receipt className="w-5 h-6 text-indigo-500" /> Maliyet Analizi
                            </h3>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">TOPLAM TUTAR</div>
                                <div className="text-3xl font-black text-indigo-400 tracking-tighter">${order.price.toFixed(2)}</div>
                            </div>
                        </div>

                        {breakdown ? (
                            <div className="space-y-6">
                                {/* Raw Materials Section */}
                                <div>
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Ham Maliyetler (BOM)</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* Profile */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">Profil ({(breakdown.perimeter ?? 0).toFixed(2)}m)</span>
                                                <span className="font-mono font-bold">${(breakdown.profileCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Birim: ${(breakdown.profileCost && breakdown.perimeter ? (breakdown.profileCost / breakdown.perimeter).toFixed(2) : '0.00')} / metre</div>
                                        </div>

                                        {/* Backing */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">Zemin ({(breakdown.areaM2 ?? 0).toFixed(2)}m²)</span>
                                                <span className="font-mono font-bold">${(breakdown.backingCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Malzeme: {config?.backplate || '-'}</div>
                                        </div>

                                        {/* LED */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">LED Aydınlatma</span>
                                                <span className="font-mono font-bold">${(breakdown.ledCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                Tip: {config?.ledType || '-'} <br />
                                                Kullanılan: {breakdown.selectedLayout?.totalLedMeters?.toFixed(2) ?? '0.00'} metre
                                            </div>
                                        </div>

                                        {/* Adapter */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">Adaptör</span>
                                                <span className="font-mono font-bold">${(breakdown.adapterCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {breakdown.adapterName || '-'} <br />
                                                Gerekli: {(breakdown.requiredAmperes ?? 0).toFixed(1)}A / Seçilen: {(breakdown.selectedAmperes ?? 0).toFixed(1)}A
                                            </div>
                                        </div>

                                        {/* Print */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">UV Baskı</span>
                                                <span className="font-mono font-bold">${(breakdown.printCost ?? 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Alan: {(breakdown.areaM2 ?? 0).toFixed(2)}m²</div>
                                        </div>

                                        {/* Other */}
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-400 text-xs font-bold uppercase">Diğer (Kablo, Köşe)</span>
                                                <span className="font-mono font-bold">${((breakdown.cableCost ?? 0) + (breakdown.cornerPieceCost ?? 0)).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between px-4 py-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
                                        <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">Ham Toplam</span>
                                        <span className="text-indigo-300 font-mono font-bold text-lg">${(breakdown.rawMaterialTotal ?? 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Labor & Profit */}
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                                    <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10">
                                        <div className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1">İşçilik</div>
                                        <div className="text-2xl font-mono font-bold text-orange-200">${(breakdown.laborCost ?? 0).toFixed(2)}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                                        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Kâr Marjı</div>
                                        <div className="text-2xl font-mono font-bold text-emerald-200">${(breakdown.profitMargin ?? 0).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-10">Maliyet detayı bulunamadı.</div>
                        )}
                    </div>

                    {/* Additional Notes (if any in config) */}
                    {(config as any)?.note && (
                        <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl">
                            <h4 className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Müşteri Notu
                            </h4>
                            <p className="text-sm text-yellow-800 font-medium">{(config as any).note}</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default OrderDetailsPage;
