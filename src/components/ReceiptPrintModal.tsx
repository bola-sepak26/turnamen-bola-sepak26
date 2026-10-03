import React from 'react';
import { Team, TournamentConfig } from '../types/tournament';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { Printer, X, CheckCircle2, Shield, Key } from 'lucide-react';
import { getDefaultTeamUsername, getDefaultTeamPassword } from '../utils/credentials';

interface ReceiptPrintModalProps {
  team: Team | null;
  config: TournamentConfig;
  isOpen: boolean;
  onClose: () => void;
}

// Convert number to Indonesian words (Terbilang)
function terbilangRupiah(n: number): string {
  if (n === 0) return 'NOL RUPIAH';
  const satuan = ['', 'SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA', 'ENAM', 'TUJUH', 'DELAPAN', 'SEMBILAN', 'SEPULUH', 'SEBELAS'];

  function convert(x: number): string {
    if (x < 12) return satuan[x];
    if (x < 20) return convert(x - 10) + ' BELAS';
    if (x < 100) return convert(Math.floor(x / 10)) + ' PULUH ' + convert(x % 10);
    if (x < 200) return 'SERATUS ' + convert(x - 100);
    if (x < 1000) return convert(Math.floor(x / 100)) + ' RATUS ' + convert(x % 100);
    if (x < 2000) return 'SERIBU ' + convert(x - 1000);
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' RIBU ' + convert(x % 1000);
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' JUTA ' + convert(x % 1000000);
    return x.toString();
  }

  return (convert(n).trim().replace(/\s+/g, ' ') + ' RUPIAH').toUpperCase();
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  team,
  config,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !team) return null;

  const receiptDate = team.paymentDate ? formatDateIndo(team.paymentDate) : formatDateIndo(new Date().toISOString().slice(0, 10));
  const remaining = Math.max(0, config.registrationFee - team.paidAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible print:block print-receipt-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:overflow-visible">
        {/* Modal Top Actions */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <span className="text-xs font-bold text-slate-700">
            Preview Kuitansi Resmi Turnamen
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kuitansi (Print/PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 sm:p-10 overflow-y-auto print:p-0 text-slate-900 bg-white print:overflow-visible print:w-full print:max-w-3xl print:mx-auto">
          <div className="border-4 border-double border-slate-800 p-6 sm:p-8 rounded-lg relative print:border-2 print:p-6 print:rounded-none print:m-0">
            {/* Header Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <img
                  src="/kingdc_logo.png"
                  alt="Logo Turnamen"
                  className="w-14 h-14 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="text-center flex-1 px-4">
                <div className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                  {config.organizer}
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950 font-display">
                  {config.name}
                </h1>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Sekretariat: {config.stadiumVenue}, {config.city} · Telp: {config.contactPhone}
                </div>
              </div>

              <div className="w-16 h-16 shrink-0 flex flex-col items-center justify-center border border-slate-300 rounded p-1 text-center bg-slate-50">
                <div className="text-[9px] font-bold text-slate-400 uppercase">QR Valid</div>
                <div className="text-base font-mono font-extrabold text-slate-800">LP</div>
                <div className="text-[8px] text-slate-400">RESMI</div>
              </div>
            </div>

            {/* Document Title & No */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide uppercase underline decoration-2 underline-offset-4">
                BUKTI PEMBAYARAN / KUITANSI
              </h2>
              <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                NO: {team.receiptNumber || 'KWT-LP/2026/REG-001'}
              </div>
            </div>

            {/* Receipt Table Details */}
            <div className="space-y-3 text-xs leading-relaxed mb-6">
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200">
                <div className="col-span-4 font-semibold text-slate-600">Telah Diterima Dari</div>
                <div className="col-span-8 font-bold text-slate-900 uppercase">
                  {team.name} ({team.code}) — {team.originCity}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200">
                <div className="col-span-4 font-semibold text-slate-600">Penanggung Jawab</div>
                <div className="col-span-8 font-semibold text-slate-800">
                  {team.managerName} ({team.managerPhone})
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200">
                <div className="col-span-4 font-semibold text-slate-600">Uang Sejumlah</div>
                <div className="col-span-8 font-extrabold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200 font-mono">
                  {terbilangRupiah(team.paidAmount)}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200">
                <div className="col-span-4 font-semibold text-slate-600">Untuk Pembayaran</div>
                <div className="col-span-8 text-slate-800 font-medium">
                  Biaya Pendaftaran <strong>{config.name ? config.name.trim() : 'Handayani Cup'} {config.edition || '2026'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200">
                <div className="col-span-4 font-semibold text-slate-600">Status Pembayaran</div>
                <div className="col-span-8 font-bold text-slate-900">
                  {team.paymentStatus === 'paid' ? (
                    <span className="text-emerald-700">LUNAS PENUH ({formatRupiah(team.paidAmount)})</span>
                  ) : team.paymentStatus === 'down_payment' ? (
                    <span className="text-indigo-700">
                      UANG MUKA / DP (Terbayar: {formatRupiah(team.paidAmount)} · Sisa: {formatRupiah(remaining)})
                    </span>
                  ) : (
                    <span className="text-rose-700">BELUM MELAKUKAN PEMBAYARAN</span>
                  )}
                </div>
              </div>
            </div>

            {/* Official Portal Access Credentials Box - Issued Only When Paid */}
            {team.paymentStatus === 'paid' ? (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50/90 border-2 border-emerald-600 text-left">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-300">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-800" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-950">
                      KODE AKSES LOGIN PORTAL RESMI TIM
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-700 text-white uppercase tracking-wider">
                    STATUS: AKTIF (LUNAS)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-white rounded border border-emerald-300 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-sans font-semibold uppercase block mb-1">
                      Username Login:
                    </span>
                    <strong className="text-slate-950 text-sm select-all font-bold">
                      {team.portalUsername || getDefaultTeamUsername(team)}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-emerald-300 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-sans font-semibold uppercase block mb-1">
                      Kata Sandi / PIN Akses:
                    </span>
                    <strong className="text-emerald-950 text-sm font-black tracking-wider select-all">
                      {team.portalPassword || getDefaultTeamPassword(team)}
                    </strong>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-950 mt-2.5 leading-relaxed font-sans">
                  *Gunakan username & kode sandi di atas pada menu <strong>Akses Tim Peserta</strong> untuk melengkapi data skuad pemain resmi, mengunggah kartu BPJS Ketenagakerjaan, serta memantau audit keabsahan panitia.
                </div>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-300 text-left text-xs text-amber-900">
                <span className="font-bold">Informasi Akses Portal:</span> Kode login resmi tim diterbitkan secara otomatis dan dicantumkan pada kuitansi lunas setelah tim menyelesaikan pelunasan seluruh biaya pendaftaran.
              </div>
            )}

            {/* Amount Badge & Signatures */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pt-4">
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-left">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Jumlah Dibayar</div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono tabular-nums">
                  {formatRupiah(team.paidAmount)}
                </div>
              </div>

              <div className="text-center w-52">
                <div className="text-xs text-slate-600 mb-1">
                  {config.city}, {receiptDate}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Bendahara / Panpel Turnamen
                </div>

                {/* Ruang tanda tangan & stempel fisik */}
                <div className="h-16 my-1" />

                <div className="text-xs font-bold text-slate-900 min-h-[16px]">
                  {config.contactPerson && !config.contactPerson.toLowerCase().includes('bambang') && config.contactPerson.trim() !== ''
                    ? <span className="underline">{config.contactPerson.split('(')[0].trim()}</span>
                    : '( .................................... )'}
                </div>
              </div>
            </div>

            {/* Note footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
              Bukti pembayaran ini sah dan diterbitkan secara digital oleh Sistem Administrasi Turnamen KingDC. Harap disimpan sebagai bukti keabsahan registrasi tim.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
