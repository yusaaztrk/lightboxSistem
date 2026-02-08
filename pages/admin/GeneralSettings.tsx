import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Save, AlertCircle } from 'lucide-react';
import { InputGroup } from '../../components/admin/InputGroup';

const GeneralSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.getSystemSettings();
            setSettings(data);
        } catch (e: any) {
            setError(e.message || "Ayarlar yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        try {
            await api.updateSystemSettings(settings);
            alert("Genel ayarlar başarıyla kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme sırasında hata oluştu.");
        }
    };

    if (loading) return <div className="text-brand-cyan animate-pulse font-mono">Yükleniyor...</div>;
    if (error) return <div className="text-red-500 font-bold flex items-center gap-2"><AlertCircle /> {error}</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Genel Ayarlar</h1>
                    <p className="text-admin-text-muted text-sm mt-1">Sistem maliyetleri ve parametreleri</p>
                </div>
                <button onClick={handleSave} className="bg-brand-cyan hover:bg-brand-cyan-hover text-white font-black py-3 px-8 rounded-xl transition shadow-lg shadow-brand-cyan/20 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Save size={16} /> Ayarları Kaydet
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                <div className="bg-admin-card border border-admin-border p-8 rounded-3xl space-y-6">
                    <h3 className="text-xs font-black text-brand-orange uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                        Sabit Giderler ($)
                    </h3>
                    <div className="space-y-4">
                        <InputGroup label="Kablo Sabit Gider" value={settings.cableFixedCost} onChange={v => setSettings({ ...settings, cableFixedCost: v })} />
                        <InputGroup label="Köşebent (Adet)" value={settings.cornerPiecePrice} onChange={v => setSettings({ ...settings, cornerPiecePrice: v })} />
                        <InputGroup label="Baskı (m²)" value={settings.printCostPerM2} onChange={v => setSettings({ ...settings, printCostPerM2: v })} />
                    </div>
                </div>

                <div className="bg-admin-card border border-admin-border p-8 rounded-3xl space-y-6">
                    <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                        Oranlar & LED Modülleri
                    </h3>
                    <div className="space-y-4">
                        <InputGroup label="İşçilik Oranı (%)" value={settings.laborRatePercentage} onChange={v => setSettings({ ...settings, laborRatePercentage: v })} />
                        <InputGroup label="Kâr Marjı (%)" value={settings.profitMarginPercentage} onChange={v => setSettings({ ...settings, profitMarginPercentage: v })} />
                        <InputGroup label="Kumaş Kâr Marjı (%)" value={settings.fabricProfitMarginPercentage} onChange={v => setSettings({ ...settings, fabricProfitMarginPercentage: v })} />
                        <InputGroup label="Ayak (Takım) Ücreti" value={settings.standPrice} onChange={v => setSettings({ ...settings, standPrice: v })} />
                        <InputGroup label="Amper / Metre" value={settings.amperesPerMeter} onChange={v => setSettings({ ...settings, amperesPerMeter: v })} />
                        <InputGroup label="LED Dizim Aralığı (Varsayılan cm)" value={settings.defaultLedSpacingCm ?? 15} onChange={v => setSettings({ ...settings, defaultLedSpacingCm: v })} />
                        <InputGroup label="LED (İç) $/m" value={settings.ledIndoorPricePerMeter} onChange={v => setSettings({ ...settings, ledIndoorPricePerMeter: v })} />
                        <InputGroup label="LED (Dış) $/m" value={settings.ledOutdoorPricePerMeter} onChange={v => setSettings({ ...settings, ledOutdoorPricePerMeter: v })} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
