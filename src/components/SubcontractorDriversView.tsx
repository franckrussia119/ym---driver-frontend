import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Loader2, Phone, Building2, X } from 'lucide-react';
import { listSubcontractors, createSubcontractor, updateSubcontractor, SubcontractorDriver } from '../lib/subcontractors';
import { ApiError } from '../lib/api';

export const SubcontractorDriversView: React.FC = () => {
  const [subcontractors, setSubcontractors] = useState<SubcontractorDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setSubcontractors(await listSubcontractors());
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger les sous-traitants.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubcontractorDriver | null>(null);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [immatriculationCamion, setImmatriculationCamion] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setNom('');
    setTelephone('');
    setNomEntreprise('');
    setImmatriculationCamion('');
    setNotes('');
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEdit = (s: SubcontractorDriver) => {
    setEditing(s);
    setNom(s.nom);
    setTelephone(s.telephone || '');
    setNomEntreprise(s.nomEntreprise || '');
    setImmatriculationCamion(s.immatriculationCamion || '');
    setNotes(s.notes || '');
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setSaveError('Veuillez indiquer le nom du chauffeur.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        nom,
        telephone: telephone || undefined,
        nomEntreprise: nomEntreprise || undefined,
        immatriculationCamion: immatriculationCamion || undefined,
        notes: notes || undefined,
      };
      if (editing) await updateSubcontractor(editing.id, payload);
      else await createSubcontractor(payload);
      await fetchAll();
      setIsModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Chauffeurs Sous-traitants</span>
          </h2>
          <p className="text-xs text-slate-500">
            Chauffeurs externes qui transportent parfois nos conteneurs — pas des comptes utilisateurs, juste une fiche.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Sous-traitant</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-10 flex items-center justify-center text-slate-400 gap-2 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement…
        </div>
      )}
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-4 flex items-center justify-between">
          {loadError}
          <button onClick={fetchAll} className="underline cursor-pointer">Réessayer</button>
        </div>
      )}
      {!isLoading && subcontractors.length === 0 && !loadError && (
        <div className="p-10 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
          Aucun sous-traitant enregistré.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subcontractors.map((s) => (
          <button
            key={s.id}
            onClick={() => openEdit(s)}
            className="text-left bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
          >
            <div className="font-bold text-sm text-slate-900">{s.nom}</div>
            {s.nomEntreprise && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                <Building2 className="w-3 h-3" /> {s.nomEntreprise}
              </div>
            )}
            {s.telephone && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <Phone className="w-3 h-3" /> {s.telephone}
              </div>
            )}
            {s.immatriculationCamion && (
              <div className="text-[10px] font-mono text-slate-400 mt-1.5">{s.immatriculationCamion}</div>
            )}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">{editing ? 'Modifier' : 'Ajouter'} un Sous-traitant</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom *</label>
                <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Téléphone</label>
                <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Société</label>
                <input type="text" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Immatriculation Camion</label>
                <input type="text" value={immatriculationCamion} onChange={(e) => setImmatriculationCamion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              {saveError && <p className="text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium cursor-pointer">Annuler</button>
                <button type="submit" disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
