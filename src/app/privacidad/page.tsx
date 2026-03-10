import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad - EIR 2026',
  description: 'Política de privacidad y protección de datos de EIR 2026',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <Link href="/" className="text-[#e0559c] hover:underline text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Política de Privacidad
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* 1. Responsable del tratamiento */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Responsable del Tratamiento de Datos</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm">
                <strong>Responsable:</strong> ewolf<br />
                <strong>Sitio web:</strong> EIR 2026 - Gestión de Plazas<br />
                <strong>Contacto:</strong> A través de la plataforma
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, 
              relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales (RGPD), 
              le informamos sobre el tratamiento de sus datos personales.
            </p>
          </section>

          {/* 2. Datos que recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datos que Recopilamos</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Datos de autenticación</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Identificador único de usuario (UID) proporcionado por Firebase Authentication</li>
              <li>Información de autenticación necesaria para el acceso al servicio</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Datos de uso</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Preferencias de usuario (selección de plazas, filtros aplicados)</li>
              <li>Información de navegación almacenada localmente en su dispositivo</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Cookies y tecnologías similares</h3>
            <p className="text-gray-700">
              Utilizamos cookies propias y de terceros para mejorar la experiencia del usuario y mostrar publicidad. 
              Consulte nuestra{' '}
              <Link href="/cookies" className="text-[#e0559c] hover:underline font-medium">
                Política de Cookies
              </Link>{' '}
              para más información.
            </p>
          </section>

          {/* 3. Finalidad del tratamiento */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-gray-700 mb-4">Sus datos se utilizan para:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Proporcionar acceso a la plataforma de gestión de plazas EIR 2026</li>
              <li>Mantener su sesión de usuario activa y segura</li>
              <li>Guardar sus preferencias y configuraciones</li>
              <li>Mejorar la funcionalidad y experiencia del usuario</li>
              <li>Mostrar publicidad personalizada (solo con su consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          {/* 4. Base legal */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base Legal del Tratamiento</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Finalidad</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Base Legal</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Autenticación y acceso al servicio</td>
                    <td className="border border-gray-300 px-4 py-2">Ejecución del contrato / Interés legítimo</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Cookies de publicidad</td>
                    <td className="border border-gray-300 px-4 py-2">Consentimiento del usuario</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Mejora del servicio</td>
                    <td className="border border-gray-300 px-4 py-2">Interés legítimo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Compartir datos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartir Datos con Terceros</h2>
            <p className="text-gray-700 mb-4">
              Compartimos datos con los siguientes proveedores de servicios que actúan como encargados del tratamiento:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Firebase (Google LLC):</strong> Autenticación de usuarios - <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">Política de privacidad</a></li>
              <li><strong>Supabase:</strong> Base de datos y almacenamiento - <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">Política de privacidad</a></li>
              <li><strong>Redes publicitarias:</strong> Solo si acepta cookies de marketing - 5gvci.com, gizokraijaw.net, nap5k.com</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Importante:</strong> No vendemos ni compartimos sus datos personales con terceros para fines de marketing sin su consentimiento explícito.
              </p>
            </div>
          </section>

          {/* 6. Transferencias internacionales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Transferencias Internacionales</h2>
            <p className="text-gray-700">
              Algunos de nuestros proveedores de servicios (Firebase, Supabase) pueden procesar datos fuera del Espacio Económico Europeo (EEE). 
              Estas transferencias están protegidas mediante cláusulas contractuales tipo aprobadas por la Comisión Europea 
              y mecanismos de escudo de privacidad equivalentes.
            </p>
          </section>

          {/* 7. Conservación de datos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Conservación de Datos</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Datos de autenticación:</strong> Mientras mantenga su cuenta activa</li>
              <li><strong>Datos de preferencias:</strong> Hasta que elimine su cuenta o solicite su eliminación</li>
              <li><strong>Cookies:</strong> Según se especifica en nuestra Política de Cookies (generalmente hasta 365 días)</li>
            </ul>
          </section>

          {/* 8. Derechos del usuario */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sus Derechos</h2>
            <p className="text-gray-700 mb-4">
              En virtud del RGPD, usted tiene los siguientes derechos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de acceso</h4>
                <p className="text-sm text-gray-600">Conocer qué datos personales tenemos sobre usted</p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de rectificación</h4>
                <p className="text-sm text-gray-600">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de supresión</h4>
                <p className="text-sm text-gray-600">Solicitar la eliminación de sus datos</p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de oposición</h4>
                <p className="text-sm text-gray-600">Oponerse al tratamiento de sus datos</p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de portabilidad</h4>
                <p className="text-sm text-gray-600">Recibir sus datos en formato estructurado</p>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de limitación</h4>
                <p className="text-sm text-gray-600">Limitar el tratamiento de sus datos</p>
              </div>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-6">
              <p className="text-sm text-green-800">
                📧 Para ejercer sus derechos, puede contactarnos a través de la plataforma. 
                Responderemos a su solicitud en un plazo máximo de 30 días.
              </p>
            </div>
          </section>

          {/* 9. Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Medidas de Seguridad</h2>
            <p className="text-gray-700 mb-4">
              Hemos implementado medidas técnicas y organizativas apropiadas para proteger sus datos personales contra:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Acceso no autorizado</li>
              <li>Pérdida accidental o destrucción</li>
              <li>Alteración o divulgación no autorizada</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Utilizamos cifrado HTTPS/TLS, autenticación segura, y controles de acceso estrictos.
            </p>
          </section>

          {/* 10. Menores */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Protección de Menores</h2>
            <p className="text-gray-700">
              Este servicio está dirigido a profesionales de enfermería mayores de 18 años. 
              No recopilamos intencionadamente datos de menores de edad. Si detectamos que hemos 
              recopilado datos de un menor sin consentimiento parental, los eliminaremos inmediatamente.
            </p>
          </section>

          {/* 11. Cambios */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modificaciones de esta Política</h2>
            <p className="text-gray-700">
              Nos reservamos el derecho a modificar esta política de privacidad para adaptarla a cambios legislativos 
              o en nuestras prácticas de tratamiento de datos. Los cambios sustanciales se notificarán a través de la plataforma 
              con al menos 30 días de antelación.
            </p>
          </section>

          {/* 12. Autoridad de control */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Autoridad de Control</h2>
            <p className="text-gray-700 mb-4">
              Si considera que sus derechos no han sido atendidos correctamente, tiene derecho a presentar 
              una reclamación ante la autoridad de control competente:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong>Agencia Española de Protección de Datos (AEPD)</strong><br />
                C/ Jorge Juan, 6<br />
                28001 - Madrid<br />
                Web: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#e0559c] hover:underline">www.aepd.es</a>
              </p>
            </div>
          </section>

          {/* 13. Contacto */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre esta política de privacidad o sobre el tratamiento de sus datos personales, 
              puede contactarnos a través de la plataforma.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/terminos"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Términos y Condiciones →
              </Link>
              <Link
                href="/cookies"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Política de Cookies →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
