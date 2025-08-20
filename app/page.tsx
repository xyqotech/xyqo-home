// Xyqo.ai - Page de maintenance temporaire

'use client';
import { useState, useEffect } from "react";

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('fr-FR'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              XYQO
            </span>
          </h1>
          <p className="text-xl text-gray-300">L'automatisation simplifiée</p>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Maintenance en cours</h2>
            <p className="text-lg text-gray-300 mb-6">
              Nous mettons à jour nos services pour vous offrir une meilleure expérience.
            </p>
          </div>

          {/* Progress Animation */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Mise à jour en cours...</p>
          </div>

          {/* Time */}
          <p className="text-sm text-gray-400">
            {currentTime}
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            Pour toute urgence, contactez-nous :
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@xyqo.ai" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@xyqo.ai
            </a>
            <a 
              href="tel:+33632587305" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +33 6 32 58 73 05
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 XYQO. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
