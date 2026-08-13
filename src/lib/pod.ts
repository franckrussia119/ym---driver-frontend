import { api } from './api';
import { PODRecord } from '../components/ProofOfDeliveryView';

export async function listPOD(): Promise<PODRecord[]> {
  return api.get<PODRecord[]>('/api/pod');
}

export async function createPOD(record: Omit<PODRecord, 'id'>): Promise<PODRecord> {
  return api.post<PODRecord>('/api/pod', record);
}
