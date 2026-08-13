import {
  WeeklyReport,
  InspectionDefectItem,
  UserProfile,
  FaultDeclaration,
  MechanicInvoice,
  FleetVehicle,
  MaintenancePlanItem,
  ScheduledMaintenance,
  ContainerCaution,
  FuelAnalysisEntry,
  DriverPerformanceScore,
} from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_superadmin_1',
    name: 'El Hadj Sylla',
    email: 'superadmin@ym-transit.com',
    role: 'SUPER_ADMIN',
    password: 'admin123',
    isActive: true,
    driverPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'user_admin_1',
    name: 'Marc Tremblay (Administration)',
    email: 'admin@ym-transit.com',
    role: 'ADMIN',
    password: 'admin123',
    isActive: true,
    driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'user_supervising_1',
    name: 'Ousmane Sow (Superviseur Flotte)',
    email: 'superviseur@ym-transit.com',
    role: 'SUPERVISEUR',
    password: 'super123',
    isActive: true,
    driverPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'user_mech_1',
    name: 'Antoine Vasseur (Chef Atelier)',
    email: 'mecanicien@ym-transit.com',
    role: 'MECANICIEN',
    password: 'mech123',
    isActive: true,
    driverPhotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'user_driver_1',
    name: 'Jean-Marc Diallo',
    email: 'chauffeur@ym-transit.com',
    role: 'CHAUFFEUR',
    password: 'driver123',
    isActive: true,
    camionAssigne: 'AB-789-XY (Volvo FH 500)',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    truckPhotoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'user_driver_2',
    name: 'Mamadou Kouyaté',
    email: 'chauffeur2@ym-transit.com',
    role: 'CHAUFFEUR',
    password: 'driver123',
    isActive: true,
    camionAssigne: 'CD-456-ZZ (Renault T480)',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    truckPhotoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
  },
];

export const DEMO_FAULTS: FaultDeclaration[] = [
  {
    id: 'PANNE-2026-001',
    dateSignalement: '2026-08-11T14:30:00.000Z',
    chauffeurId: 'user_driver_1',
    chauffeurNom: 'Jean-Marc Diallo',
    immatriculation: 'AB-789-XY (Volvo FH 500)',
    niveauUrgence: 'Élevée / Immobilisation',
    categorie: 'FREINS',
    description: 'Bruit de grincement métallique important à l’arrière droit lors du freinage à chaud.',
    localisation: 'Zone Portuaire - Terminal à Conteneurs',
    status: 'Transmise au mécanicien',
    notesSuperviseur: 'Validé par Ousmane Sow. Camion orienté vers le garage central.',
    history: [
      {
        id: 'h1',
        timestamp: '2026-08-11 14:30',
        actorName: 'Jean-Marc Diallo',
        actorRole: 'CHAUFFEUR',
        status: 'Signalée par chauffeur',
        comment: 'Création initiale du signalement de panne.',
      },
      {
        id: 'h2',
        timestamp: '2026-08-11 15:10',
        actorName: 'Ousmane Sow',
        actorRole: 'SUPERVISEUR',
        status: 'Transmise au mécanicien',
        comment: 'Prise en charge superviseur (Niveau 1). Ordre de réparation transmis à l’atelier.',
      },
    ],
  },
  {
    id: 'PANNE-2026-002',
    dateSignalement: '2026-08-10T09:15:00.000Z',
    chauffeurId: 'user_driver_2',
    chauffeurNom: 'Mamadou Kouyaté',
    immatriculation: 'CD-456-ZZ (Renault T480)',
    niveauUrgence: 'Moyenne',
    categorie: 'PNEUS',
    description: 'Usure anormale sur pneu avant gauche avec légère baisse de pression régulière.',
    localisation: 'Dépôt principal YM-TRANSIT',
    status: 'Réparée — en attente de clôture',
    notesMecanicien: 'Pneu remplacé et parallélisme ajusté. Facture atelier FACT-2026-088 générée.',
    invoiceId: 'FACT-2026-088',
    history: [
      {
        id: 'h21',
        timestamp: '2026-08-10 09:15',
        actorName: 'Mamadou Kouyaté',
        actorRole: 'CHAUFFEUR',
        status: 'Signalée par chauffeur',
        comment: 'Signalement de la baisse de pression.',
      },
      {
        id: 'h22',
        timestamp: '2026-08-10 10:00',
        actorName: 'Ousmane Sow',
        actorRole: 'SUPERVISEUR',
        status: 'Transmise au mécanicien',
        comment: 'Transmis au chef d’atelier Antoine Vasseur.',
      },
      {
        id: 'h23',
        timestamp: '2026-08-10 11:30',
        actorName: 'Antoine Vasseur',
        actorRole: 'MECANICIEN',
        status: 'En cours de réparation',
        comment: 'Véhicule sur le pont, changement du pneumatique.',
      },
      {
        id: 'h24',
        timestamp: '2026-08-10 16:45',
        actorName: 'Antoine Vasseur',
        actorRole: 'MECANICIEN',
        status: 'Réparée — en attente de clôture',
        comment: 'Travaux terminés, facture transmise pour contrôle superviseur (Niveau 2).',
      },
    ],
  },
];

