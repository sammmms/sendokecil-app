'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, DollarSign, PieChart, Layers, Check, Calculator, Sparkles } from 'lucide-react';
import { HPPComponent, Product } from '@/types';
import { calculateProductHpp, formatRupiah } from '@/lib/hpp';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useAlert } from '@/components/ui/CustomAlert';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface HppManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  components: HPPComponent[];
  onUpdateComponent: (comp: HPPComponent) => Promise<void>;
  onDeleteComponent: (id: string) => Promise<void>;
  onReload: () => void;
}

export function HppManagerModal({
  isOpen,
  onClose,
  products,
  components,
  onUpdateComponent,
  onDeleteComponent,
  onReload,
}: HppManagerModalProps) {
  const { showConfirm, showToast } = useAlert();
  const [activeTab, setActiveTab] = useState<'components' | 'recipes'>('components');
  const [editingId, setEditingId] = useState<string | null>(null);

  // New component form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<HPPComponent['category']>('bahan_baku');
  const [newCost, setNewCost] = useState<number>(1000);
  const [newUnit, setNewUnit] = useState('porsi');
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newCost <= 0) return;
    setSubmitting(true);
    try {
      await onUpdateComponent({
        id: `comp-${Date.now()}`,
        name: newName.trim(),
        category: newCategory,
        cost: Number(newCost),
        unit: newUnit.trim() || 'porsi',
        note: newNote.trim(),
      });
      setNewName('');
      setNewCost(1000);
      setNewNote('');
      onReload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCostEdit = async (comp: HPPComponent, cost: number) => {
    await onUpdateComponent({ ...comp, cost });
    setEditingId(null);
    onReload();
  };

  // Stats calculation
  const totalRawCost = components
    .filter((c) => c.category === 'bahan_baku')
    .reduce((acc, c) => acc + c.cost, 0);
  const totalPackagingCost = components
    .filter((c) => c.category === 'kemasan')
    .reduce((acc, c) => acc + c.cost, 0);
  const totalOpCost = components
    .filter((c) => c.category === 'operasional')
    .reduce((acc, c) => acc + c.cost, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F3ECE0] rounded-xl text-[#6B4226]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#3E271B]">Perhitungan HPP & Resep Bahan</h3>
              <p className="text-xs text-[#7C6353]">
                Kelola komponen bahan baku, cup kemasan, & operasional untuk menghitung keuntungan bersih
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C6353] hover:text-[#3E271B] rounded-full hover:bg-[#F3ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Highlights */}
        <div className="my-3 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAF4EA] border border-[#E8DFC8]">
            <span className="text-[10px] text-[#7A5B45] font-semibold">Bahan Baku (Rata-rata)</span>
            <div className="text-base font-bold text-[#3E271B] mt-0.5">{formatRupiah(totalRawCost)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF4EA] border border-[#E8DFC8]">
            <span className="text-[10px] text-[#7A5B45] font-semibold">Kemasan & Sendokecil</span>
            <div className="text-base font-bold text-[#3E271B] mt-0.5">{formatRupiah(totalPackagingCost)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-semibold">Operasional / Cup</span>
            <div className="text-base font-bold text-emerald-900 mt-0.5">{formatRupiah(totalOpCost)}</div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#E8DEC8] mb-3">
          <button
            onClick={() => setActiveTab('components')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'components'
                ? 'border-[#6B4226] text-[#6B4226]'
                : 'border-transparent text-[#7C6353] hover:text-[#3E271B]'
            }`}
          >
            Daftar Komponen Biaya ({components.length})
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'recipes'
                ? 'border-[#6B4226] text-[#6B4226]'
                : 'border-transparent text-[#7C6353] hover:text-[#3E271B]'
            }`}
          >
            Analisis Margin per Varian Produk ({products.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'components' ? (
            <>
              {/* Form Add Component */}
              <form
                onSubmit={handleCreateComponent}
                className="p-3 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3] grid grid-cols-1 md:grid-cols-5 gap-2 text-xs"
              >
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#5A3E2C] mb-1">Nama Komponen</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biskuit Oreo, Cup 200ml"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCCBB8] bg-white text-[#3E271B] focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226] relative focus:z-10 transition-all"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="Kategori"
                    value={newCategory}
                    onChange={(val) => setNewCategory(val as any)}
                    options={[
                      { value: 'bahan_baku', label: 'Bahan Baku' },
                      { value: 'kemasan', label: 'Kemasan / Sendok' },
                      { value: 'operasional', label: 'Operasional' },
                      { value: 'lainnya', label: 'Lainnya' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A3E2C] mb-1">Biaya (Rp)</label>
                  <CurrencyInput
                    value={newCost}
                    onChange={setNewCost}
                    prefix="Rp"
                    placeholder="1.000"
                    className="px-2.5 py-1.5 rounded-lg"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 px-3 bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
              </form>

              {/* Table of Components */}
              <div className="border border-[#E8DEC8] rounded-xl overflow-hidden bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF4EB] text-[#5A3E2C] border-b border-[#E8DEC8]">
                    <tr>
                      <th className="py-2 px-3">Komponen</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3 text-right">Biaya Satuan</th>
                      <th className="py-2 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DC]">
                    {components.map((comp) => (
                      <tr key={comp.id} className="hover:bg-[#FAF6F0] transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#3E271B]">{comp.name}</div>
                          {comp.note && <div className="text-[10px] text-gray-500">{comp.note}</div>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              comp.category === 'bahan_baku'
                                ? 'bg-amber-100 text-amber-900'
                                : comp.category === 'kemasan'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {comp.category === 'bahan_baku'
                              ? 'Bahan'
                              : comp.category === 'kemasan'
                              ? 'Kemasan'
                              : 'Operasional'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-[#3E271B]">
                          {editingId === comp.id ? (
                            <CurrencyInput
                              value={comp.cost}
                              onChange={(newVal) => handleQuickCostEdit(comp, newVal)}
                              prefix="Rp"
                              autoFocus
                              className="w-28 text-right px-2 py-0.5 text-xs rounded-lg"
                            />
                          ) : (
                            <span
                              onClick={() => setEditingId(comp.id)}
                              className="cursor-pointer hover:underline"
                            >
                              {formatRupiah(comp.cost)} / {comp.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Hapus Komponen HPP',
                                message: `Yakin ingin menghapus komponen "${comp.name}"? Ini akan mempengaruhi perhitungan margin produk yang menggunakan resep ini.`,
                                type: 'danger',
                                confirmText: 'Ya, Hapus',
                                cancelText: 'Batal',
                              });
                              if (confirmed) {
                                await onDeleteComponent(comp.id);
                                showToast(`Komponen "${comp.name}" berhasil dihapus`, 'info');
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                            title="Hapus komponen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Analysis & Recipes Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((p) => {
                const calculatedHpp = calculateProductHpp(p, components);
                const grossProfit = p.price - calculatedHpp;
                const marginPct = Math.round((grossProfit / p.price) * 100);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-[#E8DFC8] bg-white shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#3E271B]">{p.name}</h4>
                          <span className="text-[10px] text-gray-500">{p.badge}</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            marginPct >= 35
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Margin {marginPct}%
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-1 text-center py-2 px-1 bg-[#FAF6F0] rounded-lg text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500">Harga Jual</div>
                          <div className="font-bold text-[#3E271B]">{formatRupiah(p.price)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500">HPP / Modal</div>
                          <div className="font-bold text-red-700">{formatRupiah(calculatedHpp)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500">Untung Bersih</div>
                          <div className="font-bold text-emerald-700">{formatRupiah(grossProfit)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#EFE7DC] text-[11px] text-gray-600">
                      <b>Komponen yang Dihitung:</b>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-[10px]">
                        {p.recipe.map((r, i) => {
                          const comp = components.find((c) => c.id === r.componentId);
                          return (
                            <li key={i}>
                              {comp ? `${comp.name}: ${formatRupiah(comp.cost)}` : r.componentId}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8DEC8] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
