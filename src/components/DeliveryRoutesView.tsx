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
  ArrowRight,
} from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah } from '@/lib/hpp';

interface DeliveryRoutesViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['fulfillmentStatus']) => Promise<void>;
  onPrintStruk: (order: Order) => void;
  onPrintSticker: (order: Order) => void;
}

export function DeliveryRoutesView({
  orders,
  onUpdateStatus,
  onPrintStruk,
  onPrintSticker,
}: DeliveryRoutesViewProps) {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
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

      const locKey = (ord.deliveryAddress || 'Alamat Belum Lengkap').trim().toUpperCase();
      if (!groupMap.has(locKey)) {
        groupMap.set(locKey, []);
      }
      groupMap.get(locKey)!.push(ord);
    }

    const groups = Array.from(groupMap.entries()).map(([dest, ords]) => ({
      destination: dest,
      orderCount: ords.length,
      totalPcs: ords.reduce((a, b) => a + b.totalPcs, 0),
      hasPriority: ords.some((o) => o.priority !== 'normal' || !!o.deliveryTimeNote),
      orders: ords,
    }));

    // Sort by priority first, then order count
    groups.sort((a, b) => {
      if (a.hasPriority && !b.hasPriority) return -1;
      if (!a.hasPriority && b.hasPriority) return 1;
      return b.orderCount - a.orderCount;
    });

    return {
      groupedDestinations: groups,
      pickupOrders: pickupList,
      totalDeliveryPcs: delivPcs,
      priorityCount: pCount,
    };
  }, [orders]);

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
            (o.deliveryTimeNote && o.deliveryTimeNote.toLowerCase().includes(search.toLowerCase()))
        );

      const matchPriority =
        filterPriority === 'all' ||
        (filterPriority === 'priority' && grp.hasPriority);

      return matchSearch && matchPriority;
    });
  }, [groupedDestinations, search, filterPriority]);

  const handleCopyCourierManifest = () => {
    let manifest = `🚚 *DAFTAR PENGANTARAN SENDOKECIL EST 2026*\n`;
    manifest += `Total Pesanan Antar: ${orders.filter((o) => o.orderType === 'antar').length} | Total: ${totalDeliveryPcs} pcs\n\n`;

    filteredGroups.forEach((grp, idx) => {
      manifest += `📍 *[${idx + 1}] ${grp.destination}* (${grp.totalPcs} pcs):\n`;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-sm">
          <div className="flex items-center gap-2 text-[#7A5B45]">
            <MapPin className="w-4 h-4 text-[#8C5326]" />
            <span className="font-semibold">Titik Destinasi</span>
          </div>
          <div className="text-xl font-bold text-[#3E271B] mt-1">
            {groupedDestinations.length} <span className="text-xs font-normal text-gray-500">Lokasi</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-sm">
          <div className="flex items-center gap-2 text-[#7A5B45]">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Pesanan Antar (Delivery)</span>
          </div>
          <div className="text-xl font-bold text-[#3E271B] mt-1">
            {orders.filter((o) => o.orderType === 'antar').length} <span className="text-xs font-normal text-gray-500">Order ({totalDeliveryPcs} pcs)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">Jadwal Khusus / Prioritas</span>
          </div>
          <div className="text-xl font-bold text-amber-900 mt-1">
            {priorityCount} <span className="text-xs font-normal text-amber-700">Perlu Perhatian</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-sm">
          <div className="flex items-center gap-2 text-[#7A5B45]">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Ambil di Tempat (Pickup)</span>
          </div>
          <div className="text-xl font-bold text-[#3E271B] mt-1">
            {pickupOrders.length} <span className="text-xs font-normal text-gray-500">Order</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC8]">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 z-20 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama lokasi (ASMEG, STMB, dll), nama customer, atau no WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCCBB8] bg-[#FAF8F5] text-xs text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
            />
          </div>

          <div className="flex bg-[#F6F0E6] p-1 rounded-xl border border-[#E5DAC8] shrink-0 text-xs">
            <button
              onClick={() => setFilterPriority('all')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                filterPriority === 'all' ? 'bg-[#6B4226] text-white' : 'text-[#5A3E2C]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterPriority('priority')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                filterPriority === 'priority' ? 'bg-[#6B4226] text-white' : 'text-[#5A3E2C]'
              }`}
            >
              Prioritas / Jam Tertentu
            </button>
          </div>
        </div>

        <button
          onClick={handleCopyCourierManifest}
          className="w-full md:w-auto py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Tersalin ke Clipboard!' : 'Salin Rekap Rute untuk Kurir (WA)'}
        </button>
      </div>

      {/* Grouped Destination Cards */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DFC8]">
            <Truck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-[#5A3E2C]">Tidak ada destinasi yang cocok</p>
            <p className="text-xs text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter prioritas</p>
          </div>
        ) : (
          filteredGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${
                group.hasPriority ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#E8DFC8]'
              }`}
            >
              {/* Destination Group Header */}
              <div className="bg-[#FAF6F0] px-4 py-3 border-b border-[#EFE7DC] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EAE0D2] flex items-center justify-center text-[#6B4226]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3E271B] flex items-center gap-2">
                      {group.destination}
                      {group.hasPriority && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          PRIORITAS / WAKTU
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-[#7C6353]">
                      {group.orderCount} pesanan · <b>{group.totalPcs} pcs</b> dessert
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
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
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#FDFBF7] transition"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D1E16]">{ord.customerName}</span>
                        <span className="text-[11px] font-mono text-[#8C5E38] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.paymentStatus === 'lunas'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus === 'lunas' ? 'LUNAS' : 'MENUNGGU VERIFIKASI'}
                        </span>
                      </div>

                      {/* Items details */}
                      <div className="text-xs text-[#5A3E2C] font-medium">
                        {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(' · ')}
                        <span className="text-gray-400"> ({ord.totalPcs} pcs)</span>
                      </div>

                      {/* Delivery note / Phone */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7C6353]">
                        {ord.customerPhone && (
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                          >
                            <Phone className="w-3 h-3" /> {ord.customerPhone}
                          </a>
                        )}

                        {ord.deliveryTimeNote && (
                          <span className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> {ord.deliveryTimeNote}
                          </span>
                        )}

                        <span className="text-gray-500 font-semibold">{formatRupiah(ord.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Status & Print Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => onPrintStruk(ord)}
                        title="Cetak Struk Thermal"
                        className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPrintSticker(ord)}
                        title="Cetak Sticker / Label Alamat"
                        className="p-2 rounded-xl border border-[#DCCBB8] bg-white hover:bg-[#F3ECE0] text-[#5A3E2C] transition"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>

                      <select
                        value={ord.fulfillmentStatus}
                        onChange={(e) => onUpdateStatus(ord.id, e.target.value as any)}
                        className={`text-xs font-semibold py-1.5 px-2.5 rounded-xl border transition ${
                          ord.fulfillmentStatus === 'selesai'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : ord.fulfillmentStatus === 'siap'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-white border-[#DCCBB8] text-[#5A3E2C]'
                        }`}
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="diproses">Sedang Dipacking</option>
                        <option value="siap">Siap Diantar</option>
                        <option value="selesai">Selesai / Terkirim</option>
                      </select>
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
