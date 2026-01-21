import React, { useState } from 'react';
import { CalculationBreakdown } from '../types';
import { ChevronDown, ChevronUp, Layers, PenTool, TrendingUp } from 'lucide-react';

interface Props {
    breakdown: CalculationBreakdown;
}

const CostBreakdownAccordion: React.FC<Props> = ({ breakdown }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to format currency
    const format = (val: number) => `$${val.toFixed(2)}`;

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden mt-6">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Maliyet Detayları</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {isOpen ? 'Gizlemek için tıkla' : 'Görüntülemek için tıkla'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isOpen && (
                        <span className="text-xl font-black text-white">{format(breakdown.finalPrice)}</span>
                    )}
                    {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
            </div>

            {isOpen && (
                <div className="p-4 border-t border-white/5 space-y-4 bg-black/20">
                    {/* Raw Materials */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span> Ham Maliyetler
                        </h4>

                        <div className="grid gap-2 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Profil Gideri</span>
                                <span className="font-mono text-white">{format(breakdown.profileCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Zemin Malzemesi</span>
                                <span className="font-mono text-white">{format(breakdown.backingCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Baskı Maliyeti</span>
                                <span className="font-mono text-white">{format(breakdown.printCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>LED Aydınlatma</span>
                                <span className="font-mono text-white">{format(breakdown.ledCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Adaptör ({breakdown.adapterName})</span>
                                <span className="font-mono text-white">{format(breakdown.adapterCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Kablo & Sarf</span>
                                <span className="font-mono text-white">{format(breakdown.cableCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Köşe Bağlantıları</span>
                                <span className="font-mono text-white">{format(breakdown.cornerPieceCost)}</span>
                            </div>

                            <div className="pt-2 mt-1 border-t border-white/5 flex justify-between font-bold text-gray-300">
                                <span>HAM TOPLAM</span>
                                <span>{format(breakdown.rawMaterialTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Labor Cost */}
                    <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider">
                                <PenTool size={12} /> İşçilik Payı
                            </div>
                            <span className="font-mono text-white font-bold">{format(breakdown.laborCost)}</span>
                        </div>
                    </div>

                    {/* Profit Margin */}
                    <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                <TrendingUp size={12} /> Kâr Marjı
                            </div>
                            <span className="font-mono text-white font-bold">{format(breakdown.profitMargin)}</span>
                        </div>
                    </div>

                    {/* Final Total */}
                    <div className="pt-4 border-t border-white/10 mt-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">SATIŞ FİYATI</span>
                            <span className="text-2xl font-black text-white leading-none tracking-tight">{format(breakdown.finalPrice)}</span>
                        </div>
                    </div>

                    {/* Technical Details Footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-gray-600 font-mono flex justify-between uppercase">
                        <span>Düzen: {breakdown.selectedLayout?.direction === 'Vertical' ? 'DİKEY' : 'YATAY'}</span>
                        <span>LED: {breakdown.selectedLayout?.totalLedMeters.toFixed(2)}m</span>
                        <span>AMPER: {breakdown.selectedAmperes}A</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostBreakdownAccordion;
