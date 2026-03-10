'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clearConsent } from '@/lib/consent';

export default function Footer() {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const handleCookieSettings = () => {
    clearConsent();
    window.location.reload();
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">EIR 2026</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Plataforma de gestión de plazas para el examen EIR 2026. 
              Información, herramientas y recursos para tu elección de plaza.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/privacidad" 
                  className="hover:text-[#e0559c] transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/terminos" 
                  className="hover:text-[#e0559c] transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="hover:text-[#e0559c] transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCookieSettings}
                  className="hover:text-[#e0559c] transition-colors text-left"
                >
                  ⚙️ Configurar cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contacto</h4>
            <p className="text-sm text-gray-400">
              Desarrollado por <span className="text-white font-medium">ewolf</span>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Esta plataforma es un proyecto independiente sin afiliación oficial con el Ministerio de Sanidad.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} ewolf. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-xs">
            Cumplimos con el RGPD (Reglamento General de Protección de Datos)
          </p>
        </div>
      </div>
    </footer>
  );
}
