import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isInStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for BeforeInstallPrompt on Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowBanner(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isStandalone || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Top Discreet Banner (Non-overlapping) */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate font-medium text-slate-200">
              Application Mobile YM-TRANSIT disponible pour smartphone
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Installer</span>
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">Installation sur iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline text-blue-600" /> dans Safari.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Sélectionnez <strong className="text-slate-900">Sur l'écran d'accueil</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Appuyez sur <strong className="text-blue-600">Ajouter</strong>. L'application est installée !
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>J'ai compris</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
