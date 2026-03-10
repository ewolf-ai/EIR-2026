import type { Metadata } from 'next';
import Link from 'next/link';
import CookieSettingsButton from '@/components/CookieSettingsButton';

export const metadata: Metadata = {
  title: 'Política de Cookies - EIR 2026',
  description: 'Información sobre el uso de cookies en la plataforma EIR 2026',
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <Link href="/" className="text-[#e0559c] hover:underline text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Política de Cookies
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Introducción */}
          <section>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                🍪 Esta política de cookies explica qué son las cookies, cómo las utilizamos en la plataforma EIR 2026, 
                qué tipos de cookies utilizamos y cómo puede controlarlas.
              </p>
            </div>
          </section>

          {/* 1. ¿Qué son las cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Las cookies son pequeños archivos de texto que los sitios web envían al navegador y que se almacenan 
              en su dispositivo (ordenador, tablet o móvil). Las cookies permiten que el sitio web recuerde 
              información sobre su visita, como sus preferencias y configuraciones.
            </p>
            <p className="text-gray-700">
              Las cookies hacen que su experiencia de navegación sea más eficiente y pueden ayudar a personalizar 
              el contenido que se le muestra.
            </p>
          </section>

          {/* 2. ¿Cómo utilizamos las cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. ¿Cómo Utilizamos las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              En nuestra plataforma utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Mantener su sesión de usuario activa y segura</li>
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Analizar cómo utiliza nuestra plataforma para mejorarla</li>
              <li>Mostrar publicidad relevante (solo con su consentimiento)</li>
              <li>Recordar su elección de consentimiento de cookies</li>
            </ul>
          </section>

          {/* 3. Tipos de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Según su finalidad</h3>
            
            <div className="space-y-4 mb-6">
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Cookies Técnicas o Necesarias</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Son esenciales para el funcionamiento del sitio web. Permiten funciones básicas como la autenticación 
                  del usuario y la seguridad. No pueden ser desactivadas.
                </p>
                <div className="bg-gray-50 p-2 rounded mt-2">
                  <p className="text-xs text-gray-600">
                    <strong>Base legal:</strong> Interés legítimo / Ejecución del servicio
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Cookies de Análisis</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Permiten analizar el uso que los usuarios hacen de la plataforma para mejorar nuestros servicios. 
                  Actualmente no están activas, pero pueden implementarse en el futuro.
                </p>
                <div className="bg-gray-50 p-2 rounded mt-2">
                  <p className="text-xs text-gray-600">
                    <strong>Base legal:</strong> Consentimiento del usuario
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Cookies de Publicidad</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Se utilizan para mostrar anuncios relevantes y gestionar la publicidad. Son instaladas por 
                  redes publicitarias de terceros. Requieren su consentimiento explícito.
                </p>
                <div className="bg-gray-50 p-2 rounded mt-2">
                  <p className="text-xs text-gray-600">
                    <strong>Base legal:</strong> Consentimiento del usuario (obligatorio)
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Según su duración</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">⏱️ Cookies de Sesión</h4>
                <p className="text-sm text-gray-700">
                  Expiran cuando cierra su navegador. Se utilizan para mantener su sesión activa mientras navega.
                </p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📅 Cookies Persistentes</h4>
                <p className="text-sm text-gray-700">
                  Permanecen en su dispositivo durante un período determinado o hasta que las elimine manualmente.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Según su origen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🏠 Cookies Propias</h4>
                <p className="text-sm text-gray-700">
                  Instaladas por nuestra plataforma. Controlamos su configuración y uso.
                </p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🌐 Cookies de Terceros</h4>
                <p className="text-sm text-gray-700">
                  Instaladas por servicios externos (autenticación, publicidad). Se rigen por sus propias políticas.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Cookies específicas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies Específicas que Utilizamos</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Cookie</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Tipo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Finalidad</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-xs">cookie-consent</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Necesaria</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">Almacena sus preferencias de cookies</td>
                    <td className="border border-gray-300 px-4 py-2">365 días</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-xs">firebase-auth-*</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Necesaria</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">Autenticación de usuario (Firebase)</td>
                    <td className="border border-gray-300 px-4 py-2">Sesión</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-xs">sb-*-auth-token</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Necesaria</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">Token de autenticación (Supabase)</td>
                    <td className="border border-gray-300 px-4 py-2">7 días</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Cookies de terceros (publicidad)</h3>
            <p className="text-gray-700 mb-4">
              Solo se instalan si usted acepta las cookies de publicidad:
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Proveedor</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Finalidad</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Más información</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">5gvci.com</td>
                    <td className="border border-gray-300 px-4 py-2">Publicidad de terceros</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a href="https://5gvci.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">
                        Política
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">gizokraijaw.net</td>
                    <td className="border border-gray-300 px-4 py-2">Publicidad de terceros</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a href="https://gizokraijaw.net/privacy" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">
                        Política
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">nap5k.com</td>
                    <td className="border border-gray-300 px-4 py-2">Publicidad de terceros</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a href="https://nap5k.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">
                        Política
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Nota:</strong> Las cookies de terceros están sujetas a las políticas de privacidad 
                de sus respectivos proveedores. No controlamos estas cookies ni somos responsables de ellas.
              </p>
            </div>
          </section>

          {/* 5. Cómo gestionar cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cómo Gestionar las Cookies</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Panel de configuración de cookies</h3>
            <p className="text-gray-700 mb-4">
              Puede gestionar sus preferencias de cookies en cualquier momento desde nuestra plataforma:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-3">
                Para cambiar sus preferencias, haga clic en el botón &quot;Configurar cookies&quot; en el footer de cualquier página.
              </p>
              <CookieSettingsButton />
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Configuración del navegador</h3>
            <p className="text-gray-700 mb-4">
              También puede controlar las cookies desde la configuración de su navegador. A continuación, 
              enlaces a las instrucciones de los navegadores más comunes:
            </p>
            
            <ul className="space-y-2 mb-6">
              <li>
                <a 
                  href="https://support.google.com/chrome/answer/95647" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e0559c] hover:underline"
                >
                  🌐 Google Chrome
                </a>
              </li>
              <li>
                <a 
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e0559c] hover:underline"
                >
                  🦊 Mozilla Firefox
                </a>
              </li>
              <li>
                <a 
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e0559c] hover:underline"
                >
                  🧭 Safari
                </a>
              </li>
              <li>
                <a 
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e0559c] hover:underline"
                >
                  🌊 Microsoft Edge
                </a>
              </li>
              <li>
                <a 
                  href="https://help.opera.com/en/latest/web-preferences/#cookies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#e0559c] hover:underline"
                >
                  🎭 Opera
                </a>
              </li>
            </ul>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Advertencia:</strong> Bloquear o eliminar las cookies necesarias puede afectar 
                al funcionamiento de la plataforma y algunas funcionalidades pueden no estar disponibles.
              </p>
            </div>
          </section>

          {/* 6. Cookies en dispositivos móviles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies en Dispositivos Móviles</h2>
            <p className="text-gray-700 mb-4">
              Si accede a nuestra plataforma desde un dispositivo móvil, puede gestionar las cookies desde la 
              configuración del navegador móvil (Chrome, Safari, etc.) siguiendo procedimientos similares a los navegadores de escritorio.
            </p>
          </section>

          {/* 7. Actualizaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Actualizaciones de esta Política</h2>
            <p className="text-gray-700">
              Podemos actualizar nuestra política de cookies periódicamente para reflejar cambios en las cookies 
              que utilizamos o por razones operativas, legales o reglamentarias. Le recomendamos que revise esta 
              página regularmente para estar informado sobre el uso de cookies.
            </p>
          </section>

          {/* 8. Más información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Más Información</h2>
            <p className="text-gray-700 mb-4">
              Si desea más información sobre cómo utilizamos las cookies o sobre nuestras prácticas de privacidad:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Consulte nuestra{' '}
                <Link href="/privacidad" className="text-[#e0559c] hover:underline font-medium">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                Revise nuestros{' '}
                <Link href="/terminos" className="text-[#e0559c] hover:underline font-medium">
                  Términos y Condiciones
                </Link>
              </li>
              <li>Contacte con nosotros a través de la plataforma</li>
            </ul>
          </section>

          {/* Recursos adicionales */}
          <section className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
            <h3 className="text-lg font-bold text-blue-900 mb-2">📚 Recursos Adicionales</h3>
            <p className="text-sm text-blue-800 mb-3">
              Si desea obtener más información sobre las cookies en general:
            </p>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <a href="https://www.aepd.es/es/areas-de-actuacion/reglamento-europeo-de-proteccion-de-datos/guias-y-herramientas/guías" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Guía de la AEPD sobre cookies
                </a>
              </li>
              <li>
                • <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  All About Cookies
                </a>
              </li>
              <li>
                • <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Your Online Choices
                </a>
              </li>
            </ul>
          </section>

          {/* Contacto */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre esta política de cookies, puede contactarnos a través de la plataforma.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/privacidad"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Política de Privacidad →
              </Link>
              <Link
                href="/terminos"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Términos y Condiciones →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
