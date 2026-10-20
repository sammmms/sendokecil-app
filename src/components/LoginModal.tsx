'use client';

import React, { useState } from 'react';
import { Lock, User, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Login gagal. Periksa username dan password.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7C6353] hover:text-[#4A2E1B] rounded-full hover:bg-[#F3ECE0] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F5ECE0] border border-[#E0D0BE] flex items-center justify-center text-[#7A4B27]">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3E271B]">Masuk Dashboard Owner</h2>
          <p className="text-xs text-[#7C6353] mt-1">
            Akses privat untuk melihat omset, laba bersih, HPP, & konfirmasi pembayaran
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A3E2C] mb-1">
              Username Admin
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C6D58] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-sm focus:outline-none focus:ring-2 focus:ring-[#8C5326] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3E2C] mb-1">
              Password Admin
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C6D58] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-sm focus:outline-none focus:ring-2 focus:ring-[#8C5326] transition"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F3EA] border border-[#E5DAC8] text-[11px] text-[#7A5B45]">
            <div className="font-semibold flex items-center gap-1 text-[#5A3E2C] mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C5326]" /> Konfigurasi Akun .env
            </div>
            Username dan password terbaca langsung dari file <code className="bg-[#EFE5D5] px-1 py-0.5 rounded font-mono text-[#4A2E1B]">.env</code> (ADMIN_USERNAME & ADMIN_PASSWORD).
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-medium text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
