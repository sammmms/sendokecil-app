'use client';

import React, { useState } from 'react';
import { X, Tag, Heart, Printer, Scissors, Layers, Check } from 'lucide-react';
import { Order } from '@/types';
import { printSticker, StickerLayout, StickerType } from '@/lib/stickerPrint';

interface StickerPrintModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StickerPrintModal({ order, isOpen, onClose }: StickerPrintModalProps) {
  const [type, setType] = useState<StickerType>('shipping_label');
  const [layout, setLayout] = useState<StickerLayout>('single');
  const [headline, setHeadline] = useState('Special Sweet Treat ✨');
  const [recipient, setRecipient] = useState(order?.customerName || '');
  const [sender, setSender] = useState('SENDOKecil');
  const [message, setMessage] = useState('Semoga harimu semakin manis & berkesan bersama SENDOKecil!');

  // Sync recipient when order changes
  React.useEffect(() => {
    if (order) {
      setRecipient(order.customerName);
      if (order.greetingCard) {
        setHeadline('Special Message');
        setRecipient(order.greetingCard.recipientName || order.customerName);
        setSender(order.greetingCard.senderName || 'SENDOKecil');
        setMessage(order.greetingCard.message || message);
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printSticker(order, {
      type,
      layout,
      headline,
      recipient,
      sender,
      message,
    });
  };

  const itemsSummary = order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8] shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226] shrink-0">
              {type === 'shipping_label' ? <Tag className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base text-[#3E271B] truncate">Cetak Sticker & Kartu Ucapan</h3>
              <p className="text-[11px] sm:text-xs text-[#7C6353] truncate">Format label box (10×7.5cm) & kartu ucapan siap cetak</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition shrink-0 ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Toggles: Stack on Mobile, 2-cols on Tablet/Desktop */}
        <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
          {/* Format Type */}
          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold text-[#6B4226] mb-1 uppercase tracking-wider">
              1. Jenis Cetakan
            </span>
            <div className="flex bg-[#F6F0E6] p-1 rounded-xl border border-[#E5DAC8] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setType('shipping_label')}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  type === 'shipping_label'
                    ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                    : 'text-[#5A3E2C] hover:text-[#3E271B]'
                }`}
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Label Alamat Box</span>
              </button>
              <button
                type="button"
                onClick={() => setType('greeting_card')}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  type === 'greeting_card'
                    ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                    : 'text-[#5A3E2C] hover:text-[#3E271B]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Kartu Ucapan</span>
              </button>
            </div>
          </div>

          {/* Sheet Layout */}
          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold text-[#6B4226] mb-1 uppercase tracking-wider">
              2. Tata Letak Lembar
            </span>
            <div className="flex bg-[#F6F0E6] p-1 rounded-xl border border-[#E5DAC8] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLayout('single')}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  layout === 'single'
                    ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                    : 'text-[#5A3E2C] hover:text-[#3E271B]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">1 Lembar Tunggal</span>
              </button>
              <button
                type="button"
                onClick={() => setLayout('grid4')}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  layout === 'grid4'
                    ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                    : 'text-[#5A3E2C] hover:text-[#3E271B]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">4 Kartu / A4</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Inputs for Greeting Card (scrollable if needed) */}
        {type === 'greeting_card' && (
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#FAF5ED] p-3 rounded-xl border border-[#E8DFD3] text-xs shrink-0 max-h-48 overflow-y-auto">
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Judul / Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Kepada (To)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Dari (From)</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] transition"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#5A3E2C] mb-1">Isi Pesan Ucapan</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] transition resize-none"
              />
            </div>
          </div>
        )}

        {/* Live Preview Paper - Fully Mobile Responsive Width (w-full max-w-[340px]) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#F2ECE4] rounded-xl flex justify-center items-center min-h-[200px]">
          {type === 'shipping_label' ? (
            /* Shipping Label Preview */
            <div className="w-full max-w-[340px] bg-[#FFFAF5] border-2 border-[#4A2E1B] rounded-lg p-3 sm:p-3.5 shadow-md text-xs font-sans">
              <div className="text-[9px] text-gray-500 text-center mb-1 border-b border-dashed border-gray-300 pb-0.5">
                ✂ Garis Potong Label Box (10 × 7.5 cm) ✂
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm tracking-wide text-[#4A2E1B]">SENDOKecil</div>
                  <div className="text-[9px] text-[#7A583E]">EST 2026 · DESSERT BOX</div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#EFE7DC] text-[#4A2E1B] rounded">
                  {order.priority.toUpperCase()}
                </span>
              </div>

              <div className="border-t border-dashed border-[#D3C1B0] my-2" />

              <div>
                <div className="text-[9px] font-bold text-[#7A583E]">PENERIMA:</div>
                <div className="text-sm font-bold text-[#2D1E16]">{order.customerName}</div>
                {order.customerPhone && (
                  <div className="text-[11px] font-medium text-gray-700">📞 {order.customerPhone}</div>
                )}
                {order.orderType === 'antar' ? (
                  <div className="mt-1 p-1.5 bg-[#F5ECE1] rounded text-[11px]">
                    <div>📍 <b>Alamat:</b> {order.deliveryAddress || 'Belum diisi'}</div>
                    {order.deliveryTimeNote && (
                      <div className="text-[#8B3A1C] mt-0.5">⏰ <b>Waktu:</b> {order.deliveryTimeNote}</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 inline-block text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    🏪 AMBIL DI TEMPAT
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-[#D3C1B0] my-2" />

              <div>
                <div className="text-[9px] font-bold text-[#7A583E]">ISI PESANAN ({order.totalPcs} pcs):</div>
                <div className="text-[10px] font-semibold text-[#4A2E1B]">{itemsSummary}</div>
              </div>

              <div className="flex justify-between text-[9px] text-[#7A583E] mt-2 pt-1 border-t border-[#E5D5C5]">
                <span>No: <b>{order.orderNumber}</b></span>
                <span>Pengirim: <b>SENDOKecil</b></span>
              </div>
            </div>
          ) : (
            /* Greeting Card Preview */
            <div className="w-full max-w-[340px] bg-[#FCF9F2] border-2 border-[#8C5E38] rounded-lg p-3 sm:p-4 shadow-md text-xs relative font-sans text-center">
              <div className="text-[9px] text-gray-400 mb-1 border-b border-dashed border-gray-300 pb-0.5">
                ✂ Garis Potong Kartu (10 × 7 cm) ✂
              </div>
              <div className="text-[11px] text-[#A6754D] absolute top-2 left-2">❦</div>
              <div className="text-[11px] text-[#A6754D] absolute top-2 right-2">❧</div>

              <div className="font-serif font-bold text-base text-[#4A2E1B]">{headline}</div>
              <div className="text-[11px] text-[#63432B] mt-0.5">Untuk: <b>{recipient}</b></div>

              <div className="my-3 text-[11px] italic text-[#382417] leading-relaxed px-3">
                "{message}"
              </div>

              <div className="flex justify-between items-center text-[9px] border-t border-dashed border-[#D8C4B0] pt-1.5 mt-2">
                <span className="text-[#4A2E1B]">Dari: <b>{sender}</b></span>
                <span className="text-[#8C5E38] font-semibold">SENDOKecil · Sweet Moments</span>
              </div>

              <div className="text-[11px] text-[#A6754D] absolute bottom-2 left-2">❧</div>
              <div className="text-[11px] text-[#A6754D] absolute bottom-2 right-2">❦</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#E8DEC8] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F7F2EA] text-[#5A3E2C] font-semibold text-xs sm:text-sm transition shrink-0"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6B4226] hover:bg-[#54331C] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="truncate">Cetak Sekarang ({layout === 'grid4' ? '4 per Lembar' : 'Tunggal'})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
