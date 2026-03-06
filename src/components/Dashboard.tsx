'use client';

import Header from './Header';
import UserPanel from './UserPanel';
import PreferencesManager from './PreferencesManager';
import GlobalTable from './GlobalTable';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-nursing-800 mb-2">
            Gestión de Plazas EIR 2026
          </h2>
          <p className="text-gray-600">
            Organiza tus preferencias y compara tu posición con otros aspirantes
          </p>
        </div>

        {/* User Panel */}
        <UserPanel />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Preferences Manager */}
          <PreferencesManager />

          {/* Info Card */}
          <div className="bg-gradient-to-br from-nursing-50 via-pastel-mint to-pastel-blue rounded-2xl shadow-lg p-6 border-2 border-nursing-200">
            <h3 className="text-xl font-bold text-nursing-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              ¿Cómo funciona?
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-nursing-800">Introduce tu número de plaza</h4>
                  <p className="text-sm text-gray-700">
                    Indica tu posición en el examen EIR 2026
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-nursing-800">Añade tus preferencias</h4>
                  <p className="text-sm text-gray-700">
                    Elige hospitales, provincias o comunidades autónomas en orden de prioridad
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-nursing-800">Compara tu posición</h4>
                  <p className="text-sm text-gray-700">
                    Visualiza cuántas personas con mejor posición han elegido tus mismas preferencias
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-nursing-800">Toma decisiones informadas</h4>
                  <p className="text-sm text-gray-700">
                    Usa la información para optimizar tus elecciones reales
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-nursing-100 bg-opacity-70 rounded-lg border-l-4 border-nursing-500">
              <p className="text-xs text-gray-700">
                ℹ️ <strong>Nota:</strong> Esta herramienta es orientativa. Los datos aquí reflejados dependen de las preferencias introducidas por los usuarios y pueden no coincidir con las elecciones reales.
              </p>
            </div>
          </div>
        </div>

        {/* Global Table */}
        <GlobalTable />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>EIR 2026 - Gestión de Plazas</p>
          <p className="mt-1">Desarrollado con ❤️ para futuros residentes de enfermería</p>
        </footer>
      </main>
    </div>
  );
}
