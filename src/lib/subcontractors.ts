import { api } from './api';

export interface SubcontractorCompany {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  contactNom: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  driversCount: number;
}

export interface SubcontractorDriver {
  id: string;
  companyId: string;
  companyNom?: string;
  nom: string;
  telephone: string | null;
  numeroPermis: string | null;
  adresse: string | null;
  immatriculationCamion: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
}

export async function listSubcontractorCompanies(): Promise<SubcontractorCompany[]> {
  return api.get<SubcontractorCompany[]>('/api/subcontractors/companies');
}

export interface CreateCompanyInput {
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  contactNom?: string;
  notes?: string;
}

export async function createSubcontractorCompany(input: CreateCompanyInput): Promise<SubcontractorCompany> {
  return api.post<SubcontractorCompany>('/api/subcontractors/companies', input);
}

export async function updateSubcontractorCompany(id: string, input: Partial<CreateCompanyInput>): Promise<SubcontractorCompany> {
  return api.patch<SubcontractorCompany>(`/api/subcontractors/companies/${id}`, input);
}

export async function listSubcontractorDrivers(): Promise<SubcontractorDriver[]> {
  return api.get<SubcontractorDriver[]>('/api/subcontractors/drivers');
}

export interface CreateSubcontractorDriverInput {
  companyId: string;
  nom: string;
  telephone?: string;
  numeroPermis?: string;
  adresse?: string;
  immatriculationCamion?: string;
  notes?: string;
}

export async function createSubcontractorDriver(input: CreateSubcontractorDriverInput): Promise<SubcontractorDriver> {
  return api.post<SubcontractorDriver>('/api/subcontractors/drivers', input);
}

export async function updateSubcontractorDriver(id: string, input: Partial<CreateSubcontractorDriverInput>): Promise<SubcontractorDriver> {
  return api.patch<SubcontractorDriver>(`/api/subcontractors/drivers/${id}`, input);
}
