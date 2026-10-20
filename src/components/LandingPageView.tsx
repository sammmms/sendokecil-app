'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  MessageCircle,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink,
  Lock,
  X,
  Truck,
  Store,
  QrCode,
  Check,
} from 'lucide-react';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Product } from '@/types';
import { STORE_CONFIG } from '@/lib/constants';
import { formatRupiah } from '@/lib/hpp';

interface LandingPageViewProps {
  products: Product[];
  onGoToOrder: (preselectedProductId?: string) => void;
  onOpenOwnerLogin: () => void;
}

export function LandingPageView({
  products,
  onGoToOrder,
  onOpenOwnerLogin,
}: LandingPageViewProps) {
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1E16] flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Warm Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-radial from-[#F4EBE0]/80 via-[#FAF6F0]/40 to-transparent pointer-events-none -z-0" />
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#EFE4D6]/60 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-[#F3EBE0]/50 blur-3xl pointer-events-none" />

      {/* Main Content Container (Mobile-first Link-in-Bio card layout) */}
      <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center relative z-10">
        {/* Top Floating Badge */}
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3ECE0] border border-[#E0D0BE] text-[#6B4226] text-[11px] font-bold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8C5326]" />
            EST 2026 · Kue Gabin Fla Premium
          </span>
        </div>

        {/* Brand Title & Location Header */}
        <div className="text-center space-y-1 mb-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3E271B]">
            SENDOKecil
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#7A5B45] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#8C5326]" />
            <span>{STORE_CONFIG.location || 'Medan & Sekitarnya'}</span>
          </div>

          {/* Operating Hours & Live Status */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#E8DEC8] text-[10px] font-medium text-[#5A3E2C]">
              <Clock className="w-3 h-3 text-[#7A5B45]" />
              <span>08.00 - 20.00 WIB</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Buka Sekarang
            </span>
          </div>
        </div>

        {/* Centerpiece: Official 1:1 Spoon Brand Icon */}
        <div className="flex flex-col items-center my-3">
          <div className="relative group cursor-pointer" onClick={() => onGoToOrder()}>
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl p-1 bg-white shadow-md border-2 border-[#E5D5C2] flex items-center justify-center transition-transform transform group-hover:scale-105 duration-300">
              <img
                src="/icon.png"
                alt="SENDOKecil 1:1 Spoon Icon"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#6B4226] text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
              🧇 Fresh Baked
            </span>
          </div>

          <p className="font-serif italic text-xs text-[#7A5B45] mt-3.5 max-w-xs text-center px-4 leading-relaxed">
            {STORE_CONFIG.taglineQuote ||
              '“Crispy crackers, rich melted fla, pure happiness in every bite 🧇✨”'}
          </p>
        </div>

        {/* Action Link-in-Bio Buttons */}
        <div className="space-y-3 mt-4">
          {/* 1. Primary CTA: Pemesanan Online */}
          <button
            type="button"
            onClick={() => onGoToOrder()}
            className="w-full py-4 px-5 rounded-2xl bg-[#6B4226] hover:bg-[#54331C] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-tight">Pemesanan Online</div>
                <div className="text-[11px] text-[#FAF2E6]/85">
                  Pesan langsung & bayar via QRIS / BCA
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Pesan
              </span>
              <ChevronRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. Lihat Menu & Varian Rasa */}
          <button
            type="button"
            onClick={() => setShowMenuModal(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#3E271B] border border-[#E8DFC8] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8C5326] border border-amber-200/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm text-[#3E271B]">
                  Lihat Menu & Varian Rasa
                </div>
                <div className="text-[11px] text-[#7A5B45]">
                  Choco Oreo, Keju Melt, Banana, Vanilla
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E6] text-[#6B4226] border border-[#E0D0BE]">
                {products.length} Varian
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C6D53] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. WhatsApp Admin */}
          <a
            href={STORE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#3E271B] border border-[#E8DFC8] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm text-[#3E271B]">
                  WhatsApp Admin
                </div>
                <div className="text-[11px] text-[#7A5B45]">
                  Konsultasi pesanan, request waktu, atau event
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span>Chat</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* 4. Instagram Resmi */}
          <a
            href={STORE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#3E271B] border border-[#E8DFC8] shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 border border-pink-200/60 flex items-center justify-center">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm text-[#3E271B]">
                  Instagram Resmi
                </div>
                <div className="text-[11px] text-[#7A5B45]">
                  @{STORE_CONFIG.instagram || 'sendokecil'} · Update & inspirasi manis
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-700">
              <span>Follow</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#E8DEC8] text-[10px] text-[#5A3E2C] flex flex-col items-center gap-1">
            <Truck className="w-4 h-4 text-[#8C5326]" />
            <span className="font-semibold leading-tight">Bisa Antar Kurir</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#E8DEC8] text-[10px] text-[#5A3E2C] flex flex-col items-center gap-1">
            <Store className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold leading-tight">Ambil di Tempat</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#E8DEC8] text-[10px] text-[#5A3E2C] flex flex-col items-center gap-1">
            <QrCode className="w-4 h-4 text-blue-700" />
            <span className="font-semibold leading-tight">QRIS & Transfer BCA</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="w-full max-w-md mx-auto px-4 pb-6 pt-2 text-center space-y-2 relative z-10">
        <button
          type="button"
          onClick={onOpenOwnerLogin}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7A5B45] hover:text-[#3E271B] bg-white/80 hover:bg-[#FAF6F0] border border-[#E8DFC8] transition shadow-2xs cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Login Pemilik (Owner Dashboard)</span>
        </button>

        <p className="text-[10px] text-[#8C6D53]">
          © {new Date().getFullYear()} SENDOKecil · All rights reserved.
        </p>
      </footer>

      {/* Interactive Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[88vh] overflow-hidden shadow-2xl border border-[#E8DEC8] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-white border-b border-[#E8DFC8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.png"
                  alt="SENDOKecil"
                  className="w-8 h-8 rounded-xl object-contain border border-[#E8DEC8]"
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3E271B]">
                    Menu Kue Gabin Fla
                  </h3>
                  <p className="text-[11px] text-[#7A5B45]">
                    Pilihan varian fla lembut khas SENDOKecil
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Product List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8DFC8] shadow-2xs hover:shadow-sm transition flex gap-3.5 items-center"
                >
                  <img
                    src={product.image || '/images/products/choco-oreo.jpg'}
                    alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#E8DEC8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3E271B] truncate">
                        {product.name}
                      </span>
                      {product.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A5B45] line-clamp-2 mt-0.5 leading-snug">
                      {product.description || product.tagline}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F5ECE1]">
                      <span className="font-extrabold text-sm text-[#6B4226]">
                        {formatRupiah(product.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenuModal(false);
                          onGoToOrder(product.id);
                        }}
                        className="py-1 px-3 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        <span>Pesan Ini</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E8DFC8] flex items-center justify-between">
              <span className="text-xs text-[#7A5B45] font-medium">
                {products.length} pilihan varian tersedia
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowMenuModal(false);
                  onGoToOrder();
                }}
                className="py-2.5 px-4 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buka Form Pemesanan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
