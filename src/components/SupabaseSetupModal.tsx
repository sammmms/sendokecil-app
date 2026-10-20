'use client';

import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured, syncLocalToSupabase } from '@/lib/supabaseStorage';
import { Order, Product } from '@/types';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  onRefresh: () => void;
}

const SQL_SCHEMA = `-- ==========================================================
-- SENDOKECIL EST 2026 - SUPABASE DATABASE MIGRATION SCRIPT
-- Paste this script into your Supabase SQL Editor and click "RUN"
-- ==========================================================

-- 1. Create Orders Table
create table if not exists public.orders (
  id text primary key,
  order_number text not null,
  order_date text not null,
  customer_name text not null,
  customer_phone text,
  order_type text not null default 'antar',
  delivery_address text,
  delivery_time_note text,
  priority text not null default 'normal',
  items jsonb not null default '[]'::jsonb,
  total_pcs integer not null default 0,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total_amount numeric not null default 0,
  total_hpp numeric not null default 0,
  net_profit numeric not null default 0,
  payment_method text not null default 'TF',
  payment_status text not null default 'menunggu_konfirmasi',
  fulfillment_status text not null default 'menunggu',
  payment_proof_url text,
  payment_proof_uploaded_at text,
  payment_approved_at text,
  payment_approved_by text,
  customer_notes text,
  admin_notes text,
  greeting_card jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  price numeric not null default 15000,
  category text not null default 'Gabin',
  image text,
  badge text,
  is_available boolean not null default true,
  recipe jsonb not null default '[]'::jsonb,
  custom_hpp numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create HPP Components Table
create table if not exists public.hpp_components (
  id text primary key,
  name text not null,
  category text not null default 'bahan_baku',
  cost numeric not null default 0,
  unit text not null default 'porsi',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.hpp_components enable row level security;

-- 5. Policies
create policy "Enable all for orders" on public.orders for all using (true) with check (true);
create policy "Enable all for products" on public.products for all using (true) with check (true);
create policy "Enable all for hpp_components" on public.hpp_components for all using (true) with check (true);

-- 6. Enable Realtime cross-device updates
alter publication supabase_realtime add table public.orders, public.products, public.hpp_components;
`;

export function SupabaseSetupModal({
  isOpen,
  onClose,
  orders,
  products,
  onRefresh,
}: SupabaseSetupModalProps) {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncLocalToSupabase(orders, products);
      setSyncResult(res);
      if (res.success) {
        onRefresh();
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#3E271B]">Integrasi Supabase Cloud</h3>
              <p className="text-xs text-[#7C6353]">Sistem database real-time terpadu seperti Tov's Fleur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 text-xs pr-1">
          {/* Status Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {isConnected ? 'Supabase Terhubung' : 'Menggunakan Mode Lokal (JSON)'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {isConnected
                    ? 'Data otomatis tersinkronisasi ke server Supabase Anda'
                    : 'Untuk mengaktifkan cloud database, isi NEXT_PUBLIC_SUPABASE_URL dan KEY di .env'}
                </div>
              </div>
            </div>

            {isConnected && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sinkronisasi...' : 'Sync Sekarang'}
              </button>
            )}
          </div>

          {syncResult && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{syncResult.message}</span>
            </div>
          )}

          {/* Quick Setup Instructions */}
          <div className="space-y-2 p-3.5 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3]">
            <div className="font-bold text-[#5A3E2C] flex items-center justify-between">
              <span>Langkah Penyiapan di Supabase:</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B4226] hover:underline flex items-center gap-1 text-[11px]"
              >
                Buka Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 leading-relaxed text-[11px]">
              <li>Buka project Supabase Anda dan masuk ke menu <b>SQL Editor</b>.</li>
              <li>Klik tombol <b>"Salin Script SQL"</b> di bawah ini dan paste ke dalam editor SQL.</li>
              <li>Klik tombol <b>"Run"</b> di Supabase untuk membuat tabel <code className="bg-[#EFE5D5] px-1 rounded">orders</code>, <code className="bg-[#EFE5D5] px-1 rounded">products</code>, dan <code className="bg-[#EFE5D5] px-1 rounded">hpp_components</code>.</li>
              <li>Salin <b>Project URL</b> dan <b>Anon Key</b> dari menu Settings ➔ API ke file <code className="bg-[#EFE5D5] px-1 rounded">.env</code>.</li>
            </ol>
          </div>

          {/* SQL Code Block */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#5A3E2C]">Script Migrasi SQL (schema.sql):</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="py-1 px-2.5 rounded-lg border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] font-semibold text-[11px] flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin Script SQL'}
              </button>
            </div>
            <pre className="p-3 bg-[#241A14] text-[#EFE7DC] rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 border border-[#3E271B]">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8DEC8] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
