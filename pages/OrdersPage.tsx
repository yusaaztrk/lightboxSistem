import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-[#050507] text-gray-200 font-sans p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">SİPARİŞLERİM</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">SİPARİŞ GEÇMİŞİ VE DETAYLARI</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-24 h-24 text-indigo-500" />
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-2">TOPLAM SİPARİŞ</span>
                        <span className="text-4xl font-black text-white tracking-tighter">{orders.length}</span>
                    </div>
                    <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle className="w-24 h-24 text-emerald-500" />
                        </div>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-2">TAMAMLANAN</span>
                        <span className="text-4xl font-black text-white tracking-tighter">{orders.filter(o => o.status === 'Completed').length}</span>
                    </div>
                    <div className="bg-orange-600/10 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock className="w-24 h-24 text-orange-500" />
                        </div>
                        <span className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-2">BEKLEYEN</span>
                        <span className="text-4xl font-black text-white tracking-tighter">{orders.filter(o => o.status === 'Pending').length}</span>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Package className="w-5 h-5 text-indigo-500" /> SON SİPARİŞLER
                        </h2>
                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Sipariş Ara..."
                                className="w-full md:w-80 bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <th className="px-8 py-5">SİPARİŞ ID</th>
                                    <th className="px-8 py-5">MÜŞTERİ</th>
                                    <th className="px-8 py-5">BOYUTLAR</th>
                                    <th className="px-8 py-5">TUTAR</th>
                                    <th className="px-8 py-5">TARİH</th>
                                    <th className="px-8 py-5 text-center">DURUM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 font-mono text-xs text-gray-400">#{order.id.toString().padStart(6, '0')}</td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-white text-sm">{order.customerName || 'Misafir'}</div>
                                            <div className="text-[10px] text-gray-600 font-bold">{order.customerEmail || '-'}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-gray-300">
                                                {order.dimensions}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-indigo-400 tracking-tight">${order.price.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-xs text-gray-500 font-bold">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {order.status === 'Completed' ? 'TAMAMLANDI' : order.status === 'Cancelled' ? 'İPTAL EDİLDİ' : 'BEKLİYOR'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-16 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                                            HENÜZ SİPARİŞ BULUNMUYOR
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
