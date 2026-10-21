'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, ExternalLink, Download } from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/hpp';

interface ProofPreviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (order: Order) => void;
}

export function ProofPreviewModal({ order, isOpen, onClose, onApprove }: ProofPreviewModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8] shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#3E271B] truncate">Bukti Pembayaran</h3>
            <p className="text-[11px] sm:text-xs text-[#7C6353] truncate">
              Pesanan #{order.orderNumber} · {order.customerName}
            </p>
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

        {/* Order amount highlight */}
        <div className="my-2.5 sm:my-3 p-3 bg-[#FAF4EA] rounded-xl border border-[#E8DFC8] flex items-center justify-between gap-2 shrink-0">
          <div>
            <div className="text-[10px] sm:text-[11px] text-[#7A5B45]">Total Tagihan yang Harus Ditransfer:</div>
            <div className="text-base sm:text-lg font-bold text-[#3E271B]">{formatRupiah(order.totalAmount)}</div>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg ${
                order.paymentStatus === 'lunas'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.paymentStatus === 'lunas' ? 'Sudah Disetujui' : 'Menunggu Approval'}
            </span>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-2 bg-[#1A1410] rounded-xl flex items-center justify-center min-h-[220px]">
          {order.paymentProofUrl ? (
            <img
              src={order.paymentProofUrl}
              alt="Bukti Transfer"
              className="max-h-[50vh] max-w-full object-contain rounded shadow"
            />
          ) : (
            <div className="text-center text-stone-400 p-6 sm:p-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-80" />
              <p className="text-sm font-semibold">Bukti transfer belum diunggah</p>
              <p className="text-xs text-stone-500 mt-1">Customer belum melampirkan screenshot pembayaran.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-[#E8DEC8] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F7F2EA] text-[#5A3E2C] font-semibold text-xs transition"
          >
            Tutup
          </button>
          {order.paymentStatus !== 'lunas' && (
            <button
              type="button"
              onClick={() => {
                onApprove(order);
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Setujui Pembayaran (LUNAS)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
