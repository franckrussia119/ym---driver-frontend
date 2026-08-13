import React from 'react';
import { ReportSignatures, SignatureEntry } from '../types';
import { SignaturePad } from './SignaturePad';

interface Section5SignaturesProps {
  signatures: ReportSignatures;
  onChange: (updated: ReportSignatures) => void;
}

export const Section5Signatures: React.FC<Section5SignaturesProps> = ({ signatures, onChange }) => {
  const handleSaveRole = (
    roleKey: keyof ReportSignatures,
    nom: string,
    signature: string,
    date: string
  ) => {
    onChange({
      ...signatures,
      [roleKey]: {
        nom,
        signature,
        date,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Section Header */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded">SECTION 5</span>
          <h2 className="font-semibold text-sm sm:text-base tracking-wide">Signatures & Validation</h2>
        </div>
        <span className="text-xs text-slate-300 italic">Validation officielle de fin de semaine</span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <SignaturePad
          label="Chauffeur"
          nom={signatures.chauffeur.nom}
          value={signatures.chauffeur.signature}
          date={signatures.chauffeur.date}
          onSave={(nom, sig, date) => handleSaveRole('chauffeur', nom, sig, date)}
        />

        <SignaturePad
          label="Superviseur de flotte"
          nom={signatures.superviseur.nom}
          value={signatures.superviseur.signature}
          date={signatures.superviseur.date}
          onSave={(nom, sig, date) => handleSaveRole('superviseur', nom, sig, date)}
        />

        <SignaturePad
          label="Responsable logistique"
          nom={signatures.logistique.nom}
          value={signatures.logistique.signature}
          date={signatures.logistique.date}
          onSave={(nom, sig, date) => handleSaveRole('logistique', nom, sig, date)}
        />
      </div>
    </div>
  );
};
