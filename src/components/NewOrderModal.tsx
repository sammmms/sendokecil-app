'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, Truck, Store, AlertCircle } from 'lucide-react';
import { Order, OrderItem, OrderPriority, OrderType, PaymentMethod, PaymentStatus, Product } from '@/types';
import { POPULAR_LOCATIONS } from '@/lib/constants';
import { formatRupiah } from '@/lib/hpp';
import { useAlert } from '@/components/ui/CustomAlert';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (orderData: any) => Promise<void>;
}

export function NewOrderModal({ isOpen, onClose, products, onSubmit }: NewOrderModalProps) {
  const { showToast } = useAlert();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('antar');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTimeNote, setDeliveryTimeNote] = useState('');
  const [priority, setPriority] = useState<OrderPriority>('normal');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TF');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [customerNotes, setCustomerNotes] = useState('');

  // Cart items
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    'choco-oreo': 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQtyChange = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return updated;
    });
  };

  const orderItems: OrderItem[] = Object.entries(cart)
    .map(([pId, qty]) => {
      const prod = products.find((p) => p.id === pId);
      if (!prod || qty <= 0) return null;
      return {
        productId: prod.id,
        productName: prod.name,
        price: prod.price,
        quantity: qty,
        calculatedHpp: prod.recipe ? 9650 : undefined,
      };
    })
    .filter(Boolean) as OrderItem[];

  const totalPcs = orderItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalAmount = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    if (orderItems.length === 0) {
      setError('Pilih minimal 1 produk.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === 'antar' ? deliveryAddress.trim() : '',
        deliveryTimeNote: deliveryTimeNote.trim(),
        priority,
        items: orderItems,
        totalPcs,
        subtotal,
        deliveryFee: 0,
        totalAmount,
        paymentMethod,
        paymentStatus,
        customerNotes: customerNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#3E271B]">Input Pesanan Baru (Manual)</h3>
              <p className="text-xs text-[#7C6353]">Tambah pesanan pelanggan offline, WA, atau telepon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1.5 py-3 text-xs">
          {/* Customer info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Nama Pelanggan *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Megawati, Ellyn"
                className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 0821 6568 9508"
                className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
              />
            </div>
          </div>

          {/* Delivery / Pickup Toggle */}
          <div>
            <label className="block font-semibold text-[#5A3E2C] mb-1.5">Metode Pengiriman</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('antar')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition ${
                  orderType === 'antar'
                    ? 'bg-[#6B4226] text-white border-[#6B4226] shadow-sm'
                    : 'bg-white border-[#DCCBB8] text-[#5A3E2C]'
                }`}
              >
                <Truck className="w-4 h-4" /> Antar (Delivery)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('ambil')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition ${
                  orderType === 'ambil'
                    ? 'bg-[#6B4226] text-white border-[#6B4226] shadow-sm'
                    : 'bg-white border-[#DCCBB8] text-[#5A3E2C]'
                }`}
              >
                <Store className="w-4 h-4" /> Ambil Sendiri (Pickup)
              </button>
            </div>
          </div>

          {orderType === 'antar' && (
            <div className="space-y-2 p-3 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3]">
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Alamat / Lokasi Pengantaran</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Contoh: ASMEG, STMB, Jl. Zein Hamid..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                />
              </div>

              {/* Popular quick chips */}
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-gray-500 py-0.5">Pilihan cepat:</span>
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setDeliveryAddress(loc)}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-white border border-[#DCCBB8] text-[#5A3E2C] hover:bg-[#F0E6D8]"
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Catatan Waktu / Instruksi Pengantaran</label>
                <input
                  type="text"
                  value={deliveryTimeNote}
                  onChange={(e) => setDeliveryTimeNote(e.target.value)}
                  placeholder="Contoh: Jam 4 Sore, Titip Kibo, Titip ke Satpam"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Product selection */}
          <div>
            <label className="block font-semibold text-[#5A3E2C] mb-2">Pilih Varian & Jumlah</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {products.map((p) => {
                const qty = cart[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#E8DFC8] bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#3E271B]">{p.name}</div>
                      <div className="text-[11px] text-[#7C6353]">{formatRupiah(p.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#F5ECE0] text-[#5A3E2C] font-bold flex items-center justify-center hover:bg-[#EAE0D2]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-[#3E271B]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#6B4226] text-white font-bold flex items-center justify-center hover:bg-[#54331C]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Priority Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Prioritas Pesanan</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
              >
                <option value="normal">Normal</option>
                <option value="high">Prioritas Tinggi (Jam Tertentu)</option>
                <option value="urgent">Mendesak / Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Metode Bayar</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
              >
                <option value="TF">Transfer BCA</option>
                <option value="CASH">Tunai (Cash)</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
              >
                <option value="lunas">LUNAS (Disetujui)</option>
                <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                <option value="menunggu_pembayaran">Belum Bayar</option>
              </select>
            </div>
          </div>

          {/* Total summary */}
          <div className="p-3 bg-[#FAF4EA] rounded-xl border border-[#E8DFC8] flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#7A5B45]">Total Pesanan:</div>
              <div className="font-semibold text-[#5A3E2C]">{totalPcs} pcs dessert</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#7A5B45]">Total Tagihan:</div>
              <div className="text-lg font-bold text-[#3E271B]">{formatRupiah(totalAmount)}</div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex gap-2 pt-2 border-t border-[#E8DEC8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#DCCBB8] bg-white text-[#5A3E2C] font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pesanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
