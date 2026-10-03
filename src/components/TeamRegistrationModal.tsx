import React, { useState, useEffect } from 'react';
import { Team, Player, TournamentConfig, PlayerPosition } from '../types/tournament';
import { calculateAge, generateReceiptNumber } from '../utils/formatters';
import { getDefaultTeamUsername, getDefaultTeamPassword } from '../utils/credentials';
import { compressAndUpload } from '../utils/imageUtils';
import { X, Plus, Trash2, AlertCircle, Check, Shield, Camera, Upload, User, Image as ImageIcon, FileText, Eye, ShieldCheck, CreditCard } from 'lucide-react';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Team) => void;
  initialTeam?: Team | null;
  config: TournamentConfig;
}

export const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTeam,
  config,
}) => {
  const isEditing = !!initialTeam;

  // Form tab states
  const [activeTab, setActiveTab] = useState<'info' | 'officials' | 'players' | 'payment'>('info');

  // Form values
  const [name, setName] = useState(initialTeam?.name || '');
  const [code, setCode] = useState(initialTeam?.code || '');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialTeam?.logoUrl);
  const [originCity, setOriginCity] = useState(initialTeam?.originCity || '');
  const [originProvince, setOriginProvince] = useState(initialTeam?.originProvince || 'DKI Jakarta');
  const [establishedYear, setEstablishedYear] = useState<number>(initialTeam?.establishedYear || 2018);
  const [primaryJerseyColor, setPrimaryJerseyColor] = useState(initialTeam?.primaryJerseyColor || '#DC2626');
  const [secondaryJerseyColor, setSecondaryJerseyColor] = useState(initialTeam?.secondaryJerseyColor || '#FFFFFF');
  const [stadiumHome, setStadiumHome] = useState(initialTeam?.stadiumHome || '');

  // Officials (Official 5: 1 Manager, 1 Pelatih Kepala, 2 Asisten Pelatih, 1 Medis)
  const [managerName, setManagerName] = useState(initialTeam?.managerName || '');
  const [managerPhone, setManagerPhone] = useState(initialTeam?.managerPhone || '');
  const [headCoachName, setHeadCoachName] = useState(initialTeam?.headCoachName || '');
  const [assistantCoach1Name, setAssistantCoach1Name] = useState(
    initialTeam?.officials.filter((o) => o.role === 'Asisten Pelatih')[0]?.name || ''
  );
  const [assistantCoach2Name, setAssistantCoach2Name] = useState(
    initialTeam?.officials.filter((o) => o.role === 'Asisten Pelatih')[1]?.name || ''
  );
  const [medicName, setMedicName] = useState(
    initialTeam?.officials.find((o) => o.role === 'Medis/Fisioterapis')?.name || ''
  );

  // Players
  const [players, setPlayers] = useState<Player[]>(
    initialTeam?.players || [
      { id: 'new-p1', number: 1, name: '', position: 'GK', birthDate: '2009-04-12', nik: '', heightCm: 180, weightKg: 70, isVerified: false },
      { id: 'new-p2', number: 4, name: '', position: 'DF', birthDate: '2009-06-18', nik: '', heightCm: 178, weightKg: 68, isCaptain: true, isVerified: false },
      { id: 'new-p3', number: 8, name: '', position: 'MF', birthDate: '2009-03-25', nik: '', heightCm: 172, weightKg: 64, isVerified: false },
      { id: 'new-p4', number: 9, name: '', position: 'FW', birthDate: '2009-09-09', nik: '', heightCm: 181, weightKg: 72, isVerified: false },
    ]
  );

  // Payment & status
  const [status, setStatus] = useState<Team['status']>(initialTeam?.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState<Team['paymentStatus']>(initialTeam?.paymentStatus || 'unpaid');
  const [paidAmount, setPaidAmount] = useState<number>(initialTeam?.paidAmount || 0);
  const [teamBpjsDocumentUrl, setTeamBpjsDocumentUrl] = useState<string | undefined>(initialTeam?.teamBpjsDocumentUrl);

  // Lightbox preview for uploaded documents (KTP, BPJS, etc.)
  const [previewDoc, setPreviewDoc] = useState<{ title: string; subtitle?: string; imageUrl: string } | null>(null);

  // Validation feedback
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTeam) {
      setName(initialTeam.name);
      setCode(initialTeam.code);
      setLogoUrl(initialTeam.logoUrl);
      setOriginCity(initialTeam.originCity);
      setOriginProvince(initialTeam.originProvince || 'DKI Jakarta');
      setEstablishedYear(initialTeam.establishedYear || 2018);
      setPrimaryJerseyColor(initialTeam.primaryJerseyColor || '#DC2626');
      setSecondaryJerseyColor(initialTeam.secondaryJerseyColor || '#FFFFFF');
      setStadiumHome(initialTeam.stadiumHome || '');
      setManagerName(initialTeam.managerName || '');
      setManagerPhone(initialTeam.managerPhone || '');
      setHeadCoachName(initialTeam.headCoachName || '');
      const asstCoaches = initialTeam.officials.filter((o) => o.role === 'Asisten Pelatih');
      setAssistantCoach1Name(asstCoaches[0]?.name || '');
      setAssistantCoach2Name(asstCoaches[1]?.name || '');
      const medOfficial = initialTeam.officials.find((o) => o.role === 'Medis/Fisioterapis');
      setMedicName(medOfficial?.name || '');
      setPlayers(initialTeam.players || []);
      setStatus(initialTeam.status);
      setPaymentStatus(initialTeam.paymentStatus);
      setPaidAmount(initialTeam.paidAmount || 0);
      setTeamBpjsDocumentUrl(initialTeam.teamBpjsDocumentUrl);
    } else {
      setName('');
      setCode('');
      setLogoUrl(undefined);
      setOriginCity('');
      setOriginProvince('DKI Jakarta');
      setEstablishedYear(2018);
      setPrimaryJerseyColor('#DC2626');
      setSecondaryJerseyColor('#FFFFFF');
      setStadiumHome('');
      setManagerName('');
      setManagerPhone('');
      setHeadCoachName('');
      setAssistantCoach1Name('');
      setAssistantCoach2Name('');
      setMedicName('');
      setPlayers([
        { id: 'new-p1', number: 1, name: '', position: 'GK', birthDate: '2009-04-12', nik: '', heightCm: 180, weightKg: 70, isVerified: false },
        { id: 'new-p2', number: 4, name: '', position: 'DF', birthDate: '2009-06-18', nik: '', heightCm: 178, weightKg: 68, isCaptain: true, isVerified: false },
        { id: 'new-p3', number: 8, name: '', position: 'MF', birthDate: '2009-03-25', nik: '', heightCm: 172, weightKg: 64, isVerified: false },
        { id: 'new-p4', number: 9, name: '', position: 'FW', birthDate: '2009-09-09', nik: '', heightCm: 181, weightKg: 72, isVerified: false },
      ]);
      setStatus('pending');
      setPaymentStatus('unpaid');
      setPaidAmount(0);
      setTeamBpjsDocumentUrl(undefined);
    }
    setActiveTab('info');
    setErrors([]);
  }, [initialTeam, isOpen]);

  // Handle Team Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const dataUrl = await compressAndUpload(file, 350, 350, 0.85);
      setLogoUrl(dataUrl);
    } catch (err) {
      alert('Gagal memproses gambar logo: ' + String(err));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle Player Photo Upload
  const handlePlayerPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndUpload(file, 260, 260, 0.85);
      handleUpdatePlayer(index, 'photoUrl', dataUrl);
    } catch (err) {
      alert('Gagal memproses foto pemain: ' + String(err));
    }
  };

  // Handle Player KTP / KIA Photo Upload
  const handlePlayerKtpUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndUpload(file, 800, 520, 0.82);
      handleUpdatePlayer(index, 'ktpPhotoUrl', dataUrl);
    } catch (err) {
      alert('Gagal memproses foto KTP: ' + String(err));
    }
  };

  // Handle Player BPJS Ketenagakerjaan Photo Upload
  const handlePlayerBpjsUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndUpload(file, 800, 520, 0.82);
      handleUpdatePlayer(index, 'bpjsPhotoUrl', dataUrl);
    } catch (err) {
      alert('Gagal memproses foto BPJS Ketenagakerjaan: ' + String(err));
    }
  };

  // Handle Team Collective BPJS Document Upload
  const handleTeamBpjsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndUpload(file, 900, 650, 0.82);
      setTeamBpjsDocumentUrl(dataUrl);
    } catch (err) {
      alert('Gagal memproses dokumen BPJS tim: ' + String(err));
    }
  };

  // Add new player row
  const handleAddPlayer = () => {
    const existingNumbers = new Set(players.map((p) => p.number));
    let nextNum = 1;
    while (existingNumbers.has(nextNum)) {
      nextNum++;
    }

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      number: nextNum,
      name: '',
      position: 'MF',
      birthDate: '2009-05-15',
      nik: '',
      heightCm: 175,
      weightKg: 65,
      isVerified: false,
    };
    setPlayers([...players, newPlayer]);
  };

  const handleUpdatePlayer = (index: number, field: keyof Player, value: any) => {
    const updated = [...players];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPlayers(updated);
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errList: string[] = [];

    if (!name.trim()) errList.push('Nama tim wajib diisi');
    if (!originCity.trim()) errList.push('Asal kota tim wajib diisi');
    if (!managerName.trim()) errList.push('Nama manajer wajib diisi');
    if (!headCoachName.trim()) errList.push('Nama pelatih kepala wajib diisi');

    // Check duplicate player numbers
    const numSet = new Set<number>();
    const dupes: number[] = [];
    players.forEach((p) => {
      if (numSet.has(p.number)) dupes.push(p.number);
      numSet.add(p.number);
    });
    if (dupes.length > 0) {
      errList.push(`Terdapat nomor punggung ganda: #${dupes.join(', #')}`);
    }

    if (errList.length > 0) {
      setErrors(errList);
      return;
    }

    const calculatedCode = code.trim() || name.substring(0, 3).toUpperCase();

    const teamOfficials = [
      { id: 'off-m', name: managerName.trim(), role: 'Manajer' as const, phone: managerPhone.trim() },
      { id: 'off-c', name: headCoachName.trim(), role: 'Pelatih Kepala' as const, phone: '' },
      ...(assistantCoach1Name.trim()
        ? [{ id: 'off-ac1', name: assistantCoach1Name.trim(), role: 'Asisten Pelatih' as const, phone: '' }]
        : []),
      ...(assistantCoach2Name.trim()
        ? [{ id: 'off-ac2', name: assistantCoach2Name.trim(), role: 'Asisten Pelatih' as const, phone: '' }]
        : []),
      ...(medicName.trim()
        ? [{ id: 'off-med', name: medicName.trim(), role: 'Medis/Fisioterapis' as const, phone: '' }]
        : []),
    ];

    const teamToSave: Team = {
      id: initialTeam?.id || `team-${Date.now()}`,
      name: name.trim(),
      code: calculatedCode,
      originCity: originCity.trim(),
      originProvince: originProvince.trim(),
      establishedYear: Number(establishedYear) || 2020,
      logoUrl: logoUrl || undefined,
      primaryJerseyColor,
      secondaryJerseyColor,
      managerName: managerName.trim(),
      managerPhone: managerPhone.trim(),
      headCoachName: headCoachName.trim(),
      stadiumHome: stadiumHome.trim() || undefined,
      players,
      officials: teamOfficials,
      registrationDate: initialTeam?.registrationDate || new Date().toISOString().slice(0, 10),
      status,
      paymentStatus,
      paidAmount: Number(paidAmount) || 0,
      paymentDate: paidAmount > 0 ? (initialTeam?.paymentDate || new Date().toISOString().slice(0, 10)) : undefined,
      receiptNumber: initialTeam?.receiptNumber || (paidAmount > 0 ? generateReceiptNumber(calculatedCode) : undefined),
      assignedGroup: initialTeam?.assignedGroup,
      screeningNotes: initialTeam?.screeningNotes,
      teamBpjsDocumentUrl,
      portalUsername: initialTeam?.portalUsername || (paymentStatus === 'paid' ? getDefaultTeamUsername({ code: calculatedCode, name }) : undefined),
      portalPassword: initialTeam?.portalPassword || (paymentStatus === 'paid' ? getDefaultTeamPassword({ code: calculatedCode }) : undefined),
      credentialsIssuedAt: initialTeam?.credentialsIssuedAt || (paymentStatus === 'paid' ? new Date().toISOString() : undefined),
    };

    onSave(teamToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {isEditing ? `Edit Administrasi: ${initialTeam?.name}` : 'Formulir Pendaftaran Tim Turnamen'}
            </h2>
            <p className="text-xs text-slate-500">
              Kategori: <strong>{config.category}</strong>
              {config.maxAgeLimit < 90 && !config.category.toLowerCase().includes('open') && !config.category.toLowerCase().includes('umum') && (
                <span> (Maksimal Usia {config.maxAgeLimit} Thn)</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Profil Klub & Jersey
          </button>
          <button
            onClick={() => setActiveTab('officials')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'officials'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Official & Manajemen
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'players'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. Roster Skuad Pemain</span>
            <span className="font-mono tabular-nums text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {players.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'payment'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Status & Pembayaran
          </button>
        </div>

        {/* Error notification banner */}
        {errors.length > 0 && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Harap lengkapi isian wajib berikut:</span>
            </div>
            {errors.map((e, idx) => (
              <div key={idx}>• {e}</div>
            ))}
          </div>
        )}

        {/* Tab Contents */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Logo Tim Upload Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div 
                    className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-xs flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: !logoUrl ? primaryJerseyColor + '12' : '#ffffff' }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Tim" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Shield className="w-8 h-8 mb-0.5" style={{ color: primaryJerseyColor }} />
                        <span className="text-[10px] font-mono font-bold uppercase" style={{ color: primaryJerseyColor }}>
                          {code || 'LOGO'}
                        </span>
                      </div>
                    )}
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl(undefined)}
                      title="Hapus Logo"
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-sm hover:bg-rose-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold text-slate-800">
                    Logo Resmi Tim Sepak Bola
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Unggah lambang/logo klub resmi (JPG, PNG, atau SVG). Logo akan otomatis tampil di kartu ID Card akreditasi, kuitansi pendaftaran, dan daftar susunan pemain (DSP).
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isUploadingLogo ? 'Memproses...' : logoUrl ? 'Ganti Logo Klub' : 'Pilih File Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingLogo}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl(undefined)}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Klub Sepak Bola *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Garuda Muda FC / SSB Bintang Putra"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Singkatan / Kode (3-4 Huruf)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="GMD"
                    className="w-full px-3 py-2 text-xs uppercase font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota / Kabupaten Asal *
                  </label>
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan / Surabaya"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Berdiri Klub
                  </label>
                  <input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(Number(e.target.value))}
                    min={1900}
                    max={2026}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warna Jersey Utama (Kandang / Home)
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <input
                      type="color"
                      value={primaryJerseyColor}
                      onChange={(e) => setPrimaryJerseyColor(e.target.value)}
                      className="w-10 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
                      title="Klik untuk memilih warna"
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs inline-block"
                        style={{ backgroundColor: primaryJerseyColor }}
                      />
                      <span className="text-xs font-medium text-slate-700">Warna Terpilih</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warna Jersey Cadangan (Tandang / Away)
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <input
                      type="color"
                      value={secondaryJerseyColor}
                      onChange={(e) => setSecondaryJerseyColor(e.target.value)}
                      className="w-10 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer"
                      title="Klik untuk memilih warna"
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs inline-block"
                        style={{ backgroundColor: secondaryJerseyColor }}
                      />
                      <span className="text-xs font-medium text-slate-700">Warna Terpilih</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIALS */}
          {activeTab === 'officials' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse inline-block" />
                  <span className="font-bold">Standar Official 5 Tim Turnamen:</span>
                  <span className="text-emerald-800">1 Manajer Tim, 1 Pelatih Kepala, 2 Asisten Pelatih, & 1 Staf Medis.</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[10px] uppercase tracking-wide">
                  Official 5
                </span>
              </div>

              {/* 1. MANAJER TIM */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">1</span>
                    1. Data Manajer Tim *
                  </h3>
                  <span className="text-[11px] text-rose-600 font-semibold">* Wajib</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Lengkap Manajer *
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="Nama Manajer Tim"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nomor HP / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. PELATIH KEPALA */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">2</span>
                    2. Pelatih Kepala (Head Coach) *
                  </h3>
                  <span className="text-[11px] text-rose-600 font-semibold">* Wajib</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Pelatih Kepala *
                  </label>
                  <input
                    type="text"
                    value={headCoachName}
                    onChange={(e) => setHeadCoachName(e.target.value)}
                    placeholder="Nama Pelatih Kepala"
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              {/* 3 & 4. DUA ASISTEN PELATIH */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">3 & 4</span>
                    3 & 4. Dua Asisten Pelatih (Assistant Coaches)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Official 5 (2 Orang)</span>
                </div>
                
                <div className="space-y-3">
                  {/* Asisten Pelatih 1 */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 mb-2">Asisten Pelatih 1</div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Asisten Pelatih 1
                      </label>
                      <input
                        type="text"
                        value={assistantCoach1Name}
                        onChange={(e) => setAssistantCoach1Name(e.target.value)}
                        placeholder="Nama Asisten Pelatih 1"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Asisten Pelatih 2 */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 mb-2">Asisten Pelatih 2</div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Asisten Pelatih 2
                      </label>
                      <input
                        type="text"
                        value={assistantCoach2Name}
                        onChange={(e) => setAssistantCoach2Name(e.target.value)}
                        placeholder="Nama Asisten Pelatih 2"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. STAF MEDIS / FISIOTERAPIS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">5</span>
                    5. Staf Medis / Fisioterapis Tim
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Official 5 (1 Orang)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Dokter / Medis / Fisioterapis
                  </label>
                  <input
                    type="text"
                    value={medicName}
                    onChange={(e) => setMedicName(e.target.value)}
                    placeholder="dr. Satrio / Fisioterapis Tim"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAYERS */}
          {activeTab === 'players' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-2">
                    <span>Daftar Susunan Pemain: {players.length} Pemain</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      KTP: {players.filter((p) => !!p.ktpPhotoUrl).length}/{players.length}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      BPJS: {players.filter((p) => !!p.bpjsPhotoUrl).length}/{players.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    <span className="text-slate-600 font-medium">
                      Wajib melampirkan pas foto, foto KTP / KIA, dan kartu BPJS Ketenagakerjaan per pemain.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pemain</span>
                  </button>
                </div>
              </div>

              {/* Player table rows */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 sticky top-0 font-semibold border-b border-slate-200 z-10">
                      <tr>
                        <th className="py-2.5 px-2 text-center w-12">No</th>
                        <th className="py-2.5 px-2 text-center w-14">Foto</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Nama Lengkap Pemain</th>
                        <th className="py-2.5 px-2 w-24">Posisi</th>
                        <th className="py-2.5 px-3 w-36">Tgl Lahir (Usia)</th>
                        <th className="py-2.5 px-2 text-center w-36 bg-blue-50/70 border-x border-blue-100 text-blue-900">
                          <div className="flex items-center justify-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <span>Foto KTP / KIA</span>
                          </div>
                        </th>
                        <th className="py-2.5 px-2 text-center w-36 bg-emerald-50/70 border-r border-emerald-100 text-emerald-900">
                          <div className="flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>BPJS Naker</span>
                          </div>
                        </th>
                        <th className="py-2.5 px-2 text-center w-14">Kapten</th>
                        <th className="py-2.5 px-2 text-center w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {players.map((p, idx) => {
                        const age = calculateAge(p.birthDate, config.tournamentStartDate);
                        const isOverage = config.maxAgeLimit < 90 && age > config.maxAgeLimit;

                        return (
                          <tr key={p.id || idx} className={isOverage ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                            {/* Jersey Number */}
                            <td className="py-1.5 px-2 text-center">
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={p.number}
                                onChange={(e) => handleUpdatePlayer(idx, 'number', Number(e.target.value))}
                                className="w-12 text-center font-mono font-bold text-xs py-1 border border-slate-300 rounded focus:outline-none"
                              />
                            </td>

                            {/* Player Photo Upload */}
                            <td className="py-1 px-2 text-center">
                              <div className="relative group/photo inline-block">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-2xs">
                                  {p.photoUrl ? (
                                    <img
                                      src={p.photoUrl}
                                      alt={p.name || 'Pemain'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>

                                {/* Hover trigger for upload */}
                                <label
                                  title={p.photoUrl ? 'Ganti Foto Pemain' : 'Unggah Foto Pas Pemain'}
                                  className="absolute inset-0 bg-slate-900/60 text-white rounded-lg flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePlayerPhotoUpload(idx, e)}
                                    className="hidden"
                                  />
                                </label>

                                {p.photoUrl && (
                                  <button
                                    type="button"
                                    title="Hapus foto"
                                    onClick={() => handleUpdatePlayer(idx, 'photoUrl', undefined)}
                                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Name */}
                            <td className="py-1.5 px-3">
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                                placeholder="Nama lengkap pemain..."
                                className="w-full text-xs py-1 px-2 border border-slate-300 rounded focus:outline-none"
                              />
                            </td>

                            {/* Position */}
                            <td className="py-1.5 px-2">
                              <select
                                value={p.position}
                                onChange={(e) => handleUpdatePlayer(idx, 'position', e.target.value as PlayerPosition)}
                                className="w-full text-xs py-1 px-1.5 border border-slate-300 rounded font-semibold bg-white cursor-pointer"
                              >
                                <option value="GK">GK - Kiper</option>
                                <option value="DF">DF - Bek</option>
                                <option value="MF">MF - Tengah</option>
                                <option value="FW">FW - Penyerang</option>
                              </select>
                            </td>

                            {/* Birth Date & Age */}
                            <td className="py-1.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="date"
                                  value={p.birthDate}
                                  onChange={(e) => handleUpdatePlayer(idx, 'birthDate', e.target.value)}
                                  className="text-xs py-1 px-1.5 border border-slate-300 rounded focus:outline-none font-mono"
                                />
                                <span className={`text-[11px] font-mono tabular-nums font-bold ${isOverage ? 'text-rose-600' : 'text-slate-500'}`}>
                                  ({age} th)
                                </span>
                              </div>
                              {isOverage && (
                                <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                                  Lewat batas usia U-{config.maxAgeLimit}!
                                </div>
                              )}
                            </td>

                            {/* Foto KTP / KIA Upload */}
                            <td className="py-1 px-2 text-center bg-blue-50/20 border-x border-blue-100/60">
                              {p.ktpPhotoUrl ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    title="Klik untuk pratinjau foto KTP/KIA"
                                    onClick={() =>
                                      setPreviewDoc({
                                        title: `Foto KTP / Kartu Identitas - #${p.number} ${p.name || 'Pemain'}`,
                                        subtitle: `Posisi: ${p.position}`,
                                        imageUrl: p.ktpPhotoUrl!,
                                      })
                                    }
                                    className="relative group/ktp w-10 h-7 rounded border border-blue-300 overflow-hidden bg-blue-50 shadow-2xs cursor-pointer hover:border-blue-600 transition-all flex items-center justify-center shrink-0"
                                  >
                                    <img
                                      src={p.ktpPhotoUrl}
                                      alt="KTP"
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute inset-0 bg-blue-900/60 text-white flex items-center justify-center opacity-0 group-hover/ktp:opacity-100 transition-opacity">
                                      <Eye className="w-3 h-3" />
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-0.5">
                                    <label
                                      title="Ganti Foto KTP"
                                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded cursor-pointer transition-colors"
                                    >
                                      <Camera className="w-3 h-3" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePlayerKtpUpload(idx, e)}
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      title="Hapus KTP"
                                      onClick={() => handleUpdatePlayer(idx, 'ktpPhotoUrl', undefined)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  title="Unggah Foto KTP / KIA Pemain"
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-md cursor-pointer transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                                >
                                  <Upload className="w-3 h-3 text-blue-600" />
                                  <span>+ KTP</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePlayerKtpUpload(idx, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </td>

                            {/* Foto BPJS Ketenagakerjaan Upload */}
                            <td className="py-1 px-2 text-center bg-emerald-50/20 border-r border-emerald-100/60">
                              {p.bpjsPhotoUrl ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    title="Klik untuk pratinjau kartu BPJS Ketenagakerjaan"
                                    onClick={() =>
                                      setPreviewDoc({
                                        title: `Kartu BPJS Ketenagakerjaan - #${p.number} ${p.name || 'Pemain'}`,
                                        subtitle: `Perlindungan Asuransi Atlet Turnamen Resmi`,
                                        imageUrl: p.bpjsPhotoUrl!,
                                      })
                                    }
                                    className="relative group/bpjs w-10 h-7 rounded border border-emerald-300 overflow-hidden bg-emerald-50 shadow-2xs cursor-pointer hover:border-emerald-600 transition-all flex items-center justify-center shrink-0"
                                  >
                                    <img
                                      src={p.bpjsPhotoUrl}
                                      alt="BPJS"
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute inset-0 bg-emerald-900/60 text-white flex items-center justify-center opacity-0 group-hover/bpjs:opacity-100 transition-opacity">
                                      <Eye className="w-3 h-3" />
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-0.5">
                                    <label
                                      title="Ganti Foto BPJS Ketenagakerjaan"
                                      className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer transition-colors"
                                    >
                                      <Camera className="w-3 h-3" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePlayerBpjsUpload(idx, e)}
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      title="Hapus BPJS"
                                      onClick={() => handleUpdatePlayer(idx, 'bpjsPhotoUrl', undefined)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  title="Unggah Foto Kartu BPJS Ketenagakerjaan Pemain"
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-md cursor-pointer transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>+ BPJS</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePlayerBpjsUpload(idx, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </td>

                            {/* Captain Check */}
                            <td className="py-1.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={!!p.isCaptain}
                                onChange={(e) => {
                                  // uncheck others
                                  const updated = players.map((pl, i) => ({
                                    ...pl,
                                    isCaptain: i === idx ? e.target.checked : false,
                                  }));
                                  setPlayers(updated);
                                }}
                                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                              />
                            </td>

                            {/* Delete */}
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT & STATUS */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                  Status Keabsahan Dokumen Panitia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status Verifikasi Tim
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="pending">Menunggu Review Panitia</option>
                      <option value="verified">Sah / Terverifikasi Lolos</option>
                      <option value="action_required">Perlu Perbaikan / Revisi Dokumen</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>

                  {/* Dokumen Kolektif BPJS Ketenagakerjaan Tim */}
                  <div className="sm:col-span-2 mt-2 pt-3 border-t border-slate-200/80">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sertifikat / Bukti Kolektif BPJS Ketenagakerjaan Tim (Opsional)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {teamBpjsDocumentUrl ? 'Dokumen BPJS Tim Terlampir' : 'Belum ada dokumen kolektif'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lampirkan sertifikat kepesertaan kontingen jika pendaftaran asuransi dilakukan secara terpadu oleh klub/Dispora.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {teamBpjsDocumentUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: `Sertifikat Kolektif BPJS Tim - ${name || 'Klub'}`,
                                  subtitle: 'Dokumen Asuransi Resmi Kontingen',
                                  imageUrl: teamBpjsDocumentUrl,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat</span>
                            </button>
                            <label className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ganti</span>
                              <input type="file" accept="image/*" onChange={handleTeamBpjsUpload} className="hidden" />
                            </label>
                            <button
                              type="button"
                              onClick={() => setTeamBpjsDocumentUrl(undefined)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                              title="Hapus berkas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <label className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Sertifikat BPJS Tim</span>
                            <input type="file" accept="image/*" onChange={handleTeamBpjsUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                  Administrasi Pembayaran Registrasi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status Pembayaran
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPaymentStatus(val);
                        if (val === 'paid' && paidAmount === 0) {
                          setPaidAmount(config.registrationFee);
                        } else if (val === 'unpaid') {
                          setPaidAmount(0);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="unpaid">Belum Membayar</option>
                      <option value="down_payment">Uang Muka (DP / Cicilan)</option>
                      <option value="paid">Lunas Penuh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nominal Pembayaran Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      step={50000}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Biaya resmi registrasi turnamen: Rp {config.registrationFee.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save & Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batalkan
            </button>
            <div className="flex items-center gap-2">
              {activeTab !== 'payment' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'info') setActiveTab('officials');
                    else if (activeTab === 'officials') setActiveTab('players');
                    else if (activeTab === 'players') setActiveTab('payment');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Lanjut ke Langkah Berikutnya
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isEditing ? 'Simpan Perubahan Tim' : 'Selesaikan & Daftarkan Tim'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
