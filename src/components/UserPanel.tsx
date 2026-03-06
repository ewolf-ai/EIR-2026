'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { updateEIRPosition } from '@/lib/auth';
import { validateEIRPosition } from '@/lib/security';
import { supabase } from '@/lib/supabase';

interface ComparisonData {
  totalUsers: number;
  usersAhead: number;
  usersBehind: number;
  competingForSamePreferences: number;
}

export default function UserPanel() {
  const { dbUser, preferences } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    if (dbUser?.eir_position) {
      setPosition(dbUser.eir_position.toString());
      loadComparison();
    }
  }, [dbUser?.eir_position, preferences]);

  const loadComparison = async () => {
    if (!dbUser?.eir_position || preferences.length === 0) return;

    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .not('eir_position', 'is', null);

      // Get users ahead
      const { count: usersAhead } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('eir_position', dbUser.eir_position)
        .not('eir_position', 'is', null);

      // Get users behind
      const { count: usersBehind } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('eir_position', dbUser.eir_position);

      // Get users competing for same preferences
      const preferenceValues = preferences.map(p => p.preference_value);
      const { count: competing } = await supabase
        .from('preferences')
        .select('user_id', { count: 'exact', head: true })
        .in('preference_value', preferenceValues)
        .neq('user_id', dbUser.id);

      setComparison({
        totalUsers: totalUsers || 0,
        usersAhead: usersAhead || 0,
        usersBehind: usersBehind || 0,
        competingForSamePreferences: competing || 0,
      });
    } catch (err) {
      console.error('Error loading comparison:', err);
    }
  };

  const handleSavePosition = async () => {
    const posNum = parseInt(position);
    
    if (!validateEIRPosition(posNum)) {
      setError('Posición inválida. Debe ser un número entre 1 y 10000.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateEIRPosition(dbUser!.id, posNum);
      
      // Reload user data
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!dbUser) return null;

  return (
    <div className="bg-gradient-to-br from-pastel-pink to-pastel-lavender rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {dbUser.photo_url && (
            <img
              src={dbUser.photo_url}
              alt={dbUser.display_name || 'User'}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-nursing-800">
              {dbUser.display_name || 'Usuario'}
            </h2>
            <p className="text-nursing-600 text-sm">{dbUser.email}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Position Section */}
        <div className="bg-white bg-opacity-60 rounded-xl p-4">
          <h3 className="font-semibold text-nursing-700 mb-3 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Número de Plaza
          </h3>
          
          {editing ? (
            <div className="space-y-3">
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border-2 border-nursing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-500"
                placeholder="Ej: 500"
                min="1"
                max="10000"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSavePosition}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setPosition(dbUser.eir_position?.toString() || '');
                  }}
                  className="px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-nursing-600">
                {dbUser.eir_position || 'Sin asignar'}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-sm bg-nursing-100 text-nursing-700 rounded-lg hover:bg-nursing-200 transition-colors"
              >
                {dbUser.eir_position ? 'Editar' : 'Añadir'}
              </button>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="bg-white bg-opacity-60 rounded-xl p-4">
          <h3 className="font-semibold text-nursing-700 mb-3 flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            Mis Preferencias
          </h3>
          
          {preferences.length > 0 ? (
            <div className="space-y-2">
              {preferences.slice(0, 3).map((pref, idx) => (
                <div key={pref.id} className="flex items-center gap-2">
                  <span className="text-nursing-500 font-bold">{idx + 1}.</span>
                  <span className="text-sm text-gray-700">{pref.preference_value}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({pref.preference_type})
                  </span>
                </div>
              ))}
              {preferences.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{preferences.length - 3} más
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sin preferencias aún</p>
          )}
        </div>
      </div>

      {/* Comparison Analysis */}
      {comparison && dbUser.eir_position && preferences.length > 0 && (
        <div className="mt-6 bg-white bg-opacity-60 rounded-xl p-4">
          <h3 className="font-semibold text-nursing-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Análisis Comparativo
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-nursing-600">{comparison.totalUsers}</p>
              <p className="text-xs text-gray-600">Usuarios totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{comparison.usersAhead}</p>
              <p className="text-xs text-gray-600">Por delante</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{comparison.usersBehind}</p>
              <p className="text-xs text-gray-600">Por detrás</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{comparison.competingForSamePreferences}</p>
              <p className="text-xs text-gray-600">Compitiendo por tus preferencias</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