export const DEMO_INVOICES: MechanicInvoice[] = [
  {
    id: 'FACT-2026-088',
    faultId: 'PANNE-2026-002',
    truckImmatriculation: 'CD-456-ZZ (Renault T480)',
    chauffeurNom: 'Mamadou Kouyaté',
    mecanicienNom: 'Antoine Vasseur (Chef Atelier)',
    dateIntervention: '2026-08-10',
    descriptionTravaux: 'Remplacement pneu avant gauche 315/80 R22.5 + Contrôle de la géométrie train avant.',
    parts: [
      {
        id: 'p1',
        name: 'Pneu Poids Lourd 315/80 R22.5 Michelin',
        qty: 1,
        unitPrice: 220000,
        total: 220000,
      },
      {
        id: 'p2',
        name: 'Valve blindée & Équilibrage',
        qty: 1,
        unitPrice: 15000,
        total: 15000,
      },
    ],
    mainOeuvreHeures: 2,
    tauxHoraire: 15000,
    totalPieces: 235000,
    totalMainOeuvre: 30000,
    totalHT: 265000,
    tva: 0,
    totalTTC: 265000,
    status: 'Transmis Administration',
  },
];

export const INITIAL_DEFECT_CATEGORIES: { category: string; items: { id: string; name: string }[] }[] = [
  {
    category: 'MOTEUR',
    items: [
      { id: 'moteur_fuite_huile', name: "Fuite d'huile" },
      { id: 'moteur_bruit_anormal', name: 'Bruit anormal / cognement' },
      { id: 'moteur_voyant_allume', name: 'Voyant moteur allumé' },
    ],
  },
  {
    category: 'FREINS',
    items: [
      { id: 'freins_pedale_molle', name: 'Pédale molle ou spongieuse' },
      { id: 'freins_bruit_grincement', name: 'Bruit de freinage (grincement)' },
      { id: 'freins_fuite_air', name: "Fuite du système d'air" },
    ],
  },
  {
    category: 'PNEUS',
    items: [
      { id: 'pneus_pression_basse', name: 'Pression basse' },
      { id: 'pneus_usure_anormale', name: 'Usure irrégulière / anormale' },
      { id: 'pneus_crevaison', name: 'Dommage visible ou crevaison' },
    ],
  },
  {
    category: 'ÉLECTRIQUE',
    items: [
      { id: 'elec_feu_defectueux', name: 'Feu avant ou arrière défectueux' },
      { id: 'elec_clignotant', name: 'Clignotant non fonctionnel' },
      { id: 'elec_batterie_faible', name: 'Batterie faible / voyant allumé' },
    ],
  },
  {
    category: 'HYDRAULIQUE',
    items: [
      { id: 'hydra_fuite_visible', name: 'Fuite hydraulique visible' },
      { id: 'hydra_niveau_bas', name: 'Niveau de fluide bas' },
    ],
  },
  {
    category: 'REFROIDISSEMENT',
    items: [
      { id: 'refroid_niveau_bas', name: 'Niveau de liquide bas' },
      { id: 'refroid_surchauffe', name: 'Surchauffe moteur' },
    ],
  },
  {
    category: 'TRANSMISSION',
    items: [
      { id: 'trans_difficulte_vitesses', name: 'Difficulté à passer les vitesses' },
      { id: 'trans_bruit_anormal', name: 'Bruit anormal' },
    ],
  },
  {
    category: 'CARROSSERIE / REMORQUE',
    items: [
      { id: 'carross_dommage_visible', name: 'Dommage visible (bosse/rayure)' },
      { id: 'carross_parebrise_fissure', name: 'Pare-brise fissuré' },
      { id: 'carross_retroviseur_casse', name: 'Rétroviseur cassé ou manquant' },
      { id: 'carross_eclairage_remorque', name: 'Éclairage remorque défectueux' },
      { id: 'carross_pneu_remorque', name: 'Pneu remorque endommagé ou usé' },
    ],
  },
  {
    category: 'AUTRE (non listé ci-dessus)',
    items: [
      { id: 'autre_defaut', name: 'Autre défaut constaté — préciser dans Notes' },
    ],
  },
];

