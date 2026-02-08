import React from 'react';
import { ConfigOptions, LedLayoutResult } from '../types';

interface Props {
    config: ConfigOptions;
    layout: LedLayoutResult;
    alternativeLayout?: LedLayoutResult;
}

const LedVisualization: React.FC<Props> = ({ config, layout, alternativeLayout }) => {
    const [showAlternative, setShowAlternative] = React.useState(false);

    // Use the active layout based on toggle
    const activeLayout = showAlternative && alternativeLayout ? alternativeLayout : layout;

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
        ? activeLayout.stripCount / 2
        : activeLayout.stripCount;

    // Calculate dynamic spacing for visualization
    // We assume backend logic: Start at 5cm, End at Dim-5cm.
    // So Span = Dim - 10.
    // Gaps = Count - 1.
    // Spacing = Span / Gaps.

    if (activeLayout.direction === 'Horizontal') {
        const span = config.height - (edgeMargin * 2);
        const gaps = visualStripCount - 1;
        const spacing = gaps > 0 ? span / gaps : 0;

        for (let i = 0; i < visualStripCount; i++) {
            // Position: 5cm + (i * spacing)
            // If single strip (gaps=0), center it or put at 5? 
            // If 1 strip, Box < 10cm usually. Let's precise center it for visual nicety if single.

            let yCm = edgeMargin + (i * spacing);
            if (visualStripCount === 1) yCm = config.height / 2;

            const yPos = yCm * scale;
            const marginSide = stripLengthMargin / 2;
            const xPos = marginSide * scale;
            const w = (config.width - stripLengthMargin) * scale;
            const h = 2;

            strips.push(
                <g key={`h-${i}`}>
                    <rect x={xPos} y={yPos} width={w} height={h} fill={showAlternative ? "#ef4444" : "#fbbf24"} opacity={0.8} rx={1} />
                    {/* Spacing Label - Draw between this and next */}
                    {i < gaps && (
                        <text
                            x={containerSize / 2}
                            y={yPos + (spacing * scale / 2) + 3}
                            fontSize="8"
                            fill="currentColor"
                            textAnchor="middle"
                            opacity={0.6}
                        >
                            {spacing.toFixed(1)} cm
                        </text>
                    )}
                </g>
            );
        }
    } else {
        const span = config.width - (edgeMargin * 2);
        const gaps = visualStripCount - 1;
        const spacing = gaps > 0 ? span / gaps : 0;

        for (let i = 0; i < visualStripCount; i++) {
            let xCm = edgeMargin + (i * spacing);
            if (visualStripCount === 1) xCm = config.width / 2;

            const xPos = xCm * scale;
            const marginSide = stripLengthMargin / 2;
            const yPos = marginSide * scale;
            const h = (config.height - stripLengthMargin) * scale;
            const w = 2;

            strips.push(
                <g key={`v-${i}`}>
                    <rect x={xPos} y={yPos} width={w} height={h} fill={showAlternative ? "#ef4444" : "#fbbf24"} opacity={0.8} rx={1} />
                    {/* Spacing Label */}
                    {i < gaps && (
                        <text
                            x={xPos + (spacing * scale / 2)}
                            y={containerSize / 2}
                            fontSize="8"
                            fill="currentColor"
                            textAnchor="middle"
                            opacity={0.6}
                        >
                            {spacing.toFixed(1)} cm
                        </text>
                    )}
                </g>
            );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] mt-4 text-[var(--app-muted)]">
            <div className="flex items-center justify-between w-full mb-4 px-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OTOMATİK LED DİZİLİMİ</h4>

                {alternativeLayout && (
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setShowAlternative(false)}
                            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${!showAlternative ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            {layout.direction === 'Vertical' ? 'DİKEY (UCUZ)' : 'YATAY (UCUZ)'}
                        </button>
                        <button
                            onClick={() => setShowAlternative(true)}
                            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${showAlternative ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            {alternativeLayout.direction === 'Vertical' ? 'DİKEY' : 'YATAY'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ width: containerSize, height: containerSize }} className="relative flex items-center justify-center bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)] shadow-inner group">
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

                {/* Cost Badge */}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[9px] font-black backdrop-blur-md border ${showAlternative ? 'bg-red-500/20 text-red-200 border-red-500/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'}`}>
                    {activeLayout.totalLedMeters.toFixed(2)} Metre
                </div>
            </div>

            <div className="mt-4 flex gap-4 text-[9px] font-bold text-gray-500 uppercase">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> KASA
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${showAlternative ? 'bg-red-500' : 'bg-yellow-500'}`}></div> LED ŞERİT
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-600 border-dashed rounded-sm"></div> MARJ (5cm)
                </div>
            </div>
        </div>
    );
};

export default LedVisualization;
