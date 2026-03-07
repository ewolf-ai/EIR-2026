'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { updateEIRPosition } from '@/lib/auth';
import { validateEIRPosition } from '@/lib/security';

interface PreferenceAnalysis {
  preference: string;
  priority: number;
  type: string;
  specialty: string;
  totalPositions: number;
  usersFirstOption: number;
  usersTop3: number;
  usersInProvince: number;
}

interface ComparisonData {
  totalUsers: number;
  assignedPosition: string | null;
  assignmentCalculatedAt: string | null;
  preferenceAnalysis: PreferenceAnalysis[];
}

// Tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const handleMouseEnter = () => {
    if (!isTouch) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setShowTooltip(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsTouch(true);
    setShowTooltip(!showTooltip);
  };

  const handleBackdropClick = () => {
    setShowTooltip(false);
    setTimeout(() => setIsTouch(false), 300);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className="inline-flex items-center justify-center w-5 h-5 sm:w-4 sm:h-4 text-xs text-gray-500 border border-gray-400 rounded-full cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors active:bg-gray-200"
        onTouchStart={handleTouchStart}
      >
        i
      </span>
      {showTooltip && (
        <>
          {isTouch && (
            <div 
              className="fixed inset-0 z-40"
              onClick={handleBackdropClick}
              onTouchStart={handleBackdropClick}
            />
          )}
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 sm:w-56 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg">
            <div className="relative">
              {text}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function UserPanel() {
  const { dbUser, preferences } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const loadComparison = useCallback(async () => {
    if (!dbUser?.eir_position || preferences.length === 0) return;

    try {
      const response = await fetch(
        `/api/comparison?user_id=${encodeURIComponent(dbUser.id)}&eir_position=${dbUser.eir_position}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comparison');
      }

      const { data } = await response.json();
      setComparison(data);
    } catch (err) {
      console.error('Error loading comparison:', err);
    }
  }, [dbUser, preferences]);

  useEffect(() => {
    if (dbUser?.eir_position) {
      setPosition(dbUser.eir_position.toString());
      loadComparison();
    }
  }, [dbUser?.eir_position, preferences, loadComparison]);

  const handleSavePosition = async () => {
    const posNum = parseInt(position);
    
    if (!validateEIRPosition(posNum)) {
      setError('Posición inválida. Debe ser un número entre 1 y 10000.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateEIRPosition(dbUser!.firebase_uid, posNum);
      
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
    <div className="bg-gradient-to-br from-pastel-pink to-pastel-lavender rounded-2xl shadow-xl p-4 sm:p-6 mb-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
          {dbUser.photo_url && (
            <Image
              src={dbUser.photo_url}
              alt={dbUser.display_name || 'User'}
              width={56}
              height={56}
              className="rounded-full border-4 border-white shadow-lg flex-shrink-0 sm:w-16 sm:h-16"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-nursing-800 truncate">
              {dbUser.display_name || 'Usuario'}
            </h2>
            <p className="text-nursing-600 text-xs sm:text-sm truncate">{dbUser.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Position Section */}
        <div className="bg-white bg-opacity-60 rounded-xl p-4 overflow-hidden">
          <h3 className="font-semibold text-nursing-700 mb-3 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📊</span>
            <span className="text-sm sm:text-base">Número de Plaza</span>
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
        <div className="bg-white bg-opacity-60 rounded-xl p-4 overflow-hidden">
          <h3 className="font-semibold text-nursing-700 mb-3 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">❤️</span>
            <span className="text-sm sm:text-base">Mis Preferencias</span>
          </h3>
          
          {preferences.length > 0 ? (
            <div className="space-y-2">
              {preferences.slice(0, 3).map((pref, idx) => (
                <div key={pref.id} className="flex items-start gap-2 bg-white bg-opacity-40 rounded p-2 overflow-hidden">
                  <span className="text-nursing-500 font-bold flex-shrink-0">{idx + 1}.</span>
                  <span className="text-sm text-gray-700 flex-1 break-words min-w-0">{pref.preference_value}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    ({pref.preference_type === 'hospital' ? 'hosp' : pref.preference_type === 'province' ? 'prov' : 'com'})
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
        <div className="mt-4 sm:mt-6 bg-white bg-opacity-60 rounded-xl p-4 overflow-hidden">
          <h3 className="font-semibold text-nursing-700 mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📈</span>
            <span className="text-sm sm:text-base">Análisis Comparativo</span>
          </h3>
          
          {/* General Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="text-center bg-white bg-opacity-40 rounded-lg p-3 overflow-hidden">
              <p className="text-xl sm:text-2xl font-bold text-nursing-600">{comparison.totalUsers}</p>
              <p className="text-xs text-gray-600 mt-1 break-words">Usuarios totales registrados</p>
            </div>
            <div className="text-center bg-white bg-opacity-40 rounded-lg p-3 overflow-hidden">
              <p className="text-xl sm:text-2xl font-bold">
                {comparison.assignedPosition ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-red-600">✗</span>
                )}
              </p>
              <p className="text-xs text-gray-600 mt-1 break-words">
                {comparison.assignedPosition ? 'Plaza simulada asignada' : 'Sin plaza adjudicada'}
              </p>
            </div>
          </div>

          {/* Assigned Position - Success */}
          {comparison.assignedPosition && (
            <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-1 text-sm flex items-center gap-2">
                Tu plaza adjudicada (simulación):
                <InfoTooltip text="Asignación realizada según posición y preferencias de los usuarios registrados. *Tus plazas preferidas pueden no estar disponibles si los usuarios con mejor posición que tú la han seleccionado y cubren todas las plazas ofertadas" />
              </h4>
              <p className="text-sm text-green-700 font-medium break-words">{comparison.assignedPosition}</p>
            </div>
          )}

          {/* Assigned Position - No assignment */}
          {!comparison.assignedPosition && (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border-l-4 border-red-500">
              <h4 className="font-semibold text-red-800 mb-1 text-sm flex items-center gap-1">
                <span>⚠️</span>
                <span>Sin plaza adjudicada (simulación)</span>
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Según la simulación con las preferencias actuales, no obtendrías plaza. Esto puede deberse a que todas tus preferencias ya están ocupadas por usuarios con mejor posición.
              </p>
            </div>
          )}

          {/* Preference Analysis */}
          <div className="space-y-3">
            <h4 className="font-semibold text-nursing-700 text-sm flex items-center gap-2">
              <span>🎯</span>
              <span>Compitiendo por tus preferencias</span>
            </h4>

            {comparison.preferenceAnalysis.map((analysis, idx) => (
              <div key={idx} className="bg-white bg-opacity-50 rounded-lg p-3 border border-nursing-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-nursing-800 text-sm break-words">
                      Preferencia {analysis.priority}: {analysis.preference}
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {analysis.type === 'hospital' ? '🏥 Hospital' : analysis.type === 'province' ? '📍 Provincia' : '🗺️ Comunidad'}
                      {' '} · {analysis.specialty}
                    </p>
                  </div>
                </div>

                {analysis.type === 'hospital' ? (
                  // Full stats for hospital
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-blue-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Plazas ofertadas</p>
                        <InfoTooltip text="Número total de plazas ofertadas para este centro en esta especialidad." />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{analysis.totalPositions}</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Usuarios que la han elegido como 1ª opción</p>
                        <InfoTooltip text="Número de usuarios que han escogido esta plaza como primera opción y van por delante de ti en el ranking." />
                      </div>
                      <p className="text-2xl font-bold text-orange-700">{analysis.usersFirstOption}</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Usuarios que la tienen en su top 3</p>
                        <InfoTooltip text="Número de usuarios que han escogido esta plaza dentro de sus tres primeras opciones y van por delante de ti en el ranking." />
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{analysis.usersTop3}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Misma provincia</p>
                        <InfoTooltip text="Número de usuarios que compiten por plazas en la misma provincia y van por delante de ti en el ranking." />
                      </div>
                      <p className="text-2xl font-bold text-green-700">{analysis.usersInProvince}</p>
                    </div>
                  </div>
                ) : (
                  // Simplified stats for province/community
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-blue-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Plazas ofertadas</p>
                        <InfoTooltip text="Número total de plazas ofertadas en esta provincia/comunidad para esta especialidad." />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{analysis.totalPositions}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2 flex flex-col items-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs text-gray-800 font-medium">Compiten por provincia</p>
                        <InfoTooltip text="Número de usuarios que compiten por plazas en esta provincia y van por delante de ti en el ranking." />
                      </div>
                      <p className="text-2xl font-bold text-green-700">{analysis.usersInProvince}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
