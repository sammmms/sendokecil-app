'use client';

import React, { useState, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, Upload, Check, AlertCircle, Package } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/hpp';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
  onReload: () => void;
}

export function ProductManagerModal({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onReload,
}: ProductManagerModalProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(15000);
  const [category, setCategory] = useState('Gabin');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setName('');
    setTagline('');
    setDescription('');
    setPrice(15000);
    setCategory('Gabin');
    setBadge('Varian Baru ✨');
    setImage('/images/products/choco-oreo.jpg');
    setIsAvailable(true);
    setError('');
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setIsCreating(true);
    setName(p.name);
    setTagline(p.tagline || '');
    setDescription(p.description || '');
    setPrice(p.price);
    setCategory(p.category || 'Gabin');
    setBadge(p.badge || '');
    setImage(p.image || '');
    setIsAvailable(p.isAvailable);
    setError('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImage(data.url);
      }
    } catch (err: any) {
      alert('Gagal mengunggah foto: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama produk/varian wajib diisi.');
      return;
    }
    if (price <= 0) {
      setError('Harga harus lebih dari 0.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const id = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
      const payload: Product = {
        id,
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim() || 'Gabin',
        badge: badge.trim(),
        image: image || '/images/products/choco-oreo.jpg',
        isAvailable,
        recipe: editingProduct?.recipe || [
          { componentId: 'comp-gabin-crackers', quantity: 1 },
          { componentId: 'comp-fla-base', quantity: 1 },
          { componentId: 'comp-box', quantity: 1 },
          { componentId: 'comp-spoon', quantity: 1 },
          { componentId: 'comp-seal', quantity: 1 },
          { componentId: 'comp-overhead', quantity: 1 },
        ],
      };

      await onSaveProduct(payload);
      setIsCreating(false);
      setEditingProduct(null);
      onReload();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan produk.');
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#3E271B]">Kelola Menu & Varian Produk</h3>
              <p className="text-xs text-[#7C6353]">Tambah varian Gabin baru, ubah harga, atau ganti foto</p>
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

        {isCreating ? (
          /* Form Add / Edit Product */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-2 space-y-3 text-xs pr-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE7DC]">
              <span className="font-bold text-[#5A3E2C]">
                {editingProduct ? 'Edit Varian / Produk' : 'Tambah Varian / Produk Baru'}
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[11px] text-[#7A5B45] hover:underline"
              >
                Kembali ke Daftar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Nama Produk / Varian *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Gabin Tiramisu, Gabin Keju"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Gabin"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A3E2C] mb-1">Badge / Label (Opsional)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Contoh: Best Seller 🍫, New ✨"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Tagline Singkat</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Fla Tiramisu Kopi Susu Lumer"
                className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Deskripsi Lengkap</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kelezatan kue gabin ini..."
                className="w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]"
              />
            </div>

            {/* Photo Picker */}
            <div>
              <label className="block font-semibold text-[#5A3E2C] mb-1">Foto Varian Produk</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-3 p-3 bg-[#FAF5EC] rounded-xl border border-[#E8DFD3]">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#DCCBB8] shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="py-1.5 px-3 bg-white border border-[#DCCBB8] rounded-lg font-semibold text-xs text-[#5A3E2C] hover:bg-[#F0E6D8] flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Mengunggah...' : 'Upload Foto Baru'}
                  </button>
                  <div className="text-[10px] text-gray-400">Atau pilih preset foto:</div>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Choco', url: '/images/products/choco-oreo.jpg' },
                      { label: 'Strawberry', url: '/images/products/strawberry.jpg' },
                      { label: 'Matcha', url: '/images/products/matcha.jpg' },
                      { label: 'Cookies', url: '/images/products/cookies-cream.jpg' },
                    ].map((ps) => (
                      <button
                        key={ps.label}
                        type="button"
                        onClick={() => setImage(ps.url)}
                        className={`px-2 py-0.5 rounded text-[10px] border ${
                          image === ps.url ? 'bg-[#6B4226] text-white' : 'bg-white text-gray-600'
                        }`}
                      >
                        {ps.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6B4226]"
                />
                <span className="font-semibold text-[#3E271B]">Tersedia untuk Dipesan Pelanggan</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#5A3E2C] font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-xl bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs shadow transition"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        ) : (
          /* Products List */
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
            <div className="flex justify-between items-center pb-2 border-b border-[#EFE7DC]">
              <span className="text-xs text-[#7C6353]">
                Total: <b>{products.length} varian</b> aktif di menu pelanggan
              </span>
              <button
                onClick={handleStartCreate}
                className="py-1.5 px-3 bg-[#6B4226] hover:bg-[#54331C] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Varian Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-[#E8DFC8] bg-white shadow-sm flex items-start justify-between gap-3"
                >
                  <img
                    src={p.image || '/images/products/choco-oreo.jpg'}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8DFC8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-[#3E271B] truncate">{p.name}</h4>
                      {p.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FAF2E6] text-[#7A4B27] border border-[#E2D2BE]">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-[#6B4226] mt-0.5">{formatRupiah(p.price)}</div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{p.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-2 rounded-xl text-[#5A3E2C] hover:bg-[#F3ECE0] border border-[#DCCBB8] transition"
                    title="Edit Varian"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8DEC8] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#FAF5EC] border border-[#DCCBB8] hover:bg-[#F0E6D8] text-[#5A3E2C] font-semibold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
