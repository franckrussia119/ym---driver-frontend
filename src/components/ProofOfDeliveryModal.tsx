import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Camera,
  Mic,
  PenTool,
  Upload,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypointName?: string;
  onConfirmPOD?: (data: { signature: string; recipientName: string; photoUrl?: string }) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  isOpen,
  onClose,
  waypointName = 'Main Warehouse',
  onConfirmPOD,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePhoto = () => {
    // Generate a placeholder delivery photo
    const samplePhoto =
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';
    setPhotoUrl(samplePhoto);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      alert('Veuillez indiquer le nom du destinataire qui réceptionne la livraison.');
      return;
    }
    if (!signatureData) {
      alert('Veuillez capturer la signature numérique du destinataire.');
      return;
    }

    setIsSuccess(true);
    if (onConfirmPOD) {
      onConfirmPOD({
        signature: signatureData,
        recipientName,
        photoUrl: photoUrl || undefined,
      });
    }

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Preuve de Livraison (POD)</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Validation numérique pour : <span className="font-bold text-slate-800">{waypointName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-base text-emerald-900">Preuve de livraison validée !</h4>
            <p className="text-xs text-emerald-700">
              La signature et la confirmation ont été transmises instantanément au système central.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nom complet du récepteur / destinataire <span className="text-rose-500">*</span> :
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: M. Jean-Claude Bernard"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Signature numérique du destinataire <span className="text-rose-500">*</span> :
              </label>
              <SignaturePad
                onSave={(data) => setSignatureData(data)}
                onClear={() => setSignatureData('')}
              />
              {signatureData && (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  ✓ Signature enregistrée avec succès
                </span>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Photo justificative du colis / conteneur (optionnelle) :
              </label>
              {photoUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-300 max-h-40">
                  <img src={photoUrl} alt="Preuve" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Prendre / Capturer une photo du colis</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Valider la Preuve de Livraison
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
