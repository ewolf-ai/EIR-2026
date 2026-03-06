'use client';

import Header from './Header';
import UserPanel from './UserPanel';
import PreferencesManager from './PreferencesManager';
import GlobalTable from './GlobalTable';
import AdBanner from './AdBanner';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-nursing-800 mb-2">
            Gestión de Plazas EIR 2026
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Organiza tus preferencias y compara tu posición con otros aspirantes
          </p>
        </div>

        {/* User Panel */}
        <UserPanel />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Preferences Manager */}
          <PreferencesManager />

          {/* Info Card */}
          <div className="bg-gradient-to-br from-nursing-50 via-pastel-mint to-pastel-blue rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-nursing-200">
            <h3 className="text-lg sm:text-xl font-bold text-nursing-700 mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">💡</span>
              <span>¿Cómo funciona?</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  1
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-nursing-800">Introduce tu número de plaza</h4>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Indica tu posición en el examen EIR 2026
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  2
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-nursing-800">Añade tus preferencias</h4>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Elige hospitales, provincias o comunidades autónomas en orden de prioridad
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  3
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-nursing-800">Compara tu posición</h4>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Visualiza cuántas personas con mejor posición han elegido tus mismas preferencias
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  4
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-nursing-800">Toma decisiones informadas</h4>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Usa la información para optimizar tus elecciones reales
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-nursing-100 bg-opacity-70 rounded-lg border-l-4 border-nursing-500">
              <p className="text-xs sm:text-sm text-gray-700">
                ℹ️ <strong>Nota:</strong> Esta herramienta es orientativa. Los datos aquí reflejados dependen de las preferencias introducidas por los usuarios y pueden no coincidir con las elecciones reales.
              </p>
            </div>
          </div>
        </div>

        {/* Global Table */}
        <GlobalTable />

        {/* Advertisement */}
        <AdBanner />

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-500 pb-6 sm:pb-8">
          <p>EIR 2026 - Gestión de Plazas</p>
          <p className="mt-1">Desarrollado con ❤️ para futuros residentes de enfermería</p>
        </footer>
      </main>
    </div>
  );
}
