import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/defaults';
import { Truck, Wrench, ShieldCheck, UserCheck, ArrowRight, Lock, KeyRound, User } from 'lucide-react';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
  currentUser: UserProfile | null;
  usersList?: UserProfile[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, currentUser, usersList = DEMO_USERS }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CHAUFFEUR');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    usersList.find((u) => u.role === 'CHAUFFEUR')?.id || usersList[0]?.id || ''
  );

  const filteredUsers = usersList.filter((u) => u.role === selectedRole);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const userForRole = usersList.find((u) => u.role === role);
    if (userForRole) {
      setSelectedUserId(userForRole.id);
    }
  };

  const handleConnect = () => {
    const user = usersList.find((u) => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">YM-TRANSIT FLEET</h2>
              <p className="text-xs text-slate-400">Portail Logistique, Transport & Maintenance</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Veuillez choisir votre profil de connexion pour accéder à votre espace sécurisé.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1. Sélectionner votre Rôle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('CHAUFFEUR')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedRole === 'CHAUFFEUR'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className={`w-5 h-5 mb-1 ${selectedRole === 'CHAUFFEUR' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Chauffeur</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('MECANICIEN')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedRole === 'MECANICIEN'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className={`w-5 h-5 mb-1 ${selectedRole === 'MECANICIEN' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Mécanicien</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('SUPERVISEUR')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedRole === 'SUPERVISEUR'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className={`w-5 h-5 mb-1 ${selectedRole === 'SUPERVISEUR' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Superviseur</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 mb-1 ${selectedRole === 'ADMIN' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('SUPER_ADMIN')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedRole === 'SUPER_ADMIN'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 mb-1 ${selectedRole === 'SUPER_ADMIN' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Super Admin</span>
              </button>
            </div>
          </div>

          {/* User Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              2. Choisir le Compte Utilisateur
            </label>
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
                  Aucun compte disponible pour ce rôle.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedUserId === user.id
                        ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="user_select"
                        checked={selectedUserId === user.id}
                        onChange={() => setSelectedUserId(user.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-xs flex items-center space-x-2">
                          <span>{user.name}</span>
                          {user.camionAssigne && (
                            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
                              {user.camionAssigne}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <UserCheck className={`w-4 h-4 ${selectedUserId === user.id ? 'text-blue-600' : 'opacity-0'}`} />
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConnect}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs"
            >
              <span>Se Connecter à la Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Sécurité : Authentification sécurisée par rôle. Les mots de passe sont masqués conformément aux exigences de sécurité.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
