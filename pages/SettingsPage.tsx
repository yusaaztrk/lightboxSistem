import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PricingFactors } from '../types';
import { INITIAL_PRICING } from '../constants';
import AdminPanel from '../components/AdminPanel';

const SettingsPage: React.FC = () => {
    const [factors, setFactors] = useState<PricingFactors | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            setFactors(data);
        } catch (err) {
            console.error("Failed to load settings, using defaults", err);
            setFactors(INITIAL_PRICING);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (newFactors: PricingFactors) => {
        try {
            await api.updateSettings(newFactors);
            setFactors(newFactors);
            alert('Ayarlar kaydedildi!');
        } catch (err) {
            console.error("Failed to save", err);
            alert('Kaydetme başarısız!');
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;

    return (
        <div className="pb-20">
            {/* 
                Reusing AdminPanel logic but we need to ensure it fits in the dashboard flow. 
                Ideally, AdminPanel should expose the form content directly. 
                For now, we render it. If AdminPanel has a fixed overlay, we might need to adjust it later. 
                Assuming AdminPanel is a modal, we might just trigger it or render its children.
                
                Let's assume AdminPanel is the "content" we want. 
                If AdminPanel has a "Close" button that navigates away, we might want to hide it in this context 
                or override onClose to do nothing.
             */}
            {factors && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing Configuration</h2>
                    {/* We are reusing the existing complex form. Ideally this should be decomposed. */}
                    <AdminPanel
                        factors={factors}
                        onUpdate={handleUpdate}
                        onClose={() => { }} // No-op, we are in a tab
                    />
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
