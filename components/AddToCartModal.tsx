import React from 'react';
import { X, ShoppingBag, Package, DollarSign, Ruler, Layers, Lightbulb } from 'lucide-react';
import { ProfileType } from '../types';

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productInfo: {
        title: string;
        price: number;
        width?: number;
        height?: number;
        type: 'lightbox' | 'fabric';
        imageUrl?: string;
        // Lightbox specific details
        profileType?: ProfileType;
        profileDepth?: number;
        backingType?: string;
        ledUsage?: 'indoor' | 'outdoor';
    };
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isOpen, onClose, onConfirm, productInfo }) => {
    if (!isOpen) return null;

    const getProfileLabel = (type?: ProfileType) => {
        if (!type) return '';
        return type === ProfileType.SINGLE ? 'TEK TARAFLI' : 'ÇİFT TARAFLI';
    };

    const getLedLabel = (usage?: 'indoor' | 'outdoor') => {
        if (!usage) return '';
        return usage === 'indoor' ? 'İÇ MEKAN' : 'DIŞ MEKAN';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative bg-white/50 backdrop-blur-sm border-b border-purple-200/50 p-6 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-black/5 hover:bg-black/10 transition text-gray-600 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                SEPETE EKLE
                            </h2>
                            <p className="text-xs text-gray-600 font-bold mt-0.5">
                                Ürün bilgilerini kontrol edin
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Product Image */}
                    {productInfo.imageUrl && (
                        <div className="w-full h-40 rounded-2xl overflow-hidden bg-white border border-purple-200/50">
                            <img
                                src={productInfo.imageUrl}
                                alt={productInfo.title}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* Product Details */}
                    <div className="space-y-3">
                        {/* ÜRÜN */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                            <Package className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                    ÜRÜN
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                    {productInfo.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {productInfo.type === 'lightbox' ? 'Lightbox Tabela' : 'Kumaş Baskı'}
                                </p>
                            </div>
                        </div>

                        {/* BOYUTLAR */}
                        {productInfo.width && productInfo.height && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                                <Ruler className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        BOYUTLAR
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {productInfo.width} × {productInfo.height} cm
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TABLO TİPİ (only for lightbox) */}
                        {productInfo.type === 'lightbox' && productInfo.profileType && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                                <Layers className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        TABLO TİPİ
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {getProfileLabel(productInfo.profileType)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* PROFİL SEÇİMİ (only for lightbox) */}
                        {productInfo.type === 'lightbox' && productInfo.profileDepth && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                                <Package className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        PROFİL SEÇİMİ
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {productInfo.profileDepth} CM
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ZEMİN MALZEMESİ (only for lightbox) */}
                        {productInfo.type === 'lightbox' && productInfo.backingType && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                                <Layers className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        ZEMİN MALZEMESİ
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {productInfo.backingType}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* LED KULLANIMI (only for lightbox) */}
                        {productInfo.type === 'lightbox' && productInfo.ledUsage && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-purple-200/50">
                                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                        LED KULLANIMI
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {getLedLabel(productInfo.ledUsage)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* FİYAT */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">
                                    FİYAT
                                </p>
                                <p className="text-2xl font-black text-emerald-600">
                                    ${productInfo.price.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex gap-3 flex-shrink-0 border-t border-purple-200/50 bg-white/30">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white/70 border border-purple-200/50 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-white transition uppercase tracking-widest text-xs"
                    >
                        İPTAL
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            setTimeout(() => {
                                onClose();
                            }, 100);
                        }}
                        className="flex-1 bg-indigo-600 text-white font-black py-3.5 rounded-2xl hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={16} /> SEPETE EKLE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToCartModal;
