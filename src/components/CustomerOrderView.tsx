'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Truck,
  Store,
  QrCode,
  Copy,
  Check,
  Upload,
  Clipboard,
  X,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Heart,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Order, OrderItem, OrderType, Product, StoreConfig } from '@/types';
import { POPULAR_LOCATIONS, STORE_CONFIG } from '@/lib/constants';
import { formatRupiah } from '@/lib/hpp';
import { printOrderReceipt } from '@/lib/thermalPrint';

interface CustomerOrderViewProps {
  products: Product[];
  onOrderPlaced?: (order: Order) => void;
  onOpenOwnerLogin: () => void;
}

export function CustomerOrderView({ products, onOrderPlaced, onOpenOwnerLogin }: CustomerOrderViewProps) {
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('antar');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTimeNote, setDeliveryTimeNote] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Cart: { productId: quantity }
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    'choco-oreo': 1,
  });

  // Payment states
  const [markedPaid, setMarkedPaid] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Greeting card add-on
  const [showGreetingCard, setShowGreetingCard] = useState(false);
  const [cardTo, setCardTo] = useState('');
  const [cardFrom, setCardFrom] = useState('');
  const [cardMessage, setCardMessage] = useState('Selamat menikmati sweet treat ini! ✨');

  // QR Code data URL
  const [qrisQrUrl, setQrisQrUrl] = useState<string>('');

  // Submitted order tracking state
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QRIS QR code
  useEffect(() => {
    // Generate valid scannable QR code string representation
    const qrisData = `00020101021126600016ID.CO.BCA.WWW0118936000000000000000021579855662240303UME51440014ID.LINKAJA.WWW0118936000000000000000021579855662240303UME5204581453033605802ID5910SENDOKECIL6005MEDAN6304`;
    QRCode.toDataURL(qrisData, {
      width: 320,
      margin: 1,
      color: {
        dark: '#3E271B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrisQrUrl(url))
      .catch((err) => console.error('Failed generating QR code:', err));
  }, []);

  // Global clipboard paste listener for payment screenshot
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleImageBlob(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageBlob = (blob: Blob) => {
    setUploadingProof(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setProofImage(base64Data);
      setMarkedPaid(true);

      // Upload to server
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data }),
        });
        const json = await res.json();
        if (json.success && json.url) {
          setProofImage(json.url);
        }
      } catch (err) {
        console.error('Server upload failed, using local dataUrl:', err);
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert('Browser Anda memerlukan izin clipboard. Anda juga bisa langsung tekan Ctrl+V / Cmd+V atau pilih dari galeri.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          handleImageBlob(blob);
          return;
        }
      }
      alert('Tidak ditemukan gambar di clipboard Anda. Silakan copy/screenshot bukti bayar terlebih dahulu.');
    } catch (err) {
      alert('Gunakan tombol "Pilih dari Galeri" atau tekan Ctrl+V / Cmd+V.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageBlob(file);
    }
  };

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

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(STORE_CONFIG.bcaAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Cart calculations
  const orderItems: OrderItem[] = Object.entries(cart)
    .map(([pId, qty]) => {
      const prod = products.find((p) => p.id === pId);
      if (!prod || qty <= 0) return null;
      return {
        productId: prod.id,
        productName: prod.name,
        price: prod.price,
        quantity: qty,
      };
    })
    .filter(Boolean) as OrderItem[];

  const totalPcs = orderItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalAmount = subtotal;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Silakan isi Nama Pemesan.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Silakan isi No. WhatsApp agar kami bisa menghubungi Anda.');
      return;
    }
    if (orderType === 'antar' && !deliveryAddress.trim()) {
      setErrorMessage('Silakan isi Alamat / Lokasi Pengantaran.');
      return;
    }
    if (orderItems.length === 0) {
      setErrorMessage('Keranjang Anda masih kosong. Pilih minimal 1 dessert.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === 'antar' ? deliveryAddress.trim() : '',
        deliveryTimeNote: deliveryTimeNote.trim(),
        priority: deliveryTimeNote ? 'high' : 'normal',
        items: orderItems,
        totalPcs,
        subtotal,
        deliveryFee: 0,
        totalAmount,
        paymentMethod: 'TF',
        paymentStatus: proofImage ? 'menunggu_konfirmasi' : 'menunggu_pembayaran',
        paymentProofUrl: proofImage || '',
        customerNotes: customerNotes.trim(),
        greetingCard: showGreetingCard
          ? {
              recipientName: cardTo || customerName,
              senderName: cardFrom || 'SENDOKecil',
              message: cardMessage,
            }
          : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Gagal mengirim pesanan');
      }

      // Celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8C5326', '#E8C89A', '#3E271B', '#2E6B4F'],
      });

      setSubmittedOrder(json.data);
      if (onOrderPlaced) {
        onOrderPlaced(json.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- TRACKING VIEW IF ORDER IS SUBMITTED ---------------- //
  if (submittedOrder) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#FAF7F2] p-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Logo & Confirmation Card */}
          <div className="text-center pt-4 pb-2">
            <img
              src="/logo-banner.png"
              alt="SENDOKecil EST 2026"
              className="h-14 mx-auto object-contain mb-2"
            />
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#3E271B]">Pesanan Berhasil Dikirim!</h2>
            <p className="text-xs text-[#7C6353] mt-1">
              Terima kasih, <b>{submittedOrder.customerName}</b>. Pesanan Anda telah tercatat di sistem SENDOKecil.
            </p>
          </div>

          {/* Tracking Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
              <div>
                <div className="text-[10px] text-[#7A5B45] font-semibold uppercase tracking-wider">Nomor Pesanan</div>
                <div className="text-lg font-bold font-mono text-[#3E271B]">{submittedOrder.orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#7A5B45] font-semibold uppercase tracking-wider">Status Bayar</div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    submittedOrder.paymentStatus === 'lunas'
                      ? 'bg-emerald-100 text-emerald-800'
                      : submittedOrder.paymentProofUrl
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {submittedOrder.paymentStatus === 'lunas'
                    ? '✓ Lunas'
                    : submittedOrder.paymentProofUrl
                    ? '⏳ Menunggu Konfirmasi Admin'
                    : 'Belum Bayar'}
                </span>
              </div>
            </div>

            {/* Live Progress Stepper */}
            <div className="space-y-3 py-1">
              <div className="text-xs font-bold text-[#5A3E2C]">Alur Proses Pesanan:</div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#3E271B]">Pesanan Diterima</div>
                    <div className="text-[11px] text-gray-500">Rincian pesanan sudah tersimpan di database toko</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      submittedOrder.paymentStatus === 'lunas'
                        ? 'bg-emerald-600 text-white'
                        : submittedOrder.paymentProofUrl
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    2
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#3E271B]">Verifikasi Pembayaran</div>
                    <div className="text-[11px] text-gray-500">
                      {submittedOrder.paymentStatus === 'lunas'
                        ? 'Pembayaran telah disetujui oleh Owner'
                        : submittedOrder.paymentProofUrl
                        ? 'Bukti transfer sedang diperiksa oleh admin'
                        : 'Menunggu transfer dan lampiran bukti bayar'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      submittedOrder.fulfillmentStatus === 'diproses' || submittedOrder.fulfillmentStatus === 'siap' || submittedOrder.fulfillmentStatus === 'selesai'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    3
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#3E271B]">Persiapan & Pengemasan</div>
                    <div className="text-[11px] text-gray-500">
                      {submittedOrder.orderType === 'antar' ? 'Dessert dipersiapkan & dipacking untuk kurir' : 'Dessert disiapkan untuk pengambilan'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      submittedOrder.fulfillmentStatus === 'selesai'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    4
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#3E271B]">
                      {submittedOrder.orderType === 'antar' ? 'Pengantaran Selesai 🛵' : 'Siap Diambil 🏪'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items summary */}
            <div className="p-3 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3] text-xs space-y-1.5">
              <div className="font-bold text-[#5A3E2C] mb-1">Rincian Item:</div>
              {submittedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.productName}</span>
                  <span className="font-semibold">{formatRupiah(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-[#E5DAC8] pt-1.5 mt-1 flex justify-between font-bold text-[#3E271B] text-sm">
                <span>Total ({submittedOrder.totalPcs} pcs)</span>
                <span>{formatRupiah(submittedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Delivery address info */}
            {submittedOrder.orderType === 'antar' && (
              <div className="text-xs p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-1">
                <div className="font-bold text-[#5A3E2C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8C5326]" /> Alamat Pengantaran:
                </div>
                <div className="text-[#3E271B] font-medium">{submittedOrder.deliveryAddress}</div>
                {submittedOrder.deliveryTimeNote && (
                  <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" /> Waktu: {submittedOrder.deliveryTimeNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-4">
          <button
            onClick={() => printOrderReceipt(submittedOrder)}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#DCCBB8] hover:bg-[#F5ECE0] text-[#5A3E2C] font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Cetak Nota Pembelian
          </button>

          <a
            href={`https://wa.me/${STORE_CONFIG.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Halo SENDOKecil, saya ingin konfirmasi pesanan #${submittedOrder.orderNumber} atas nama ${submittedOrder.customerName}. Terima kasih!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Phone className="w-4 h-4" /> Konfirmasi ke WhatsApp Toko
          </a>

          <button
            onClick={() => {
              setSubmittedOrder(null);
              setCart({ 'choco-oreo': 1 });
              setProofImage(null);
              setMarkedPaid(false);
            }}
            className="w-full py-2.5 text-center text-xs text-[#7A5B45] hover:text-[#3E271B] underline font-medium"
          >
            Pesan Lagi / Buat Pesanan Baru
          </button>
        </div>
      </div>
    );
  }

  // ---------------- ORDER CREATION FORM VIEW ---------------- //
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAF7F2] pb-24 text-[#2D1E16]">
      {/* Brand Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8DEC8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/icon.png" alt="SENDOKecil" className="w-9 h-9 rounded-full object-cover shadow-sm border border-[#E0D0BE]" />
          <div>
            <h1 className="font-serif font-bold text-base tracking-wide text-[#3E271B]">SENDOKecil</h1>
            <p className="text-[10px] text-[#7C6353] font-medium leading-tight">EST 2026 · Dessert & Sweet Moments</p>
          </div>
        </div>

        <button
          onClick={onOpenOwnerLogin}
          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#EFE7DC] hover:bg-[#E5D8C7] text-[#5A3E2C] border border-[#DCCBB8] transition"
        >
          Login Owner
        </button>
      </header>

      {/* Hero Banner with Logo */}
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="relative rounded-2xl bg-[#FFFDF9] border border-[#EAE0D2] p-4 shadow-sm overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#F3ECE0] rounded-full opacity-60" />
          <img src="/logo-banner.png" alt="SENDOKecil EST 2026" className="h-14 mx-auto object-contain mb-1" />
          <p className="text-xs text-[#7A5B45] font-serif italic">
            "Pesan mudah, bayar cepat, nikmati dessert lumer istimewa"
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-4 my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="px-4 space-y-4 pt-2">
        {/* Delivery / Pickup Segmented Control */}
        <div className="bg-[#EFE7DC] p-1 rounded-xl border border-[#DCCBB8] grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOrderType('antar')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              orderType === 'antar'
                ? 'bg-[#6B4226] text-white shadow-sm'
                : 'text-[#5A3E2C] hover:bg-[#E5D8C7]'
            }`}
          >
            <Truck className="w-4 h-4" /> 🛵 Antar (Delivery)
          </button>
          <button
            type="button"
            onClick={() => setOrderType('ambil')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              orderType === 'ambil'
                ? 'bg-[#6B4226] text-white shadow-sm'
                : 'text-[#5A3E2C] hover:bg-[#E5D8C7]'
            }`}
          >
            <Store className="w-4 h-4" /> 🏪 Ambil Sendiri
          </button>
        </div>

        {/* Customer Information Card */}
        <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#E8DFC8] shadow-sm space-y-3 text-xs">
          <div className="font-bold text-sm text-[#3E271B] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8C5326]" /> Data Pemesan
          </div>

          <div>
            <label className="block font-semibold text-[#5A3E2C] mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda (contoh: Megawati, Ellyn)"
              className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-1 focus:ring-[#8C5326]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5A3E2C] mb-1">No. WhatsApp Aktif *</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0812 3456 7890"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-1 focus:ring-[#8C5326]"
              />
            </div>
          </div>

          {orderType === 'antar' ? (
            <div className="space-y-2 pt-1 border-t border-[#F2ECE4]">
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Alamat / Lokasi Pengantaran *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Contoh: ASMEG, STMB, Jl. Zein Hamid No. 25..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-1 focus:ring-[#8C5326]"
                />
              </div>

              {/* Quick location chips */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1">Pilihan Cepat Lokasi Populer:</div>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setDeliveryAddress(loc)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition ${
                        deliveryAddress === loc
                          ? 'bg-[#6B4226] text-white border-[#6B4226]'
                          : 'bg-white border-[#DCCBB8] text-[#5A3E2C] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Catatan Waktu Pengantaran</label>
                <input
                  type="text"
                  value={deliveryTimeNote}
                  onChange={(e) => setDeliveryTimeNote(e.target.value)}
                  placeholder="Contoh: Jam 4 Sore, Titip Kibo, Titip ke Satpam"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-1 focus:ring-[#8C5326]"
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#FAF5EC] border border-[#E8DFD3] text-[11px] text-[#5A3E2C]">
              📍 <b>Lokasi Pengambilan:</b> Toko SENDOKecil Medan · Buka setiap hari jam 09.00 - 18.00 WIB.
            </div>
          )}
        </div>

        {/* Menu Catalog Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif font-bold text-base text-[#3E271B]">Pilih Menu Dessert</h3>
            <span className="text-[11px] text-[#7C6353]">{products.length} Varian Tersedia</span>
          </div>

          <div className="space-y-2.5">
            {products.map((product) => {
              const qty = cart[product.id] || 0;
              return (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-2xl border transition bg-[#FFFDF9] shadow-sm flex items-center justify-between gap-3 ${
                    qty > 0 ? 'border-[#8C5326] ring-1 ring-[#8C5326]/30' : 'border-[#E8DFC8]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-[#3E271B]">{product.name}</h4>
                      {product.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF2E6] text-[#7A4B27] border border-[#E2D2BE]">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7C6353] line-clamp-1 mt-0.5">{product.tagline}</p>
                    <div className="font-bold text-sm text-[#6B4226] mt-1">{formatRupiah(product.price)}</div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 shrink-0 bg-[#F5ECE0] p-1 rounded-xl border border-[#E0D0BE]">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-[#5A3E2C] font-bold text-sm flex items-center justify-center hover:bg-[#EFE5D5] transition shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-[#3E271B]">{qty}</span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-[#6B4226] text-white font-bold text-sm flex items-center justify-center hover:bg-[#54331C] transition shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Greeting Card Checkbox */}
        <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#E8DFC8] shadow-sm space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGreetingCard}
              onChange={(e) => setShowGreetingCard(e.target.checked)}
              className="w-4 h-4 rounded text-[#6B4226] focus:ring-[#8C5326]"
            />
            <span className="font-bold text-[#3E271B] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-600" /> Tambah Kartu Ucapan (Gift / Hadiah)
            </span>
          </label>

          {showGreetingCard && (
            <div className="pt-2 space-y-2 border-t border-[#F2ECE4] animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#5A3E2C] mb-0.5">Kepada (To)</label>
                  <input
                    type="text"
                    value={cardTo}
                    onChange={(e) => setCardTo(e.target.value)}
                    placeholder="Nama penerima"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5A3E2C] mb-0.5">Dari (From)</label>
                  <input
                    type="text"
                    value={cardFrom}
                    onChange={(e) => setCardFrom(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#5A3E2C] mb-0.5">Pesan Ucapan</label>
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment & QR Section */}
        <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#E8DFC8] shadow-sm space-y-3 text-xs">
          <div className="font-bold text-sm text-[#3E271B] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#8C5326]" /> Pembayaran Transfer / QRIS
            </span>
            <span className="text-base font-bold text-[#6B4226]">{formatRupiah(totalAmount)}</span>
          </div>

          {/* BCA Transfer Box */}
          <div className="p-3 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#7A5B45] font-semibold">Transfer Bank BCA</div>
              <div className="text-sm font-bold font-mono text-[#3E271B] tracking-wider mt-0.5">
                {STORE_CONFIG.bcaAccount}
              </div>
              <div className="text-[11px] text-[#5A3E2C]">a/n {STORE_CONFIG.bcaHolder}</div>
            </div>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="py-1.5 px-3 bg-white border border-[#DCCBB8] rounded-lg font-semibold text-xs text-[#5A3E2C] hover:bg-[#F3ECE0] flex items-center gap-1 shadow-xs transition"
            >
              {copiedAccount ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAccount ? 'Tersalin' : 'Salin Rekening'}
            </button>
          </div>

          {/* QRIS Code */}
          {qrisQrUrl && (
            <div className="text-center p-3 bg-white rounded-xl border border-[#E8DFC8]">
              <div className="text-[11px] font-semibold text-[#5A3E2C] mb-1.5">
                Atau Scan QRIS (Semua E-Wallet & Mobile Banking):
              </div>
              <img
                src={qrisQrUrl}
                alt="QRIS SENDOKECIL"
                className="w-44 h-44 mx-auto rounded-lg shadow-sm border border-[#EFE7DC]"
              />
              <div className="text-[10px] text-gray-500 mt-1">BCA · GoPay · OVO · ShopeePay · Dana · Livin</div>
            </div>
          )}

          {/* Proof of Payment Upload / Paste */}
          <div className="pt-2 border-t border-[#F2ECE4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3E271B]">Lampirkan Bukti Bayar:</span>
              <span className="text-[10px] text-gray-500">Bisa paste / galeri</span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            {proofImage ? (
              <div className="relative p-2 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3] flex items-center gap-3">
                <img
                  src={proofImage}
                  alt="Bukti Bayar"
                  className="w-16 h-16 object-cover rounded-lg border border-[#DCCBB8]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bukti Terpasang
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Siap diverifikasi oleh owner toko</div>
                </div>
                <button
                  type="button"
                  onClick={() => setProofImage(null)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="py-2.5 px-3 rounded-xl border border-dashed border-[#8C5326] bg-[#FAF5EC] hover:bg-[#F3EAE0] text-[#5A3E2C] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Clipboard className="w-4 h-4 text-[#8C5326]" /> Paste Clipboard
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#FAF8F5] text-[#5A3E2C] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4" /> Pilih dari Galeri
                </button>
              </div>
            )}
            <div className="text-[10px] text-gray-400 italic">
              Tip: Setelah screenshot di m-Banking, cukup tekan tombol <b>Paste Clipboard</b> atau Ctrl+V.
            </div>
          </div>
        </div>

        {/* Floating / Sticky Bottom Bar with Order Summary and Submit */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8DEC8] p-3">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-[#7A5B45]">Total ({totalPcs} pcs):</div>
              <div className="text-base font-bold text-[#3E271B] leading-tight">{formatRupiah(totalAmount)}</div>
            </div>

            <button
              type="submit"
              disabled={submitting || totalPcs === 0}
              className="py-3 px-6 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {submitting ? 'Memproses...' : 'Kirim Pesanan Sekarang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
