import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Search,
  Download,
  Printer,
  Camera,
  PenTool,
  MapPin,
  Clock,
  UserCheck,
  Building2,
  Plus,
  X,
  AlertTriangle,
  Check,
  ShieldCheck,
  PackageCheck,
  History,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile } from '../types';
import { SignaturePad } from './SignaturePad';
import { listPOD, createPOD } from '../lib/pod';
import { ApiError } from '../lib/api';

export interface PODRecord {
  id: string;
  blNumber: string;
  containerNumber: string;
  clientName: string;
  deliveryAddress: string;
  driverName: string;
  truckImmatriculation: string;
  dateTime: string;
  gpsLocation: string;
  recipientName: string;
  status: 'LIVRE_CONFORME' | 'SOUS_RESERVES' | 'REFUSE' | 'EN_COURS';
  signatureData?: string;
  photoUrl?: string;
  observations?: string;
}

interface ProofOfDeliveryViewProps {
  currentUser: UserProfile | null;
  driversList?: UserProfile[];
}

// Aucune preuve de livraison fictive : la liste démarre vide. Chaque
// enregistrement réel est créé par un chauffeur lors d'une livraison.
export const DEMO_POD_RECORDS: PODRecord[] = [];

export const ProofOfDeliveryView: React.FC<ProofOfDeliveryViewProps> = ({
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MENU' | 'CREATE' | 'HISTORY'>('MENU');
  const [podRecords, setPodRecords] = useState<PODRecord[]>([]);
  const [isLoadingPOD, setIsLoadingPOD] = useState(true);
  const [podLoadError, setPodLoadError] = useState<string | null>(null);
  const [isSubmittingPOD, setIsSubmittingPOD] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPOD, setSelectedPOD] = useState<PODRecord | null>(null);

  const fetchPODRecords = React.useCallback(async () => {
    setIsLoadingPOD(true);
    setPodLoadError(null);
    try {
      const records = await listPOD();
      setPodRecords(records);
    } catch (err) {
      setPodLoadError(err instanceof ApiError ? err.message : 'Impossible de charger les preuves de livraison.');
    } finally {
      setIsLoadingPOD(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPODRecords();
  }, [fetchPODRecords]);

  // Modal Form State for New POD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blNumber, setBlNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [status, setStatus] = useState<PODRecord['status']>('LIVRE_CONFORME');
  const [signatureData, setSignatureData] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [observations, setObservations] = useState('');
  const [gpsLocation, setGpsLocation] = useState('');

  // Capture la position GPS réelle du navigateur à l'ouverture du
  // formulaire de création (best-effort : n'empêche jamais la création si
  // refusée ou indisponible).
  React.useEffect(() => {
    if (!isModalOpen || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGpsLocation(`Lat ${pos.coords.latitude.toFixed(4)}, Long ${pos.coords.longitude.toFixed(4)}`),
      () => setGpsLocation(''),
      { timeout: 8000 }
    );
  }, [isModalOpen]);

  // Filtered Records
  const filteredRecords = podRecords.filter((rec) => {
    const matchesSearch =
      rec.blNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapturePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreatePOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blNumber.trim() || !clientName.trim() || !recipientName.trim()) {
      alert('Veuillez remplir le N° BL, le nom du client et du récepteur.');
      return;
    }
    if (!signatureData) {
      alert('Veuillez capturer la signature numérique du destinataire.');
      return;
    }

    setIsSubmittingPOD(true);
    try {
      await createPOD({
        blNumber,
        containerNumber: containerNumber || 'N/A',
        clientName,
        deliveryAddress: deliveryAddress || '',
        driverName: currentUser?.name || 'Chauffeur YM-TRANSIT',
        truckImmatriculation: currentUser?.camionAssigne || 'Non renseigné',
        dateTime: `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        gpsLocation: gpsLocation || 'Non disponible',
        recipientName,
        status,
        signatureData,
        photoUrl: photoUrl || undefined,
        observations,
      });

      await fetchPODRecords();
      setIsModalOpen(false);

      // Reset Form
      setBlNumber('');
      setContainerNumber('');
      setClientName('');
      setDeliveryAddress('');
      setRecipientName('');
      setStatus('LIVRE_CONFORME');
      setSignatureData('');
      setPhotoUrl(null);
      setObservations('');
      setGpsLocation('');

      // Switch view to history automatically
      setActiveSubTab('HISTORY');
      alert('Preuve de livraison (POD) créée et enregistrée avec succès dans la base de données !');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Échec de l'enregistrement de la preuve de livraison.");
    } finally {
      setIsSubmittingPOD(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['N° POD', 'BL', 'Conteneur', 'Client', 'Adresse', 'Chauffeur', 'Date/Heure', 'Recepteur', 'Statut'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.blNumber,
      r.containerNumber,
      r.clientName,
      r.deliveryAddress,
      r.driverName,
      r.dateTime,
      r.recipientName,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `POD_YM_TRANSIT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <PackageCheck className="w-4 h-4" />
              <span>Gestion Numérique & Réception Client</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Preuves de Livraison (POD)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Validation des déchargements avec signatures électroniques, géolocalisation GPS, horodatage et photos.
            </p>
          </div>

          {activeSubTab !== 'MENU' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('MENU')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-700 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu Principal</span>
            </button>
          )}
        </div>

        {/* SUB-MENU NAVIGATION (WHEN INSIDE CREATE OR HISTORY) */}
        {activeSubTab !== 'MENU' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('CREATE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'CREATE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Créer preuve de livraison (POD)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('HISTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'HISTORY'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historique ({podRecords.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* MENU LAUNCHER: TWO CLEAN ACTION CARDS (WHEN ACTIVE SUB TAB IS MENU) */}
      {activeSubTab === 'MENU' && (
        <div className="max-w-2xl mx-auto space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ACTION CARD 1: CREATE POD */}
            <button
              type="button"
              onClick={() => setActiveSubTab('CREATE')}
              className="group relative bg-white hover:bg-emerald-50/50 p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm transition-all duration-200 text-left cursor-pointer flex flex-col justify-between min-h-[150px] active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Créer Preuve de Livraison (POD)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Signatures électroniques, géolocalisation GPS, horodatage et photos du conteneur.
                </p>
              </div>
            </button>

            {/* ACTION CARD 2: HISTORY POD */}
            <button
              type="button"
              onClick={() => setActiveSubTab('HISTORY')}
              className="group relative bg-white hover:bg-blue-50/50 p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 shadow-sm transition-all duration-200 text-left cursor-pointer flex flex-col justify-between min-h-[150px] active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <History className="w-6 h-6" />
                </div>
                <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Historique des Preuves de Livraison
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Consulter, rechercher, exporter en CSV et imprimer tous les récépissés enregistrés ({podRecords.length}).
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: CREATE POD FORM */}
      {activeSubTab === 'CREATE' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto space-y-5">
          <div className="flex items-center space-x-2.5 border-b pb-3 border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Saisie de Preuve de Livraison (POD)</h2>
              <p className="text-xs text-slate-500">Formulaire direct de réception client avec signature tactile</p>
            </div>
          </div>

          <form onSubmit={handleCreatePOD} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  N° Bon de Livraison (BL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={blNumber}
                  onChange={(e) => setBlNumber(e.target.value)}
                  placeholder="Ex: BL-2026-904"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">N° Conteneur</label>
                <input
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                  placeholder="Ex: MSCU-892014-9"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nom du Client & Entreprise <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: CIMENCAM Bonabéri, Douala"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Adresse Précise de Déchargement</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Ex: Zone Industrielle, Bonabéri Douala"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nom & Fonction du Récepteur / Destinataire <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: M. Jean-Paul Mbarga (Chef de Stock)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Conformité de la Livraison</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PODRecord['status'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="LIVRE_CONFORME">Livré Conforme (En parfait état)</option>
                <option value="SOUS_RESERVES">Livré Sous Réserves (Avarie partielle / Manquant)</option>
                <option value="REFUSE">Livraison Refusée par le Client</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Signature Numérique du Récepteur <span className="text-rose-500">*</span>
              </label>
              <SignaturePad
                label="Signature du récepteur"
                nom={recipientName}
                value={signatureData}
                date={new Date().toISOString().split('T')[0]}
                onSave={(_nom, signatureDataUrl) => setSignatureData(signatureDataUrl)}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Photo Justificative du Conteneur / Colis (Optionnel)</label>
              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48">
                  <img src={photoUrl} alt="Aperçu photo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Prendre photo du conteneur / plombage</span>
                </button>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Observations & Réserves</label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Saisissez ici les remarques éventuelles du récepteur..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <button
                type="submit"
                disabled={isSubmittingPOD}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingPOD ? 'Enregistrement…' : 'Valider et Enregistrer la Preuve de Livraison'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-VIEW 2: POD HISTORY & SEARCH */}
      {activeSubTab === 'HISTORY' && (
        <>
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par N° BL, conteneur, client ou chauffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="LIVRE_CONFORME">Livré Conforme (Vert)</option>
                <option value="SOUS_RESERVES">Sous Réserves (Orange)</option>
                <option value="REFUSE">Refusé (Rouge)</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>

          {/* POD RECORDS TABLE */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Registre des Preuves de Livraison ({filteredRecords.length} enregistrements)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Chiffrement & Horodatage actif</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Ref / BL / Conteneur</th>
                    <th className="py-3 px-3">Client & Destinataire</th>
                    <th className="py-3 px-3">Chauffeur & Camion</th>
                    <th className="py-3 px-3">Date & Horodatage</th>
                    <th className="py-3 px-3">Récepteur Signataire</th>
                    <th className="py-3 px-3 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        Aucune preuve de livraison enregistrée.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((pod) => (
                      <tr key={pod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-blue-700 block font-mono">{pod.id}</span>
                          <span className="text-[11px] font-bold text-slate-900 block">{pod.blNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{pod.containerNumber}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 block">{pod.clientName}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {pod.deliveryAddress}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 block">{pod.driverName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{pod.truckImmatriculation}</span>
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          <span className="text-slate-800 font-medium block">{pod.dateTime}</span>
                          <span className="text-[10px] text-slate-400 block">{pod.gpsLocation}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-800 block">{pod.recipientName}</span>
                          {pod.signatureData && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Signature Capturée
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              pod.status === 'LIVRE_CONFORME'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pod.status === 'SOUS_RESERVES'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {pod.status === 'LIVRE_CONFORME' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Livré Conforme
                              </>
                            ) : pod.status === 'SOUS_RESERVES' ? (
                              <>
                                <AlertTriangle className="w-3 h-3" /> Sous Réserves
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" /> Refusé
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedPOD(pod)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-blue-200"
                          >
                            Détails & Reçu
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DETAIL MODAL / SHEET */}
      {selectedPOD && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">{selectedPOD.id}</span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Récépissé Officiel de Preuve de Livraison
                </h3>
              </div>
              <button
                onClick={() => setSelectedPOD(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">N° Bon de Livraison (BL)</span>
                  <span className="font-extrabold text-slate-900 text-sm font-mono">{selectedPOD.blNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">N° Conteneur</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedPOD.containerNumber}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-[10px] text-slate-400 font-bold block">Client & Destinataire</span>
                <p className="font-bold text-slate-900">{selectedPOD.clientName}</p>
                <p className="text-slate-600">{selectedPOD.deliveryAddress}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Chauffeur YM-TRANSIT</span>
                  <p className="font-semibold text-slate-800">{selectedPOD.driverName} ({selectedPOD.truckImmatriculation})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Date & Horodatage</span>
                  <p className="font-semibold text-slate-800">{selectedPOD.dateTime}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Signature du Récepteur ({selectedPOD.recipientName})</span>
                {selectedPOD.signatureData ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-300 inline-block min-w-[200px]">
                    <img src={selectedPOD.signatureData} alt="Signature" className="h-16 object-contain" />
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Aucune signature enregistrée</span>
                )}
              </div>

              {selectedPOD.photoUrl && (
                <div className="border-t border-slate-200 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Photo Justificative</span>
                  <img src={selectedPOD.photoUrl} alt="Justificatif" className="w-full max-h-48 object-cover rounded-lg border" />
                </div>
              )}

              {selectedPOD.observations && (
                <div className="border-t border-slate-200 pt-2 bg-amber-50/50 p-2.5 rounded-lg border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold block">Observations & Réserves :</span>
                  <p className="text-slate-700 italic">{selectedPOD.observations}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Récépissé POD</span>
              </button>
              <button
                onClick={() => setSelectedPOD(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Saisie Preuve de Livraison (POD)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOD} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    N° Bon de Livraison (BL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blNumber}
                    onChange={(e) => setBlNumber(e.target.value)}
                    placeholder="Ex: BL-2026-904"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">N° Conteneur</label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value)}
                    placeholder="Ex: MSCU-892014"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nom du Client <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: CIMENCAM Douala"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse de Déchargement</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ex: Zone Industrielle Bonabéri, Douala"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nom du Récepteur / Destinataire <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: M. Jean-Paul Mbarga"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Conformité de Livraison</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PODRecord['status'])}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold"
                >
                  <option value="LIVRE_CONFORME">Livré Conforme (En bon état)</option>
                  <option value="SOUS_RESERVES">Livré Sous Réserves (Avarie / Manquant)</option>
                  <option value="REFUSE">Livraison Refusée par le Client</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Signature Numérique Client <span className="text-rose-500">*</span>
                </label>
                <SignaturePad
                  label="Signature du client"
                  nom={recipientName}
                  value={signatureData}
                  date={new Date().toISOString().split('T')[0]}
                  onSave={(_nom, signatureDataUrl) => setSignatureData(signatureDataUrl)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Justificative (Optionnel)</label>
                {photoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 max-h-36">
                    <img src={photoUrl} alt="Aperçu photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Capturer photo du conteneur/colis</span>
                  </button>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations / Réserves</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Remarques particulières lors du déchargement..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="submit"
                  disabled={isSubmittingPOD}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {isSubmittingPOD ? 'Enregistrement…' : 'Valider et Enregistrer POD'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
