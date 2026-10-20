'use client';

import React, { useState } from 'react';
import { X, Printer, Check, Copy } from 'lucide-react';
import { Order } from '@/types';
import { printOrderReceipt, ReceiptWidth } from '@/lib/thermalPrint';
import { formatRupiah } from '@/lib/hpp';

interface ThermalReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThermalReceiptModal({ order, isOpen, onClose }: ThermalReceiptModalProps) {
  const [width, setWidth] = useState<ReceiptWidth>('58mm');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printOrderReceipt(order, { width });
  };

  const handleCopyText = () => {
    const textSummary = `
🧾 NOTA SENDOKECIL EST 2026
No: ${order.orderNumber}
Tanggal: ${order.orderDate}
Pelanggan: ${order.customerName}
${order.customerPhone ? `WA: ${order.customerPhone}` : ''}
Layanan: ${order.orderType === 'antar' ? `Antar (${order.deliveryAddress || '-'})` : 'Ambil di Tempat'}
${order.deliveryTimeNote ? `Waktu: ${order.deliveryTimeNote}` : ''}
--------------------------------
${order.items.map((it) => `${it.productName} x ${it.quantity} = ${formatRupiah(it.price * it.quantity)}`).join('\n')}
--------------------------------
Total: ${formatRupiah(order.totalAmount)} (${order.totalPcs} pcs)
Status: ${order.paymentStatus === 'lunas' ? 'LUNAS' : 'MENUNGGU VERIFIKASI'}
    `.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#3E271B]">Cetak Struk Thermal</h3>
              <p className="text-xs text-[#7C6353]">Printer kasir 58mm / 80mm / A4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper format selector */}
        <div className="my-4 flex items-center justify-between bg-[#F6F0E6] p-1.5 rounded-xl border border-[#E5DAC8]">
          <span className="text-xs font-semibold text-[#5A3E2C] pl-2">Ukuran Kertas:</span>
          <div className="flex gap-1">
            {(['58mm', '80mm', 'a4'] as ReceiptWidth[]).map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  width === w
                    ? 'bg-[#6B4226] text-white shadow-sm'
                    : 'text-[#5A3E2C] hover:bg-[#EFE5D5]'
                }`}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Receipt Preview Paper */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F2ECE4] rounded-xl flex justify-center">
          <div
            className={`bg-white shadow-md border border-[#E0D5C5] p-4 font-mono text-black text-xs transition-all ${
              width === '58mm' ? 'w-[280px]' : width === '80mm' ? 'w-[360px]' : 'w-[440px]'
            }`}
          >
            <div className="text-center pb-2">
              <div className="font-bold text-sm tracking-widest uppercase">SENDOKECIL</div>
              <div className="text-[10px] text-gray-500">EST 2026 · DESSERT BOX</div>
              <div className="text-[10px] text-gray-500">WA: 0813 7749 3907</div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[11px]">
              <span>No: <b>{order.orderNumber}</b></span>
              <span>{order.orderDate}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Pelanggan:</span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between text-[11px]">
                <span>WhatsApp:</span>
                <span>{order.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px]">
              <span>Layanan:</span>
              <span className="font-semibold">{order.orderType === 'antar' ? '🛵 Antar (Delivery)' : '🏪 Ambil Sendiri'}</span>
            </div>
            {order.orderType === 'antar' && order.deliveryAddress && (
              <div className="text-[10px] bg-amber-50/70 p-1 rounded mt-1 border border-amber-200/50">
                <b>Alamat:</b> {order.deliveryAddress}
                {order.deliveryTimeNote && <div><b>Waktu:</b> {order.deliveryTimeNote}</div>}
              </div>
            )}

            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Items */}
            <div className="space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-semibold">{it.productName}</div>
                  <div className="flex justify-between text-gray-600">
                    <span>{formatRupiah(it.price)} × {it.quantity}</span>
                    <span>{formatRupiah(it.price * it.quantity)}</span>
                  </div>
                  {it.notes && <div className="text-[10px] italic text-gray-500">- {it.notes}</div>}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[11px]">
              <span>Total Item:</span>
              <span>{order.totalPcs} pcs</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.deliveryFee ? (
              <div className="flex justify-between text-[11px]">
                <span>Ongkir:</span>
                <span>{formatRupiah(order.deliveryFee)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-sm font-bold border-t border-black pt-1 mt-1">
              <span>TOTAL</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            <div className="flex justify-between text-[11px]">
              <span>Metode:</span>
              <span>{order.paymentMethod === 'TF' ? 'Transfer BCA' : order.paymentMethod}</span>
            </div>
            <div className="text-center my-2">
              <span className="inline-block px-3 py-0.5 border border-black font-bold text-[10px] rounded uppercase">
                {order.paymentStatus === 'lunas' ? '✓ LUNAS' : 'MENUNGGU VERIFIKASI'}
              </span>
            </div>

            <div className="text-center text-[9px] text-gray-500 mt-3 pt-2 border-t border-dashed border-gray-300">
              Terima kasih! Simpan di kulkas agar tetap nikmat.<br />
              Instagram: @sendokecil
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 pt-4 border-t border-[#E8DEC8]">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F7F2EA] text-[#5A3E2C] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Teks Nota'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Printer className="w-4 h-4" />
            Cetak ke Printer
          </button>
        </div>
      </div>
    </div>
  );
}
