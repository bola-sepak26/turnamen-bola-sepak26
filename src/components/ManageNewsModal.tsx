import React, { useState, useEffect } from 'react';
import { TournamentNewsItem } from '../data/tournamentNewsData';
import { X, Plus, Trash2, Edit3, Image as ImageIcon, Save, Check, RefreshCw, Upload, Eye } from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

interface ManageNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsList: TournamentNewsItem[];
  onSaveNewsList: (updatedList: TournamentNewsItem[]) => void;
  onResetToDefault: () => void;
}

export const ManageNewsModal: React.FC<ManageNewsModalProps> = ({
  isOpen,
  onClose,
  newsList,
  onSaveNewsList,
  onResetToDefault,
}) => {
  const [items, setItems] = useState<TournamentNewsItem[]>(newsList);
  const [editingItem, setEditingItem] = useState<TournamentNewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(newsList);
      setEditingItem(null);
      setIsCreating(false);
    }
  }, [isOpen, newsList]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNew = () => {
    const newItem: TournamentNewsItem = {
      id: `news-${Date.now()}`,
      title: '',
      category: 'Berita',
      date: new Date().toISOString().slice(0, 10),
      author: 'Panitia Turnamen',
      summary: '',
      content: '',
      imageUrl: '/handayani_cup_banner.jpg',
      tag: 'Update',
      readTime: '2 mnt baca',
    };
    setEditingItem(newItem);
    setIsCreating(true);
  };

  const handleEdit = (item: TournamentNewsItem) => {
    setEditingItem({ ...item });
    setIsCreating(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Hapus artikel/foto "${title || 'Tanpa Judul'}"?`)) {
      const updated = items.filter((it) => it.id !== id);
      setItems(updated);
      onSaveNewsList(updated);
      if (editingItem?.id === id) {
        setEditingItem(null);
        setIsCreating(false);
      }
      showToast('Artikel berhasil dihapus');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      alert('Judul berita tidak boleh kosong.');
      return;
    }

    let updated: TournamentNewsItem[];
    if (isCreating) {
      updated = [editingItem, ...items];
    } else {
      updated = items.map((it) => (it.id === editingItem.id ? editingItem : it));
    }

    setItems(updated);
    onSaveNewsList(updated);
    setEditingItem(null);
    setIsCreating(false);
    showToast(isCreating ? 'Artikel/Foto baru berhasil ditambahkan' : 'Perubahan berita berhasil disimpan');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditingItem({
        ...editingItem,
        imageUrl: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Kelola Berita & Galeri Foto Turnamen
              </h2>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit judul, rilis berita, ringkasan, unggah foto dokumentasi, dan kelola publikasi turnamen Handayani Cup 2026.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert if any */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-5 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {editingItem ? (
            /* Edit / Create Form */
            <form onSubmit={handleSaveEdit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-rose-600" />
                  <span>{isCreating ? 'Tambah Berita / Dokumentasi Baru' : 'Edit Berita / Foto'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-white border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1 & 2: Details */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul Berita / Foto <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Contoh: Hasil Pertandingan Babak Penyisihan Hari Ke-1..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            category: e.target.value as any,
                          })
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      >
                        <option value="Berita">Berita</option>
                        <option value="Match Highlight">Match Highlight</option>
                        <option value="Galeri">Galeri Foto</option>
                        <option value="Pengumuman">Pengumuman</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Rilis</label>
                      <input
                        type="date"
                        value={editingItem.date}
                        onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Penulis / Sumber</label>
                      <input
                        type="text"
                        value={editingItem.author}
                        onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                        placeholder="Tim Media Panpel"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ringkasan Singkat (Muncul di kartu dashboard)
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.summary}
                      onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                      placeholder="Ringkasan 1-2 kalimat mengenai foto atau momen pertandingan..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Isi Berita Lengkap
                    </label>
                    <textarea
                      rows={4}
                      value={editingItem.content || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                      placeholder="Tuliskan ulasan lengkap, hasil pertandingan, skor, atau catatan panitia..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    />
                  </div>
                </div>

                {/* Column 3: Image / Photo preview & Upload */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Foto / Gambar Dokumentasi
                  </label>

                  <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-200 overflow-hidden relative group">
                    <img
                      src={editingItem.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', '/handayani_cup_banner.jpg');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium pointer-events-none">
                      Preview Foto
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Ganti Foto dari Perangkat:
                    </label>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Unggah Gambar (JPG/PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Atau Masukkan URL Gambar:
                    </label>
                    <input
                      type="text"
                      value={editingItem.imageUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder="https://... atau /handayani_cup_banner.jpg"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-rose-600 text-[11px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        ...editingItem,
                        imageUrl: '/handayani_cup_banner.jpg',
                      })
                    }
                    className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold underline block cursor-pointer"
                  >
                    Gunakan Banner Resmi Handayani
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Tambah Artikel' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Action bar when not editing */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Total {items.length} Dokumentasi & Artikel</span>
                  <p className="text-[11px] text-slate-500">Klik tombol edit pada artikel di bawah untuk mengganti foto atau isi ulasan.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    title="Kosongkan semua berita dan galeri foto"
                    onClick={() => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data berita dan galeri foto? Tindakan ini tidak dapat dibatalkan.')) {
                        setItems([]);
                        onSaveNewsList([]);
                        setEditingItem(null);
                        setIsCreating(false);
                        showToast('Seluruh berita dan galeri foto berhasil dikosongkan.');
                      }
                    }}
                    className="px-2.5 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Semua</span>
                  </button>
                )}

                <button
                  onClick={handleCreateNew}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Berita / Foto Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* List of News & Gallery Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daftar Dokumentasi & Berita yang Ditampilkan
            </h3>

            {items.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Daftar berita dan galeri foto saat ini kosong.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Klik "+ Tambah Berita / Foto Baru" untuk membuat artikel atau dokumentasi pertama.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', '/handayani_cup_banner.jpg');
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateIndo(item.date)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {item.title || '(Tanpa Judul)'}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-lg transition-colors cursor-pointer"
                      title="Hapus Artikel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Perubahan otomatis tersimpan dan langsung tampil di halaman ringkasan turnamen.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
