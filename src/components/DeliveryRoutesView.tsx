'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Truck,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Tag,
  Phone,
  Search,
  CheckCircle,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/hpp';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface DeliveryRoutesViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['fulfillmentStatus']) => Promise<void>;
  onPrintStruk: (order: Order) => void;
  onPrintSticker: (order: Order) => void;
  onApproveOrder?: (order: Order) => Promise<void>;
  onPreviewProof?: (order: Order) => void;
}

export function DeliveryRoutesView({
  orders,
  onUpdateStatus,
  onPrintStruk,
  onPrintSticker,
  onApproveOrder,
  onPreviewProof,
}: DeliveryRoutesViewProps) {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortDestinationsBy, setSortDestinationsBy] = useState<
    'priority' | 'orders_desc' | 'pcs_desc' | 'name_asc'
  >('priority');
  const [copied, setCopied] = useState(false);

  // Group delivery orders by destination
  const { groupedDestinations, pickupOrders, totalDeliveryPcs, priorityCount } = useMemo(() => {
    const deliveryList = orders.filter((o) => o.orderType === 'antar');
    const pickupList = orders.filter((o) => o.orderType === 'ambil');

    let pCount = 0;
    let delivPcs = 0;

    const groupMap = new Map<string, Order[]>();

    for (const ord of deliveryList) {
      if (ord.priority === 'urgent' || ord.priority === 'high' || ord.deliveryTimeNote) {
        pCount++;
      }
      delivPcs += ord.totalPcs;

      const rawAddr = (ord.deliveryAddress || '').trim();
      const isMissingAddress =
        !rawAddr ||
        rawAddr.toLowerCase().includes('alamat belum') ||
        rawAddr.toLowerCase().includes('belum diisi');

      const locKey = isMissingAddress
        ? 'ALAMAT BELUM DIISI (PERLU KONFIRMASI)'
        : rawAddr.toUpperCase();

      if (!groupMap.has(locKey)) {
        groupMap.set(locKey, []);
      }
      groupMap.get(locKey)!.push(ord);
    }

    const groups = Array.from(groupMap.entries()).map(([dest, ords]) => {
      // Sort orders within each group: time notes / priority first, then order number
      const sortedOrds = [...ords].sort((a, b) => {
        const aHasPriority = a.priority !== 'normal' || !!a.deliveryTimeNote;
        const bHasPriority = b.priority !== 'normal' || !!b.deliveryTimeNote;
        if (aHasPriority && !bHasPriority) return -1;
        if (!aHasPriority && bHasPriority) return 1;
        if (a.deliveryTimeNote && b.deliveryTimeNote) {
          return a.deliveryTimeNote.localeCompare(b.deliveryTimeNote);
        }
        return b.orderNumber.localeCompare(a.orderNumber);
      });

      return {
        destination: dest,
        isMissingAddress: dest.startsWith('ALAMAT BELUM DIISI'),
        orderCount: sortedOrds.length,
        totalPcs: sortedOrds.reduce((a, b) => a + b.totalPcs, 0),
        hasPriority: sortedOrds.some((o) => o.priority !== 'normal' || !!o.deliveryTimeNote),
        orders: sortedOrds,
      };
    });

    // Sort destinations by user selection
    groups.sort((a, b) => {
      switch (sortDestinationsBy) {
        case 'priority':
          if (a.hasPriority && !b.hasPriority) return -1;
          if (!a.hasPriority && b.hasPriority) return 1;
          return b.orderCount - a.orderCount;
        case 'orders_desc':
          return b.orderCount - a.orderCount;
        case 'pcs_desc':
          return b.totalPcs - a.totalPcs;
        case 'name_asc':
          return a.destination.localeCompare(b.destination, 'id');
        default:
          return 0;
      }
    });

    return {
      groupedDestinations: groups,
      pickupOrders: pickupList,
      totalDeliveryPcs: delivPcs,
      priorityCount: pCount,
    };
  }, [orders, sortDestinationsBy]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groupedDestinations.filter((grp) => {
      const matchSearch =
        !search ||
        grp.destination.toLowerCase().includes(search.toLowerCase()) ||
        grp.orders.some(
          (o) =>
            o.customerName.toLowerCase().includes(search.toLowerCase()) ||
            o.customerPhone.includes(search) ||
            o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            (o.deliveryTimeNote && o.deliveryTimeNote.toLowerCase().includes(search.toLowerCase()))
        );

      const matchPriority =
        filterPriority === 'all' || (filterPriority === 'priority' && grp.hasPriority);

      return matchSearch && matchPriority;
    });
  }, [groupedDestinations, search, filterPriority]);

  const handleCopyCourierManifest = () => {
    let manifest = `🚚 *DAFTAR PENGANTARAN SENDOKECIL EST 2026*\n`;
    manifest += `Total Pesanan Antar: ${orders.filter((o) => o.orderType === 'antar').length} | Total: ${totalDeliveryPcs} pcs\n\n`;

    filteredGroups.forEach((grp, idx) => {
      manifest += `📍 *[${idx + 1}] ${grp.destination}* (${grp.totalPcs} pcs Gabin):\n`;
      grp.orders.forEach((o) => {
        manifest += `  • *${o.customerName}* (${o.totalPcs} pcs) - ${o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}`;
        if (o.customerPhone) manifest += ` | WA: ${o.customerPhone}`;
        if (o.deliveryTimeNote) manifest += ` | ⏰ *${o.deliveryTimeNote}*`;
        manifest += `\n`;
      });
      manifest += `\n`;
    });

    navigator.clipboard.writeText(manifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs">
          <div className="flex items-center gap-1.5 text-[#7A5B45]">
            <MapPin className="w-4 h-4 text-[#8C5326] shrink-0" />
            <span className="font-semibold truncate">Titik Destinasi</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#3E271B] mt-1">
            {groupedDestinations.length}{' '}
            <span className="text-[11px] font-normal text-gray-500">Cluster</span>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs">
          <div className="flex items-center gap-1.5 text-[#7A5B45]">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold truncate">Delivery (Antar)</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#3E271B] mt-1 truncate">
            {orders.filter((o) => o.orderType === 'antar').length}{' '}
            <span className="text-[11px] font-normal text-gray-500">Order ({totalDeliveryPcs} pcs)</span>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-800">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold truncate">Jadwal Khusus</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-900 mt-1">
            {priorityCount}{' '}
            <span className="text-[11px] font-normal text-amber-700">Perhatian</span>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs">
          <div className="flex items-center gap-1.5 text-[#7A5B45]">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Ambil di Toko</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#3E271B] mt-1">
            {pickupOrders.length}{' '}
            <span className="text-[11px] font-normal text-gray-500">Order</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Filter + Sort By + Copy Manifest */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lokasi, pelanggan, order #, atau no WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] text-xs text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] transition"
            />
          </div>

          {/* Filter Priority Pill */}
          <div className="flex bg-[#F6F0E6] p-1 rounded-xl border border-[#E5DAC8] shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterPriority('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'all'
                  ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                  : 'text-[#5A3E2C] hover:text-[#3E271B]'
              }`}
            >
              Semua Lokasi
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('priority')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition ${
                filterPriority === 'priority'
                  ? 'bg-[#6B4226] text-white shadow-xs font-bold'
                  : 'text-[#5A3E2C] hover:text-[#3E271B]'
              }`}
            >
              Prioritas / Jam Tertentu
            </button>
          </div>
        </div>

        {/* Secondary Row: Sort By & Quick Copy Manifest */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#F2ECE4]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-[#7A5B45] shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C5326]" />
              Urutkan Cluster:
            </span>
            <div className="w-full sm:w-60">
              <CustomSelect
                value={sortDestinationsBy}
                onChange={(val) => setSortDestinationsBy(val as any)}
                options={[
                  { value: 'priority', label: '⚡ Prioritas & Terbanyak (Default)' },
                  { value: 'orders_desc', label: '📦 Pesanan Terbanyak' },
                  { value: 'pcs_desc', label: '🧁 Pcs Gabin Terbanyak' },
                  { value: 'name_asc', label: '🔤 Nama Destinasi (A - Z)' },
                ]}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCourierManifest}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition shrink-0 w-full sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Rekap Rute untuk Kurir (WA)'}</span>
          </button>
        </div>
      </div>

      {/* Grouped Destination Cards */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DFC8] p-6">
            <Truck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-[#5A3E2C]">Tidak ada destinasi yang cocok</p>
            <p className="text-xs text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter prioritas</p>
          </div>
        ) : (
          filteredGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                group.isMissingAddress
                  ? 'border-amber-300 bg-amber-50/20'
                  : group.hasPriority
                    ? 'border-amber-200'
                    : 'border-[#E8DFC8]'
              }`}
            >
              {/* Destination Group Header */}
              <div className="bg-[#FAF6F0] px-3.5 sm:px-4 py-3 border-b border-[#EFE7DC] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      group.isMissingAddress
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-[#EAE0D2] text-[#6B4226]'
                    }`}
                  >
                    {group.isMissingAddress ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-[#3E271B] flex flex-wrap items-center gap-1.5">
                      <span>{group.destination}</span>
                      {group.hasPriority && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-700" /> Ada Jadwal Khusus
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-[#7C6353]">
                      {group.orderCount} pesanan · <b>{group.totalPcs} pcs</b> dessert
                      {group.isMissingAddress && ' · Mohon konfirmasi alamat via WA'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#EFE7DC] rounded-lg text-[#5A3E2C]">
                    Batch #{gIdx + 1}
                  </span>
                </div>
              </div>

              {/* Order Items under this Destination */}
              <div className="divide-y divide-[#F2ECE4]">
                {group.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 sm:p-4 hover:bg-[#FDFBF7] transition flex flex-col gap-2.5"
                  >
                    {/* Top Row: Customer Name & Order # & Payment Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-sm sm:text-base text-[#2D1E16]">
                            {ord.customerName}
                          </span>
                          <span className="text-[11px] font-mono text-[#8C5E38] bg-[#FAF4EB] border border-[#E8DFC8] px-2 py-0.5 rounded-md shrink-0">
                            #{ord.orderNumber}
                          </span>
                        </div>
                        {ord.deliveryAddress &&
                          ord.deliveryAddress.toLowerCase() !== 'alamat belum diisi' && (
                            <div className="text-[11px] text-[#7C6353] mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{ord.deliveryAddress}</span>
                            </div>
                          )}
                      </div>

                      {/* Payment Status + Quick Approve */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {ord.paymentStatus === 'lunas' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ LUNAS
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              MENUNGGU
                            </span>
                            {onApproveOrder && (
                              <button
                                type="button"
                                onClick={() => onApproveOrder(ord)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition flex items-center gap-1"
                                title="Setujui Pembayaran Lunas"
                              >
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Items & Badges Box */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F0E6D8]">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#3E271B]">
                          {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(' · ')}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Total {ord.totalPcs} pcs Gabin · <b className="text-[#3E271B]">{formatRupiah(ord.totalAmount)}</b>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {ord.customerPhone && (
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-mono font-semibold border border-emerald-200 transition"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{ord.customerPhone}</span>
                          </a>
                        )}

                        {ord.deliveryTimeNote && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{ord.deliveryTimeNote}</span>
                          </span>
                        )}

                        {ord.paymentProofUrl && onPreviewProof && (
                          <button
                            type="button"
                            onClick={() => onPreviewProof(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200 transition"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>Bukti Bayar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Row: Print Struk, Print Sticker, Fulfillment Status */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] font-medium text-[#7A5B45]">
                        Status Pengantaran:
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onPrintStruk(ord)}
                          title="Cetak Struk Thermal"
                          className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition shadow-xs"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrintSticker(ord)}
                          title="Cetak Sticker / Label Alamat Box"
                          className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition shadow-xs"
                        >
                          <Tag className="w-4 h-4" />
                        </button>

                        <div className="w-36 sm:w-40">
                          <CustomSelect
                            value={ord.fulfillmentStatus}
                            onChange={(val) => onUpdateStatus(ord.id, val as any)}
                            options={[
                              { value: 'menunggu', label: 'Menunggu' },
                              { value: 'diproses', label: 'Dipacking', badge: 'Proses' },
                              {
                                value: 'siap',
                                label: 'Siap Diantar',
                                badge: 'Siap',
                                badgeColor: 'bg-blue-100 text-blue-800',
                              },
                              {
                                value: 'selesai',
                                label: 'Selesai Terkirim',
                                badge: 'Done',
                                badgeColor: 'bg-emerald-100 text-emerald-800',
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
