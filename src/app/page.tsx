'use client';

import { useAuthStore } from '@/lib/store';
import LoginButton from '@/components/LoginButton';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { dbUser, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-nursing-500 mx-auto mb-4"></div>
          <p className="text-nursing-700 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo and Welcome */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-nursing-400 to-nursing-600 rounded-full mb-6 shadow-xl">
              <span className="text-5xl">🩺</span>
            </div>
            
            <h1 className="text-4xl font-bold text-nursing-800 mb-3">
              EIR 2026
            </h1>
            
            <h2 className="text-xl text-nursing-600 mb-2">
              Gestión de Plazas
            </h2>
            
            <p className="text-gray-600 max-w-sm mx-auto">
              Organiza tus preferencias y compara tu posición con otros aspirantes a las plazas EIR 2026
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Inicia sesión para continuar
            </h3>
            
            <LoginButton />
          </div>

          {/* Features */}
          <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Seguro y privado</h4>
                <p className="text-xs text-gray-600">Tu DNI se almacena de forma segura</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Análisis comparativo</h4>
                <p className="text-xs text-gray-600">Compara tu posición con otros usuarios</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Gestión de preferencias</h4>
                <p className="text-xs text-gray-600">Organiza tus destinos favoritos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">DNI único</h4>
                <p className="text-xs text-gray-600">Un DNI por cuenta, garantizando transparencia</p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="mt-8 text-center space-y-2 opacity-50">
            <div className="flex justify-center gap-4 text-3xl">
              <span>💉</span>
              <span>🩺</span>
              <span>❤️</span>
              <span>🏥</span>
              <span>⚕️</span>
            </div>
          </div>
          
          {/* Ad containers at bottom - scripts from layout.tsx will render here */}
          <div className="mt-12 space-y-4">
            <div id="adsterra-banner-login" className="mx-auto"></div>
            <div id="adsterra-socialbar-login" className="mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
