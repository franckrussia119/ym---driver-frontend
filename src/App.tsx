import React, { useState, useEffect } from 'react';
import {
  WeeklyReport,
  UserProfile,
  FaultDeclaration,
  FaultStatus,
  MechanicInvoice,
  InspectionDefectItem,
  FleetVehicle,
  MaintenancePlanItem,
  ScheduledMaintenance,
  ContainerCaution,
  FuelAnalysisEntry,
  DriverPerformanceScore,
} from './types';
import {
  createDefaultReport,
  ensureReportDefaults,
  DEMO_USERS,
  DEMO_FAULTS,
  DEMO_INVOICES,
  DEMO_FLEET,
  DEMO_MAINTENANCE_PLANS,
  DEMO_SCHEDULED_MAINTENANCE,
  DEMO_CAUTIONS,
  DEMO_FUEL_ANALYSIS,
  DEMO_DRIVER_SCORES,
} from './data/defaults';
import { restoreSession, logout as apiLogout } from './lib/auth';
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { RoutesDispatchView } from './components/RoutesDispatchView';
import { DriverMobileAppView } from './components/DriverMobileAppView';
import { ModulesDashboard } from './components/ModulesDashboard';
import { ProofOfDeliveryModal } from './components/ProofOfDeliveryModal';
import { Section2TripsLog } from './components/Section2TripsLog';
import { Section3VehicleInspection } from './components/Section3VehicleInspection';
import { Section4Observations } from './components/Section4Observations';
import { Section5Signatures } from './components/Section5Signatures';
import { Section1DriverInfo } from './components/Section1DriverInfo';
import { LoginModal } from './components/LoginModal';
import { FaultDeclarationModal } from './components/FaultDeclarationModal';
import { MechanicInvoiceModal } from './components/MechanicInvoiceModal';
import { FaultWorkflowView } from './components/FaultWorkflowView';
import { LandingPortal } from './components/LandingPortal';
import { UserManagementView } from './components/UserManagementView';
import { DriverHomeMenu } from './components/DriverHomeMenu';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SmartphoneFrameWrapper } from './components/SmartphoneFrameWrapper';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DriverHistoryView } from './components/DriverHistoryView';

// New Module Views
import { FleetRegistryView } from './components/FleetRegistryView';
import { PreventiveMaintenanceView } from './components/PreventiveMaintenanceView';
import { ContainerCautionsView } from './components/ContainerCautionsView';
import { RoutePlanningFuelView } from './components/RoutePlanningFuelView';
import { DriverPerformanceView } from './components/DriverPerformanceView';
import { ProofOfDeliveryView } from './components/ProofOfDeliveryView';
import { CustomerFeedbackView } from './components/CustomerFeedbackView';

import { CheckCircle2, AlertTriangle, Wrench, ShieldCheck, Truck, Users, Lock, FileText } from 'lucide-react';

const STORAGE_KEY_CURRENT = 'ym_transit_current_report_v3';
const STORAGE_KEY_HISTORY = 'ym_transit_history_v3';
const STORAGE_KEY_FAULTS = 'ym_transit_faults_v3';
const STORAGE_KEY_INVOICES = 'ym_transit_invoices_v3';
const STORAGE_KEY_USERS_LIST = 'ym_transit_users_list_v3';

// Storage keys for 5 new modules
const STORAGE_KEY_FLEET = 'ym_transit_fleet_v3';
const STORAGE_KEY_MAINT_PLANS = 'ym_transit_maint_plans_v3';
const STORAGE_KEY_SCHED_MAINT = 'ym_transit_sched_maint_v3';
const STORAGE_KEY_CAUTIONS = 'ym_transit_cautions_v3';
const STORAGE_KEY_FUEL = 'ym_transit_fuel_v3';
const STORAGE_KEY_SCORES = 'ym_transit_scores_v3';

