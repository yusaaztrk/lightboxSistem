import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Settings, LogOut, Bell, Search, Globe, ChevronDown, User,
    Layers, Palette, Disc, Users, Database, Zap
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const isAuth = localStorage.getItem('isAdminAuthenticated');
        if (!isAuth) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/login');
    };

    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
            ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20'
            : 'text-admin-text-muted hover:bg-white/5 hover:text-white'
        }`;

    return (
        <div className="flex h-screen bg-admin-dark text-admin-text-main font-sans selection:bg-brand-cyan selection:text-white">
            {/* SIDEBAR */}
            <aside className="w-72 bg-[#0F1623] border-r border-admin-border flex flex-col shadow-2xl z-20">
                <div className="p-8 pb-4 flex justify-center">
                    <img src="/logo_new.png" alt="Lightbox Logo" className="h-12 w-auto object-contain" />
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-black text-admin-text-muted/50 uppercase tracking-widest px-4 mb-3 mt-2">Genel Bakış</div>

                    <NavLink to="/admin/orders" className={navItemClass}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Siparişler</span>
                    </NavLink>

                    <div className="text-[10px] font-black text-admin-text-muted/50 uppercase tracking-widest px-4 mb-3 mt-8">Veri Yönetimi</div>

                    <NavLink to="/admin/general" className={navItemClass}>
                        <Settings className="w-5 h-5" />
                        <span>Genel Ayarlar</span>
                    </NavLink>
                    <NavLink to="/admin/profiles" className={navItemClass}>
                        <Layers className="w-5 h-5" />
                        <span>Profiller</span>
                    </NavLink>
                    <NavLink to="/admin/backing" className={navItemClass}>
                        <Database className="w-5 h-5" />
                        <span>Zemin</span>
                    </NavLink>
                    <NavLink to="/admin/adapters" className={navItemClass}>
                        <Zap className="w-5 h-5" />
                        <span>Adaptörler</span>
                    </NavLink>
                    <NavLink to="/admin/colors" className={navItemClass}>
                        <Palette className="w-5 h-5" />
                        <span>Renkler</span>
                    </NavLink>
                    <NavLink to="/admin/wheel" className={navItemClass}>
                        <Disc className="w-5 h-5" />
                        <span>Çark & Çekiliş</span>
                    </NavLink>
                    <NavLink to="/admin/members" className={navItemClass}>
                        <Users className="w-5 h-5" />
                        <span>Üyeler</span>
                    </NavLink>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-admin-card rounded-2xl p-5 text-white border border-admin-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
                            <Globe className="w-16 h-16 text-brand-cyan" />
                        </div>
                        <h4 className="font-bold text-sm mb-1 relative z-10">Web Sitesi</h4>
                        <p className="text-[10px] text-admin-text-muted mb-3 relative z-10">Müşteri tarafını görüntüle</p>
                        <button onClick={() => window.open('/', '_blank')} className="w-full bg-white/5 border border-white/10 text-white py-2 rounded-lg text-xs font-bold hover:bg-brand-cyan hover:border-transparent transition relative z-10">
                            Siteye Git
                        </button>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 mt-4 text-admin-text-muted hover:text-red-500 rounded-xl text-sm font-bold transition">
                        <LogOut className="w-4 h-4" /> <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-admin-dark relative">
                {/* Gradient Background Effect */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none" />

                {/* HEADER */}
                <header className="h-24 flex items-center justify-between px-10 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                            {location.pathname.includes('orders') ? 'Sipariş Yönetimi' : 'Yönetim Paneli'}
                        </h2>
                        <p className="text-admin-text-muted text-xs font-bold tracking-widest mt-1">
                            HOŞGELDİNİZ, YÖNETİCİ
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="bg-admin-card border border-admin-border rounded-xl py-3 pl-12 pr-4 text-sm w-72 text-white focus:border-brand-cyan transition-all outline-none"
                            />
                        </div>

                        <div className="h-8 w-px bg-admin-border"></div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-white">Admin</div>
                                    <div className="text-[10px] text-brand-cyan font-bold tracking-widest uppercase">System Admin</div>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
                                    <User className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
