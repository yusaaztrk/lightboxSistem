import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ConfigOptions, MockupScene } from '../types';

interface MockupViewerProps {
    config: ConfigOptions;
    scene: MockupScene;
    onClose: () => void;
}

const MockupViewer: React.FC<MockupViewerProps> = ({ config, scene, onClose }) => {
    const { width, height, userImageUrl } = config;

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
                {/* We use an img tag instead of bg-image to ensure it fits nicely without cropping if possible, or use object-contain */}
                <img
                    src={scene.url}
                    alt={scene.title}
                    className="w-full h-full object-contain bg-[#1a1a1a]"
                />

                {/* The Lightbox Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* 
                We center the lightbox on the image. 
                We limit its size so it doesn't cover the whole room. 
                We use aspect-ratio to keep the user's dimensions correct.
             */}
                    <div
                        className="relative shadow-[0_0_60px_-5px_rgba(255,255,255,0.5)] transition-all duration-500"
                        style={{
                            width: width >= height ? '50%' : 'auto', // Occupy 50% width max
                            height: height > width ? '50%' : 'auto',  // Occupy 50% height max
                            maxWidth: '600px',
                            maxHeight: '600px',
                            aspectRatio: `${width}/${height}`,
                            backgroundColor: '#fff',
                            border: '4px solid #d1d5db', // Silver-ish frame
                        }}
                    >
                        {userImageUrl ? (
                            <img
                                src={userImageUrl}
                                alt="Lightbox Design"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-gray-300">
                                <span className="font-black text-2xl lg:text-4xl opacity-20">LOGO</span>
                            </div>
                        )}

                        {/* Subtle Glare/Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                    </div>

                    {/* Dimension Label Tag */}
                    <div className="absolute mt-[620px] bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-mono backdrop-blur">
                        {width}cm x {height}cm
                    </div>
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
