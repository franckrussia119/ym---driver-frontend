import { api } from './api';

export interface SubcontractorDriver {
  id: string;
  nom: string;
  telephone: string | null;
  nomEntreprise: string | null;
  immatriculationCamion: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
}

export async function listSubcontractors(): Promise<SubcontractorDriver[]> {
  return api.get<SubcontractorDriver[]>('/api/subcontractors');
}

export interface CreateSubcontractorInput {
  nom: string;
  telephone?: string;
  nomEntreprise?: string;
  immatriculationCamion?: string;
  notes?: string;
}

export async function createSubcontractor(input: CreateSubcontractorInput): Promise<SubcontractorDriver> {
  return api.post<SubcontractorDriver>('/api/subcontractors', input);
}

export async function updateSubcontractor(id: string, input: Partial<CreateSubcontractorInput>): Promise<SubcontractorDriver> {
  return api.patch<SubcontractorDriver>(`/api/subcontractors/${id}`, input);
}
