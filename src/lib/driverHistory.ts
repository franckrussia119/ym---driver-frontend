import { api } from './api';

export interface DriverListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  camionAssigne?: string;
  totalRapports: number;
  totalPannes: number;
}

export interface DriverHistoryResponse {
  driver: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    camionAssigne?: string;
    createdAt: string;
  };
  summary: {
    totalRapports: number;
    rapportsSoumis: number;
    totalPannes: number;
    pannesEnCours: number;
    totalDefautsConstates: number;
    totalLivraisons: number;
    totalTrajets: number;
    totalKm: number;
    totalFraisRouteFCFA: number;
    totalCarburantL: number;
    cautionsEnRetard: number;
    anomaliesCarburant: number;
    dernierScoreGlobalPct: number | null;
    dernierRang: number | null;
  };
  reports: Array<{
    id: string;
    createdAt: string;
    submittedAt: string | null;
    isSubmitted: boolean;
    status: string;
    semaineDu: string;
    semaineAu: string;
    immatriculation: string;
  }>;
  faults: Array<{
    id: string;
    dateSignalement: string;
    status: string;
    categorie: string;
    niveauUrgence: string;
    description: string;
    createdAt: string;
  }>;
  pod: Array<{ id: string; blNumber: string; containerNumber: string; clientName: string; status: string; dateTime: string; createdAt: string }>;
  invoices: Array<{ id: string; dateIntervention: string; totalTTC: number; status: string; createdAt: string }>;
  cautions: Array<{ id: string; noConteneurBL: string; status: string; montantCautionFCFA: number; montantPenaliteFCFA: number | null; dateLimiteRetour: string }>;
  fuelEntries: Array<{ id: string; date: string; consommationReelleL100: number; consommationRefL100: number; anomalieDetectee: boolean; typeAnomalie: string | null }>;
  scoreHistory: Array<{ periode: string; scoreGlobalPct: number; ponctualitePct: number; moyenneConsoL100: number; rang: number }>;
}

export async function listDrivers(): Promise<DriverListItem[]> {
  return api.get<DriverListItem[]>('/api/driver-history');
}

export async function getDriverHistory(driverId: string): Promise<DriverHistoryResponse> {
  return api.get<DriverHistoryResponse>(`/api/driver-history/${driverId}`);
}
