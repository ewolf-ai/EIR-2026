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
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-nursing-400 to-nursing-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
              🩺
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-nursing-700">
                EIR 2026
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Gestión de Plazas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://ko-fi.com/e_wolf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#00b9fe] to-[#0099d6] hover:from-[#0099d6] hover:to-[#0085be] rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
            >
              <span className="text-base sm:text-lg">❤️</span>
              <span className="hidden sm:inline">Apóyanos</span>
              <span className="sm:hidden">Donar</span>
            </a>
            
            <a
              href="https://ewolf-web.vercel.app/#team"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-nursing-700 hover:text-nursing-900 hover:bg-pastel-pink hover:bg-opacity-30 rounded-lg transition-colors"
            >
              Equipo
            </a>
            
            {dbUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-nursing-700 hover:text-nursing-900 hover:bg-pastel-pink hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
