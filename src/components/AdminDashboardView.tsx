'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Store,
  Printer,
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  Calculator,
  Download,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Database,
  Layers,
} from 'lucide-react';
import { HPPComponent, Order, Product } from '@/types';
import { formatNumber, formatRupiah } from '@/lib/hpp';
import { isSupabaseConfigured } from '@/lib/supabaseStorage';
import { ProofPreviewModal } from './ProofPreviewModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { StickerPrintModal } from './StickerPrintModal';
import { HppManagerModal } from './HppManagerModal';
import { NewOrderModal } from './NewOrderModal';
import { DeliveryRoutesView } from './DeliveryRoutesView';
import { ProductManagerModal } from './ProductManagerModal';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { useAlert } from '@/components/ui/CustomAlert';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Phone } from 'lucide-react';

interface AdminDashboardViewProps {
  orders: Order[];
  products: Product[];
  hppComponents: HPPComponent[];
  onRefresh: () => Promise<void>;
  onApproveOrder: (order: Order) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['fulfillmentStatus']) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onCreateOrder: (orderData: any) => Promise<void>;
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  onUpdateHppComponent: (comp: HPPComponent) => Promise<void>;
  onDeleteHppComponent: (id: string) => Promise<void>;
  onLogout: () => void;
  onSwitchToCustomer: () => void;
}

