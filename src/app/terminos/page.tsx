import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - EIR 2026',
  description: 'Términos y condiciones de uso de la plataforma EIR 2026',
};

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <Link href="/" className="text-[#e0559c] hover:underline text-sm mb-6 inline-block">
          ← Volver al inicio
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Términos y Condiciones de Uso
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Introducción */}
          <section>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                Al acceder y utilizar la plataforma EIR 2026, usted acepta estar sujeto a estos términos y condiciones de uso. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar esta plataforma.
              </p>
            </div>
          </section>

          {/* 1. Objeto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objeto y Ámbito de Aplicación</h2>
            <p className="text-gray-700 mb-4">
              Los presentes términos y condiciones regulan el acceso y uso de la plataforma web EIR 2026 (en adelante, "la Plataforma"), 
              desarrollada por ewolf, que tiene como finalidad proporcionar información y herramientas de gestión para la selección 
              de plazas del examen de Enfermero Interno Residente (EIR) 2026.
            </p>
            <p className="text-gray-700">
              La Plataforma es un proyecto independiente sin afiliación oficial con el Ministerio de Sanidad o cualquier 
              otra entidad gubernamental.
            </p>
          </section>

          {/* 2. Usuarios */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Usuarios y Requisitos</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Edad mínima</h3>
            <p className="text-gray-700 mb-4">
              El uso de la Plataforma está destinado a profesionales de enfermería mayores de 18 años. 
              Al utilizar este servicio, usted declara y garantiza que tiene al menos 18 años de edad.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Registro y cuenta</h3>
            <p className="text-gray-700 mb-4">
              Para acceder a determinadas funcionalidades, puede ser necesario crear una cuenta de usuario. Usted se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la seguridad y confidencialidad de sus credenciales de acceso</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Asumir la responsabilidad por todas las actividades realizadas con su cuenta</li>
            </ul>
          </section>

          {/* 3. Uso de la Plataforma */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso Aceptable de la Plataforma</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Usos permitidos</h3>
            <p className="text-gray-700 mb-4">
              La Plataforma puede ser utilizada únicamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Consultar información sobre las plazas ofertadas en el EIR 2026</li>
              <li>Gestionar preferencias de selección de plazas</li>
              <li>Acceder a herramientas de comparación y análisis de plazas</li>
              <li>Cualquier otro uso legítimo relacionado con la finalidad de la Plataforma</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Usos prohibidos</h3>
            <p className="text-gray-700 mb-4">
              Queda expresamente prohibido:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Utilizar la Plataforma para fines ilegales o no autorizados</li>
              <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier parte de la Plataforma</li>
              <li>Intentar acceder sin autorización a sistemas, servidores o redes conectadas a la Plataforma</li>
              <li>Transmitir virus, malware o cualquier código malicioso</li>
              <li>Realizar scraping automatizado o extracción masiva de datos sin autorización</li>
              <li>Interferir con el funcionamiento normal de la Plataforma</li>
              <li>Suplantar la identidad de otra persona o entidad</li>
              <li>Acosar, intimidar o difamar a otros usuarios</li>
              <li>Utilizar la Plataforma para enviar spam o comunicaciones comerciales no solicitadas</li>
            </ul>
          </section>

          {/* 4. Información y contenido */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Información y Contenido</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Exactitud de la información</h3>
            <p className="text-gray-700 mb-4">
              Nos esforzamos por mantener la información actualizada y precisa. Sin embargo, no garantizamos la exactitud, 
              integridad o actualidad de toda la información disponible en la Plataforma.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Importante:</strong> La información proporcionada es de carácter informativo y orientativo. 
                Para decisiones oficiales, consulte siempre las fuentes oficiales del Ministerio de Sanidad.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Responsabilidad sobre decisiones</h3>
            <p className="text-gray-700">
              La Plataforma es una herramienta de apoyo para la toma de decisiones. El usuario es el único responsable 
              de las decisiones que tome en base a la información proporcionada.
            </p>
          </section>

          {/* 5. Propiedad intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propiedad Intelectual e Industrial</h2>
            <p className="text-gray-700 mb-4">
              Todos los contenidos de la Plataforma, incluyendo pero no limitándose a textos, gráficos, logotipos, 
              iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software, son propiedad 
              de ewolf o de sus proveedores de contenido y están protegidos por las leyes de propiedad intelectual 
              españolas e internacionales.
            </p>
            <p className="text-gray-700 mb-4">
              Queda prohibida la reproducción, distribución, modificación, comunicación pública o transformación de 
              cualquier contenido sin autorización expresa.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Marcas registradas</h3>
            <p className="text-gray-700">
              Todas las marcas, nombres comerciales o signos distintivos son propiedad de ewolf o de terceros. 
              El uso de la Plataforma no otorga ningún derecho sobre dichas marcas.
            </p>
          </section>

          {/* 6. Disponibilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disponibilidad del Servicio</h2>
            <p className="text-gray-700 mb-4">
              Nos esforzamos por mantener la Plataforma disponible de forma continua. Sin embargo, no garantizamos 
              que el servicio esté libre de interrupciones o errores.
            </p>
            <p className="text-gray-700">
              Nos reservamos el derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Suspender temporalmente el servicio por mantenimiento o actualizaciones</li>
              <li>Modificar, suspender o discontinuar cualquier aspecto de la Plataforma</li>
              <li>Limitar el acceso a ciertos usuarios o funcionalidades</li>
            </ul>
          </section>

          {/* 7. Limitación de responsabilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              En la máxima medida permitida por la ley aplicable:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                La Plataforma se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, 
                expresas o implícitas
              </li>
              <li>
                No nos responsabilizamos de daños directos, indirectos, incidentales, consecuentes o punitivos 
                derivados del uso o imposibilidad de uso de la Plataforma
              </li>
              <li>
                No garantizamos que la Plataforma esté libre de virus u otros componentes dañinos
              </li>
              <li>
                No somos responsables de las decisiones tomadas por los usuarios basándose en la información proporcionada
              </li>
            </ul>
            
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-700">
                Esta limitación de responsabilidad no afecta a los derechos de los consumidores que no puedan 
                ser excluidos según la legislación aplicable.
              </p>
            </div>
          </section>

          {/* 8. Enlaces externos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Enlaces a Terceros</h2>
            <p className="text-gray-700">
              La Plataforma puede contener enlaces a sitios web de terceros. No controlamos ni somos responsables 
              del contenido, políticas de privacidad o prácticas de sitios web de terceros. El acceso a estos 
              enlaces es bajo su propia responsabilidad.
            </p>
          </section>

          {/* 9. Publicidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Publicidad</h2>
            <p className="text-gray-700">
              La Plataforma puede mostrar publicidad de terceros. No somos responsables del contenido de los anuncios 
              ni de las prácticas de los anunciantes. La interacción con los anuncios es bajo su propia responsabilidad.
            </p>
          </section>

          {/* 10. Protección de datos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Protección de Datos Personales</h2>
            <p className="text-gray-700">
              El tratamiento de sus datos personales se rige por nuestra{' '}
              <Link href="/privacidad" className="text-[#e0559c] hover:underline font-medium">
                Política de Privacidad
              </Link>,
              que forma parte integrante de estos términos y condiciones.
            </p>
          </section>

          {/* 11. Modificaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modificaciones de los Términos</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho a modificar estos términos y condiciones en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en la Plataforma.
            </p>
            <p className="text-gray-700">
              Es responsabilidad del usuario revisar periódicamente estos términos. El uso continuado de la 
              Plataforma después de la publicación de cambios constituye la aceptación de dichos cambios.
            </p>
          </section>

          {/* 12. Terminación */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Terminación del Acceso</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho a suspender o cancelar el acceso de cualquier usuario que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Incumpla estos términos y condiciones</li>
              <li>Realice actividades fraudulentas o ilegales</li>
              <li>Ponga en riesgo la seguridad o funcionamiento de la Plataforma</li>
              <li>Cause daño a otros usuarios o a la reputación de la Plataforma</li>
            </ul>
          </section>

          {/* 13. Divisibilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Divisibilidad</h2>
            <p className="text-gray-700">
              Si alguna disposición de estos términos se considera inválida o inaplicable, dicha disposición 
              se eliminará o limitará en la medida mínima necesaria, y las disposiciones restantes seguirán 
              siendo válidas y aplicables.
            </p>
          </section>

          {/* 14. Ley aplicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              Estos términos y condiciones se rigen por la legislación española.
            </p>
            <p className="text-gray-700">
              Para la resolución de cualquier controversia derivada de estos términos, las partes se someten 
              a los Juzgados y Tribunales españoles que correspondan conforme a derecho, renunciando expresamente 
              a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          {/* 15. Contacto */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre estos términos y condiciones, puede contactarnos a través de la plataforma.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/privacidad"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Política de Privacidad →
              </Link>
              <Link
                href="/cookies"
                className="text-[#e0559c] hover:underline font-medium"
              >
                Ver Política de Cookies →
              </Link>
            </div>
          </section>

          {/* Aceptación */}
          <section className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
            <h3 className="text-lg font-bold text-green-900 mb-2">Aceptación de los Términos</h3>
            <p className="text-sm text-green-800">
              Al utilizar la Plataforma EIR 2026, usted reconoce haber leído, entendido y aceptado estos 
              términos y condiciones en su totalidad. Si no está de acuerdo, debe abstenerse de utilizar la Plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
