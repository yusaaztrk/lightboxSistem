import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ConfigOptions, MockupScene } from '../types';

interface MockupViewerProps {
    config: ConfigOptions;
    scene: MockupScene;
    onClose: () => void;
}

const MockupViewer: React.FC<MockupViewerProps> = ({ config, scene, onClose }) => {
    const { width, height, userImageUrl, backImageUrl, profile } = config;

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md transition-opacity duration-300">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all group"
            >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Main Container */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center select-none overflow-hidden rounded-xl border border-white/5 shadow-2xl">

                {/* Background Image (The Scene) */}
                <img
                    src={scene.url}
                    alt={scene.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Top Half Container for Lightbox Placement */}
                {/* User Request: Divide screen in 2, use only top half, center proportionally. Maximize size (remove padding). */}
                <div className="absolute top-0 left-0 w-full h-1/2 flex items-center justify-center z-10">
                    <div
                        className="relative shadow-[0_0_60px_-5px_rgba(255,255,255,0.5)] transition-all duration-500"
                        style={{
                            // Logic: Fit within the top half container, maintaining aspect ratio
                            maxWidth: '100%',
                            maxHeight: '100%',
                            aspectRatio: `${width}/${height}`,
                            width: 'auto',
                            height: 'auto',
                            // Fallback size calculation if needed, but flex+max constraints usually handle this
                            backgroundColor: config.isLightOn ? '#fff' : '#e5e7eb',
                            border: `4px solid ${config.frameColor}`,
                            boxShadow: config.isLightOn ? '0 0 50px rgba(255,255,255,0)' : '0 20px 25px -5px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Dimensions Overlay on Hover or Always */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {width}cm x {height}cm
                        </div>

                        {userImageUrl ? (
                            <>
                                {profile === 'DOUBLE' && backImageUrl && (
                                    <img
                                        src={backImageUrl}
                                        alt="Lightbox Back Design"
                                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                                        style={{ filter: config.isLightOn ? 'brightness(0.85)' : 'brightness(0.45) grayscale(1)' }}
                                    />
                                )}
                                <img
                                    src={userImageUrl}
                                    alt="Lightbox Design"
                                    className={`relative w-full h-full object-cover transition-all duration-700 ${config.isLightOn ? 'brightness-100' : 'brightness-50 grayscale'}`}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-gray-300">
                                <span className="font-black text-2xl lg:text-4xl opacity-20">LOGO</span>
                            </div>
                        )}

                        {/* Glare removed to prevent white washout */}
                    </div>
                </div>

                {/* Info Text explaining the view */}
                <div className="absolute top-1/2 left-0 w-full border-t border-white/20 border-dashed opacity-30 pointer-events-none"></div>
                <div className="absolute top-[51%] right-4 text-[10px] text-white/40 font-mono uppercase tracking-widest pointer-events-none text-right">
                    Mekan Orta Hattı<br />(Zemin Yukarısı)
                </div>


                {/* Scene Title Badge (Bottom Left) */}
                <div className="absolute bottom-6 left-6 pointer-events-none">
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]" />
                        <span className="text-xs font-black tracking-[0.2em] text-white uppercase">{scene.title}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MockupViewer;
