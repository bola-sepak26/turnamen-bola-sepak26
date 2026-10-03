import React, { useState } from 'react';
import { Team, TournamentConfig } from '../types/tournament';
import { formatRupiah, formatDateIndo, generateReceiptNumber } from '../utils/formatters';
import { 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Download, 
  Search,
  Filter,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface FinanceViewProps {
  teams: Team[];
  config: TournamentConfig;
  onOpenReceipt: (team: Team) => void;
  onUpdatePayment: (teamId: string, status: Team['paymentStatus'], amount: number) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  teams,
  config,
  onOpenReceipt,
  onUpdatePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'down_payment' | 'unpaid'>('all');

  const totalCollected = teams.reduce((acc, t) => acc + (t.paidAmount || 0), 0);
  const targetTotal = config.maxTeams * config.registrationFee;
  const currentTotalFee = teams.length * config.registrationFee;
  const totalOutstanding = Math.max(0, currentTotalFee - totalCollected);

  const paidCount = teams.filter((t) => t.paymentStatus === 'paid').length;
  const dpCount = teams.filter((t) => t.paymentStatus === 'down_payment').length;
  const unpaidCount = teams.filter((t) => t.paymentStatus === 'unpaid').length;

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.receiptNumber && team.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || team.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Kode Tim', 'Nama Tim', 'Kota', 'Manajer', 'Biaya Registrasi', 'Nominal Terbayar', 'Sisa Tunggakan', 'Status Pembayaran', 'No Kuitansi', 'Tanggal Bayar'];
    const rows = teams.map((t) => [
      t.code,
      `"${t.name}"`,
      `"${t.originCity}"`,
      `"${t.managerName}"`,
      config.registrationFee,
      t.paidAmount,
      Math.max(0, config.registrationFee - t.paidAmount),
      t.paymentStatus,
      t.receiptNumber || '-',
      t.paymentDate || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-keuangan-turnamen-${config.category.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            Administrasi Keuangan & Kuitansi Turnamen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Biaya pendaftaran per tim: <strong>{formatRupiah(config.registrationFee)}</strong> · Rekapitulasi pembayaran & penerbitan kuitansi resmi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Rekap CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Keuangan</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Terkumpul</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
            {formatRupiah(totalCollected)}
          </div>
          <div className="text-xs text-slate-500">
            Dari {teams.length} tim terdaftar
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sisa Piutang / Tunggakan</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 font-mono tabular-nums mb-1">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-500">
            {dpCount} tim DP + {unpaidCount} belum bayar
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tim Lunas Penuh</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
            {paidCount} <span className="text-sm font-medium text-slate-500">/ {teams.length} Tim</span>
          </div>
          <div className="text-xs text-slate-500">
            {Math.round((paidCount / Math.max(1, teams.length)) * 100)}% kepatuhan pelunasan
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potensi Total Kuota</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
            {formatRupiah(targetTotal)}
          </div>
          <div className="text-xs text-slate-500">
            Target 100% ({config.maxTeams} tim)
          </div>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tim, manajer, nomor kuitansi..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Filter Status:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-md">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Semua ({teams.length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                  filterStatus === 'paid' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Lunas ({paidCount})
              </button>
              <button
                onClick={() => setFilterStatus('down_payment')}
                className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                  filterStatus === 'down_payment' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                DP ({dpCount})
              </button>
              <button
                onClick={() => setFilterStatus('unpaid')}
                className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                  filterStatus === 'unpaid' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Belum Bayar ({unpaidCount})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Klub / Tim</th>
                <th className="py-3 px-4">Manajer & Kontak</th>
                <th className="py-3 px-4">No. Kuitansi</th>
                <th className="py-3 px-4 font-right">Biaya Registrasi</th>
                <th className="py-3 px-4 font-right">Nominal Bayar</th>
                <th className="py-3 px-4 font-right">Sisa Tunggakan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeams.map((team) => {
                const remaining = Math.max(0, config.registrationFee - team.paidAmount);

                return (
                  <tr key={team.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: team.primaryJerseyColor }}
                        >
                          {team.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{team.name}</div>
                          <div className="text-[10px] text-slate-400">{team.originCity}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <div>{team.managerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{team.managerPhone}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {team.receiptNumber || '-'}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {formatRupiah(config.registrationFee)}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-700">
                      {formatRupiah(team.paidAmount)}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums">
                      {remaining > 0 ? (
                        <span className="text-amber-800 font-medium">{formatRupiah(remaining)}</span>
                      ) : (
                        <span className="text-slate-400">Rp 0</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {team.paymentStatus === 'paid' && (
                        <div>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                          </span>
                          <span className="text-[10px] text-emerald-800 font-mono font-medium block mt-0.5">
                            Kode Login: AKTIF
                          </span>
                        </div>
                      )}
                      {team.paymentStatus === 'down_payment' && (
                        <div>
                          <span className="text-indigo-700 font-semibold">
                            DP (Cicilan)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Kode: Menunggu Lunas
                          </span>
                        </div>
                      )}
                      {team.paymentStatus === 'unpaid' && (
                        <div>
                          <span className="text-slate-400 font-medium">
                            Belum Bayar
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Kode: Menunggu Lunas
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {team.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => {
                              onUpdatePayment(team.id, 'paid', config.registrationFee);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                          >
                            Set Lunas
                          </button>
                        )}
                        <button
                          onClick={() => onOpenReceipt(team)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Kwitansi</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
