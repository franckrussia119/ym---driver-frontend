import { api } from './api';

export type ContainerPort = 'Douala' | 'Kribi';
export type ContainerSize = '20' | '40';
export type ContainerStatus = 'OUVERT' | 'FERME';
export type CarrierType = 'CHAUFFEUR_INTERNE' | 'SOUS_TRAITANT';
export type PipelineStepStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type DocumentType = 'BL_OBL' | 'BL_TELEX' | 'TICKET' | 'AUTRE';
export type DocumentStatus = 'PENDING' | 'RECEIVED' | 'VALIDATED';

export interface PipelineStep {
  id: string;
  containerId: string;
  stepNumber: number;
  stepName: string;
  status: PipelineStepStatus;
  dateDone: string | null;
  agentResponsibleId: string | null;
  agentNom: string | null;
  notes: string | null;
  details: Record<string, any>;
  updatedAt: string;
}

export interface ContainerDocument {
  id: string;
  containerId: string;
  type: DocumentType;
  fileUrl: string;
  uploadedById: string;
  uploadedByNom: string | null;
  uploadedAt: string;
  status: DocumentStatus;
}

export interface ContainerReturn {
  id: string;
  containerId: string;
  dateRetourVide: string;
  depotRetour: string;
  fraisRetourFCFA: number;
  photoUrl: string | null;
  notes: string | null;
  filledById: string;
  filledByNom?: string | null;
  filledByTelephone?: string | null;
  createdAt: string;
}

export interface ContainerIncident {
  id: string;
  containerId: string;
  type: 'PANNE' | 'TRANSFERT' | 'AUTRE';
  description: string;
  ancienChauffeurNom: string | null;
  nouveauChauffeurNom: string | null;
  ancienCamion: string | null;
  nouveauCamion: string | null;
  createdByNom: string | null;
  createdAt: string;
}

export interface Container {
  id: string;
  numeroReference: string;
  blNumber: string;
  port: ContainerPort;
  terminal: string;
  containerNumber: string;
  size: ContainerSize;
  status: ContainerStatus;
  carrierType: CarrierType | null;
  assignedDriverId: string | null;
  assignedSubcontractorId: string | null;
  subcontractorNom?: string | null;
  subcontractorTelephone?: string | null;
  subcontractorEntreprise?: string | null;
  driverNom?: string | null;
  driverTelephone?: string | null;
  createdByNom?: string | null;
  createdById: string;
  createdAt: string;
  closedAt: string | null;
  dateLimiteRetour: string | null;
  fraisDepotFCFA: number;
  fraisSupplementairesFCFA: number;
  fraisSupplementairesNote: string | null;
  notes: string | null;
}

export interface ContainerWithDetails extends Container {
  steps: PipelineStep[];
  documents: ContainerDocument[];
  pod: any[];
  return: ContainerReturn | null;
  incidents: ContainerIncident[];
}

export interface ContainerReport {
  container: Pick<Container, 'id' | 'numeroReference' | 'blNumber' | 'containerNumber' | 'port' | 'terminal' | 'size' | 'status' | 'dateLimiteRetour'>;
  isOuvert: boolean;
  dateOuverture: string;
  dateFermeture: string | null;
  totalDays: number;
  dateLivraisonClient: string | null;
  joursDetentionClient: number | null;
  detention: { jours: number | null; statut: 'DANS_LES_DELAIS' | 'EN_RETARD' | 'NON_DEFINI' };
  carrier: { type: CarrierType | null; label: string; telephone: string | null };
  retourPar: string | null;
  retourParTelephone: string | null;
  incidents: ContainerIncident[];
  montantDroitsTaxesFCFA: number;
  montantFraisRetourFCFA: number;
  montantFraisDepotFCFA: number;
  montantFraisSupplementairesFCFA: number;
  fraisSupplementairesNote: string | null;
  montantTotalFCFA: number;
  stepsCompleted: number;
  stepsTotal: number;
  stepsBlocked: number;
  documentsCount: number;
  documentsValidated: number;
  timeline: Array<{ stepNumber: number; stepName: string; status: PipelineStepStatus; dateDone: string | null; agent: string | null; notes: string | null }>;
  pod: any[];
  return: ContainerReturn | null;
}

export async function listContainers(): Promise<Container[]> {
  return api.get<Container[]>('/api/containers');
}

