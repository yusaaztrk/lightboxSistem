import React from 'react';
import { Box, Settings, User, Gift, LayoutGrid, Scissors, Sun, Moon, ShoppingCart, X, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getThemeMode, subscribeThemeMode, toggleThemeMode } from '../services/theme';
import { getCartItems, getCartCount, subscribeCart, removeCartItem, clearCart, CartItem } from '../services/cart';
import { api } from '../services/api';

interface PublicHeaderProps {
    price?: number;
    onOpenWheel: () => void;
    onOpenMember: () => void;
    activePage: 'lightbox' | 'fabric';
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ price, onOpenWheel, onOpenMember, activePage }) => {
    const navigate = useNavigate();
    const [themeMode, setThemeMode] = React.useState<'dark' | 'light'>(() => getThemeMode());
    const [cartCount, setCartCount] = React.useState<number>(() => getCartCount());
    const [cartOpen, setCartOpen] = React.useState(false);
    const [cartItems, setCartItems] = React.useState<CartItem[]>(() => getCartItems());
    const [wheelEnabled, setWheelEnabled] = React.useState(true);

    React.useEffect(() => {
        const unsubTheme = subscribeThemeMode(() => setThemeMode(getThemeMode()));
        const unsubCart = subscribeCart(() => {
            setCartCount(getCartCount());
            setCartItems(getCartItems());
        });

        // Check wheel status
        api.getWheelStatus().then(s => setWheelEnabled(s.isEnabled)).catch(() => { });

        return () => {
            unsubTheme();
            unsubCart();
        };
    }, []);

    const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0), 0);

    const CartPopup = () => (
        <div className="fixed inset-0 z-[70] flex items-start justify-end p-4 pt-24 md:pt-28" onClick={() => setCartOpen(false)}>
            <div
                className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-black text-[var(--app-text)] uppercase tracking-tighter">Sepet</h3>
                        <span className="text-xs text-[var(--app-muted)] font-bold">({cartItems.length})</span>
                    </div>
                    <button onClick={() => setCartOpen(false)} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                    {cartItems.length === 0 ? (
                        <p className="text-[var(--app-muted)] text-sm text-center py-8 font-bold">Sepet boş</p>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl p-3">
                                {item.previewImageUrl ? (
                                    <img src={item.previewImageUrl} className="w-12 h-12 rounded-lg object-cover border border-[var(--app-border)] flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-[var(--app-border)] flex-shrink-0 flex items-center justify-center">
                                        <Box className="w-5 h-5 text-indigo-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-[var(--app-text)] truncate">{item.title}</div>
                                    <div className="text-xs text-emerald-500 font-black">${(item.price || 0).toFixed(2)}</div>
                                </div>
                                <button onClick={() => removeCartItem(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--app-muted)] hover:text-red-400 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-[var(--app-border)] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">Toplam</span>
                            <span className="text-xl font-black text-emerald-400">${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => { setCartOpen(false); navigate('/cart'); }}
                            className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-500 transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            <ShoppingBag size={16} /> SİPARİŞ OLUŞTUR
                        </button>
                        <button
                            onClick={() => { if (confirm('Sepet temizlensin mi?')) clearCart(); }}
                            className="w-full bg-[var(--app-border)] text-[var(--app-muted)] font-bold py-2 rounded-xl hover:opacity-80 transition text-xs uppercase tracking-widest"
                        >
                            Sepeti Temizle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="z-30 w-full">
            {cartOpen && <CartPopup />}

            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-8 z-10 bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-8">
                    {/* Logo Area */}
                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                            <Box className="w-6 h-6 text-white" />
                        </div>
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

                        {/* Wheel button - only show if enabled */}
                        {wheelEnabled && (
                            <button
                                onClick={onOpenWheel}
                                className="p-3.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-2xl hover:scale-105 transition group"
                                title="Çarkı Çevir"
                            >
                                <Gift className="w-5 h-5 text-pink-400 group-hover:rotate-12 transition-transform" />
                            </button>
                        )}

                        <button
                            onClick={onOpenMember}
                            className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl hover:scale-105 transition group"
                            title="Üye Ol / Giriş Yap"
                        >
                            <User className="w-5 h-5 text-indigo-400" />
                        </button>

                        <button
                            onClick={() => navigate('/admin')}
                            className="p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group"
                            title="Yönetim Paneli"
                        >
                            <Settings className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-3xl border border-white/5 backdrop-blur-3xl shadow-xl">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Box className="w-5 h-5 text-white" />
                        </div>
                        <img src="/logo_new.png" alt="Lightbox Master" className="h-10 w-auto object-contain" />
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
                    >
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
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

                    {wheelEnabled && (
                        <button
                            onClick={onOpenWheel}
                            className="flex-shrink-0 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl"
                        >
                            <Gift className="w-4 h-4 text-pink-400" />
                        </button>
                    )}

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
