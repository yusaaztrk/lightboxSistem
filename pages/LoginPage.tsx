import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin123') {
            navigate('/admin/orders');
        } else {
            alert('Hatalı kullanıcı adı veya şifre!');
        }
    };

    return (
        <div className="h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-10 border border-gray-100">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Box className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome Back</h2>
                <p className="text-gray-500 text-center text-sm mb-8">Please enter your details to sign in.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                            placeholder="admin"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]">
                            SIGN IN
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/')} className="text-sm font-semibold text-gray-400 hover:text-indigo-600 transition">
                        Back to Website
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
