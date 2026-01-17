import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';
import { api } from '../services/api';
import { PricingFactors } from '../types';
import { INITIAL_PRICING } from '../constants';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [factors, setFactors] = useState<PricingFactors | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch settings on mount
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin123') {
            setIsLoggedIn(true);
        } else {
            alert('Hatalı kullanıcı adı veya şifre!');
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

    if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;

    if (!isLoggedIn) {
        return (
            <div className="h-screen bg-[#050507] flex items-center justify-center">
                <form onSubmit={handleLogin} className="bg-white/5 p-10 rounded-3xl border border-white/10 w-96 space-y-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-black text-white text-center uppercase italic">Yönetici Girişi</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Kullanıcı Adı"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Şifre"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition"
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition">GİRİŞ YAP</button>
                    <button type="button" onClick={() => navigate('/')} className="w-full text-gray-500 text-xs font-black hover:text-white transition">ANA SAYFAYA DÖN</button>
                </form>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black">
            {/* We reuse AdminPanel but trick it into thinking it's always open. 
          The AdminPanel usually has a fixed overlay. Since we are on a dedicated page, that's fine. */}
            {factors && (
                <AdminPanel
                    factors={factors}
                    onUpdate={handleUpdate}
                    onClose={() => navigate('/')}
                />
            )}
        </div>
    );
};

export default AdminPage;
