import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { api } from '../services/api';

const WhatsAppButton: React.FC = () => {
    const [number, setNumber] = useState('');

    useEffect(() => {
        api.getSystemSettings().then(s => {
            const val = (s as any).whatsAppNumber || (s as any).WhatsAppNumber;
            if (val) setNumber(val);
            else setNumber('905000000000'); // Failsafe default
        }).catch(() => {
            setNumber('905000000000'); // Failsafe default
        });
    }, []);

    if (!number) return null;

    return (
        <a
            href={`https://wa.me/${number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 left-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-3 overflow-hidden max-w-[60px] hover:max-w-[200px]"
        >
            <MessageCircle className="w-7 h-7 flex-shrink-0" />
            <span className="font-black uppercase tracking-tighter whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Mesaj Gönder
            </span>
        </a>
    );
};

export default WhatsAppButton;
