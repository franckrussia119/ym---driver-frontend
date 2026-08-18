import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Package,
  Ship,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Upload,
  Truck,
  UserRound,
  Lock,
  Unlock,
  Ticket,
  Paperclip,
} from 'lucide-react';
import { formatFCFA } from '../types';
import {
  ContainerWithDetails,
  PipelineStep,
  getContainer,
  updatePipelineStep,
  addContainerDocument,
  updateDocumentStatus,
  DocumentType,
} from '../lib/containers';
import { uploadFile, ApiError } from '../lib/api';

interface ContainerDetailViewProps {
  containerId: string;
  onBack: () => void;
  onGoToReturn: () => void;
}

const STEP_STATUS_STYLE: Record<string, { badge: string; icon: React.ElementType }> = {
  PENDING: { badge: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock },
  IN_PROGRESS: { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: Loader2 },
  DONE: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  BLOCKED: { badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  BL_OBL: 'Bill of Lading (OBL)',
  BL_TELEX: 'Bill of Lading (Telex)',
  TICKET: 'Ticket',
  AUTRE: 'Autre document',
};

export const ContainerDetailView: React.FC<ContainerDetailViewProps> = ({ containerId, onBack, onGoToReturn }) => {
  const [container, setContainer] = useState<ContainerWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchContainer = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setContainer(await getContainer(containerId));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger ce conteneur.');
    } finally {
      setIsLoading(false);
    }
  }, [containerId]);

  useEffect(() => {
    fetchContainer();
  }, [fetchContainer]);

  // Step editing
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [stepStatus, setStepStatus] = useState<string>('PENDING');
  const [stepDate, setStepDate] = useState('');
  const [stepNotes, setStepNotes] = useState('');
  const [stepAmount, setStepAmount] = useState<number>(0);
  const [stepDeclarationNo, setStepDeclarationNo] = useState('');
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isUploadingTicket, setIsUploadingTicket] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const openStepEdit = (step: PipelineStep) => {
    setEditingStep(step.stepNumber);
    setStepStatus(step.status);
    setStepDate(step.dateDone || '');
    setStepNotes(step.notes || '');
    setStepAmount(step.details?.montantFCFA || 0);
    setStepDeclarationNo(step.details?.numeroDeclaration || '');
    setStepError(null);
  };

  const handleSaveStep = async (stepNumber: number) => {
    setIsSavingStep(true);
    setStepError(null);
    try {
      const details: Record<string, any> = {};
      if (stepNumber === 2 && stepDeclarationNo) details.numeroDeclaration = stepDeclarationNo;
      if (stepNumber === 3 && stepAmount > 0) details.montantFCFA = stepAmount;

      await updatePipelineStep(containerId, stepNumber, {
        status: stepStatus as any,
        dateDone: stepDate || undefined,
        notes: stepNotes || undefined,
        details: Object.keys(details).length > 0 ? details : undefined,
      });
      await fetchContainer();
      setEditingStep(null);
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : "Échec de la mise à jour de l'étape.");
    } finally {
      setIsSavingStep(false);
    }
  };

  const handleTicketUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingTicket(true);
    setStepError(null);
    try {
      const url = await uploadFile(file, file.name);
      await updatePipelineStep(containerId, 6, { details: { ticketUrl: url } });
      await addContainerDocument(containerId, { type: 'TICKET', fileUrl: url });
      await fetchContainer();
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : "Échec de l'envoi du ticket.");
    } finally {
      setIsUploadingTicket(false);
    }
  };

  // Document upload
  const [docType, setDocType] = useState<DocumentType>('BL_OBL');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingDoc(true);
    setDocError(null);
    try {
      const url = await uploadFile(file, file.name);
      await addContainerDocument(containerId, { type: docType, fileUrl: url });
      await fetchContainer();
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : "Échec de l'envoi du document.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDocStatusChange = async (docId: string, status: 'PENDING' | 'RECEIVED' | 'VALIDATED') => {
    try {
      await updateDocumentStatus(containerId, docId, status);
      await fetchContainer();
    } catch {
      /* silencieux : re-fetch échoué, l'utilisateur peut réessayer */
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Chargement du conteneur…
      </div>
    );
  }
  if (loadError || !container) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-4">
        {loadError || 'Conteneur introuvable.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour au registre
      </button>

      {/* Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-xs text-blue-400">{container.numeroReference}</div>
            <h2 className="text-lg font-bold mt-0.5">{container.containerNumber}</h2>
            <p className="text-xs text-slate-400 mt-0.5">BL: {container.blNumber}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            container.status === 'OUVERT' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'
          }`}>
            {container.status === 'OUVERT' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {container.status === 'OUVERT' ? 'Vie Ouverte' : 'Vie Fermée'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5"><Ship className="w-3.5 h-3.5 text-blue-400" /> {container.port === 'Douala' ? 'PAD' : 'PAK'} · {container.terminal}</span>
          <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-blue-400" /> {container.size}'</span>
          {container.carrierType === 'CHAUFFEUR_INTERNE' ? (
            <span className="flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-emerald-400" /> {container.driverNom} (chauffeur)</span>
          ) : container.carrierType === 'SOUS_TRAITANT' ? (
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-amber-400" /> {container.subcontractorNom} (sous-traitant)</span>
          ) : (
            <span className="text-slate-500 italic">Transporteur non assigné</span>
          )}
        </div>
        {container.status === 'OUVERT' && (
          <button
            onClick={onGoToReturn}
            className="mt-4 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Enregistrer le Retour du Conteneur (clôture la vie)
          </button>
        )}
      </div>

      {/* Pipeline Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">Pipeline — Suivi des Étapes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {container.steps.map((step) => {
            const style = STEP_STATUS_STYLE[step.status];
            const StatusIcon = style.icon;
            const isEditing = editingStep === step.stepNumber;
            return (
              <div key={step.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900">{step.stepName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {step.dateDone ? `Le ${step.dateDone}` : 'Pas encore fait'}
                        {step.agentNom && ` · ${step.agentNom}`}
                      </div>
                      {step.notes && <div className="text-[11px] text-slate-400 mt-0.5 italic">{step.notes}</div>}
                      {step.stepNumber === 3 && step.details?.montantFCFA > 0 && (
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">{formatFCFA(step.details.montantFCFA)}</div>
                      )}
                      {step.stepNumber === 6 && step.details?.ticketUrl && (
                        <a href={step.details.ticketUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                          <Ticket className="w-3 h-3" /> Voir le ticket
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${style.badge}`}>
                      <StatusIcon className="w-3 h-3" />
                      {step.status === 'PENDING' ? 'En attente' : step.status === 'IN_PROGRESS' ? 'En cours' : step.status === 'DONE' ? 'Fait' : 'Bloqué'}
                    </span>
                    <button
                      onClick={() => (isEditing ? setEditingStep(null) : openStepEdit(step))}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {isEditing ? 'Fermer' : 'Modifier'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 pl-10 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Statut</label>
                        <select value={stepStatus} onChange={(e) => setStepStatus(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                          <option value="PENDING">En attente</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="DONE">Fait</option>
                          <option value="BLOCKED">Bloqué</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Date</label>
                        <input type="date" value={stepDate} onChange={(e) => setStepDate(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    {step.stepNumber === 2 && (
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">N° Déclaration (GUCE/CAMCIS)</label>
                        <input type="text" value={stepDeclarationNo} onChange={(e) => setStepDeclarationNo(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
                      </div>
                    )}
                    {step.stepNumber === 3 && (
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Montant Payé (FCFA)</label>
                        <input type="number" min={0} value={stepAmount} onChange={(e) => setStepAmount(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                      </div>
                    )}
                    {step.stepNumber === 6 && (
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Ticket de Levée</label>
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer w-fit font-bold text-slate-700">
                          {isUploadingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{isUploadingTicket ? 'Envoi…' : 'Joindre le ticket'}</span>
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleTicketUpload} disabled={isUploadingTicket} />
                        </label>
                      </div>
                    )}
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Notes</label>
                      <textarea value={stepNotes} onChange={(e) => setStepNotes(e.target.value)} rows={2}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    {stepError && <p className="text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{stepError}</p>}
                    <button
                      onClick={() => handleSaveStep(step.stepNumber)}
                      disabled={isSavingStep}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      {isSavingStep && <Loader2 className="w-3 h-3 animate-spin" />}
                      Enregistrer l'étape
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Vault */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Paperclip className="w-4 h-4 text-blue-600" /> Coffre à Documents
          </h3>
          <div className="flex items-center gap-2">
            <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg font-semibold">
              {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer">
              {isUploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isUploadingDoc ? 'Envoi…' : 'Téléverser'}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocUpload} disabled={isUploadingDoc} />
            </label>
          </div>
        </div>
        {docError && <p className="text-rose-600 text-xs font-semibold bg-rose-50 border-b border-rose-200 px-4 py-2">{docError}</p>}
        {container.documents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Aucun document envoyé pour l'instant.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {container.documents.map((doc) => (
              <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 min-w-0 text-blue-700 hover:underline">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">{DOC_TYPE_LABELS[doc.type]}</span>
                </a>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">{doc.uploadedByNom}</span>
                  <select
                    value={doc.status}
                    onChange={(e) => handleDocStatusChange(doc.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer ${
                      doc.status === 'VALIDATED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      doc.status === 'RECEIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <option value="PENDING">En attente</option>
                    <option value="RECEIVED">Reçu</option>
                    <option value="VALIDATED">Validé</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POD History */}
      {container.pod.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Preuve(s) de Livraison</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {container.pod.map((p: any) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-700 block">{p.numeroReference}</span>
                  <span className="text-slate-500">{p.recipientName} · {p.dateTime}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  p.status === 'LIVRE_CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return info if closed */}
      {container.return && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-slate-900 mb-2">Retour du Conteneur Vide</h3>
          <p className="text-xs text-slate-600">Retourné le {container.return.dateRetourVide} au dépôt {container.return.depotRetour}.</p>
          {container.return.notes && <p className="text-xs text-slate-500 mt-1 italic">{container.return.notes}</p>}
        </div>
      )}
    </div>
  );
};
