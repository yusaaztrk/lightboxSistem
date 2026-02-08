import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, Trophy, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { SpinWheelItem } from '../types';
import confetti from 'canvas-confetti';

const LAST_RESULT_KEY = 'lastWheelResult_v1';

interface LuckyWheelProps {
    isOpen: boolean;
    onClose: () => void;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<SpinWheelItem[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [wonItem, setWonItem] = useState<any>(null);
    const [rotation, setRotation] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);
    const isOpenRef = useRef(isOpen);

    // Keep ref in sync with prop
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setWonItem(null);
            setIsSpinning(false);
            setRotation(0);
            setError('');
            setPhoneNumber('');
            setLoading(true);
            setCopied(false);

            try {
                const raw = localStorage.getItem(LAST_RESULT_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    const at = typeof parsed?.at === 'number' ? parsed.at : 0;
                    const isRecent = at && (Date.now() - at) < 1000 * 60 * 60 * 6;
                    if (isRecent && parsed?.result) {
                        setWonItem(parsed.result);
                    }
                }
            } catch {
                // ignore
            }

            api.getWheelConfig().then(data => {
                if (!isOpenRef.current) return;
                setItems(data);
                setLoading(false);
                drawWheel(data, 0);
            }).catch(() => {
                if (!isOpenRef.current) return;
                setItems([]);
                setLoading(false);
                setError('Çark yüklenemedi. Sunucu bağlantısını kontrol edin.');
            });
        }

        return () => {
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (items.length > 0 && !isSpinning) {
            drawWheel(items, rotation);
        }
    }, [items, rotation]);

    const drawWheel = (wheelItems: SpinWheelItem[], currentRotation: number) => {
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (!wheelItems || wheelItems.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = canvas.width / 2 - 10;
            const sliceAngle = (2 * Math.PI) / wheelItems.length;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            wheelItems.forEach((item, index) => {
                const startAngle = index * sliceAngle + currentRotation;
                const endAngle = (index + 1) * sliceAngle + currentRotation;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = item.colorHex;
                ctx.fill();
                ctx.stroke();

                // Text
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(item.label, radius - 20, 5);
                ctx.restore();
            });

            // Marker
            ctx.beginPath();
            const markerX = canvas.width - 10;
            const markerY = centerY;
            ctx.moveTo(markerX, markerY - 10);
            ctx.lineTo(markerX - 20, markerY);
            ctx.lineTo(markerX, markerY + 10);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSpin = async () => {
        if (loading) {
            setError('Çark yükleniyor...');
            return;
        }

        if (!items || items.length === 0) {
            setError('Çark verisi yüklenemedi. Sunucu bağlantısını kontrol edin.');
            return;
        }

        const rawPhone = phoneNumber.replace(/\D/g, '');
        if (!/^05\d{9}$/.test(rawPhone)) {
            setError('Geçerli bir telefon numarası giriniz: 05XX XXX XX XX');
            return;
        }
        setError('');
        setIsSpinning(true);

        try {
            const result = await api.spinWheel(rawPhone);

            // Calculate target rotation
            // The API returns the WON item ID. We need to find its index.
            const wonIndex = items.findIndex(i => i.id === result.wonItemId);

            if (wonIndex < 0) {
                setError('Sonuç hesaplanamadı. Lütfen tekrar deneyin.');
                setIsSpinning(false);
                return;
            }

            // Calculate angle to land on this index.
            // The marker is at 0 degrees (Right side). 
            // Rotation is clockwise.
            // Target Index should be at 0 degrees.
            const sliceAngle = (2 * Math.PI) / items.length;

            // targetAngle is where the item START is. 
            // We want the item CENTER to match marker.
            // But wait, standard math. 
            // If we rotate by X, item I moves to (I * Slice + X).
            // We want (WonIndex * Slice + X) % 2PI approx 0 (Marker).
            // Actually let's just do a big spin + offset.

            const extraSpins = 5 * (2 * Math.PI);

            // Center of the winning slice needs to be at angle 0 (Right).
            // Slice covers [Index*SA, (Index+1)*SA]. Center = (Index + 0.5) * SA.
            // We want (Center + Rotation) % 2PI = 0.
            // So Rotation = -Center.

            const centerAngle = (wonIndex + 0.5) * sliceAngle;
            const targetRotation = extraSpins - centerAngle; // Rotate backwards to align

            if (!Number.isFinite(targetRotation)) {
                setError('Çark animasyonu başlatılamadı. Lütfen tekrar deneyin.');
                setIsSpinning(false);
                return;
            }

            // Animate
            const duration = 5000;
            const start = performance.now();

            const animate = (time: number) => {
                // Only bail out if the modal was closed
                if (!isOpenRef.current) return;
                try {
                    const elapsed = time - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 4); // EaseOutQuart

                    const currentRot = targetRotation * easeOut;
                    setRotation(currentRot);

                    if (progress < 1) {
                        rafRef.current = requestAnimationFrame(animate);
                    } else {
                        // Animation complete – show result
                        setIsSpinning(false);
                        setWonItem(result);
                        try {
                            localStorage.setItem(LAST_RESULT_KEY, JSON.stringify({ at: Date.now(), result }));
                        } catch {
                            // ignore
                        }
                        try {
                            if (!result.isLoss) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                        } catch {
                            // confetti is optional
                        }
                    }
                } catch (e) {
                    console.error(e);
                    setIsSpinning(false);
                    setWonItem(result); // Still show result even if animation errors
                }
            };
            rafRef.current = requestAnimationFrame(animate);

        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data || 'Bir hata oluştu veya bu numara ile zaten katıldınız.';
            setError(typeof msg === 'string' ? msg : 'Bir hata oluştu.');
            setIsSpinning(false);
        }
    };

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');
        let formatted = digits;
        if (digits.length > 0 && digits[0] !== '0') formatted = '0' + digits;
        if (formatted.length > 11) formatted = formatted.substring(0, 11);
        let display = formatted;
        if (formatted.length > 4) display = `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
        if (formatted.length > 7) display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
        if (formatted.length > 9) display = `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9)}`;
        return { display, raw: formatted };
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { display } = formatPhoneNumber(e.target.value);
        setPhoneNumber(display);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-3xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

                {!wonItem ? (
                    <div className="flex flex-col items-center">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-[var(--app-text)] italic uppercase tracking-tighter mb-2">ŞANS ÇARKI</h2>
                            <p className="text-gray-400 text-sm">Numaranı gir, çarkı çevir, sürpriz indirim kazan!</p>
                        </div>

                        <div className="relative mb-8">
                            {loading ? <div className="text-[var(--app-text)]">Yükleniyor...</div> : (
                                <canvas ref={canvasRef} width={300} height={300} className="rounded-full shadow-2xl shadow-indigo-500/20" />
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <input
                                type="tel"
                                placeholder="05XX XXX XX XX"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[var(--app-text)] font-bold outline-none focus:border-indigo-500 text-center tracking-widest"
                                disabled={isSpinning}
                                maxLength={14}
                            />
                            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

                            <button
                                onClick={handleSpin}
                                disabled={isSpinning || loading || items.length === 0}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 text-lg uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSpinning ? <Sparkles className="animate-spin" /> : <Gift />}
                                {isSpinning ? 'ÇEVRİLİYOR...' : 'ŞANSINI DENE'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                        {wonItem.isLoss ? (
                            <>
                                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <X className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--app-text)] mb-2">MAALESEF!</h3>
                                <p className="text-[var(--app-muted)] mb-6">Bu sefer kazanamadınız. Tekrar deneyin!</p>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40 animate-bounce">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-[var(--app-text)] mb-2 uppercase italic">TEBRİKLER!</h3>
                                <p className="text-lg text-emerald-500 font-bold mb-8">{wonItem.wonLabel} KAZANDINIZ!</p>

                                <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 mb-6">
                                    <p className="text-xs text-[var(--app-muted)] uppercase tracking-widest mb-2">İNDİRİM KODUNUZ</p>
                                    <div className="text-3xl font-mono font-black text-emerald-600 tracking-widest select-all">
                                        {wonItem.discountCode}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(wonItem.discountCode);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1500);
                                            } catch {
                                                setError('Kopyalama başarısız. Kodu seçip kopyalayın.');
                                            }
                                        }}
                                        className="mt-4 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[var(--app-text)] font-black py-3 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'KOPYALANDI' : 'KODU KOPYALA'}
                                    </button>
                                    <p className="text-[10px] text-[var(--app-muted)] mt-2">Bu kodu sipariş ekranında indirim kısmına yapıştırın</p>
                                </div>
                            </>
                        )}

                        <button onClick={onClose} className="bg-[var(--app-border)] hover:opacity-80 text-[var(--app-text)] font-bold py-3 px-8 rounded-xl transition">
                            Kapat
                        </button>

                        <button
                            onClick={() => {
                                setWonItem(null);
                                setError('');
                                setRotation(0);
                                drawWheel(items, 0);
                            }}
                            className="mt-3 bg-[var(--app-border)] hover:opacity-80 text-[var(--app-text)] font-bold py-3 px-8 rounded-xl transition"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LuckyWheel;
