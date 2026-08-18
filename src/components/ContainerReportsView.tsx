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
} from 'lucide-react';
import { formatFCFA } from '../types';
import { Container, ContainerReport, listContainers, getContainerReport } from '../lib/containers';
import { ApiError } from '../lib/api';

export const ContainerReportsView: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [report, setReport] = useState<ContainerReport | null>(null);
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
        <button
          onClick={() => { setSelectedId(null); setReport(null); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au tableau de bord
        </button>

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
              <StatCard icon={Wallet} label="Droits & Taxes" value={formatFCFA(report.montantDroitsTaxesFCFA)} accent="emerald" />
              <StatCard icon={CheckCircle2} label="Étapes Terminées" value={`${report.stepsCompleted}/${report.stepsTotal}`} accent={report.stepsBlocked > 0 ? 'rose' : 'emerald'} />
              <StatCard icon={Package} label="Documents Validés" value={`${report.documentsValidated}/${report.documentsCount}`} accent="blue" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Transporteur</span>
              <span className="text-sm font-bold text-slate-900">{report.carrier.label}</span>
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

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Tableau de Bord & Rapports</span>
        </h2>
        <p className="text-xs text-slate-500">Vue d'ensemble de l'activité conteneurs. Cliquez un conteneur pour son rapport complet.</p>
      </div>

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
