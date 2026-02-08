import React from 'react';

interface InputGroupProps {
    label: string;
    value: string | number;
    onChange: (v: string | number) => void;
    isText?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, isText }) => (
    <div className="bg-admin-dark p-4 rounded-xl border border-admin-border focus-within:ring-2 focus-within:ring-brand-cyan/50 transition-all">
        <label className="block text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-2">{label}</label>
        <input
            type={isText ? "text" : "number"}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-transparent text-white font-mono font-bold text-lg outline-none border-b border-admin-border focus:border-brand-cyan transition-colors py-1 placeholder-white/10"
        />
    </div>
);
