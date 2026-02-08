import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SiteTicker: React.FC = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getSystemSettings().then(s => {
            const val = (s as any).scrollingMessage || (s as any).ScrollingMessage;
            if (val) setMessage(val);
            else setMessage('Hoş geldiniz! En uygun fiyatlı Lightbox çözümleri burada.');
        }).catch(() => {
            setMessage('Hoş geldiniz! En uygun fiyatlı Lightbox çözümleri burada.');
        });
    }, []);

    if (!message) return null;

    return (
        <div className="w-full bg-indigo-600/10 border-b border-indigo-500/10 backdrop-blur-md overflow-hidden py-2 relative z-[25]">
            <div className="flex whitespace-nowrap animate-ticker">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4">
                    {message}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4">
                    {message}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4">
                    {message}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4">
                    {message}
                </span>
            </div>

            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 30s linear infinite;
                    display: inline-flex;
                }
            `}</style>
        </div>
    );
};

export default SiteTicker;
