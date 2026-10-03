import React from 'react';
import { TournamentConfig, Team } from '../types/tournament';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Wallet, 
  Calendar, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  Shuffle,
  FileCheck2,
  Printer,
  Shield,
  Newspaper,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  X,
  Edit3,
  Plus
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { INITIAL_TOURNAMENT_NEWS, TournamentNewsItem } from '../data/tournamentNewsData';
import { ManageNewsModal } from './ManageNewsModal';
import { loadTournamentNews, saveTournamentNews } from '../utils/storage';
import { fetchNewsApi, saveNewsApi, deleteAllNewsApi } from '../utils/api';

interface DashboardOverviewProps {
  config: TournamentConfig;
  teams: Team[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRegisterModal: () => void;
  onSelectTeam: (team: Team) => void;
  isTeamViewer?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  config,
  teams,
  setActiveTab,
  onOpenRegisterModal,
  onSelectTeam,
  isTeamViewer = false,
}) => {
  const verifiedTeams = teams.filter((t) => t.status === 'verified');
  const actionRequiredTeams = teams.filter((t) => t.status === 'action_required');
  const pendingTeams = teams.filter((t) => t.status === 'pending');
  const totalCollected = teams.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const targetRevenue = config.maxTeams * config.registrationFee;

  const quotaPercent = Math.min(100, Math.round((teams.length / config.maxTeams) * 100));
  const [newsList, setNewsList] = React.useState<TournamentNewsItem[]>(() => loadTournamentNews());
  const [selectedNews, setSelectedNews] = React.useState<TournamentNewsItem | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = React.useState<{ url: string; title: string; desc: string } | null>(null);
  const [isManageNewsModalOpen, setIsManageNewsModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchNewsApi().then((res) => {
      if (Array.isArray(res)) {
        setNewsList(res);
        saveTournamentNews(res);
      }
    });
  }, []);

  const handleUpdateNewsList = (updated: TournamentNewsItem[]) => {
    setNewsList(updated);
    saveTournamentNews(updated);
    for (const item of updated) {
      saveNewsApi(item);
    }
  };

  const handleResetNewsList = async () => {
    setNewsList([]);
    saveTournamentNews([]);
    await deleteAllNewsApi();
  };

  return (
    <div className="space-y-8 text-black">
      {/* Variation 23: Hero Banner with bold black typography */}
      <div className="h-[280px] sm:h-[300px] w-full bg-white relative border border-slate-200 mb-8 overflow-hidden group rounded-xs shadow-xs">
        <img
          src="/handayani_cup_banner.jpg"
          alt="Banner Handayani Cup"
          className="w-full h-full object-cover opacity-20 group-hover:opacity-25 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        
        <div className="absolute bottom-8 left-6 sm:bottom-10 sm:left-10 right-6 text-black">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black mb-2 font-black">
            Live Competition // {config.city.toUpperCase()}
          </div>
          <h1 className="font-syne text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[0.92] mb-4">
            {config.name}
          </h1>
          <div className="flex flex-wrap items-center gap-5 font-mono-tech text-[11px] text-black font-bold">
            <span className="flex items-center gap-1.5 text-black">
              <MapPin className="w-3.5 h-3.5 text-black" />
              Loc: {config.stadiumVenue}
            </span>
            <a
              href="tel:081237970080"
              className="flex items-center gap-1.5 text-black hover:underline transition-colors"
              title="Hubungi Admin Portaz DC"
            >
              <Phone className="w-3.5 h-3.5 text-black" />
              Tel: 081237970080 (Portaz DC)
            </a>
            <span className="flex items-center gap-1.5 text-black">
              <Mail className="w-3.5 h-3.5 text-black" />
              Mail: hogatodafc@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Variation 23: High-Density Stat Box Grid with black text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-slate-200 border border-slate-200 mb-8 rounded-xs overflow-hidden shadow-xs">
        <div className="bg-white p-6">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black">
            Quota Utilization
          </div>
          <div className="font-mono-tech text-3xl sm:text-[32px] font-black text-black my-2 tracking-[-0.04em]">
            {quotaPercent}%
          </div>
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-bold">
            {teams.length} / {config.maxTeams} Teams
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black">
            Verified Status
          </div>
          <div className="font-mono-tech text-3xl sm:text-[32px] font-black text-black my-2 tracking-[-0.04em]">
            {verifiedTeams.length < 10 ? `0${verifiedTeams.length}` : verifiedTeams.length}
          </div>
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-bold">
            {verifiedTeams.length} Teams Confirmed
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black">
            Pending Review
          </div>
          <div className="font-mono-tech text-3xl sm:text-[32px] font-black text-black my-2 tracking-[-0.04em]">
            {pendingTeams.length < 10 ? `0${pendingTeams.length}` : pendingTeams.length}
          </div>
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-bold">
            {pendingTeams.length} New • {actionRequiredTeams.length} Fix
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black">
            Collected Fees
          </div>
          <div className="font-mono-tech text-xl sm:text-2xl font-black text-black my-2 tracking-[-0.04em] truncate">
            {formatRupiah(totalCollected)}
          </div>
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-bold">
            Of {formatRupiah(targetRevenue)}
          </div>
        </div>
      </div>

      {/* Action Required Banner with high-contrast black text */}
      {!isTeamViewer && actionRequiredTeams.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xs p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-tech text-black shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider">
                AUDIT ALERT: {actionRequiredTeams.length} TEAMS REQUIRE REVISION
              </h2>
              <p className="text-[11px] text-black font-semibold mt-0.5">
                Dokumen NIK atau batasan umur regulasi {config.category} memerlukan peninjauan verifikator.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('screening')}
            className="px-4 py-2 text-xs font-mono-tech font-bold uppercase tracking-wider text-black bg-amber-300 hover:bg-amber-400 border border-black rounded-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
          >
            <span>SCREENING // EXECUTE</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      )}

      {/* Variation 23: Module Grid with black text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setActiveTab('screening')}
          className="border border-slate-200 hover:border-black p-5 bg-white transition-colors cursor-pointer group rounded-xs shadow-xs"
        >
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black mb-3">Module // 01</div>
          <div className="font-black text-sm text-black mb-1 uppercase tracking-wide">Screening</div>
          <div className="font-mono-tech text-[10px] text-black font-bold uppercase">Verify Documents & NIK</div>
        </div>

        <div 
          onClick={() => setActiveTab('drawing')}
          className="border border-slate-200 hover:border-black p-5 bg-white transition-colors cursor-pointer group rounded-xs shadow-xs"
        >
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black mb-3">Module // 02</div>
          <div className="font-black text-sm text-black mb-1 uppercase tracking-wide">Drawing</div>
          <div className="font-mono-tech text-[10px] text-black font-bold uppercase">Live Pot Allocation</div>
        </div>

        <div 
          onClick={() => setActiveTab('schedule')}
          className="border border-slate-200 hover:border-black p-5 bg-white transition-colors cursor-pointer group rounded-xs shadow-xs"
        >
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black mb-3">Module // 03</div>
          <div className="font-black text-sm text-black mb-1 uppercase tracking-wide">Scheduling</div>
          <div className="font-mono-tech text-[10px] text-black font-bold uppercase">Match Masterlist</div>
        </div>

        <div 
          onClick={() => setActiveTab('finance')}
          className="border border-slate-200 hover:border-black p-5 bg-white transition-colors cursor-pointer group rounded-xs shadow-xs"
        >
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black font-black mb-3">Module // 04</div>
          <div className="font-black text-sm text-black mb-1 uppercase tracking-wide">Finance</div>
          <div className="font-mono-tech text-[10px] text-black font-bold uppercase">Receipts & ID Cards</div>
        </div>
      </div>

      {/* Variation 23: Panel - Registration Backlog with black text */}
      <div className="bg-white border border-slate-200 mb-8 overflow-hidden rounded-xs shadow-xs">
        <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-200 flex justify-between items-center gap-3 bg-white">
          <div className="font-black uppercase tracking-[0.05em] text-xs font-mono-tech text-black">
            Registration Backlog
          </div>
          <div className="flex items-center gap-2">
            {!isTeamViewer && (
              <button
                onClick={onOpenRegisterModal}
                className="px-3 py-1.5 text-xs font-mono-tech font-bold uppercase tracking-wider text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs transition-colors cursor-pointer"
              >
                + DAFTAR TIM
              </button>
            )}
            <button
              onClick={() => setActiveTab('teams')}
              className="bg-black hover:bg-slate-800 text-white font-mono-tech text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider rounded-xs cursor-pointer"
            >
              EXPORT_ALL
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black">Team ID</th>
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black">Hometown</th>
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black">Personnel</th>
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black">Roster</th>
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black">Financials</th>
                <th className="font-mono-tech uppercase text-[10px] py-3 px-5 text-black font-black text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teams.slice(0, 8).map((team) => (
                <tr 
                  key={team.id}
                  onClick={() => onSelectTeam(team)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xs flex items-center justify-center font-bold text-[10px] font-mono-tech text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: team.primaryJerseyColor || '#000000' }}
                      >
                        {team.code}
                      </div>
                      <div>
                        <div className="font-bold text-black text-xs">{team.name}</div>
                        <div className="text-[10px] font-mono-tech text-black font-semibold">ID: {team.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-black font-mono-tech text-xs font-semibold">
                    {team.originCity}
                  </td>
                  <td className="py-3.5 px-5 text-black text-xs font-medium">
                    <div className="font-bold text-black">{team.managerName}</div>
                    <div className="text-[10px] text-black font-semibold">Plth: {team.headCoachName}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono-tech text-xs text-black font-black">
                    {team.players.length} Men
                  </td>
                  <td className="py-3.5 px-5 font-mono-tech text-xs">
                    {team.paymentStatus === 'paid' ? (
                      <span className="text-black font-black">{formatRupiah(team.paidAmount)}</span>
                    ) : team.paymentStatus === 'down_payment' ? (
                      <span className="text-black font-black">DP {formatRupiah(team.paidAmount)}</span>
                    ) : (
                      <span className="text-black font-semibold">Rp 0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {team.status === 'verified' ? (
                      <span className="badge-sah text-black font-bold">VERIFIED</span>
                    ) : team.status === 'action_required' ? (
                      <span className="badge-pending text-black font-bold">REVISION</span>
                    ) : (
                      <span className="badge-pending text-black font-bold">REVIEW</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variation 23: Galeri Foto & Berita Seputar Turnamen with black text */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 space-y-5 rounded-xs shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xs bg-slate-100 text-black">
                <Newspaper className="w-4 h-4 text-black" />
              </span>
              <h2 className="text-sm font-black text-black uppercase font-mono-tech tracking-wide">
                Galeri Foto & Berita Seputar Turnamen
              </h2>
              <span className="text-[10px] font-mono-tech font-bold text-black bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                {config.name}
              </span>
            </div>
            <p className="text-xs text-black font-medium mt-1 font-mono-tech">
              Dokumentasi resmi, rilis berita pertandingan, dan galeri foto lapangan turnamen {config.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isTeamViewer && (
              <button
                type="button"
                onClick={() => setIsManageNewsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-bold uppercase text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-black" />
                <span>Kelola Berita & Foto</span>
              </button>
            )}
            <span className="text-xs font-mono-tech text-black font-bold">
              {newsList.length} Konten
            </span>
          </div>
        </div>

        {/* News & Photo Grid */}
        {newsList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xs p-8 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <ImageIcon className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase font-mono-tech">
              Belum Ada Berita & Galeri Foto
            </h3>
            <p className="text-xs text-slate-500 font-mono-tech mt-1 max-w-md mx-auto">
              Data publikasi berita dan dokumentasi foto turnamen saat ini masih kosong.
            </p>
            {!isTeamViewer && (
              <button
                type="button"
                onClick={() => setIsManageNewsModalOpen(true)}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-bold uppercase text-white bg-slate-900 hover:bg-slate-800 rounded-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Berita / Foto Baru</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {newsList.map((item) => (
              <div
                key={item.id}
                className="group bg-white hover:bg-slate-50 rounded-xs border border-slate-200 hover:border-black transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative shadow-2xs"
                onClick={() => setSelectedNews(item)}
              >
                {/* Card Image with Tag & Hover Preview Zoom */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', '/handayani_cup_banner.jpg');
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white text-black border border-black">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {!isTeamViewer && (
                      <button
                        type="button"
                        title="Edit Berita/Foto Ini"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsManageNewsModalOpen(true);
                        }}
                        className="p-1.5 rounded-xs bg-white hover:bg-slate-100 text-black border border-black transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Perbesar Foto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoPreview({
                          url: item.imageUrl,
                          title: item.title,
                          desc: item.summary,
                        });
                      }}
                      className="p-1.5 rounded-xs bg-white hover:bg-slate-100 text-black border border-black transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-black font-mono-tech font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-black" />
                        {formatDateIndo(item.date)}
                      </span>
                      <span>{item.readTime || '2 mnt'}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-black group-hover:underline transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-black line-clamp-2 leading-relaxed font-mono-tech text-[11px] font-medium">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono-tech">
                    <span className="text-black font-semibold truncate max-w-[120px]">
                      Oleh: {item.author}
                    </span>
                    <span className="text-black font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Baca <ChevronRight className="w-3 h-3 text-black" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Detail Berita */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xs max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300">
            <div className="relative aspect-video w-full bg-slate-100">
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 p-1.5 rounded-xs bg-white text-black border border-black hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-black" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-black text-white">
                  {selectedNews.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-black">
              <div className="flex items-center gap-3 text-xs text-black font-mono-tech font-bold">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-black" />
                  {formatDateIndo(selectedNews.date)}
                </span>
                <span>•</span>
                <span>Penulis: <strong className="text-black">{selectedNews.author}</strong></span>
                <span>•</span>
                <span>{selectedNews.readTime || '3 mnt baca'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-black font-syne leading-tight uppercase">
                {selectedNews.title}
              </h2>

              <p className="text-sm font-medium text-black leading-relaxed bg-slate-50 p-3.5 rounded-xs border border-slate-200 font-mono-tech text-[12px]">
                {selectedNews.summary}
              </p>

              {selectedNews.content && (
                <div className="text-sm text-black leading-relaxed space-y-3 font-sans">
                  <p>{selectedNews.content}</p>
                  <p>
                    Turnamen Handayani Cup 2026 terus berkomitmen memberikan wadah positif bagi talenta pesepakbola tanah air, menjaga sportivitas, serta mempererat tali persaudaraan antar tim peserta di Stadion Ampera & Lapangan Ampera Mataloko.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs font-mono-tech text-black font-bold">
                  Media & Publikasi Resmi {config.name}
                </div>
                <div className="flex items-center gap-2">
                  {!isTeamViewer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNews(null);
                        setIsManageNewsModalOpen(true);
                      }}
                      className="px-3.5 py-2 text-xs font-mono-tech font-bold uppercase text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-black" />
                      <span>Edit Berita Ini</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedNews(null)}
                    className="px-4 py-2 text-xs font-mono-tech font-bold uppercase text-black bg-white hover:bg-slate-100 border border-black rounded-xs transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Preview Foto Penuh */}
      {selectedPhotoPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhotoPreview.url}
                alt={selectedPhotoPreview.title}
                className="w-full h-auto max-h-[75vh] object-contain"
              />
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold">{selectedPhotoPreview.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{selectedPhotoPreview.desc}</p>
              </div>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Kelola / Edit Berita & Galeri Foto */}
      <ManageNewsModal
        isOpen={isManageNewsModalOpen}
        onClose={() => setIsManageNewsModalOpen(false)}
        newsList={newsList}
        onSaveNewsList={handleUpdateNewsList}
        onResetToDefault={handleResetNewsList}
      />
    </div>
  );
};
