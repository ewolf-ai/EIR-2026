'use client';

import { signOut } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';

export default function Header() {
  const { dbUser } = useAuthStore();

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-nursing-400 to-nursing-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              🩺
            </div>
            <div>
              <h1 className="text-xl font-bold text-nursing-700">
                EIR 2026
              </h1>
              <p className="text-xs text-gray-500">Gestión de Plazas</p>
            </div>
          </div>

          {dbUser && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-nursing-700 hover:text-nursing-900 hover:bg-pastel-pink hover:bg-opacity-30 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
