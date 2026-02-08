import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Layers, Settings, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="absolute top-6 right-6 z-20">
                <button onClick={() => navigate('/admin')} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition backdrop-blur-md">
                    <Settings className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-2 rounded-full mb-4 backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sistem Hazır v10.0</span>
                    </div>
                    <img src="/logo_new.png" alt="Lightbox Master" className="h-24 md:h-32 mx-auto mb-6 object-contain rounded-2xl" />
                    <p className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest max-w-lg mx-auto">
                        Gelişmiş Fiyatlandırma ve Tasarım Motoru
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl w-full">
                    {/* Card 1: Lightbox Calculator */}
                    <button
                        onClick={() => navigate('/lightbox')}
                        className="group relative bg-[var(--app-surface)] border border-[var(--app-border)] hover:border-indigo-500/50 p-10 rounded-[2.5rem] text-left transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(79,70,229,0.3)] hover:-translate-y-2 flex flex-col"
                    >
                        <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            <Box className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
                        </div>

                        <h2 className="text-3xl font-black text-[var(--app-text)] uppercase italic tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors">Lightbox Hesapla</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8 group-hover:text-gray-400">
                            Profil, LED, adaptör ve montaj dahil komple sistem hesabı.
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            <span>Hesaplamaya Başla</span> <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Card 2: Fabric Calculator */}
                    <button
                        onClick={() => navigate('/fabric')}
                        className="group relative bg-[var(--app-surface)] border border-[var(--app-border)] hover:border-emerald-500/50 p-10 rounded-[2.5rem] text-left transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-2 flex flex-col"
                    >
                        <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                            <Layers className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
                        </div>

                        <h2 className="text-3xl font-black text-[var(--app-text)] uppercase italic tracking-tighter mb-2 group-hover:text-emerald-400 transition-colors">Sadece Kumaş</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8 group-hover:text-gray-400">
                            Sadece ön yüz, görsel baskı ve kumaş maliyeti hesabı.
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            <span>Hesaplamaya Başla</span> <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
