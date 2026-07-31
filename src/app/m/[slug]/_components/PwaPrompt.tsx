"use client";

import { useEffect, useState } from "react";

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIos(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }

    // Timer to trigger popup after 3.5 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/80 rounded-2xl p-4 shadow-2xl text-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="font-bold text-sm text-white">Save as App / Listen Offline</h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Install this mixtape on your home screen for quick access and offline playback.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-gray-400 hover:text-white text-xs p-1"
            aria-label="Close prompt"
          >
            ✕
          </button>
        </div>

        {isIos ? (
          <div className="bg-gray-800/80 rounded-xl p-2.5 text-xs text-gray-300 space-y-1 border border-gray-700">
            <p className="font-semibold text-amber-300">How to install on iOS / Safari:</p>
            <p>1. Tap the <span className="font-bold text-white">Share</span> button (icon at bottom of screen).</p>
            <p>2. Scroll down & tap <span className="font-bold text-white">&quot;Add to Home Screen&quot;</span> ➕.</p>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold text-xs py-2.5 rounded-xl shadow transition-all active:scale-95"
              >
                Install App 📲
              </button>
            ) : (
              <div className="text-xs text-gray-400 bg-gray-800/80 p-2 rounded-xl border border-gray-700 w-full">
                Tap your browser menu (<span className="text-white">⋮</span>) & select <span className="text-white">&quot;Install app&quot;</span> or <span className="text-white">&quot;Add to Home screen&quot;</span>.
              </div>
            )}
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl transition-all"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