export const INITIAL_CHECKLIST_ITEMS = [
  'Pneus & pression',
  'Freins',
  'Feux & clignotants',
  'Rétroviseurs',
  'Klaxon',
  'Niveaux de fluides (huile, liquide de refroidissement, frein)',
  'Batterie',
  'Système carburant',
  "Compresseur d'air",
  "Sellette d'attelage",
  'Verrous tournants',
  'Extincteur',
  'Trousse de premiers secours',
  'Triangles réfléchissants',
  'Documents à bord',
];

export const createDefaultReport = (): WeeklyReport => {
  const today = new Date().toISOString().split('T')[0];
  const defectsMap: Record<string, InspectionDefectItem> = {};

  INITIAL_DEFECT_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      defectsMap[item.id] = {
        id: item.id,
        category: cat.category,
        name: item.name,
        constate: false,
        gravite: 'Mineure',
        actionPrise: 'Réparé sur place',
        date: today,
        notes: '',
      };
    });
  });

  const checklistMap: Record<string, boolean> = {};
  INITIAL_CHECKLIST_ITEMS.forEach((item) => {
    checklistMap[item] = false;
  });

  return {
    id: `RPT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'CONFORME',
    isSubmitted: false,
    driverInfo: {
      semaineDu: '2026-08-04',
      semaineAu: '2026-08-10',
      nomChauffeur: 'Jean-Marc Diallo',
      immatriculation: 'AB-789-XY',
      marqueModele: 'Volvo FH 500',
      noRemorque: 'REM-8820',
    },
    trips: [
      {
        id: '1',
        date: today,
        client: 'Port Autonome / Bolloré Logistics',
        noConteneurBL: 'MSCU-9821340',
        typeConteneur: '40',
        depart: 'Port Terminal Nord',
        destination: 'Zone Industrielle Akwa',
        kmParcourus: 140,
        carburantL: 45,
        fraisRoute: 25000,
      },
    ],
    tripStats: {
      totalEnlevesPort: 3,
      totalLivresDestinataire: 3,
      conteneursVidesRetournes: 2,
    },
    aucunDefautConstate: true,
    defects: defectsMap,
    checklist: checklistMap,
    mechanicVerif: {
      nomMecanicien: 'Antoine Vasseur',
      date: today,
    },
    observations: {
      itineraireTrafic: 'Fluide le matin, ralentissements au péage.',
      clientsDestinataires: 'Réception rapide au dépôt client.',
      suggestionsOperations: 'RAS pour cette semaine.',
      besoinsFormation: '',
      commentairesGeneraux: 'Véhicule en bon état général.',
    },
    signatures: {
      chauffeur: { nom: 'Jean-Marc Diallo', signature: 'JMD', date: today },
      superviseur: { nom: 'Ousmane Sow', signature: '', date: '' },
      logistique: { nom: '', signature: '', date: '' },
    },
  };
};

export const createDemoReport = (): WeeklyReport => {
  return createDefaultReport();
};

// ==========================================
// DEMO FLEET VEHICLES
// ==========================================
export const DEMO_FLEET: FleetVehicle[] = [
  {
    id: 'veh_01',
    immatriculation: 'AB-789-XY',
    marqueModele: 'Volvo FH 500 Globetrotter',
    annee: 2022,
    capaciteTonnage: 40,
    noRemorqueAssociee: 'REM-8820',
    photoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    chauffeurHabituelId: 'user_driver_1',
    chauffeurHabituelNom: 'Jean-Marc Diallo',
    statut: 'En service',
    kmCompteurInitial: 142500,
    consommationReferenceL100: 34.5,
    notesInterne: 'Tracteur principal ligne Douala - Kribi / Yaoundé.',
    documents: [
      {
        id: 'doc_101',
        type: 'Assurance',
        numeroDoc: 'ASS-2026-9921',
        dateEmission: '2026-01-01',
        dateExpiration: '2026-12-31',
        status: 'VALIDE',
      },
      {
        id: 'doc_102',
        type: 'Visite Technique',
        numeroDoc: 'VT-2026-4412',
        dateEmission: '2026-02-15',
        dateExpiration: '2026-08-15', // Expires soon / expired
        status: 'EXPIRE_BIENTOT',
      },
      {
        id: 'doc_103',
        type: 'Carte Grise',
        numeroDoc: 'CG-LT-88912',
        dateEmission: '2022-03-10',
        dateExpiration: '2030-03-10',
        status: 'VALIDE',
      },
      {
        id: 'doc_104',
        type: 'Patente / Transport',
        numeroDoc: 'PAT-2026-778',
        dateEmission: '2026-01-10',
        dateExpiration: '2026-12-31',
        status: 'VALIDE',
      },
      {
        id: 'doc_105',
        type: 'Extincteur',
        numeroDoc: 'EXT-991',
        dateEmission: '2025-08-01',
        dateExpiration: '2026-08-01',
        status: 'EXPIRE',
      },
    ],
  },
  {
    id: 'veh_02',
    immatriculation: 'CD-456-ZZ',
    marqueModele: 'Renault Trucks T480',
    annee: 2021,
    capaciteTonnage: 35,
    noRemorqueAssociee: 'REM-4410',
    photoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    chauffeurHabituelId: 'user_driver_2',
    chauffeurHabituelNom: 'Mamadou Kouyaté',
    statut: 'En service',
    kmCompteurInitial: 189200,
    consommationReferenceL100: 36.0,
    notesInterne: 'Utilisé principalement pour navettes Port Autonome de Douala.',
    documents: [
      {
        id: 'doc_201',
        type: 'Assurance',
        numeroDoc: 'ASS-2026-3312',
        dateEmission: '2026-01-01',
        dateExpiration: '2026-12-31',
        status: 'VALIDE',
      },
      {
        id: 'doc_202',
        type: 'Visite Technique',
        numeroDoc: 'VT-2026-9901',
        dateEmission: '2026-03-01',
        dateExpiration: '2026-09-01',
        status: 'VALIDE',
      },
      {
        id: 'doc_203',
        type: 'Extincteur',
        numeroDoc: 'EXT-442',
        dateEmission: '2026-02-01',
        dateExpiration: '2027-02-01',
        status: 'VALIDE',
      },
    ],
  },
  {
    id: 'veh_03',
    immatriculation: 'EF-123-AA',
    marqueModele: 'Mercedes-Benz Actros 3344',
    annee: 2020,
    capaciteTonnage: 45,
    noRemorqueAssociee: 'REM-9901',
    photoUrl: 'https://images.unsplash.com/photo-1586191582056-a61f3eb1a473?auto=format&fit=crop&w=600&q=80',
    chauffeurHabituelNom: 'Paul Mbida',
    statut: 'En maintenance',
    kmCompteurInitial: 245000,
    consommationReferenceL100: 38.0,
    notesInterne: 'En révision complète système d’injection au garage central.',
    documents: [
      {
        id: 'doc_301',
        type: 'Assurance',
        numeroDoc: 'ASS-2026-1102',
        dateEmission: '2026-01-01',
        dateExpiration: '2026-12-31',
        status: 'VALIDE',
      },
      {
        id: 'doc_302',
        type: 'Visite Technique',
        numeroDoc: 'VT-2026-0012',
        dateEmission: '2025-08-01',
        dateExpiration: '2026-02-01',
        status: 'EXPIRE',
      },
    ],
  },
];

// ==========================================
// DEMO MAINTENANCE PLANS & SCHEDULED
// ==========================================
export const DEMO_MAINTENANCE_PLANS: MaintenancePlanItem[] = [
  {
    id: 'mplan_01',
    vehicleImmatriculation: 'AB-789-XY',
    typeIntervention: 'Vidange Moteur',
    frequenceKm: 15000,
    dernierKmRealise: 135000,
    derniereDateRealisee: '2026-05-10',
    prochainKmEcheance: 150000,
    prochaineDateEcheance: '2026-08-20',
    alertLevel: 'ORANGE', // Approaching deadline (142500 vs 150000)
  },
  {
    id: 'mplan_02',
    vehicleImmatriculation: 'AB-789-XY',
    typeIntervention: 'Freinage & Plaquettes',
    frequenceKm: 30000,
    dernierKmRealise: 110000,
    derniereDateRealisee: '2025-11-15',
    prochainKmEcheance: 140000,
    prochaineDateEcheance: '2026-08-01',
    alertLevel: 'ROUGE', // Overdue!
  },
  {
    id: 'mplan_03',
    vehicleImmatriculation: 'CD-456-ZZ',
    typeIntervention: 'Rotation / Pneus',
    frequenceKm: 20000,
    dernierKmRealise: 175000,
    derniereDateRealisee: '2026-06-01',
    prochainKmEcheance: 195000,
    prochaineDateEcheance: '2026-09-15',
    alertLevel: 'VERT',
  },
  {
    id: 'mplan_04',
    vehicleImmatriculation: 'EF-123-AA',
    typeIntervention: 'Révision Générale',
    frequenceKm: 50000,
    dernierKmRealise: 190000,
    derniereDateRealisee: '2025-08-10',
    prochainKmEcheance: 240000,
    prochaineDateEcheance: '2026-08-10',
    alertLevel: 'ROUGE',
  },
];

export const DEMO_SCHEDULED_MAINTENANCE: ScheduledMaintenance[] = [
  {
    id: 'SCHED-2026-01',
    planItemId: 'mplan_02',
    vehicleImmatriculation: 'AB-789-XY',
    typeIntervention: 'Freinage & Plaquettes',
    dateProgrammee: '2026-08-15',
    mecanicienOuAtelier: 'Antoine Vasseur (Chef Atelier YM)',
    coutEstimeFCFA: 180000,
    status: 'PROGRAMMEE',
    notes: 'Remplacement d’urgence des plaquettes essieu arrière.',
  },
  {
    id: 'SCHED-2026-02',
    planItemId: 'mplan_01',
    vehicleImmatriculation: 'AB-789-XY',
    typeIntervention: 'Vidange Moteur',
    dateProgrammee: '2026-08-22',
    mecanicienOuAtelier: 'Garage Central Douala',
    coutEstimeFCFA: 120000,
    status: 'PROGRAMMEE',
    notes: 'Vidange 15w40 + filtres à huile/carburant/air.',
  },
];

// ==========================================
// DEMO CONTAINER CAUTIONS
// ==========================================
export const DEMO_CAUTIONS: ContainerCaution[] = [
  {
    id: 'CAUT-2026-001',
    noConteneurBL: 'MSCU-9821340',
    ligneMaritime: 'MSC (Mediterranean Shipping Co)',
    clientNom: 'Bolloré Logistics / Socar',
    truckImmatriculation: 'AB-789-XY',
    chauffeurNom: 'Jean-Marc Diallo',
    montantCautionFCFA: 350000,
    fraisJournalierRetardFCFA: 15000,
    depotDestination: 'Dépôt 3B Douala Port',
    dateDepot: '2026-08-05',
    dateLimiteRetour: '2026-08-15',
    status: 'En cours',
    notes: 'Conteneur 40 High Cube en déchargement client Akwa.',
  },
  {
    id: 'CAUT-2026-002',
    noConteneurBL: 'MAEU-4410921',
    ligneMaritime: 'Maersk Line',
    clientNom: 'Cimenteries du Cameroun (CIMENCAM)',
    truckImmatriculation: 'CD-456-ZZ',
    chauffeurNom: 'Mamadou Kouyaté',
    montantCautionFCFA: 500000,
    fraisJournalierRetardFCFA: 20000,
    depotDestination: 'Parc à Conteneurs Kribi',
    dateDepot: '2026-07-28',
    dateLimiteRetour: '2026-08-10', // Exceeded deadline by 2 days
    status: 'En retard - Pénalité',
    montantPenaliteFCFA: 40000,
    notes: 'Client retardé à la manutention. Camion en route vers le parc.',
  },
  {
    id: 'CAUT-2026-003',
    noConteneurBL: 'CMAU-1120938',
    ligneMaritime: 'CMA CGM',
    clientNom: 'Brasseries du Cameroun',
    truckImmatriculation: 'EF-123-AA',
    chauffeurNom: 'Paul Mbida',
    montantCautionFCFA: 400000,
    fraisJournalierRetardFCFA: 18000,
    depotDestination: 'Dépôt Bassa Douala',
    dateDepot: '2026-07-15',
    dateLimiteRetour: '2026-07-25',
    dateRetourEffectif: '2026-07-24',
    status: 'Retourné à temps',
    montantRecupereFCFA: 400000,
    notes: 'Restitué conforme sans avarie.',
  },
  {
    id: 'CAUT-2026-004',
    noConteneurBL: 'COSU-8819201',
    ligneMaritime: 'COSCO Shipping',
    clientNom: 'SABC Yaoundé',
    truckImmatriculation: 'AB-789-XY',
    chauffeurNom: 'Jean-Marc Diallo',
    montantCautionFCFA: 450000,
    fraisJournalierRetardFCFA: 25000,
    depotDestination: 'Gare Routière Mvan Yaoundé',
    dateDepot: '2026-06-01',
    dateLimiteRetour: '2026-06-15',
    status: 'Caution perdue',
    montantPenaliteFCFA: 450000,
    notes: 'Conteneur endommagé au déchargement, caution confisquée par COSCO.',
  },
];

// ==========================================
// DEMO FUEL ANALYSIS
// ==========================================
export const DEMO_FUEL_ANALYSIS: FuelAnalysisEntry[] = [
  {
    tripId: 'TRIP-101',
    date: '2026-08-10',
    truckImmatriculation: 'AB-789-XY',
    chauffeurNom: 'Jean-Marc Diallo',
    trajetLabel: 'Douala Port -> Yaoundé Nsimalen (280 km)',
    kmParcourus: 280,
    carburantConsommeL: 95,
    consommationReelleL100: 33.9,
    consommationRefL100: 34.5,
    ecartL100: -0.6,
    anomalieDetectee: false,
  },
  {
    tripId: 'TRIP-102',
    date: '2026-08-08',
    truckImmatriculation: 'CD-456-ZZ',
    chauffeurNom: 'Mamadou Kouyaté',
    trajetLabel: 'Douala -> Kribi Port Conteneurs (180 km)',
    kmParcourus: 180,
    carburantConsommeL: 82,
    consommationReelleL100: 45.5,
    consommationRefL100: 36.0,
    ecartL100: 9.5, // +26% over ref!
    anomalieDetectee: true,
    typeAnomalie: 'Suspicion fuite/vol',
  },
  {
    tripId: 'TRIP-103',
    date: '2026-08-06',
    truckImmatriculation: 'EF-123-AA',
    chauffeurNom: 'Paul Mbida',
    trajetLabel: 'Douala -> Bafoussam ZI (290 km)',
    kmParcourus: 290,
    carburantConsommeL: 125,
    consommationReelleL100: 43.1,
    consommationRefL100: 38.0,
    ecartL100: 5.1,
    anomalieDetectee: true,
    typeAnomalie: 'Surconsommation mécanique',
  },
];

// ==========================================
// DEMO DRIVER SCORES
// ==========================================
export const DEMO_DRIVER_SCORES: DriverPerformanceScore[] = [
  {
    chauffeurId: 'user_driver_1',
    chauffeurNom: 'Jean-Marc Diallo',
    periode: 'Août 2026',
    totalKm: 3420,
    nombreTrajets: 14,
    ponctualitePct: 96,
    moyenneConsoL100: 33.8,
    pannesSignaleesCount: 1,
    cautionsEnRetardCount: 0,
    noteClientMoyenne: 4.8,
    scoreGlobalPct: 94,
    rang: 1,
  },
  {
    chauffeurId: 'user_driver_2',
    chauffeurNom: 'Mamadou Kouyaté',
    periode: 'Août 2026',
    totalKm: 2890,
    nombreTrajets: 11,
    ponctualitePct: 88,
    moyenneConsoL100: 41.2,
    pannesSignaleesCount: 2,
    cautionsEnRetardCount: 1,
    noteClientMoyenne: 4.2,
    scoreGlobalPct: 79,
    rang: 2,
  },
  {
    chauffeurId: 'user_driver_3',
    chauffeurNom: 'Paul Mbida',
    periode: 'Août 2026',
    totalKm: 1950,
    nombreTrajets: 7,
    ponctualitePct: 82,
    moyenneConsoL100: 42.8,
    pannesSignaleesCount: 3,
    cautionsEnRetardCount: 1,
    noteClientMoyenne: 3.9,
    scoreGlobalPct: 71,
    rang: 3,
  },
];


export const ensureReportDefaults = (raw: any): WeeklyReport => {
  const defaultRep = createDefaultReport();
  if (!raw || typeof raw !== 'object') return defaultRep;

  return {
    ...defaultRep,
    ...raw,
    driverInfo: {
      ...defaultRep.driverInfo,
      ...(raw.driverInfo || {}),
    },
    trips: Array.isArray(raw.trips) && raw.trips.length > 0 ? raw.trips : defaultRep.trips,
    tripStats: {
      ...defaultRep.tripStats,
      ...(raw.tripStats || {}),
    },
    defects: {
      ...defaultRep.defects,
      ...(raw.defects || {}),
    },
    checklist: {
      ...defaultRep.checklist,
      ...(raw.checklist || {}),
    },
    mechanicVerif: {
      ...defaultRep.mechanicVerif,
      ...(raw.mechanicVerif || {}),
    },
    observations: {
      ...defaultRep.observations,
      ...(raw.observations || {}),
    },
    signatures: {
      chauffeur: {
        ...defaultRep.signatures.chauffeur,
        ...(raw.signatures?.chauffeur || {}),
      },
      superviseur: {
        ...defaultRep.signatures.superviseur,
        ...(raw.signatures?.superviseur || {}),
      },
      logistique: {
        ...defaultRep.signatures.logistique,
        ...(raw.signatures?.logistique || {}),
      },
    },
  };
};
