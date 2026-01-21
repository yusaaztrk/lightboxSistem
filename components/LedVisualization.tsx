import React from 'react';
import { ConfigOptions, LedLayoutResult } from '../types';

interface Props {
    config: ConfigOptions;
    layout: LedLayoutResult;
}

const LedVisualization: React.FC<Props> = ({ config, layout }) => {
    // Scaling logic to fit in container
    const containerSize = 300;
    const padding = 20;
    const availableCheck = containerSize - (padding * 2);

    const scale = Math.min(
        availableCheck / config.width,
        availableCheck / config.height
    );

    const scaledWidth = config.width * scale;
    const scaledHeight = config.height * scale;

    // LED props
    const ledSpacing = 15; // 15cm
    const edgeMargin = 5; // 5cm
    const stripLengthMargin = 2; // 2cm

    const strips: React.ReactNode[] = [];

    // Calculate strip logic
    // Note: layout.stripCount includes double sided (x2) if applicable. 
    // We want to visualize one side.
    const visualStripCount = config.profile === 'DOUBLE'
        ? layout.stripCount / 2
        : layout.stripCount;

    if (layout.direction === 'Horizontal') {
        for (let i = 0; i < visualStripCount; i++) {
            const yPos = (edgeMargin + (i * ledSpacing)) * scale;
            // Center the strip in width? or 5cm from left? 
            // Horizontal layout: Strip runs along Width.
            // Length = Width - 2cm.
            // Start x = 1cm (half of 2cm margin? No 1cm each side)
            const marginSide = stripLengthMargin / 2;
            const xPos = marginSide * scale;
            const w = (config.width - stripLengthMargin) * scale;
            const h = 2; // thickness of strip visual (fixed px)

            strips.push(
                <rect key={`h-${i}`} x={xPos} y={yPos} width={w} height={h} fill="#fbbf24" opacity={0.8} rx={1} />
            );
        }
    } else {
        for (let i = 0; i < visualStripCount; i++) {
            const xPos = (edgeMargin + (i * ledSpacing)) * scale;
            const marginSide = stripLengthMargin / 2;
            const yPos = marginSide * scale;
            const h = (config.height - stripLengthMargin) * scale;
            const w = 2; // thickness (fixed px)

            strips.push(
                <rect key={`v-${i}`} x={xPos} y={yPos} width={w} height={h} fill="#fbbf24" opacity={0.8} rx={1} />
            );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-3xl border border-white/5 mt-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">OTOMATİK LED DİZİLİMİ ({layout.direction === 'Vertical' ? 'DİKEY' : 'YATAY'})</h4>
            <div style={{ width: containerSize, height: containerSize }} className="relative flex items-center justify-center bg-[#050507] rounded-xl border border-white/10 shadow-inner">
                <svg width={scaledWidth} height={scaledHeight} style={{ overflow: 'visible' }}>
                    {/* Frame Outline */}
                    <rect x={0} y={0} width={scaledWidth} height={scaledHeight} fill="none" stroke="#6366f1" strokeWidth="2" rx="4" />

                    {/* Margin Guides (5cm dashed) */}
                    <rect x={edgeMargin * scale} y={edgeMargin * scale}
                        width={Math.max(0, scaledWidth - (edgeMargin * 2 * scale))}
                        height={Math.max(0, scaledHeight - (edgeMargin * 2 * scale))}
                        fill="none" stroke="#4b5563" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />

                    {/* LED Strips */}
                    {strips}
                </svg>
            </div>
            <div className="mt-4 flex gap-4 text-[9px] font-bold text-gray-500 uppercase">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> KASA
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> LED ŞERİT
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-600 border-dashed rounded-sm"></div> MARJ (5cm)
                </div>
            </div>
        </div>
    );
};

export default LedVisualization;
