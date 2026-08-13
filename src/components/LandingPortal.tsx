import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  Truck,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Smartphone,
  Lock,
  KeyRound,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  Download,
  Flame,
  UserCheck
} from 'lucide-react';

interface LandingPortalProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  users,
  onSelectUser,
  onInstallPWA,
  canInstallPWA,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CHAUFFEUR');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find((u) => u.role === 'CHAUFFEUR')?.id || users[0]?.id || ''
  );
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const filteredUsers = users.filter((u) => u.role === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const userForRole = users.find((u) => u.role === role);
    if (userForRole) {
      setSelectedUserId(userForRole.id);
      setEnteredPassword(userForRole.password || '');
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setEnteredPassword(user.password || '');
    setPasswordError(false);
  };

  const handleConnect = () => {
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;

    // Validate password if user has one
    if (user.password && enteredPassword !== user.password) {
      setPasswordError(true);
      return;
    }

    setPasswordError(false);
    onSelectUser(user);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const demoUser = users.find((u) => u.role === role);
    if (demoUser) {
      onSelectUser(demoUser);
    }
  };

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
            Sélectionnez votre Espace de Travail
          </h2>
          <p className="text-sm text-slate-300">
            Chaque collaborateur accède à son compte dédié avec gestion des droits, formulaires sécurisés et tarification en <strong className="text-emerald-400">FCFA</strong>.
          </p>
        </div>

        {/* 4 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tile 1: Driver */}
          <div
            onClick={() => handleRoleSelect('CHAUFFEUR')}
            className={`rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedRole === 'CHAUFFEUR'
                ? 'bg-slate-800/90 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500'
                : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-900/60 text-blue-300 px-2.5 py-1 rounded-full border border-blue-700/40">
                  Mobile PWA
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Chauffeur / Conducteur</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Rapport hebdomadaire DVIR, saisie des trajets journaliers et déclaration directe des pannes urgentes.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Optimisé smartphones PWA</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickDemoLogin('CHAUFFEUR');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Accès Direct Chauffeur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tile 2: Mechanic */}
          <div
            onClick={() => handleRoleSelect('MECANICIEN')}
            className={`rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedRole === 'MECANICIEN'
                ? 'bg-slate-800/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500'
                : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-900/60 text-amber-300 px-2.5 py-1 rounded-full border border-amber-700/40">
                  Factures FCFA
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Atelier Mécanique</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Réception des pannes signalées, saisie des interventions et établissement des factures de pièces en FCFA.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Tarification en FCFA</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickDemoLogin('MECANICIEN');
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Accès Direct Mécanique</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tile 3: Admin */}
          <div
            onClick={() => handleRoleSelect('ADMIN')}
            className={`rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedRole === 'ADMIN'
                ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500'
                : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-700/40">
                  Supervision
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Administration & Flotte</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Contrôle des rapports scellés des chauffeurs, impression PDF des documents officiels et validation finale.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Impression PDF Officielle</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickDemoLogin('ADMIN');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Accès Direct Administration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tile 4: Super Admin */}
          <div
            onClick={() => handleRoleSelect('SUPER_ADMIN')}
            className={`rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedRole === 'SUPER_ADMIN'
                ? 'bg-slate-800/90 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500'
                : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 px-2.5 py-1 rounded-full border border-purple-700/40">
                  Gestion Utilisateurs
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Super Administrateur</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Création des comptes chauffeurs/mécaniciens, définition des mots de passe et affectation des camions.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Création & Mots de Passe</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickDemoLogin('SUPER_ADMIN');
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Accès Super Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Login Credentials Selection Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <span>Formulaire de Connexion Sécurisée</span>
          </h3>

          <div className="space-y-5">
            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sélectionner un compte ({selectedRole})
              </label>
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedUserId === user.id
                        ? 'bg-blue-950/80 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center space-x-2">
                          <span>{user.name}</span>
                          {user.camionAssigne && (
                            <span className="bg-slate-800 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-700">
                              {user.camionAssigne}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>

                    <UserCheck className={`w-5 h-5 ${selectedUserId === user.id ? 'text-blue-400' : 'opacity-0'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Mot de passe requis</span>
                <span className="text-[10px] text-slate-400 font-mono">Démo pré-remplie</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Entrez votre mot de passe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-400 mt-1 font-semibold">
                  Mot de passe incorrect. (Vérifiez le compte sélectionné)
                </p>
              )}
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-xl flex items-center justify-center space-x-2 text-sm transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              <span>Se Connecter à l'Espace</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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
