'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Preference } from '@/lib/supabase';
import { getSpecialtyInfo } from '@/lib/specialties';

interface UserWithPreferences {
  user: User;
  preferences: Preference[];
}

export default function GlobalTable() {
  const [data, setData] = useState<UserWithPreferences[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'position' | 'name'>('position');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedPreferences, setExpandedPreferences] = useState<Record<string, number>>({});

  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/global?sortBy=${encodeURIComponent(sortBy)}&page=${currentPage}&limit=${itemsPerPage}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch global data');
        }

        const { data: combined, totalUsers: total } = await response.json();
        setTotalUsers(total || 0);
        
        // Debug logging
        const user344 = combined?.find((item: any) => item.user.eir_position === 344);
        if (user344) {
          console.log('🔍 User 344 data:', {
            position: user344.user.eir_position,
            preferencesCount: user344.preferences?.length,
            preferences: user344.preferences
          });
        }
        
        setData(combined || []);
      } catch (err) {
        console.error('Error loading global data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sortBy, currentPage, itemsPerPage]);

  // Reset to first page when items per page or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, sortBy]);

  // Helper function to get visible preferences count for a user (default: 3)
  const getVisiblePrefsCount = (userId: string) => {
    return expandedPreferences[userId] || 3;
  };

  // Helper function to expand preferences for a user
  const expandPreferences = (userId: string, currentCount: number) => {
    setExpandedPreferences(prev => ({
      ...prev,
      [userId]: currentCount + 3
    }));
  };

  // Calculate pagination based on total users count
  const totalPages = Math.ceil((totalUsers || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers || 0);
  const paginatedData = data; // Data is already paginated from API

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nursing-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-nursing-700 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <span className="leading-tight">Tabla Global de Preferencias</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Sort control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nursing-500 flex-1 sm:flex-none"
            >
              <option value="position">Posición</option>
              <option value="name">Nombre</option>
            </select>
          </div>

          {/* Items per page control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nursing-500 flex-1 sm:flex-none"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={300}>300</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Total de usuarios registrados: <span className="font-bold">{totalUsers ?? '...'}</span>
        {totalPages > 1 && (
          <span className="ml-3">
            (Mostrando {startIndex + 1}-{endIndex})
          </span>
        )}
      </p>

      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay usuarios registrados todavía</p>
          </div>
        ) : (
          paginatedData.map(({ user, preferences }) => (
            <div 
              key={user.id} 
              className="bg-gradient-to-r from-pastel-pink to-pastel-mint bg-opacity-30 rounded-xl p-4 border border-nursing-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-nursing-500 to-nursing-600 text-white rounded-full font-bold flex items-center justify-center text-lg shadow-md">
                  {user.eir_position}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-nursing-700 mb-1.5">Preferencias:</p>
                    {preferences.length === 0 ? (
                      <span className="text-gray-400 text-sm italic">Sin preferencias</span>
                    ) : (
                      <div className="space-y-1.5">
                        {preferences.slice(0, getVisiblePrefsCount(user.id)).map((pref, idx) => (
                            <div key={pref.id} className="text-sm bg-white bg-opacity-60 rounded px-2 py-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-nursing-600 font-bold">{idx + 1}.</span>
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getSpecialtyInfo(pref.specialty).bgColor} ${getSpecialtyInfo(pref.specialty).color}`}>
                                  {getSpecialtyInfo(pref.specialty).shortName}
                                </span>
                              </div>
                              <span className="text-gray-800">{pref.preference_value}</span>
                              <span className="text-gray-500 text-xs ml-1">
                                ({pref.preference_type === 'hospital' ? 'hospital' : pref.preference_type === 'province' ? 'provincia' : 'comunidad'})
                              </span>
                            </div>
                        ))}
                        {preferences.length > getVisiblePrefsCount(user.id) && (
                          <button
                            onClick={() => expandPreferences(user.id, getVisiblePrefsCount(user.id))}
                            className="text-xs font-medium text-nursing-600 hover:text-nursing-700 bg-nursing-100 hover:bg-nursing-200 px-3 py-1.5 rounded-lg transition-colors w-full flex items-center justify-center gap-1 mt-1"
                          >
                            <span>Ver más</span>
                            <span className="text-gray-500">({preferences.length - getVisiblePrefsCount(user.id)} restantes)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
          <thead className="bg-pastel-pink bg-opacity-40">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-nursing-800">
                Posición
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-nursing-800">
                Preferencias
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                  No hay usuarios registrados todavía
                </td>
              </tr>
            ) : (
              paginatedData.map(({ user, preferences }) => (
                <tr key={user.id} className="hover:bg-pastel-mint hover:bg-opacity-20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-nursing-500 text-white rounded-full font-bold">
                      {user.eir_position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {preferences.length === 0 ? (
                      <span className="text-gray-400 text-sm italic">Sin preferencias</span>
                    ) : (
                      <div className="space-y-1">
                        {(() => {
                          const visibleCount = getVisiblePrefsCount(user.id);
                          const visiblePrefs = preferences.slice(0, visibleCount);
                          if (user.eir_position === 344) {
                            console.log('🖥️ Rendering desktop user 344:', {
                              totalPrefs: preferences.length,
                              visibleCount,
                              visiblePrefs: visiblePrefs.length
                            });
                          }
                          return visiblePrefs.map((pref, idx) => (
                            <div key={pref.id} className="text-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="text-nursing-600 font-semibold">{idx + 1}.</span>
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getSpecialtyInfo(pref.specialty).bgColor} ${getSpecialtyInfo(pref.specialty).color}`}>
                                  {getSpecialtyInfo(pref.specialty).shortName}
                                </span>
                              </div>
                              <span className="text-gray-700 ml-5">{pref.preference_value}</span>
                              <span className="text-gray-400 text-xs ml-1">
                                ({pref.preference_type === 'hospital' ? 'hospital' : pref.preference_type === 'province' ? 'provincia' : 'comunidad'})
                              </span>
                            </div>
                          ));
                        })()}
                        {preferences.length > getVisiblePrefsCount(user.id) && (
                          <button
                            onClick={() => expandPreferences(user.id, getVisiblePrefsCount(user.id))}
                            className="text-xs font-medium text-nursing-600 hover:text-nursing-700 bg-nursing-100 hover:bg-nursing-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 mt-1"
                          >
                            <span>Ver más</span>
                            <span className="text-gray-500">({preferences.length - getVisiblePrefsCount(user.id)} restantes)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm hover:bg-nursing-50 focus:outline-none focus:ring-2 focus:ring-nursing-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ««
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm hover:bg-nursing-50 focus:outline-none focus:ring-2 focus:ring-nursing-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nursing-500 transition-colors ${
                      currentPage === pageNum
                        ? 'bg-nursing-500 text-white font-bold'
                        : 'border-2 border-nursing-300 hover:bg-nursing-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm hover:bg-nursing-50 focus:outline-none focus:ring-2 focus:ring-nursing-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border-2 border-nursing-300 rounded-lg text-sm hover:bg-nursing-50 focus:outline-none focus:ring-2 focus:ring-nursing-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
