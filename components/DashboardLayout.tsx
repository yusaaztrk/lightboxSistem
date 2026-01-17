import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Bell, Search, Globe, ChevronDown, User } from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // In a real app, clear auth tokens here
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F3F4F6] text-[#1F2937] font-sans selection:bg-indigo-500 selection:text-white">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.03)] z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">Soft<span className="text-indigo-600">Material</span></h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-4">Dashboard</div>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">Components</div>

                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                            <Globe className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">Live Website</h4>
                        <p className="text-[10px] opacity-80 mb-3">View your public storefront</p>
                        <button onClick={() => window.open('/', '_blank')} className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition">
                            Visit Site
                        </button>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 mt-4 text-gray-500 hover:text-red-500 text-sm font-medium transition">
                        <LogOut className="w-4 h-4" /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* HEADER */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center flex-1 gap-8">
                        <h2 className="text-xl font-bold text-gray-800">
                            {window.location.pathname.includes('settings') ? 'Settings' : 'Dashboard'}
                            <span className="text-gray-400 text-sm font-medium ml-2 font-mono">Control panel</span>
                        </h2>

                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition text-gray-500">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-5 border-l border-gray-100">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-900">Admin User</div>
                                <div className="text-xs text-gray-400">Super Admin</div>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200">
                                <User className="w-5 h-5" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