// Conteneurs assignés au chauffeur, encore ouverts, et PAS ENCORE livrés —
// alimente le formulaire de création de POD. Un conteneur déjà livré ne
// doit plus jamais apparaître ici.
export async function listPendingDeliveryContainers(): Promise<Container[]> {
  return api.get<Container[]>('/api/containers/pending-delivery');
}

// Pool ouvert : conteneurs livrés (preuve de livraison faite) mais pas
// encore retournés — visible et accessible à TOUS les chauffeurs, pas
// seulement celui qui a livré.
export async function listPendingReturnContainers(): Promise<Container[]> {
  return api.get<Container[]>('/api/containers/pending-return');
}

export async function getContainer(id: string): Promise<ContainerWithDetails> {
  return api.get<ContainerWithDetails>(`/api/containers/${id}`);
}

export interface CreateContainerInput {
  blNumber: string;
  port: ContainerPort;
  terminal: string;
  containerNumber: string;
  size: ContainerSize;
  dateLimiteRetour?: string;
  notes?: string;
}

export async function createContainer(input: CreateContainerInput): Promise<ContainerWithDetails> {
  return api.post<ContainerWithDetails>('/api/containers', input);
}

export interface UpdateContainerInput {
  blNumber?: string;
  port?: ContainerPort;
  terminal?: string;
  containerNumber?: string;
  size?: ContainerSize;
  notes?: string;
}

export async function updateContainer(id: string, input: UpdateContainerInput): Promise<ContainerWithDetails> {
  return api.patch<ContainerWithDetails>(`/api/containers/${id}`, input);
}

export async function deleteContainer(id: string): Promise<void> {
  await api.del(`/api/containers/${id}`);
}

export async function createIncident(
  containerId: string,
  input: {
    type: 'PANNE' | 'TRANSFERT' | 'AUTRE';
    description: string;
    ancienChauffeurNom?: string;
    nouveauChauffeurNom?: string;
    ancienCamion?: string;
    nouveauCamion?: string;
  }
): Promise<ContainerIncident> {
  return api.post<ContainerIncident>(`/api/containers/${containerId}/incidents`, input);
}

export async function setContainerDeadline(id: string, dateLimiteRetour: string): Promise<Container> {
  return api.patch<Container>(`/api/containers/${id}/deadline`, { dateLimiteRetour });
}

export async function setContainerFees(
  id: string,
  input: { fraisDepotFCFA?: number; fraisSupplementairesFCFA?: number; fraisSupplementairesNote?: string }
): Promise<Container> {
  return api.patch<Container>(`/api/containers/${id}/fees`, input);
}

export interface ContainerReturnHistoryItem extends ContainerReturn {
  containerNumeroReference: string;
  containerNumber: string;
  blNumber: string;
  port: ContainerPort;
  terminal: string;
  size: ContainerSize;
}

export async function listReturnsHistory(): Promise<ContainerReturnHistoryItem[]> {
  return api.get<ContainerReturnHistoryItem[]>('/api/containers/returns-history');
}

export async function assignCarrier(
  id: string,
  input: { carrierType: CarrierType; driverId?: string; subcontractorId?: string }
): Promise<ContainerWithDetails> {
  return api.patch<ContainerWithDetails>(`/api/containers/${id}/assign`, input);
}

export async function updatePipelineStep(
  containerId: string,
  stepNumber: number,
  input: { status?: PipelineStepStatus; dateDone?: string; notes?: string; details?: Record<string, any> }
): Promise<PipelineStep> {
  return api.patch<PipelineStep>(`/api/containers/${containerId}/pipeline/${stepNumber}`, input);
}

export async function addContainerDocument(
  containerId: string,
  input: { type: DocumentType; fileUrl: string }
): Promise<ContainerDocument> {
  return api.post<ContainerDocument>(`/api/containers/${containerId}/documents`, input);
}

export async function updateDocumentStatus(
  containerId: string,
  docId: string,
  status: DocumentStatus
): Promise<ContainerDocument> {
  return api.patch<ContainerDocument>(`/api/containers/${containerId}/documents/${docId}/status`, { status });
}

export async function submitContainerReturn(
  containerId: string,
  input: { dateRetourVide: string; depotRetour: string; fraisRetourFCFA: number; photoUrl?: string; notes?: string }
): Promise<ContainerWithDetails> {
  return api.post<ContainerWithDetails>(`/api/containers/${containerId}/return`, input);
}

export async function getContainerReport(containerId: string): Promise<ContainerReport> {
  return api.get<ContainerReport>(`/api/containers/${containerId}/report`);
}