export function AdminDashboardView({
  orders,
  products,
  hppComponents,
  onRefresh,
  onApproveOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onCreateOrder,
  onSaveProduct,
  onDeleteProduct,
  onUpdateHppComponent,
  onDeleteHppComponent,
  onLogout,
  onSwitchToCustomer,
}: AdminDashboardViewProps) {
  const { showConfirm, showToast } = useAlert();
  const [activeTab, setActiveTab] = useState<'orders' | 'routes' | 'analytics'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [previewProofOrder, setPreviewProofOrder] = useState<Order | null>(null);
  const [printStrukOrder, setPrintStrukOrder] = useState<Order | null>(null);
  const [printStickerOrder, setPrintStickerOrder] = useState<Order | null>(null);
  const [showHppModal, setShowHppModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const supabaseConnected = isSupabaseConfigured();

  // Financial calculations
  const { totalOmset, totalHpp, netProfit, marginPct, totalPcs, variantBreakdown, pendingApprovalCount } =
    useMemo(() => {
      let omset = 0;
      let hpp = 0;
      let pcs = 0;
      let pendingCount = 0;
      const variants: { [name: string]: number } = {};

      for (const ord of orders) {
        if (ord.paymentStatus !== 'batal') {
          omset += ord.totalAmount;
          hpp += ord.totalHpp || 0;
          pcs += ord.totalPcs || 0;

          if (ord.paymentStatus === 'menunggu_konfirmasi') {
            pendingCount++;
          }

          for (const item of ord.items) {
            variants[item.productName] = (variants[item.productName] || 0) + item.quantity;
          }
        }
      }

      const profit = omset - hpp;
      const margin = omset > 0 ? Math.round((profit / omset) * 100) : 0;

      return {
        totalOmset: omset,
        totalHpp: hpp,
        netProfit: profit,
        marginPct: margin,
        totalPcs: pcs,
        variantBreakdown: variants,
        pendingApprovalCount: pendingCount,
      };
    }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search) ||
        o.deliveryAddress.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && o.paymentStatus === 'menunggu_konfirmasi') ||
        (statusFilter === 'lunas' && o.paymentStatus === 'lunas') ||
        (statusFilter === 'active' && o.fulfillmentStatus !== 'selesai');

      const matchType = typeFilter === 'all' || o.orderType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, search, statusFilter, typeFilter]);

  const handleExportCsv = () => {
    const headers = ['No. Order', 'Tanggal', 'Pelanggan', 'No WA', 'Tipe', 'Alamat', 'Item', 'Total Pcs', 'Total (Rp)', 'HPP (Rp)', 'Laba Bersih (Rp)', 'Status Bayar', 'Status Kirim'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.orderDate,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      o.orderType,
      `"${o.deliveryAddress || '-'}"`,
      `"${o.items.map((i) => `${i.quantity}x ${i.productName}`).join('; ')}"`,
      o.totalPcs,
      o.totalAmount,
      o.totalHpp,
      o.netProfit,
      o.paymentStatus,
      o.fulfillmentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_sendokecil_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 text-[#2D1E16]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E8DFC8] px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-banner.png" alt="SENDOKecil" className="h-9 object-contain" />
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF2E6] text-[#6B4226] border border-[#E8DFC8]">
              Dashboard Owner
            </span>
            <button
              onClick={() => setShowSupabaseModal(true)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                supabaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <Database className="w-3 h-3" />
              {supabaseConnected ? 'Supabase Terhubung' : 'Supabase Setup'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToCustomer}
              className="py-1.5 px-3 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Lihat Menu Customer
            </button>

            <button
              onClick={() => setShowProductModal(true)}
              className="py-1.5 px-3 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5" /> Kelola Produk
            </button>

            <button
              onClick={() => setShowNewOrderModal(true)}
              className="py-1.5 px-3 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> + Order Manual
            </button>

            <button
              onClick={onLogout}
              title="Keluar"
              className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Financial Metrics Cards (1:1 square tiles on phone) */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Omset Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#E8DFC8] shadow-xs aspect-square sm:aspect-auto flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#7A5B45] leading-tight">Total Omset</span>
              <div className="p-1.5 sm:p-2 bg-amber-50 rounded-xl text-[#8C5326] shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-2xl font-bold text-[#3E271B] leading-tight">{formatRupiah(totalOmset)}</div>
              <div className="text-[10px] sm:text-[11px] text-[#7C6353] mt-1">{orders.length} Transaksi</div>
            </div>
          </div>

          {/* HPP Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#E8DFC8] shadow-xs aspect-square sm:aspect-auto flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#7A5B45] leading-tight">Total HPP Bahan</span>
              <button
                type="button"
                onClick={() => setShowHppModal(true)}
                className="p-1.5 sm:p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition shrink-0"
                title="Kelola HPP"
              >
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div>
              <div className="text-base sm:text-2xl font-bold text-rose-700 leading-tight">{formatRupiah(totalHpp)}</div>
              <button
                type="button"
                onClick={() => setShowHppModal(true)}
                className="text-[10px] sm:text-[11px] text-[#8C5326] underline font-semibold mt-1 block"
              >
                Resep Terhitung
              </button>
            </div>
          </div>

          {/* Net Profit Card */}
          <div className="bg-emerald-50/70 p-3.5 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs aspect-square sm:aspect-auto flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-900 leading-tight">Penjualan Bersih</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-200 text-emerald-900 shrink-0">
                {marginPct}%
              </span>
            </div>
            <div>
              <div className="text-base sm:text-2xl font-bold text-emerald-900 leading-tight">{formatRupiah(netProfit)}</div>
              <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-1 font-medium">Laba Bersih</div>
            </div>
          </div>

          {/* Total Pcs Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#E8DFC8] shadow-xs aspect-square sm:aspect-auto flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#7A5B45] leading-tight">Total Gabin</span>
              <div className="p-1.5 sm:p-2 bg-[#FAF5EC] rounded-xl text-[#6B4226] shrink-0">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-2xl font-bold text-[#3E271B] leading-tight">
                {formatNumber(totalPcs)} <span className="text-xs font-normal text-gray-500">pcs</span>
              </div>
              <div className="text-[10px] text-[#7C6353] mt-1 truncate">
                {Object.keys(variantBreakdown).length} Varian
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-[#F0E6D8]">
            {/* Tabs */}
            <div className="flex bg-[#F6F0E6] p-1 rounded-xl border border-[#E5DAC8] text-xs font-semibold w-full md:w-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'orders' ? 'bg-[#6B4226] text-white shadow-sm' : 'text-[#5A3E2C]'
                }`}
              >
                <Package className="w-4 h-4" /> Semua Pesanan ({orders.length})
                {pendingApprovalCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                    {pendingApprovalCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('routes')}
                className={`py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'routes' ? 'bg-[#6B4226] text-white shadow-sm' : 'text-[#5A3E2C]'
                }`}
              >
                <Truck className="w-4 h-4" /> Peta & Rute Delivery
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => setShowProductModal(true)}
                className="py-2 px-3 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" /> Tambah / Edit Produk
              </button>

              <button
                onClick={() => setShowHppModal(true)}
                className="py-2 px-3 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Calculator className="w-3.5 h-3.5" /> Kelola HPP & Resep
              </button>

              <button
                onClick={handleExportCsv}
                className="py-2 px-3 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Excel/CSV
              </button>

              <button
                onClick={onRefresh}
                title="Refresh Data"
                className="p-2 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeTab === 'orders' ? (
            <>
              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nomor order, nama pelanggan, no WA, atau alamat pengantaran..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] text-xs text-[#3E271B] focus:outline-none focus:ring-1 focus:ring-[#8C5326]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="w-full sm:w-52">
                    <CustomSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { value: 'all', label: 'Semua Status Bayar' },
                        { value: 'pending', label: 'Menunggu Konfirmasi', badge: 'Pending', badgeColor: 'bg-amber-100 text-amber-800' },
                        { value: 'lunas', label: 'Lunas Disetujui', badge: 'Lunas', badgeColor: 'bg-emerald-100 text-emerald-800' },
                        { value: 'active', label: 'Sedang Aktif' },
                      ]}
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <CustomSelect
                      value={typeFilter}
                      onChange={setTypeFilter}
                      options={[
                        { value: 'all', label: 'Semua Layanan' },
                        { value: 'antar', label: '🛵 Delivery (Antar)' },
                        { value: 'ambil', label: '🏪 Pickup (Ambil)' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Orders Table (md and up) */}
              <div className="hidden md:block overflow-x-auto border border-[#E8DFC8] rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF4EB] text-[#5A3E2C] border-b border-[#E8DFC8] font-semibold">
                    <tr>
                      <th className="py-3 px-3">No. Order</th>
                      <th className="py-3 px-3">Pelanggan</th>
                      <th className="py-3 px-3">Layanan & Destinasi</th>
                      <th className="py-3 px-3">Varian Gabin</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-3 text-center">Bukti Bayar</th>
                      <th className="py-3 px-3 text-center">Status Bayar</th>
                      <th className="py-3 px-3 text-center">Pengiriman</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DC]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-400">
                          Tidak ada pesanan yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#FDFBF7] transition">
                          {/* Order ID */}
                          <td className="py-3 px-3 font-mono font-bold text-[#6B4226]">
                            {order.orderNumber}
                            <div className="text-[10px] text-gray-400 font-sans font-normal">{order.orderDate}</div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#3E271B]">{order.customerName}</div>
                            {order.customerPhone && (
                              <div className="text-[10px] text-gray-500 font-mono">{order.customerPhone}</div>
                            )}
                          </td>

                          {/* Delivery info */}
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="flex items-center gap-1 font-semibold text-[#5A3E2C]">
                              {order.orderType === 'antar' ? (
                                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <span>{order.orderType === 'antar' ? 'Antar' : 'Ambil Sendiri'}</span>
                            </div>
                            {order.deliveryAddress && (
                              <div className="text-[11px] text-gray-600 truncate mt-0.5">
                                {order.deliveryAddress}
                              </div>
                            )}
                            {order.deliveryTimeNote && (
                              <div className="text-[10px] text-amber-800 font-bold flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" /> {order.deliveryTimeNote}
                              </div>
                            )}
                          </td>

                          {/* Items */}
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="text-[11px] text-[#3E271B] font-medium truncate">
                              {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                            </div>
                            <div className="text-[10px] text-gray-400">{order.totalPcs} pcs Gabin</div>
                          </td>

                          {/* Total */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-[#3E271B]">{formatRupiah(order.totalAmount)}</div>
                            <div className="text-[10px] text-emerald-700">Untung: {formatRupiah(order.netProfit)}</div>
                          </td>

                          {/* Proof of payment */}
                          <td className="py-3 px-3 text-center">
                            {order.paymentProofUrl ? (
                              <button
                                onClick={() => setPreviewProofOrder(order)}
                                className="relative group inline-block"
                                title="Klik untuk lihat bukti transfer"
                              >
                                <img
                                  src={order.paymentProofUrl}
                                  alt="Bukti"
                                  className="w-9 h-9 object-cover rounded-lg border border-[#DCCBB8] group-hover:scale-105 transition"
                                />
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white">
                                  ✓
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                          </td>

                          {/* Payment status & One-click approve */}
                          <td className="py-3 px-3 text-center">
                            {order.paymentStatus === 'lunas' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ LUNAS
                              </span>
                            ) : (
                              <button
                                onClick={() => onApproveOrder(order)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-900 border border-amber-300 transition flex items-center justify-center gap-1 mx-auto"
                                title="Klik untuk Approve Pembayaran"
                              >
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                            )}
                          </td>

                          {/* Fulfillment status dropdown */}
                          <td className="py-3 px-3 text-center">
                            <div className="w-28 mx-auto">
                              <CustomSelect
                                value={order.fulfillmentStatus}
                                onChange={(val) => onUpdateOrderStatus(order.id, val as any)}
                                options={[
                                  { value: 'menunggu', label: 'Menunggu' },
                                  { value: 'diproses', label: 'Diproses', badge: 'Proses' },
                                  { value: 'siap', label: 'Siap', badge: 'Siap', badgeColor: 'bg-blue-100 text-blue-800' },
                                  { value: 'selesai', label: 'Selesai', badge: 'Done', badgeColor: 'bg-emerald-100 text-emerald-800' },
                                ]}
                              />
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setPrintStrukOrder(order)}
                                title="Cetak Struk Thermal"
                                className="p-1.5 rounded-lg border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setPrintStickerOrder(order)}
                                title="Cetak Sticker / Label Alamat"
                                className="p-1.5 rounded-lg border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={async () => {
                                  const confirmed = await showConfirm({
                                    title: 'Hapus Pesanan',
                                    message: `Yakin ingin menghapus pesanan #${order.orderNumber} atas nama ${order.customerName}?`,
                                    type: 'danger',
                                    confirmText: 'Ya, Hapus Pesanan',
                                    cancelText: 'Batal',
                                  });
                                  if (confirmed) {
                                    await onDeleteOrder(order.id);
                                    showToast(`Pesanan #${order.orderNumber} berhasil dihapus`, 'info');
                                  }
                                }}
                                title="Hapus Pesanan"
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Friendly Order Cards (under md screens) */}
              <div className="block md:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-[#E8DFC8]">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#E8DFC8] p-4 shadow-xs space-y-3"
                    >
                      {/* Card Header: Order #, Date, Status */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#6B4226]">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] text-gray-400">{order.orderDate}</span>
                        </div>
                        {order.paymentStatus === 'lunas' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ LUNAS
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onApproveOrder(order)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-900 border border-amber-300 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve Lunas
                          </button>
                        )}
                      </div>

                      {/* Customer & Contact */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#3E271B]">{order.customerName}</div>
                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-0.5 font-mono font-semibold"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          )}
                        </div>

                        {order.paymentProofUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewProofOrder(order)}
                            className="relative group shrink-0"
                            title="Lihat Bukti Transfer"
                          >
                            <img
                              src={order.paymentProofUrl}
                              alt="Bukti"
                              className="w-12 h-12 object-cover rounded-xl border border-[#DCCBB8] shadow-2xs"
                            />
                            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-[#6B4226] text-white text-[8px] font-bold rounded">
                              Bukti
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Delivery Details */}
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#5A3E2C]">
                          {order.orderType === 'antar' ? (
                            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span>{order.orderType === 'antar' ? 'Antar Kurir' : 'Ambil di Toko'}</span>
                        </div>
                        {order.deliveryAddress && (
                          <div className="text-[11px] text-[#3E271B] font-medium pl-5">
                            📍 {order.deliveryAddress}
                          </div>
                        )}
                        {order.deliveryTimeNote && (
                          <div className="text-[10px] text-amber-800 font-bold pl-5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Waktu: {order.deliveryTimeNote}
                          </div>
                        )}
                      </div>

                      {/* Items & Money */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <div className="text-[11px] text-[#3E271B] font-medium">
                            {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-gray-500">{order.totalPcs} pcs Gabin</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-[#3E271B]">{formatRupiah(order.totalAmount)}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Laba: {formatRupiah(order.netProfit)}
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Status + Actions Toolbar */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F2ECE4]">
                        <div className="w-36">
                          <CustomSelect
                            value={order.fulfillmentStatus}
                            onChange={(val) => onUpdateOrderStatus(order.id, val as any)}
                            options={[
                              { value: 'menunggu', label: 'Menunggu' },
                              { value: 'diproses', label: 'Diproses', badge: 'Proses' },
                              { value: 'siap', label: 'Siap', badge: 'Siap', badgeColor: 'bg-blue-100 text-blue-800' },
                              { value: 'selesai', label: 'Selesai', badge: 'Done', badgeColor: 'bg-emerald-100 text-emerald-800' },
                            ]}
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPrintStrukOrder(order)}
                            title="Cetak Struk Thermal"
                            className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintStickerOrder(order)}
                            title="Cetak Sticker / Label Alamat"
                            className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                          >
                            <Tag className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Hapus Pesanan',
                                message: `Yakin ingin menghapus pesanan #${order.orderNumber} atas nama ${order.customerName}?`,
                                type: 'danger',
                                confirmText: 'Ya, Hapus Pesanan',
                                cancelText: 'Batal',
                              });
                              if (confirmed) {
                                await onDeleteOrder(order.id);
                                showToast(`Pesanan #${order.orderNumber} berhasil dihapus`, 'info');
                              }
                            }}
                            title="Hapus Pesanan"
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Tab 2: Delivery Routes View */
            <DeliveryRoutesView
              orders={orders}
              onUpdateStatus={onUpdateOrderStatus}
              onPrintStruk={(ord) => setPrintStrukOrder(ord)}
              onPrintSticker={(ord) => setPrintStickerOrder(ord)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <ProofPreviewModal
        order={previewProofOrder}
        isOpen={!!previewProofOrder}
        onClose={() => setPreviewProofOrder(null)}
        onApprove={async (ord) => {
          await onApproveOrder(ord);
          setPreviewProofOrder(null);
        }}
      />

      <ThermalReceiptModal
        order={printStrukOrder}
        isOpen={!!printStrukOrder}
        onClose={() => setPrintStrukOrder(null)}
      />

      <StickerPrintModal
        order={printStickerOrder}
        isOpen={!!printStickerOrder}
        onClose={() => setPrintStickerOrder(null)}
      />

      <HppManagerModal
        isOpen={showHppModal}
        onClose={() => setShowHppModal(false)}
        products={products}
        components={hppComponents}
        onUpdateComponent={onUpdateHppComponent}
        onDeleteComponent={onDeleteHppComponent}
        onReload={onRefresh}
      />

      <ProductManagerModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        onSaveProduct={onSaveProduct}
        onDeleteProduct={onDeleteProduct}
        onReload={onRefresh}
      />

      <SupabaseSetupModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        orders={orders}
        products={products}
        onRefresh={onRefresh}
      />

      <NewOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        products={products}
        onSubmit={onCreateOrder}
      />

      {/* Floating Action Button for Manual Order (Mobile, Tablet, & Desktop) */}
      <button
        type="button"
        onClick={() => setShowNewOrderModal(true)}
        aria-label="Tambah Pesanan Baru"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 py-3.5 px-5 rounded-full bg-[#6B4226] hover:bg-[#54331C] active:scale-95 text-white font-bold text-xs md:text-sm shadow-2xl flex items-center gap-2.5 transition-all duration-200 border-2 border-white/20 group cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <span className="tracking-wide">Pesanan Baru</span>
      </button>
    </div>
  );
}
