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
  photoUrl: string | null;
  notes: string | null;
  filledById: string;
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
  createdById: string;
  createdAt: string;
  closedAt: string | null;
  notes: string | null;
}

export interface ContainerWithDetails extends Container {
  steps: PipelineStep[];
  documents: ContainerDocument[];
  pod: any[];
  return: ContainerReturn | null;
}

export interface ContainerReport {
  container: Pick<Container, 'id' | 'numeroReference' | 'blNumber' | 'containerNumber' | 'port' | 'terminal' | 'size' | 'status'>;
  isOuvert: boolean;
  dateOuverture: string;
  dateFermeture: string | null;
  totalDays: number;
  carrier: { type: CarrierType | null; label: string };
  montantDroitsTaxesFCFA: number;
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

export async function getContainer(id: string): Promise<ContainerWithDetails> {
  return api.get<ContainerWithDetails>(`/api/containers/${id}`);
}

export interface CreateContainerInput {
  blNumber: string;
  port: ContainerPort;
  terminal: string;
  containerNumber: string;
  size: ContainerSize;
  notes?: string;
}

export async function createContainer(input: CreateContainerInput): Promise<ContainerWithDetails> {
  return api.post<ContainerWithDetails>('/api/containers', input);
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
  input: { dateRetourVide: string; depotRetour: string; photoUrl?: string; notes?: string }
): Promise<ContainerWithDetails> {
  return api.post<ContainerWithDetails>(`/api/containers/${containerId}/return`, input);
}

export async function getContainerReport(containerId: string): Promise<ContainerReport> {
  return api.get<ContainerReport>(`/api/containers/${containerId}/report`);
}