export default function App() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('routes_overview');
  const [isSmartphoneView, setIsSmartphoneView] = useState<boolean>(false);

  // POD Modal State
  const [isPODModalOpen, setIsPODModalOpen] = useState(false);
  const [podTargetWaypoint, setPodTargetWaypoint] = useState('Main Warehouse');

  // Users State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_USERS;
  });

  // Auth User State — la session réelle est restaurée via le jeton JWT
  // (voir useEffect ci-dessous), plus jamais depuis un objet utilisateur
  // stocké en clair dans localStorage.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    restoreSession().then((user) => {
      if (user) {
        handleSelectUserFromPortal(user);
      }
      setIsRestoringSession(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDeclareFaultModalOpen, setIsDeclareFaultModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedFaultForInvoice, setSelectedFaultForInvoice] = useState<FaultDeclaration | null>(null);

  // Data Stores
  const [report, setReport] = useState<WeeklyReport>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (saved) {
      try { return ensureReportDefaults(JSON.parse(saved)); } catch { }
    }
    return createDefaultReport();
  });

  const [history, setHistory] = useState<WeeklyReport[]>(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r) => ensureReportDefaults(r));
        }
      } catch { }
    }
    return [];
  });

  const [faults, setFaults] = useState<FaultDeclaration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FAULTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_FAULTS;
  });

  const [invoices, setInvoices] = useState<MechanicInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_INVOICES;
  });

  // State for 5 New Modules
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FLEET);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_FLEET;
  });

  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlanItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MAINT_PLANS);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_MAINTENANCE_PLANS;
  });

  const [scheduledMaintenances, setScheduledMaintenances] = useState<ScheduledMaintenance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCHED_MAINT);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_SCHEDULED_MAINTENANCE;
  });

  const [cautions, setCautions] = useState<ContainerCaution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CAUTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_CAUTIONS;
  });

  const [fuelEntries, setFuelEntries] = useState<FuelAnalysisEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FUEL);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_FUEL_ANALYSIS;
  });

  const [driverScores, setDriverScores] = useState<DriverPerformanceScore[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCORES);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEMO_DRIVER_SCORES;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(report));
  }, [report]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAULTS, JSON.stringify(faults));
  }, [faults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FLEET, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MAINT_PLANS, JSON.stringify(maintenancePlans));
  }, [maintenancePlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHED_MAINT, JSON.stringify(scheduledMaintenances));
  }, [scheduledMaintenances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CAUTIONS, JSON.stringify(cautions));
  }, [cautions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FUEL, JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(driverScores));
  }, [driverScores]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'CHAUFFEUR') {
        const camionParts = currentUser.camionAssigne?.split('(') || [];
        const immat = camionParts[0]?.trim() || currentUser.camionAssigne || '';
        const model = camionParts[1] ? camionParts[1].replace(')', '').trim() : '';

        setReport((prev) => ({
          ...prev,
          driverInfo: {
            ...prev.driverInfo,
            nomChauffeur: currentUser.name || prev.driverInfo.nomChauffeur,
            immatriculation: immat,
            marqueModele: model,
          },
        }));
      }
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const hasDefects = (Object.values(report.defects || {}) as InspectionDefectItem[]).some((d) => d.constate);

  // Actions
  const handleSelectUserFromPortal = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'CHAUFFEUR') {
      setSidebarTab('proof_of_delivery');
      showToast(`Espace Chauffeur connecté : ${user.name}`);
    } else if (user.role === 'MECANICIEN') {
      setSidebarTab('faults_workflow');
      showToast(`Espace Mécanique connecté : ${user.name}`);
    } else if (user.role === 'SUPER_ADMIN') {
      setSidebarTab('superadmin_users');
      showToast(`Espace Super Admin connecté : ${user.name}`);
    } else {
      setSidebarTab('routes_overview');
      showToast(`Espace Supervision / Admin connecté : ${user.name}`);
    }
  };

  const handleLogin = (user: UserProfile) => {
    handleSelectUserFromPortal(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setSidebarTab('routes_overview');
    showToast('Déconnexion réussie.');
  };

  const handleSaveDraft = () => {
    const existingIdx = history.findIndex((h) => h.id === report.id);
    let updatedHistory: WeeklyReport[];
    if (existingIdx >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIdx] = report;
    } else {
      updatedHistory = [report, ...history];
    }
    setHistory(updatedHistory);
    showToast('Rapport sauvegardé avec succès.');
  };

  const handleSubmitReportToAdmin = () => {
    if (!report.signatures?.chauffeur?.signature && !report.signatures?.chauffeur?.nom) {
      alert('Veuillez signer la section 5 avant de soumettre le rapport.');
      return;
    }

    const submittedReport: WeeklyReport = {
      ...report,
      isSubmitted: true,
      submittedAt: new Date().toISOString(),
    };

    setReport(submittedReport);

    const existingIdx = history.findIndex((h) => h.id === submittedReport.id);
    let updatedHistory: WeeklyReport[];
    if (existingIdx >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIdx] = submittedReport;
    } else {
      updatedHistory = [submittedReport, ...history];
    }
    setHistory(updatedHistory);

    showToast('Rapport hebdomadaire soumis et verrouillé ! Transmis à l\'Administration.');
    setSidebarTab('driver_mobile_app');
  };

  const handleAddFault = (newFault: FaultDeclaration) => {
    const initialHistoryEntry = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      actorName: currentUser?.name || 'Chauffeur',
      actorRole: currentUser?.role || 'CHAUFFEUR',
      status: 'Signalée par chauffeur' as FaultStatus,
      comment: 'Déclaration initiale de la panne par le chauffeur.',
    };

    const faultWithHistory = {
      ...newFault,
      history: [initialHistoryEntry],
    };

    setFaults([faultWithHistory, ...faults]);
    setIsDeclareFaultModalOpen(false);
    showToast(`Panne ${newFault.id} transmise au Superviseur & Atelier.`);
    setSidebarTab('faults_workflow');
  };

  const handleUpdateFaultStatus = (faultId: string, newStatus: FaultStatus, comment?: string) => {
    setFaults(
      faults.map((f) => {
        if (f.id !== faultId) return f;

        const newHistoryEntry = {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString('fr-FR'),
          actorName: currentUser?.name || 'Utilisateur',
          actorRole: currentUser?.role || 'SUPERVISEUR',
          status: newStatus,
          comment: comment || `Mise à jour du statut vers ${newStatus}`,
        };

        return {
          ...f,
          status: newStatus,
          history: [...(f.history || []), newHistoryEntry],
          notesSuperviseur: comment || f.notesSuperviseur,
        };
      })
    );
    showToast(`Panne mise à jour : ${newStatus}`);
  };

  const handleAddInvoice = (newInvoice: MechanicInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    if (newInvoice.faultId) {
      handleUpdateFaultStatus(
        newInvoice.faultId,
        'Réparée — en attente de clôture',
        `Facture ${newInvoice.id} enregistrée par le mécanicien.`
      );
    }
    showToast(`Facture ${newInvoice.id} créée avec succès (${newInvoice.totalTTC} FCFA).`);
    setSidebarTab('mechanic_invoices');
  };

  const handleOpenPODModalForWaypoint = (waypointName: string) => {
    setPodTargetWaypoint(waypointName);
    setIsPODModalOpen(true);
  };

  // Filter personal history for logged in driver
  const driverPersonalReports = history.filter(
    (r) => r.driverInfo?.nomChauffeur === currentUser?.name || currentUser?.role !== 'CHAUFFEUR'
  );
  const driverPersonalFaults = faults.filter(
    (f) => f.chauffeurId === currentUser?.id || f.chauffeurNom === currentUser?.name || currentUser?.role !== 'CHAUFFEUR'
  );

  // Restauration de session en cours : éviter le clignotement de l'écran de connexion
  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          <span>Vérification de la session…</span>
        </div>
      </div>
    );
  }

  // If no user logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LandingPortal onLoginSuccess={handleSelectUserFromPortal} />
        <PWAInstallPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col lg:flex-row">
      <PWAInstallPrompt />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* Fault Declaration Modal */}
      {currentUser && (
        <FaultDeclarationModal
          currentUser={currentUser}
          isOpen={isDeclareFaultModalOpen}
          onClose={() => setIsDeclareFaultModalOpen(false)}
          onSubmitFault={handleAddFault}
        />
      )}

      {/* Mechanic Invoice Modal */}
      {currentUser && (
        <MechanicInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedFaultForInvoice(null);
          }}
          onSaveInvoice={handleAddInvoice}
          currentUser={currentUser}
          initialTruck={selectedFaultForInvoice?.immatriculation || 'AB-789-XY (Volvo FH 500)'}
          initialChauffeur={selectedFaultForInvoice?.chauffeurNom || 'Jean-Marc Diallo'}
          initialFaultId={selectedFaultForInvoice?.id}
        />
      )}

      {/* Proof of Delivery Modal (POD) */}
      <ProofOfDeliveryModal
        isOpen={isPODModalOpen}
        onClose={() => setIsPODModalOpen(false)}
        waypointName={podTargetWaypoint}
        onConfirmPOD={(data) => {
          showToast(`POD enregistré pour ${podTargetWaypoint} (Signataire : ${data.recipientName})`);
        }}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={sidebarTab}
        setActiveTab={setSidebarTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Header
          report={report}
          currentUser={currentUser}
          activeTab={sidebarTab as any}
          setActiveTab={(tab: any) => setSidebarTab(tab)}
          onLogout={handleLogout}
          onOpenDeclareFault={() => setIsDeclareFaultModalOpen(true)}
          onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
          onLoadDemo={() => setReport(createDefaultReport())}
          onSaveDraft={handleSaveDraft}
          onPrint={() => window.print()}
          hasDefects={hasDefects}
          historyCount={history.length}
          isSmartphoneView={isSmartphoneView}
          setIsSmartphoneView={setIsSmartphoneView}
        />

        {/* Content Area */}
        <SmartphoneFrameWrapper
          isSmartphoneView={isSmartphoneView}
          setIsSmartphoneView={setIsSmartphoneView}
          appName="YM-TRANSIT Logistics"
          driverName={currentUser?.name}
        >
          <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-10 max-w-7xl mx-auto w-full">
            
            {/* DRIVER MOBILE HOME MENU (When Driver clicks Mobile App Tab) */}
            {sidebarTab === 'driver_mobile_app' && (
              <DriverHomeMenu
                currentUser={currentUser}
                onOpenDeclareFault={() => setIsDeclareFaultModalOpen(true)}
                onOpenWeeklyReport={() => setSidebarTab('driver_vehicle')}
                driverReports={driverPersonalReports}
                driverFaults={driverPersonalFaults}
                onViewReport={(rpt) => {
                  setReport(rpt);
                  setSidebarTab('driver_vehicle');
                }}
                onViewFault={(fault) => {
                  setSidebarTab('faults_workflow');
                }}
              />
            )}

            {/* 1. ROUTES DISPATCH OVERVIEW VIEW */}
            {sidebarTab === 'routes_overview' && (
              <RoutesDispatchView
                onOpenMobileView={() => setSidebarTab('driver_mobile_app')}
                onOpenPODModal={handleOpenPODModalForWaypoint}
              />
            )}

            {/* 2. CONDUCTEUR ET VÉHICULE (Weekly Driver Report) */}
            {sidebarTab === 'driver_vehicle' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-blue-400" />
                    <div>
                      <h2 className="font-bold text-base">Rapport Hebdomadaire & Inspection Camion</h2>
                      <p className="text-xs text-slate-400">
                        {report.isSubmitted ? 'Rapport soumis et verrouillé (Lecture seule)' : 'Saisie du rapport par le chauffeur'}
                      </p>
                    </div>
                  </div>

                  {report.isSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800/80">
                      <Lock className="w-3.5 h-3.5" />
                      Envoyé — non modifiable
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsDeclareFaultModalOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Déclarer Panne</span>
                    </button>
                  )}
                </div>

                <Section1DriverInfo
                  driverInfo={report.driverInfo}
                  onChange={(updated) => setReport({ ...report, driverInfo: updated })}
                  isSubmitted={report.isSubmitted}
                />

                <Section2TripsLog
                  trips={report.trips}
                  tripStats={report.tripStats}
                  onUpdateTrips={(updatedTrips) => setReport({ ...report, trips: updatedTrips })}
                  onUpdateTripStats={(updatedStats) => setReport({ ...report, tripStats: updatedStats })}
                  isSubmitted={report.isSubmitted}
                />

                <Section3VehicleInspection
                  checklist={report.checklist || {}}
                  defects={report.defects || {}}
                  aucunDefautConstate={report.aucunDefautConstate}
                  mechanicVerif={report.mechanicVerif || { nomMecanicien: '', date: '' }}
                  onAucunDefautToggle={(val) => setReport({ ...report, aucunDefautConstate: val })}
                  onDefectChange={(id, updated) =>
                    setReport({
                      ...report,
                      defects: {
                        ...(report.defects || {}),
                        [id]: { ...(report.defects?.[id] || {}), ...updated },
                      },
                    })
                  }
                  onChecklistToggle={(item) =>
                    setReport({
                      ...report,
                      checklist: {
                        ...(report.checklist || {}),
                        [item]: !report.checklist?.[item],
                      },
                    })
                  }
                  onChecklistAll={(checked) => {
                    const updated = { ...(report.checklist || {}) };
                    Object.keys(updated).forEach((k) => (updated[k] = checked));
                    setReport({ ...report, checklist: updated });
                  }}
                  onMechanicVerifChange={(updated) => setReport({ ...report, mechanicVerif: updated })}
                  onUpdateChecklist={(c) => setReport({ ...report, checklist: c })}
                  onUpdateDefects={(d) => setReport({ ...report, defects: d })}
                  onUpdateAucunDefaut={(val) => setReport({ ...report, aucunDefautConstate: val })}
                  isSubmitted={report.isSubmitted}
                />

                <Section4Observations
                  observations={report.observations}
                  onChange={(obs) => setReport({ ...report, observations: obs })}
                  isSubmitted={report.isSubmitted}
                />

                <Section5Signatures
                  signatures={report.signatures}
                  onChange={(sigs) => setReport({ ...report, signatures: sigs })}
                  onSubmitReport={handleSubmitReportToAdmin}
                  isSubmitted={report.isSubmitted}
                />
              </div>
            )}

            {/* 3. FAULTS WORKFLOW VIEW */}
            {sidebarTab === 'faults_workflow' && (
              <FaultWorkflowView
                currentUser={currentUser}
                faults={faults}
                onUpdateFaultStatus={handleUpdateFaultStatus}
                onOpenDeclareModal={() => setIsDeclareFaultModalOpen(true)}
                onOpenCreateInvoiceForFault={(fault) => {
                  setSelectedFaultForInvoice(fault);
                  setIsInvoiceModalOpen(true);
                }}
              />
            )}

            {/* 4. MECHANIC INVOICES VIEW */}
            {sidebarTab === 'mechanic_invoices' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-blue-600" />
                      <span>Factures Atelier & Interventions Mécaniques</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Création et consultation des factures d'entretien et pièces détachées (FCFA).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFaultForInvoice(null);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Créer Facture Atelier (FCFA)</span>
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Aucune facture d'intervention mécanique enregistrée pour le moment.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{inv.id}</span>
                            <span className="text-slate-400">·</span>
                            <span className="font-semibold text-blue-700">{inv.truckImmatriculation}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{inv.descriptionTravaux}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            Mécanicien : {inv.mecanicienNom} · Date : {inv.dateIntervention}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-sm block">
                            {new Intl.NumberFormat('fr-FR').format(inv.totalTTC)} FCFA
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SUPERADMIN USER MANAGEMENT VIEW */}
            {sidebarTab === 'superadmin_users' && (
              <UserManagementView />
            )}

            {/* 6. REGISTRE FLOTTE & DOCUMENTS */}
            {sidebarTab === 'fleet_registry' && (
              <FleetRegistryView
                vehicles={vehicles}
                onAddVehicle={(v) => setVehicles([...vehicles, v])}
                onUpdateVehicle={(v) =>
                  setVehicles(vehicles.map((x) => (x.id === v.id ? v : x)))
                }
                driversList={users}
              />
            )}

            {/* 7. MAINTENANCE PRÉVENTIVE */}
            {sidebarTab === 'preventive_maintenance' && (
              <PreventiveMaintenanceView
                maintenancePlans={maintenancePlans}
                scheduledMaintenances={scheduledMaintenances}
                vehicles={vehicles}
                allTrips={report.trips || []}
                currentUser={currentUser}
                onAddPlanItem={(p) => setMaintenancePlans([...maintenancePlans, p])}
                onAddScheduledMaintenance={(s) =>
                  setScheduledMaintenances([...scheduledMaintenances, s])
                }
                onOpenCreateInvoiceForMaintenance={(sched) => {
                  setSelectedFaultForInvoice(null);
                  setIsInvoiceModalOpen(true);
                  showToast(`Création facture atelier pour intervention ${sched.vehicleImmatriculation}`);
                }}
              />
            )}

            {/* 8. SUIVI CAUTIONS CONTENEURS */}
            {sidebarTab === 'container_cautions' && (
              <ContainerCautionsView
                cautions={cautions}
                onAddCaution={(c) => setCautions([...cautions, c])}
                onUpdateCaution={(c) =>
                  setCautions(cautions.map((x) => (x.id === c.id ? c : x)))
                }
                vehicles={vehicles}
              />
            )}

            {/* 9. OPTIMISATION ROUTE & CARBURANT */}
            {sidebarTab === 'route_planning_fuel' && (
              <RoutePlanningFuelView
                fuelEntries={fuelEntries}
                vehicles={vehicles}
                allTrips={report.trips || []}
                onAddFuelEntry={(e) => setFuelEntries([...fuelEntries, e])}
              />
            )}

            {/* 10. SCORE & PERFORMANCE CHAUFFEURS */}
            {sidebarTab === 'driver_performance' && (
              <DriverPerformanceView scores={driverScores} driversList={users} />
            )}

            {/* 11. PREUVE DE LIVRAISON (POD) VIEW */}
            {sidebarTab === 'proof_of_delivery' && (
              <ProofOfDeliveryView
                currentUser={currentUser}
                driversList={users}
              />
            )}

            {/* 12. RETOUR CLIENT VIEW */}
            {sidebarTab === 'customer_feedback' && (
              <CustomerFeedbackView
                currentUser={currentUser}
              />
            )}

            {/* 13. HISTORIQUE GLOBAL (POD, RAPPORTS, AVIS) VIEW */}
            {sidebarTab === 'driver_history' && (
              <DriverHistoryView
                currentUser={currentUser}
                driverReports={history}
                onViewReport={(rpt) => {
                  setReport(rpt);
                  setSidebarTab('driver_vehicle');
                }}
              />
            )}

            {/* 13. OTHER MODULES DASHBOARD */}
            {(sidebarTab === 'planning_auto' ||
              sidebarTab === 'orders_tasks' ||
              sidebarTab === 'realtime_eta' ||
              sidebarTab === 'customer_tracking' ||
              sidebarTab === 'barcode_scan' ||
              sidebarTab === 'route_modification' ||
              sidebarTab === 'hazmat_routing' ||
              sidebarTab === 'commercial_nav') && (
              <ModulesDashboard
                onSelectModule={setSidebarTab}
                onOpenPODModal={handleOpenPODModalForWaypoint}
              />
            )}
          </main>
        </SmartphoneFrameWrapper>

        {/* Permanent WhatsApp-Style Bottom Navigation for Mobile & Tablet */}
        <MobileBottomNav
          activeTab={sidebarTab}
          setActiveTab={(tab) => setSidebarTab(tab)}
          currentUser={currentUser}
          onOpenDeclareFault={() => setIsDeclareFaultModalOpen(true)}
          faultsCount={faults.filter((f) => f.status !== 'CORRIGE').length}
        />
      </div>
    </div>
  );
}
