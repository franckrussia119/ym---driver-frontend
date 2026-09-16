import React from 'react';
import { Container } from '../lib/containers';
import { Printer, X, FileText } from 'lucide-react';

interface PrintableInterchangeDocumentViewProps {
  blNumber: string;
  containers: Container[];
  onClose?: () => void;
}

export const PrintableInterchangeDocumentView: React.FC<PrintableInterchangeDocumentViewProps> = ({ blNumber, containers, onClose }) => {
  // Le client est déduit des conteneurs du BL — on prend le premier nom
  // renseigné trouvé, puisqu'un même BL correspond en pratique à un même
  // client dans l'immense majorité des cas.
  const clientNom = containers.find((c) => c.clientNom)?.clientNom || '';

  return (
    <div className="print-isolate fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible print:inset-auto print:z-auto">
      {/* Non-printable Navigation / Action Header */}
      <div className="w-full max-w-[210mm] bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between text-white shadow-xl print:hidden shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Aperçu PDF - Document d'Interchange</h2>
            <p className="text-xs text-slate-400 font-mono">{blNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Exporter</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable A4 Page */}
      <div className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl print:shadow-none print:p-8 font-serif text-sm">
        <h1 className="text-center text-3xl font-bold text-[#1c3f66] tracking-wide mb-3">YM – TRANSIT</h1>
        <h2 className="text-center text-base font-bold uppercase mb-1">
          Document d'Interchange de Conteneur — Formulaire de Remise et Confirmation
        </h2>
        <p className="text-center text-xs italic text-slate-700 mb-3">
          À utiliser chaque fois qu'un document d'interchange (EIR) change de main. Un formulaire peut couvrir plusieurs conteneurs déposés ensemble.
        </p>
        <div className="border-t-2 border-[#1c3f66] mb-4"></div>

        <table className="w-full border-collapse border border-slate-800 text-xs mb-6">
          <tbody>
            <tr>
              <td className="border border-slate-800 px-2 py-1.5 font-bold w-1/4">N° BL :</td>
              <td className="border border-slate-800 px-2 py-1.5 font-semibold">{blNumber}</td>
            </tr>
            <tr>
              <td className="border border-slate-800 px-2 py-1.5 font-bold">CLIENT :</td>
              <td className="border border-slate-800 px-2 py-1.5 font-semibold">{clientNom}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-slate-800 text-[11px]">
          <thead>
            <tr className="bg-[#1c3f66] text-white">
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[6%]">N°</td>
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[18%]">N° Conteneur</td>
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[18%]">Date et Heure</td>
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[18%]">Déposé par</td>
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[20%]">Le responsable (point de contrôle)</td>
              <td className="border border-slate-800 px-2 py-2 font-bold text-center w-[20%]">Reçu par l'acconier</td>
            </tr>
          </thead>
          <tbody>
            {containers.map((c, i) => (
              <React.Fragment key={c.id}>
                <tr className="break-inside-avoid">
                  <td rowSpan={2} className="border border-slate-800 px-2 py-1 text-center font-bold align-middle">{i + 1}</td>
                  <td rowSpan={2} className="border border-slate-800 px-2 py-1 text-center font-mono font-bold align-middle">{c.containerNumber}</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                </tr>
                <tr className="break-inside-avoid">
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                  <td className="border border-slate-800 px-2 py-3.5">&nbsp;</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="mt-6">
          <p className="font-bold underline text-xs mb-1">Écart Dommage / Remarques :</p>
          <div className="border border-slate-800 h-16"></div>
        </div>

        <p className="text-[10px] italic text-slate-600 mt-4">
          L'original est conservé par le Responsable et classé avec le Registre de Suivi des Interchanges, référencé par le N° EIR. Une copie accompagne le document jusqu'à l'Acconier et à la Comptabilité.
        </p>
      </div>
    </div>
  );
};
