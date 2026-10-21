'use client';

import React, { useState } from 'react';
import { X, Printer, Check, Copy, Share2, Download, Image as ImageIcon } from 'lucide-react';
import { Order } from '@/types';
import { printOrderReceipt, ReceiptWidth, shareReceiptImage } from '@/lib/thermalPrint';
import { formatRupiah } from '@/lib/hpp';
import { useAlert } from '@/components/ui/CustomAlert';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface ThermalReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThermalReceiptModal({ order, isOpen, onClose }: ThermalReceiptModalProps) {
  const { showToast, showAlert } = useAlert();
  const [width, setWidth] = useState<ReceiptWidth>('58mm');
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printOrderReceipt(order, { width });
    showToast('Membuka dialog pencetakan printer...', 'info');
  };

  const handleShareImage = async () => {
    setSharing(true);
    try {
      const res = await shareReceiptImage(order, width);
      if (res.success) {
        showToast(
          res.method === 'share'
            ? 'Struk siap dibagikan ke WhatsApp / Printer!'
            : 'Gambar struk berhasil diunduh (PNG)!',
          'success'
        );
      }
    } catch (err: any) {
      await showAlert({
        title: 'Gagal Membagikan Struk',
        message: err.message || 'Terjadi kesalahan saat membuat gambar struk.',
        type: 'error',
      });
    } finally {
      setSharing(false);
    }
  };

  const handleCopyText = () => {
    const textSummary = `
🧾 NOTA SENDOKECIL EST 2026
No: #${order.orderNumber}
Tanggal: ${order.orderDate}
Pelanggan: ${order.customerName}
${order.customerPhone ? `WhatsApp: ${order.customerPhone}` : ''}
Layanan: ${order.orderType === 'antar' ? `Delivery (${order.deliveryAddress || '-'})` : 'Ambil Sendiri'}
${order.deliveryTimeNote ? `Waktu: ${order.deliveryTimeNote}` : ''}
--------------------------------
${order.items.map((it) => `${it.productName}\n  ${formatRupiah(it.price)} x ${it.quantity} = ${formatRupiah(it.price * it.quantity)}`).join('\n')}
--------------------------------
Total: ${formatRupiah(order.totalAmount)} (${order.totalPcs} pcs)
Status: ${order.paymentStatus === 'lunas' ? 'LUNAS (APPROVED)' : 'MENUNGGU VERIFIKASI'}
--------------------------------
Simpan di kulkas agar tetap nikmat!
    `.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    showToast('Teks nota disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226] shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#3E271B] truncate">Cetak Struk Thermal</h3>
              <p className="text-[11px] sm:text-xs text-[#7C6353] truncate">Monokrom kasir 58mm / 80mm · Bagikan via WA</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper format selector */}
        <div className="my-2.5 sm:my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 bg-[#F6F0E6] p-2 sm:p-2.5 rounded-xl border border-[#E5DAC8] text-xs shrink-0">
          <span className="font-bold text-[#5A3E2C] pl-1">Format Lebar Kertas:</span>
          <div className="w-full sm:w-56">
            <CustomSelect
              value={width}
              onChange={(val) => setWidth(val as ReceiptWidth)}
              options={[
                { value: '58mm', label: '58 mm (Roll Standar)', badge: 'Umum' },
                { value: '80mm', label: '80 mm (Roll Lebar)' },
                { value: 'a4', label: 'A4 (Halaman Penuh)' },
              ]}
            />
          </div>
        </div>

        {/* Pure Monochrome Thermal Preview Paper (Real Black & White) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#EBE5DB] rounded-xl flex justify-center items-start">
          <div
            className={`bg-white shadow-md border border-neutral-300 p-4 sm:p-5 font-mono text-black text-xs transition-all select-text leading-tight w-full ${
              width === '58mm' ? 'max-w-[280px]' : width === '80mm' ? 'max-w-[340px]' : 'max-w-[420px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2">
              <div className="font-bold text-base tracking-widest uppercase">SENDOKECIL</div>
              <div className="text-[11px] text-black">EST 2026 · KUE GABIN FLA</div>
              <div className="text-[10px] text-black">WA: 0813 7749 3907</div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            <div className="flex justify-between text-[11px]">
              <span>NO: <b>#{order.orderNumber}</b></span>
              <span>{order.orderDate}</span>
            </div>
            <div className="flex justify-between text-[11px] mt-0.5">
              <span>PELANGGAN:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between text-[11px] mt-0.5">
                <span>WHATSAPP:</span>
                <span>{order.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] mt-0.5">
              <span>LAYANAN:</span>
              <span className="font-bold">{order.orderType === 'antar' ? 'DELIVERY' : 'PICKUP'}</span>
            </div>
            {order.orderType === 'antar' && order.deliveryAddress && (
              <div className="text-[10px] border border-black p-1.5 rounded mt-1.5">
                <div><b>TUJUAN:</b> {order.deliveryAddress}</div>
                {order.deliveryTimeNote && <div><b>WAKTU :</b> {order.deliveryTimeNote}</div>}
              </div>
            )}

            <div className="border-t border-dashed border-black my-2" />

            {/* Items */}
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-bold">{it.productName}</div>
                  <div className="flex justify-between text-black">
                    <span>{formatRupiah(it.price)} x {it.quantity}</span>
                    <span>{formatRupiah(it.price * it.quantity)}</span>
                  </div>
                  {it.notes && <div className="text-[10px] italic">- {it.notes}</div>}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            <div className="flex justify-between text-[11px]">
              <span>TOTAL ITEM:</span>
              <span>{order.totalPcs} pcs</span>
            </div>
            <div className="flex justify-between text-[11px] mt-0.5">
              <span>SUBTOTAL:</span>
              <span>{formatRupiah(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.deliveryFee ? (
              <div className="flex justify-between text-[11px] mt-0.5">
                <span>ONGKIR:</span>
                <span>{formatRupiah(order.deliveryFee)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-sm font-bold border-t-2 border-black pt-1.5 mt-1.5">
              <span>TOTAL</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            <div className="flex justify-between text-[11px]">
              <span>METODE:</span>
              <span>{order.paymentMethod === 'TF' ? 'TRANSFER BCA' : order.paymentMethod}</span>
            </div>
            <div className="text-center my-2.5">
              <span className="inline-block px-3 py-1 border border-black font-bold text-xs uppercase tracking-wider">
                {order.paymentStatus === 'lunas' ? '[ LUNAS / APPROVED ]' : '[ MENUNGGU KONFIRMASI ]'}
              </span>
            </div>

            <div className="text-center text-[10px] text-black mt-2 pt-2 border-t border-dashed border-black">
              Terima kasih atas pesanan Anda!<br />
              Simpan di kulkas agar lebih nikmat.<br />
              Instagram: @sendokecil
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3.5 border-t border-[#E8DEC8]">
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F7F2EA] text-[#5A3E2C] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Teks Nota'}
          </button>

          <button
            type="button"
            onClick={handleShareImage}
            disabled={sharing}
            className="py-2.5 px-4 rounded-xl border border-[#DCCBB8] bg-[#FAF5EC] hover:bg-[#F3ECE0] text-[#5A3E2C] font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            title="Bagikan ke WhatsApp, Bluetooth Print App, atau Simpan Gambar"
          >
            <Share2 className="w-4 h-4 text-[#8C5326]" />
            <span>{sharing ? 'Membuat Gambar...' : 'Bagikan Gambar Struk'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Printer className="w-4 h-4" />
            Cetak ke Printer
          </button>
        </div>
      </div>
    </div>
  );
}
