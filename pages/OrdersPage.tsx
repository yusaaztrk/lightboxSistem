import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Search, ShoppingCart, DollarSign, Calendar, ChevronRight } from 'lucide-react';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await api.getOrders();
            setOrders(data);
        } catch (err) {
            console.error("Orders could not be loaded", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Pending') return order.status === 'Pending' || !order.status;
        if (activeTab === 'Completed') return order.status === 'Completed';
        if (activeTab === 'Shipped') return order.status === 'Shipped';
        if (activeTab === 'Cancelled') return order.status === 'Cancelled';
        return true;
    });

    const stats = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'Completed' || o.status === 'Shipped').length,
        pending: orders.filter(o => o.status === 'Pending' || !o.status).length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Completed': return 'Tamamlandı';
            case 'Approved': return 'Onaylandı';
            case 'Pending': return 'Beklemede';
            case 'Cancelled': return 'İptal Edildi';
            default: return status;
        }
    }

    return (

        <div className="space-y-8">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-admin-card border border-admin-border p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                        <Package className="w-24 h-24 text-brand-cyan" />
                    </div>
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest block mb-2">TOPLAM SİPARİŞ</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{stats.total}</span>
                </div>

                <div className="bg-admin-card border border-admin-border p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                        <Clock className="w-24 h-24 text-brand-orange" />
                    </div>
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest block mb-2">BEKLEYEN</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{stats.pending}</span>
                    <div className="mt-2 text-[10px] font-bold text-admin-text-muted">İşlem bekleniyor</div>
                </div>

                <div className="bg-admin-card border border-admin-border p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                        <CheckCircle className="w-24 h-24 text-brand-cyan" />
                    </div>
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest block mb-2">TAMAMLANAN</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{stats.completed}</span>
                    <div className="mt-2 text-[10px] font-bold text-admin-text-muted">Bu hafta</div>
                </div>

                <div className="bg-brand-cyan text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-brand-cyan/20">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <DollarSign className="w-24 h-24 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest block mb-2">TOPLAM KAZANÇ</span>
                    <span className="text-4xl font-black text-white tracking-tighter">${orders.reduce((acc, curr) => acc + (curr.price || 0), 0).toFixed(0)}</span>
                </div>
            </div>

            {/* Main Orders Table */}
            <div className="bg-admin-card rounded-3xl border border-admin-border overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-admin-border flex justify-between items-center bg-white/5">
                    <h3 className="font-black text-xl text-white uppercase tracking-tight italic">Son Siparişler</h3>
                    <div className="flex gap-2">
                        {['All', 'Pending', 'Completed', 'Cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition ${activeTab === tab ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20' : 'bg-white/5 text-admin-text-muted hover:bg-white/10 hover:text-white'}`}
                            >
                                {tab === 'All' ? 'Tümü' : tab === 'Pending' ? 'Bekleyen' : tab === 'Completed' ? 'Tamamlanan' : 'İptal'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Müşteri</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Boyutlar</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Fiyat</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Tarih</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Durum</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-admin-text-muted uppercase tracking-widest">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filteredOrders.map((order) => {
                                let dims = "-";
                                try {
                                    const c = JSON.parse(order.configurationDetails || '{}');
                                    if (c.width && c.height) dims = `${c.width}x${c.height} cm`;
                                } catch (e) { /* ignore parse error */ }

                                return (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-xs font-bold text-admin-text-muted">#{order.id.toString().padStart(6, '0')}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-brand-cyan/20">
                                                    {order.customerName ? order.customerName.substring(0, 1).toUpperCase() : 'M'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{order.customerName || 'Misafir'}</div>
                                                    <div className="text-[10px] text-admin-text-muted font-mono">{order.customerEmail || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-white font-mono">{order.dimensions || dims}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-black text-brand-orange text-lg">
                                                ${order.price?.toFixed(0)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-admin-text-muted text-xs font-mono">
                                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {order.status === 'Completed' || order.status === 'Shipped' ? (
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-brand-cyan/10 text-brand-cyan uppercase tracking-wider border border-brand-cyan/20">
                                                    {getStatusText(order.status)}
                                                </span>
                                            ) : order.status === 'Cancelled' ? (
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-red-500/10 text-red-500 uppercase tracking-wider border border-red-500/20">
                                                    {getStatusText(order.status)}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-brand-orange/10 text-brand-orange uppercase tracking-wider border border-brand-orange/20">
                                                    {getStatusText(order.status || 'Pending')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 bg-white/5 rounded-lg text-admin-text-muted group-hover:text-white group-hover:bg-brand-cyan transition">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center text-admin-text-muted text-sm font-black uppercase tracking-widest opacity-50">
                                        SİPARİŞ BULUNMUYOR
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
};

export default OrdersPage;
