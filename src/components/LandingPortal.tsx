import React from 'react';
import { UserProfile } from '../types';
import {
  Truck,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Lock,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  Flame,
  KeyRound,
} from 'lucide-react';
import { LoginForm } from './LoginForm';

interface LandingPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  onLoginSuccess,
  onInstallPWA,
  canInstallPWA,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>YM-TRANSIT</span>
              <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                PWA Mobile
              </span>
            </h1>
            <p className="text-xs text-slate-400">Portail Flotte, DVIR & Maintenance Atelier (Tarification FCFA)</p>
          </div>
        </div>

        {canInstallPWA && onInstallPWA && (
          <button
            onClick={onInstallPWA}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-blue-200" />
            <span className="hidden sm:inline">Installer l'Application Mobile</span>
            <span className="sm:hidden">Installer App</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full my-8 space-y-10">
        {/* Intro Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Portail d'Accès Multi-Services YM-TRANSIT</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Connectez-vous à votre espace
          </h2>
          <p className="text-sm text-slate-300">
            Chaque collaborateur accède à son compte dédié avec gestion des droits, formulaires sécurisés et tarification en <strong className="text-emerald-400">FCFA</strong>.
          </p>
        </div>

        {/* 4 Service Description Tiles (informational only — no direct-access shortcuts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 border bg-slate-800/40 border-slate-700/70">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Chauffeur / Conducteur</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Rapport hebdomadaire DVIR, saisie des trajets journaliers et déclaration directe des pannes urgentes.
            </p>
          </div>

          <div className="rounded-2xl p-6 border bg-slate-800/40 border-slate-700/70">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Atelier Mécanique</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Réception des pannes signalées, saisie des interventions et établissement des factures de pièces en FCFA.
            </p>
          </div>

          <div className="rounded-2xl p-6 border bg-slate-800/40 border-slate-700/70">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Administration & Flotte</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Contrôle des rapports scellés des chauffeurs, impression PDF des documents officiels et validation finale.
            </p>
          </div>

          <div className="rounded-2xl p-6 border bg-slate-800/40 border-slate-700/70">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Super Administrateur</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Création des comptes chauffeurs/mécaniciens, définition des mots de passe et affectation des camions.
            </p>
          </div>
        </div>

        {/* Real Login Form */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <span>Connexion Sécurisée</span>
          </h3>
          <LoginForm onSuccess={onLoginSuccess} variant="page" />
          <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3" />
            Identifiants créés et gérés par votre Super Administrateur.
          </p>
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-7xl mx-auto w-full pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>YM-TRANSIT PWA — Système Officiel Logistique Flotte & Maintenance</span>
        </div>
        <div>
          <span>Devises: <strong>FCFA</strong> | Multi-rôles & Authentification Sécurisée</span>
        </div>
      </footer>
    </div>
  );
};
