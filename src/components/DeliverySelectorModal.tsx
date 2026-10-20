'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Store, 
  MapPin, 
  Clock, 
  Check, 
  Sparkles, 
  Navigation,
  Info
} from 'lucide-react';
import { OrderType } from '@/types';
import { POPULAR_LOCATIONS } from '@/lib/constants';

interface DeliverySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: OrderType;
  initialAddress: string;
  initialTimeNote: string;
  onConfirm: (type: OrderType, address: string, timeNote: string) => void;
}

const TIME_SLOT_PRESETS = [
  'Jam 4 Sore',
  'Siang (12.00 - 13.00)',
  'Pagi (10.00 - 11.30)',
  'Bebas Jam Berapa Aja',
  'Titip Kibo',
  'Titip ke Satpam / Pos',
];

export function DeliverySelectorModal({
  isOpen,
  onClose,
  initialType,
  initialAddress,
  initialTimeNote,
  onConfirm,
}: DeliverySelectorModalProps) {
  const [selectedType, setSelectedType] = useState<OrderType>(initialType);
  const [address, setAddress] = useState(initialAddress);
  const [timeNote, setTimeNote] = useState(initialTimeNote);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      setAddress(initialAddress);
      setTimeNote(initialTimeNote);
      setValidationError('');
    }
  }, [isOpen, initialType, initialAddress, initialTimeNote]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedType === 'antar' && !address.trim()) {
      setValidationError('Silakan pilih atau isi alamat / lokasi pengantaran.');
      return;
    }
    onConfirm(selectedType, address.trim(), timeNote.trim());
    onClose();
  };

  const handleSelectQuickLocation = (loc: string) => {
    setAddress(loc);
    setValidationError('');
  };

  const handleSelectQuickTime = (slot: string) => {
    setTimeNote(slot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#E8DEC8] bg-[#FAF6F0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#6B4226] text-white rounded-xl shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-[#3E271B]">Pilih Pengiriman</h3>
              <p className="text-xs text-[#7C6353]">Tentukan metode dan alamat penerimaan pesanan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs">
          {/* Interactive Method Switcher Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Delivery Card */}
            <div
              onClick={() => setSelectedType('antar')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2.5 relative select-none ${
                selectedType === 'antar'
                  ? 'border-[#6B4226] bg-[#F7F1E8] shadow-sm ring-1 ring-[#6B4226]/20'
                  : 'border-[#E8DFC8] bg-white hover:border-[#D0BEA7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${
                  selectedType === 'antar' ? 'bg-[#6B4226] text-white' : 'bg-[#FAF5EC] text-[#6B4226]'
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                {selectedType === 'antar' && (
                  <div className="w-5 h-5 rounded-full bg-[#6B4226] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-[#3E271B]">Antar Kurir</div>
                <div className="text-[11px] text-[#7A5B45] mt-0.5">Dikirim langsung ke lokasi Anda</div>
              </div>
              <span className="inline-block self-start px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FAF2E6] text-[#7A4B27] border border-[#E2D2BE]">
                🛵 Delivery Order
              </span>
            </div>

            {/* Pickup Card */}
            <div
              onClick={() => setSelectedType('ambil')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2.5 relative select-none ${
                selectedType === 'ambil'
                  ? 'border-[#6B4226] bg-[#F7F1E8] shadow-sm ring-1 ring-[#6B4226]/20'
                  : 'border-[#E8DFC8] bg-white hover:border-[#D0BEA7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${
                  selectedType === 'ambil' ? 'bg-[#6B4226] text-white' : 'bg-[#FAF5EC] text-[#6B4226]'
                }`}>
                  <Store className="w-5 h-5" />
                </div>
                {selectedType === 'ambil' && (
                  <div className="w-5 h-5 rounded-full bg-[#6B4226] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-[#3E271B]">Ambil Sendiri</div>
                <div className="text-[11px] text-[#7A5B45] mt-0.5">Ambil langsung di outlet</div>
              </div>
              <span className="inline-block self-start px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                🏪 Self Pickup
              </span>
            </div>
          </div>

          {validationError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Type 1: Delivery Fields */}
          {selectedType === 'antar' ? (
            <div className="space-y-3.5 pt-1">
              {/* Popular quick chips */}
              <div>
                <label className="block font-bold text-[#5A3E2C] mb-1.5 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#6B4226]" /> Pilihan Cepat Lokasi Populer:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = address.trim().toLowerCase() === loc.toLowerCase();
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectQuickLocation(loc)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#6B4226] text-white border-[#6B4226] shadow-xs'
                            : 'bg-white border-[#DCCBB8] text-[#5A3E2C] hover:bg-[#F3ECE0]'
                        }`}
                      >
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{loc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Address input */}
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">
                  Alamat / Patokan Pengantaran Lengkap *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (e.target.value.trim()) setValidationError('');
                    }}
                    placeholder="Contoh: ASMEG, Gedung B Lantai 2, Jl. Zein Hamid..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                  />
                  {address && (
                    <button
                      type="button"
                      onClick={() => setAddress('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Time slot picker */}
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6B4226]" /> Waktu Pengantaran / Prioritas:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TIME_SLOT_PRESETS.map((slot) => {
                    const isSelected = timeNote.toLowerCase().includes(slot.toLowerCase());
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSelectQuickTime(slot)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
                          isSelected
                            ? 'bg-[#8C5326] text-white border-[#8C5326]'
                            : 'bg-[#FAF5EC] border-[#E8DFC8] text-[#5A3E2C] hover:bg-[#F3ECE0]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={timeNote}
                  onChange={(e) => setTimeNote(e.target.value)}
                  placeholder="Atau ketik instruksi khusus (misal: Jam 4 Sore, Titip Satpam)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                />
              </div>
            </div>
          ) : (
            /* Type 2: Pickup Information */
            <div className="p-4 rounded-2xl bg-[#FAF5EC] border border-[#E8DFD3] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-[#DCCBB8] text-[#6B4226] shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3E271B]">Toko SENDOKecil Medan</h4>
                  <p className="text-xs text-[#5A3E2C] mt-0.5">
                    Jl. Zein Hamid No. 25, Medan · Buka setiap hari <b>09.00 - 18.00 WIB</b>.
                  </p>
                  <p className="text-[11px] text-[#7A5B45] mt-1.5">
                    ✨ Pesanan Anda akan disiapkan fresh dalam kemasan box higienis siap ambil.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A3E2C] mb-1">
                  Catatan Waktu Penjemputan (Opsional):
                </label>
                <input
                  type="text"
                  value={timeNote}
                  onChange={(e) => setTimeNote(e.target.value)}
                  placeholder="Contoh: Ambil jam 14.30 WIB..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B] text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8DEC8] bg-[#FAF6F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#5A3E2C] hover:text-[#3E271B] hover:bg-[#F3ECE0] rounded-xl border border-[#DCCBB8] transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-[#6B4226] hover:bg-[#54331C] shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Terapkan Pengiriman</span>
          </button>
        </div>
      </div>
    </div>
  );
}
