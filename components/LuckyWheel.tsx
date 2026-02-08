import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gift, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { SpinWheelItem } from '../types';

/**
 * LuckyWheel v4 – Bulletproof approach
 *
 * Problem with v3: transitionend listener was set in useEffect([]) but
 * wheelDivRef was null at mount because isOpen starts false.
 *
 * Solution: Use setTimeout as the SOLE timer. No transitionend dependency.
 * The wheel spins for exactly SPIN_DURATION ms, then result is shown.
 */

const SPIN_DURATION = 5000; // must match CSS transition duration

interface LuckyWheelProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── phases ───
type Phase = 'input' | 'spinning' | 'result';

const LuckyWheel: React.FC<LuckyWheelProps> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<SpinWheelItem[]>([]);
    const [phone, setPhone] = useState('');
    const [phase, setPhase] = useState<Phase>('input');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [animate, setAnimate] = useState(false);

    const cumulativeRotation = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Load items when opened ───
    useEffect(() => {
        if (!isOpen) return;

        // Reset everything
        setPhase('input');
        setResult(null);
        setError('');
        setPhone('');
        setCopied(false);
        setLoading(true);
        setAnimate(false);
        setRotation(cumulativeRotation.current);

        if (timerRef.current) clearTimeout(timerRef.current);

        api.getWheelConfig()
            .then(data => { setItems(data); setLoading(false); })
            .catch(() => { setItems([]); setLoading(false); setError('Çark yüklenemedi.'); });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isOpen]);

    // ─── Phone formatting ───
    const formatPhone = useCallback((raw: string) => {
        let d = raw.replace(/\D/g, '');
        if (d.length > 0 && d[0] !== '0') d = '0' + d;
        if (d.length > 11) d = d.slice(0, 11);
        if (d.length > 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
        if (d.length > 7) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
        if (d.length > 4) return `${d.slice(0, 4)} ${d.slice(4)}`;
        return d;
    }, []);

    // ─── SPIN ───
    const handleSpin = async () => {
        if (phase !== 'input' || loading || items.length === 0) return;

        const raw = phone.replace(/\D/g, '');
        if (!/^05\d{9}$/.test(raw)) {
            setError('Geçerli bir telefon giriniz: 05XX XXX XX XX');
            return;
        }

        setError('');
        setPhase('spinning');

        try {
            const res = await api.spinWheel(raw);
            const idx = items.findIndex(i => i.id === res.wonItemId);
            if (idx < 0) {
                setError('Sonuç hesaplanamadı.');
                setPhase('input');
                return;
            }

            // Calculate target rotation
            const sliceDeg = 360 / items.length;
            // Wheel rotates clockwise; pointer is on the RIGHT.
            // Slice 0 starts at 12 o'clock (top) in conic-gradient.
            // To land on slice idx, we need the midpoint of that slice at the pointer (right = 90deg from top).
            const targetAngle = 360 - (idx * sliceDeg + sliceDeg / 2); // center of slice relative to 0
            const fullSpins = 6 * 360;
            const nextRotation = cumulativeRotation.current + fullSpins + targetAngle;
            cumulativeRotation.current = nextRotation;

            // Trigger animation: first set rotation without transition, then with
            setAnimate(true);
            setRotation(nextRotation);

            // After SPIN_DURATION, show result
            timerRef.current = setTimeout(() => {
                setPhase('result');
                setResult(res);
                setAnimate(false);
            }, SPIN_DURATION + 300); // 300ms safety buffer

        } catch (e: any) {
            const msg = e.response?.data;
            setError(typeof msg === 'string' ? msg : 'Bu numara ile zaten katıldınız veya hata oluştu.');
            setPhase('input');
        }
    };

    // ─── Copy code ───
    const handleCopy = async () => {
        if (!result?.discountCode) return;
        try {
            await navigator.clipboard.writeText(result.discountCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    if (!isOpen) return null;

    // ─── Build conic-gradient ───
    const gradient = (() => {
        if (items.length === 0) return 'conic-gradient(#333 0deg 360deg)';
        const sliceDeg = 360 / items.length;
        const stops = items.map((item, i) => {
            return `${item.colorHex} ${i * sliceDeg}deg ${(i + 1) * sliceDeg}deg`;
        });
        return `conic-gradient(${stops.join(', ')})`;
    })();

    // ─── RESULT SCREEN ───
    if (phase === 'result' && result) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <div
                    className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-[var(--app-muted)] hover:text-[var(--app-text)] z-10">
                        <X size={22} />
                    </button>

                    <div className="p-8 text-center">
                        {result.isLoss ? (
                            <>
                                <div className="text-6xl mb-4">😞</div>
                                <h3 className="text-2xl font-black text-[var(--app-text)] mb-2">MAALESEF!</h3>
                                <p className="text-[var(--app-muted)] mb-6">Bu sefer kazanamadınız.</p>
                            </>
                        ) : (
                            <>
                                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                <h3 className="text-3xl font-black text-[var(--app-text)] mb-2 uppercase italic">TEBRİKLER!</h3>
                                <p className="text-lg text-emerald-500 font-bold mb-6">{result.wonLabel} KAZANDINIZ!</p>

                                <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 mb-6">
                                    <p className="text-xs text-[var(--app-muted)] uppercase tracking-widest mb-3">İNDİRİM KODUNUZ</p>
                                    <div className="text-3xl font-mono font-black text-emerald-500 tracking-widest select-all mb-4">
                                        {result.discountCode}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-500 transition flex items-center justify-center gap-2"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'KOPYALANDI!' : 'KODU KOPYALA'}
                                    </button>
                                    <p className="text-[10px] text-[var(--app-muted)] mt-3">
                                        Bu kodu sipariş ekranında indirim kısmına yapıştırın
                                    </p>
                                </div>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full bg-[var(--app-border)] hover:opacity-80 text-[var(--app-text)] font-bold py-3 rounded-xl transition"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SPIN SCREEN ───
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">

                {/* Only allow close when not spinning */}
                {phase !== 'spinning' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-[var(--app-muted)] hover:text-[var(--app-text)] z-10">
                        <X size={22} />
                    </button>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <div className="relative p-8 flex flex-col items-center">
                    <h2 className="text-2xl font-black text-[var(--app-text)] italic uppercase tracking-tighter mb-1">
                        🎰 ŞANS ÇARKI
                    </h2>
                    <p className="text-[var(--app-muted)] text-sm mb-6">Numaranı gir, çarkı çevir!</p>

                    {/* ── WHEEL ── */}
                    <div className="relative mb-8">
                        {loading ? (
                            <div className="w-[280px] h-[280px] flex items-center justify-center">
                                <span className="text-[var(--app-muted)] animate-pulse font-bold">Yükleniyor...</span>
                            </div>
                        ) : (
                            <>
                                {/* Glow */}
                                <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-amber-500/20 blur-md" />
                                <div className="absolute inset-[-3px] rounded-full border-2 border-white/10" />

                                {/* Wheel disc */}
                                <div
                                    className="w-[280px] h-[280px] rounded-full relative z-[1] shadow-xl"
                                    style={{
                                        background: gradient,
                                        transform: `rotate(${rotation}deg)`,
                                        transition: animate
                                            ? `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.7, 0.1, 1)`
                                            : 'none',
                                    }}
                                >
                                    {/* Slice labels */}
                                    {items.map((item, i) => {
                                        const sliceDeg = 360 / items.length;
                                        const angle = (i + 0.5) * sliceDeg;
                                        return (
                                            <div
                                                key={item.id}
                                                className="absolute inset-0 flex items-center justify-end pointer-events-none"
                                                style={{ transform: `rotate(${angle}deg)` }}
                                            >
                                                <span
                                                    className="text-white font-black text-[11px] pr-5"
                                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Center dot */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg z-[2] border-2 border-gray-200" />

                                {/* Pointer (right side) */}
                                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10">
                                    <div
                                        className="w-0 h-0"
                                        style={{
                                            borderTop: '14px solid transparent',
                                            borderBottom: '14px solid transparent',
                                            borderRight: '24px solid #FFD700',
                                            filter: 'drop-shadow(0 2px 6px rgba(255,215,0,0.5))',
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── INPUT & BUTTON ── */}
                    <div className="w-full space-y-3">
                        <input
                            type="tel"
                            placeholder="05XX XXX XX XX"
                            value={phone}
                            onChange={e => setPhone(formatPhone(e.target.value))}
                            className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-4 py-4 text-[var(--app-text)] font-bold outline-none focus:border-purple-500 text-center tracking-widest disabled:opacity-50"
                            disabled={phase === 'spinning'}
                            maxLength={14}
                        />
                        {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                        <button
                            onClick={handleSpin}
                            disabled={phase === 'spinning' || loading || items.length === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 text-lg uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Gift className={phase === 'spinning' ? 'animate-spin' : ''} size={20} />
                            {phase === 'spinning' ? 'ÇEVRİLİYOR...' : 'ŞANSINI DENE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LuckyWheel;
