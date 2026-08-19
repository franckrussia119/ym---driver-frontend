import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Package,
  Ship,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Wallet,
  Printer,
} from 'lucide-react';
import { formatFCFA } from '../types';
import { Container, ContainerReport, listContainers, getContainerReport } from '../lib/containers';
import { PrintableContainerReportView } from './PrintableContainerReportView';
import { listPOD } from '../lib/pod';
import { PODRecord } from './ProofOfDeliveryView';
import { ApiError } from '../lib/api';

type ViewMode = 'dashboard' | 'operations' | 'deliveries';

export const ContainerReportsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [containers, setContainers] = useState<Container[]>([]);
  const [deliveries, setDeliveries] = useState<PODRecord[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setContainers(await listContainers());
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger les données.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (viewMode !== 'deliveries' || deliveries.length > 0) return;
    setIsLoadingDeliveries(true);
    listPOD()
      .then(setDeliveries)
      .catch(() => {
        /* silencieux : la liste reste vide si le chargement échoue, l'utilisateur peut changer d'onglet et revenir */
      })
      .finally(() => setIsLoadingDeliveries(false));
  }, [viewMode, deliveries.length]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filtres — Rapport Opérations
  const [opsPortFilter, setOpsPortFilter] = useState<'ALL' | 'Douala' | 'Kribi'>('ALL');
  const [opsStatusFilter, setOpsStatusFilter] = useState<'ALL' | 'OUVERT' | 'FERME'>('ALL');
  const [opsFromDate, setOpsFromDate] = useState('');
  const [opsToDate, setOpsToDate] = useState('');
  const [opsAgentFilter, setOpsAgentFilter] = useState('');

  // Filtres — Rapport Livraisons
  const [delFromDate, setDelFromDate] = useState('');
  const [delToDate, setDelToDate] = useState('');
  const [delStatusFilter, setDelStatusFilter] = useState<'ALL' | PODRecord['status']>('ALL');
  const [report, setReport] = useState<ContainerReport | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const openReport = async (id: string) => {
    setSelectedId(id);
    setIsLoadingReport(true);
    setReportError(null);
    try {
      setReport(await getContainerReport(id));
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : 'Impossible de charger ce rapport.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  if (selectedId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedId(null); setReport(null); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au tableau de bord
          </button>
          {report && (
            <button
              onClick={() => setIsPrintOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Exporter en PDF
            </button>
          )}
        </div>

        {isPrintOpen && report && (
          <PrintableContainerReportView report={report} onClose={() => setIsPrintOpen(false)} />
        )}

        {isLoadingReport && (
          <div className="p-16 flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement du rapport…
          </div>
        )}
        {reportError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-4">{reportError}</div>
        )}

        {report && (
          <>
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
              <div className="font-mono text-xs text-blue-400">{report.container.numeroReference}</div>
              <h2 className="text-lg font-bold mt-0.5">{report.container.containerNumber}</h2>
              <p className="text-xs text-slate-400">BL: {report.container.blNumber} · {report.container.port === 'Douala' ? 'PAD' : 'PAK'} · {report.container.terminal}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Clock} label="Jours" value={report.totalDays} sub={report.isOuvert ? 'Toujours ouvert' : 'Clôturé'} accent={report.isOuvert ? 'blue' : 'slate'} />
              <StatCard icon={Wallet} label="Coût Total" value={formatFCFA(report.montantTotalFCFA)} sub={`Droits: ${formatFCFA(report.montantDroitsTaxesFCFA)} · Retour: ${formatFCFA(report.montantFraisRetourFCFA)}`} accent="emerald" />
              <StatCard icon={CheckCircle2} label="Étapes Terminées" value={`${report.stepsCompleted}/${report.stepsTotal}`} accent={report.stepsBlocked > 0 ? 'rose' : 'emerald'} />
              <StatCard icon={Package} label="Documents Validés" value={`${report.documentsValidated}/${report.documentsCount}`} accent="blue" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Chauffeur — Livraison (aller)</span>
                <span className="text-sm font-bold text-slate-900">{report.carrier.label}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Chauffeur — Retour (à vide)</span>
                <span className="text-sm font-bold text-slate-900">{report.retourPar || 'Pas encore retourné'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">Chronologie Complète</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {report.timeline.map((t) => (
                  <div key={t.stepNumber} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">{t.stepNumber}</span>
                      <div>
                        <span className="font-semibold text-slate-800 block">{t.stepName}</span>
                        {t.notes && <span className="text-[10px] text-slate-400 italic">{t.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        t.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        t.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {t.status === 'DONE' ? 'Fait' : t.status === 'BLOCKED' ? 'Bloqué' : t.status === 'IN_PROGRESS' ? 'En cours' : 'En attente'}
                      </span>
                      {t.dateDone && <span className="text-[10px] text-slate-400 block mt-0.5">{t.dateDone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {report.return && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h3 className="font-bold text-sm text-emerald-900 mb-1">Retourné</h3>
                <p className="text-xs text-emerald-800">Le {report.return.dateRetourVide} au dépôt {report.return.depotRetour}.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const totalOuverts = containers.filter((c) => c.status === 'OUVERT').length;
  const totalFermes = containers.filter((c) => c.status === 'FERME').length;
  const parPort = { Douala: containers.filter((c) => c.port === 'Douala').length, Kribi: containers.filter((c) => c.port === 'Kribi').length };
  const nonAssignes = containers.filter((c) => c.status === 'OUVERT' && !c.carrierType).length;

  const filteredOps = containers.filter((c) => {
    if (opsPortFilter !== 'ALL' && c.port !== opsPortFilter) return false;
    if (opsStatusFilter !== 'ALL' && c.status !== opsStatusFilter) return false;
    if (opsFromDate && c.createdAt < opsFromDate) return false;
    if (opsToDate && c.createdAt > `${opsToDate}T23:59:59`) return false;
    if (opsAgentFilter && !(c.createdByNom || '').toLowerCase().includes(opsAgentFilter.toLowerCase())) return false;
    return true;
  });

  const filteredDeliveries = deliveries.filter((d) => {
    if (delStatusFilter !== 'ALL' && d.status !== delStatusFilter) return false;
    if (delFromDate && d.dateTime < delFromDate) return false;
    if (delToDate && d.dateTime > `${delToDate}T23:59:59`) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Tableau de Bord & Rapports</span>
        </h2>
        <p className="text-xs text-slate-500">Vue d'ensemble de l'activité conteneurs. Cliquez un conteneur pour son rapport complet.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['dashboard', 'Tableau de Bord'],
          ['operations', 'Rapport Opérations'],
          ['deliveries', 'Rapport Livraisons'],
        ] as [ViewMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              viewMode === mode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'operations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Port</label>
              <select value={opsPortFilter} onChange={(e) => setOpsPortFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                <option value="ALL">Tous</option>
                <option value="Douala">Douala (PAD)</option>
                <option value="Kribi">Kribi (PAK)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Statut</label>
              <select value={opsStatusFilter} onChange={(e) => setOpsStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                <option value="ALL">Tous</option>
                <option value="OUVERT">Ouvert</option>
                <option value="FERME">Fermé</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Du</label>
              <input type="date" value={opsFromDate} onChange={(e) => setOpsFromDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Au</label>
              <input type="date" value={opsToDate} onChange={(e) => setOpsToDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Agent (créé par)</label>
              <input type="text" value={opsAgentFilter} onChange={(e) => setOpsAgentFilter(e.target.value)}
                placeholder="Nom de l'agent…"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">{filteredOps.length} conteneur(s)</h3>
            </div>
            {filteredOps.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Aucun résultat pour ces filtres.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredOps.map((c) => (
                  <button key={c.id} onClick={() => openReport(c.id)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/70 transition-colors cursor-pointer">
                    <div>
                      <span className="font-mono font-bold text-blue-700 block">{c.numeroReference}</span>
                      <span className="text-slate-500">{c.containerNumber} · {c.port === 'Douala' ? 'PAD' : 'PAK'} · Créé par {c.createdByNom || '—'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === 'OUVERT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {c.status === 'OUVERT' ? 'Ouvert' : 'Fermé'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'deliveries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Statut</label>
              <select value={delStatusFilter} onChange={(e) => setDelStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                <option value="ALL">Tous</option>
                <option value="LIVRE_CONFORME">Livré Conforme</option>
                <option value="SOUS_RESERVES">Sous Réserves</option>
                <option value="REFUSE">Refusé</option>
                <option value="EN_COURS">En Cours</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Du</label>
              <input type="date" value={delFromDate} onChange={(e) => setDelFromDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Au</label>
              <input type="date" value={delToDate} onChange={(e) => setDelToDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">{filteredDeliveries.length} livraison(s)</h3>
            </div>
            {isLoadingDeliveries ? (
              <div className="p-10 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement…
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Aucune livraison pour ces filtres.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredDeliveries.map((d) => (
                  <div key={d.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-blue-700 block">{d.numeroReference}</span>
                      <span className="text-slate-500">{d.recipientName} · {d.dateTime} · BL {d.blNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.bordereauPhotoUrl && (
                        <a href={d.bordereauPhotoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold underline">
                          Preuve
                        </a>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'LIVRE_CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'dashboard' && (
      <>
      {isLoading && (
        <div className="p-10 flex items-center justify-center text-slate-400 gap-2 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement…
        </div>
      )}
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-4 flex items-center justify-between">
          {loadError}
          <button onClick={fetchAll} className="underline cursor-pointer">Réessayer</button>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Package} label="Total Conteneurs" value={containers.length} accent="blue" />
            <StatCard icon={Clock} label="Actuellement Ouverts" value={totalOuverts} accent="amber" />
            <StatCard icon={CheckCircle2} label="Clôturés" value={totalFermes} accent="emerald" />
            <StatCard icon={AlertTriangle} label="Sans Transporteur" value={nonAssignes} accent={nonAssignes > 0 ? 'rose' : 'emerald'} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Ship className="w-3.5 h-3.5" /> Douala (PAD)</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">{parPort.Douala}</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Ship className="w-3.5 h-3.5" /> Kribi (PAK)</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">{parPort.Kribi}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Tous les Conteneurs</h3>
            </div>
            {containers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Aucun conteneur enregistré.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {containers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openReport(c.id)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700 block">{c.numeroReference}</span>
                      <span className="text-slate-500">{c.containerNumber} · BL {c.blNumber}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === 'OUVERT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {c.status === 'OUVERT' ? 'Ouvert' : 'Fermé'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
};

const ACCENT_CLASSES: Record<string, string> = {
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: keyof typeof ACCENT_CLASSES }> = ({
  icon: Icon, label, value, sub, accent = 'slate',
}) => (
  <div className={`p-3.5 rounded-xl border ${ACCENT_CLASSES[accent]}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <div className="text-xl font-bold mt-1">{value}</div>
    {sub && <div className="text-[10px] opacity-70 mt-0.5">{sub}</div>}
  </div>
);
