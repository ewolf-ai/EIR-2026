'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { User, Preference } from '@/lib/supabase';
import { getSpecialtyInfo } from '@/lib/specialties';

interface UserWithPreferences {
  user: User;
  preferences: Preference[];
}

export default function GlobalTable() {
  const [data, setData] = useState<UserWithPreferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'position' | 'name'>('position');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/global?sortBy=${encodeURIComponent(sortBy)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }

      const { data: combined } = await response.json();
      setData(combined || []);
    } catch (err) {
      console.error('Error loading global data:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Total de usuarios registrados: <span className="font-bold">{data.length}</span>
      </p>

      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay usuarios registrados todavía</p>
          </div>
        ) : (
          data.map(({ user, preferences }) => (
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
                        {preferences.slice(0, 3).map((pref, idx) => (
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
                        {preferences.length > 3 && (
                          <p className="text-xs text-gray-500 italic pl-2">
                            +{preferences.length - 3} más
                          </p>
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
              data.map(({ user, preferences }) => (
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
                        {preferences.slice(0, 3).map((pref, idx) => (
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
                        ))}
                        {preferences.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{preferences.length - 3} más
                          </p>
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

      {data.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Mostrando {data.length} usuarios
          </p>
        </div>
      )}
    </div>
  );
}
