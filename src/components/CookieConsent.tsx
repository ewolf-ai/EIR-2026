'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  hasConsentChoice,
  acceptAllCookies,
  rejectAllCookies,
  setConsentPreferences,
  getConsentPreferences,
} from '@/lib/consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    if (!hasConsentChoice()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
    setShowCustomize(false);
    
    // Reload to apply scripts
    window.location.reload();
  };

  const handleRejectAll = () => {
    rejectAllCookies();
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleCustomize = () => {
    const preferences = getConsentPreferences();
    setMarketingConsent(preferences?.marketing ?? false);
    setShowCustomize(true);
  };

  const handleSavePreferences = () => {
    setConsentPreferences({
      necessary: true,
      marketing: marketingConsent,
    });
    setShowBanner(false);
    setShowCustomize(false);
    
    // Reload if marketing consent was granted to load scripts
    if (marketingConsent) {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" />

      {/* Main Banner */}
      {!showCustomize && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-4 border-[#e0559c] z-[9999] animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Utilizamos cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias. 
                  Si continúa navegando, consideramos que acepta su uso. Puede obtener más información y cambiar su configuración en nuestra{' '}
                  <Link href="/cookies" className="text-[#e0559c] hover:underline font-medium">
                    Política de Cookies
                  </Link>.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
                >
                  Rechazar todo
                </button>
                <button
                  onClick={handleCustomize}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
                >
                  Personalizar
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e0559c] rounded-lg hover:bg-[#c94a87] transition-colors whitespace-nowrap"
                >
                  Aceptar todo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomize && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Configuración de cookies
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus preferencias de cookies
              </p>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Necessary Cookies */}
              <div className="border-b pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      Cookies necesarias
                      <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Siempre activas
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Estas cookies son esenciales para el funcionamiento del sitio web y no pueden ser desactivadas. 
                      Incluyen cookies de autenticación y funcionalidad básica del sitio.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center px-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full shadow translate-x-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cookies de publicidad y marketing
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Estas cookies son utilizadas por redes publicitarias de terceros para mostrar anuncios 
                      personalizados. Puedes desactivarlas si no deseas ver publicidad personalizada.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Incluye: 5gvci.com, gizokraijaw.net, nap5k.com
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setMarketingConsent(!marketingConsent)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        marketingConsent ? 'bg-[#e0559c]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          marketingConsent ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Nota:</strong> Puedes cambiar tus preferencias en cualquier momento desde el footer de la página.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between border-t rounded-b-xl">
              <Link
                href="/cookies"
                className="text-sm text-[#e0559c] hover:underline font-medium self-start"
              >
                Ver Política de Cookies completa
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomize(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e0559c] rounded-lg hover:bg-[#c94a87] transition-colors"
                >
                  Guardar preferencias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
