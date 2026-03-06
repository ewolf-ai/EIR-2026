'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { supabase, User, Preference } from '@/lib/supabase';

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

      // Get all users with positions
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .not('eir_position', 'is', null)
        .order(sortBy === 'position' ? 'eir_position' : 'display_name', { ascending: true });

      if (usersError) throw usersError;

      // Get all preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('preferences')
        .select('*')
        .order('priority', { ascending: true });

      if (prefsError) throw prefsError;

      // Combine data
      const combined = users?.map(user => ({
        user,
        preferences: prefs?.filter(p => p.user_id === user.id) || [],
      })) || [];

      setData(combined);
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
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-nursing-700 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          Tabla Global de Preferencias
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border-2 border-nursing-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nursing-500"
          >
            <option value="position">Posición</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Total de usuarios registrados: <span className="font-bold">{data.length}</span>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-pastel-pink bg-opacity-40">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-nursing-800">
                Posición
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-nursing-800">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-nursing-800">
                Preferencias
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
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
                    <div className="flex items-center gap-2">
                      {user.photo_url && (
                        <Image
                          src={user.photo_url}
                          alt={user.display_name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-800">
                        {user.display_name || 'Usuario'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {preferences.length === 0 ? (
                      <span className="text-gray-400 text-sm italic">Sin preferencias</span>
                    ) : (
                      <div className="space-y-1">
                        {preferences.slice(0, 3).map((pref, idx) => (
                          <div key={pref.id} className="text-sm">
                            <span className="text-nursing-600 font-semibold">{idx + 1}.</span>{' '}
                            <span className="text-gray-700">{pref.preference_value}</span>
                            <span className="text-gray-400 text-xs ml-1">
                              ({pref.preference_type})
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
