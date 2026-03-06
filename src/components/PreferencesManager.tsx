'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { Preference } from '@/lib/supabase';
import { sanitizePreferenceValue, validatePreferenceType } from '@/lib/security';

export default function PreferencesManager() {
  const { dbUser, preferences, setPreferences } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPrefType, setNewPrefType] = useState<'hospital' | 'province' | 'community'>('hospital');
  const [newPrefValue, setNewPrefValue] = useState('');
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const loadAllOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/options?type=${encodeURIComponent(newPrefType)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load options');
      }

      const { data } = await response.json();
      setAllOptions(data || []);
    } catch (err) {
      console.error('Error loading options:', err);
      setAllOptions([]);
    }
  }, [newPrefType]);

  useEffect(() => {
    if (isAdding) {
      loadAllOptions();
    }
  }, [newPrefType, isAdding, loadAllOptions]);

  // Filter options based on search text
  const filteredOptions = allOptions.filter(option =>
    option.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleAddPreference = async () => {
    if (!dbUser || !newPrefValue.trim()) {
      setError('Por favor, selecciona una preferencia de la lista');
      return;
    }

    const sanitizedValue = sanitizePreferenceValue(newPrefValue);
    const nextPriority = preferences.length + 1;

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: dbUser.id,
          preference_type: newPrefType,
          preference_value: sanitizedValue,
          priority: nextPriority,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add preference');
      }

      setPreferences([...preferences, result.data]);
      setNewPrefValue('');
      setFilterText('');
      setShowDropdown(false);
      setIsAdding(false);
      
      // Refrescar la página para mostrar la preferencia en las tablas
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error al añadir preferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreference = async (id: string) => {
    try {
      const response = await fetch(`/api/preferences?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete preference');
      }

      const updatedPrefs = preferences.filter(p => p.id !== id);
      
      // Update priorities
      const priorityUpdates = updatedPrefs.map((pref, i) => ({
        id: pref.id,
        priority: i + 1,
      }));

      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: priorityUpdates }),
      });

      updatedPrefs.forEach((pref, i) => {
        pref.priority = i + 1;
      });

      setPreferences(updatedPrefs);
    } catch (err: any) {
      alert('Error al eliminar preferencia: ' + err.message);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newPrefs = [...preferences];
    const [moved] = newPrefs.splice(fromIndex, 1);
    newPrefs.splice(toIndex, 0, moved);

    // Update priorities
    const priorityUpdates = newPrefs.map((pref, i) => ({
      id: pref.id,
      priority: i + 1,
    }));

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: priorityUpdates }),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar el nuevo orden');
      }

      // Update local state only after successful save
      newPrefs.forEach((pref, i) => {
        pref.priority = i + 1;
      });

      setPreferences(newPrefs);
    } catch (err: any) {
      alert('Error al reordenar preferencias: ' + err.message);
      // Don't update local state if server update failed
    }
  };

  if (!dbUser) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-nursing-700 flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl">🎯</span>
          <span className="hidden sm:inline">Gestionar Preferencias</span>
          <span className="sm:hidden">Preferencias</span>
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 sm:px-4 py-2 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors text-xs sm:text-sm"
          >
            + Añadir
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-3 sm:p-4 bg-pastel-mint bg-opacity-30 rounded-lg space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Tipo de preferencia
            </label>
            <select
              value={newPrefType}
              onChange={(e) => {
                setNewPrefType(e.target.value as any);
                setNewPrefValue('');
                setFilterText('');
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 border-2 border-nursing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-500 text-sm"
            >
              <option value="hospital">Hospital concreto</option>
              <option value="province">Provincia</option>
              <option value="community">Comunidad Autónoma</option>
            </select>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {newPrefType === 'hospital' ? 'Hospital' : newPrefType === 'province' ? 'Provincia' : 'Comunidad Autónoma'}
              {newPrefValue && (
                <span className="ml-2 text-xs text-nursing-600">✓ Seleccionado</span>
              )}
            </label>
            <input
              type="text"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={`Buscar ${
                newPrefType === 'hospital'
                  ? 'hospital'
                  : newPrefType === 'province'
                  ? 'provincia'
                  : 'comunidad autónoma'
              }...`}
              className="w-full px-3 py-2 border-2 border-nursing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-500 text-sm"
              autoComplete="off"
            />
            
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-nursing-300 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto">
                {filteredOptions.slice(0, 100).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewPrefValue(option);
                      setFilterText(option);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-pastel-pink hover:bg-opacity-30 transition-all duration-75 text-xs sm:text-sm ${
                      option === newPrefValue ? 'bg-nursing-100' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
                {filteredOptions.length > 100 && (
                  <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
                    Mostrando 100 de {filteredOptions.length} resultados. Refina tu búsqueda.
                  </div>
                )}
              </div>
            )}

            {newPrefValue && (
              <div className="mt-2 p-2 bg-nursing-50 rounded border border-nursing-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-nursing-700">
                    {newPrefValue}
                  </span>
                  <button
                    onClick={() => {
                      setNewPrefValue('');
                      setFilterText('');
                    }}
                    className="text-nursing-600 hover:text-nursing-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleAddPreference}
              disabled={loading || !newPrefValue.trim()}
              className="flex-1 px-3 py-2 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {loading ? 'Añadiendo...' : 'Añadir'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewPrefValue('');
                setFilterText('');
                setShowDropdown(false);
                setError('');
              }}
              className="px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {preferences.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="text-3xl sm:text-4xl mb-2">📋</p>
            <p className="text-sm sm:text-base">No has añadido preferencias todavía</p>
            <p className="text-xs sm:text-sm mt-1">Haz clic en &quot;Añadir&quot; para comenzar</p>
          </div>
        ) : (
          preferences.map((pref, idx) => (
            <div
              key={pref.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-pastel-blue bg-opacity-20 rounded-lg group hover:bg-opacity-40 transition-all duration-100"
            >
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <button
                  onClick={() => idx > 0 && handleReorder(idx, idx - 1)}
                  disabled={idx === 0}
                  className="text-nursing-600 hover:text-nursing-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100 text-xs sm:text-base"
                >
                  ▲
                </button>
                <button
                  onClick={() => idx < preferences.length - 1 && handleReorder(idx, idx + 1)}
                  disabled={idx === preferences.length - 1}
                  className="text-nursing-600 hover:text-nursing-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100 text-xs sm:text-base"
                >
                  ▼
                </button>
              </div>

              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-nursing-500 text-white rounded-full font-bold text-xs sm:text-sm">
                {pref.priority}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{pref.preference_value}</p>
                <p className="text-xs text-gray-500">
                  {pref.preference_type === 'hospital'
                    ? 'Hospital'
                    : pref.preference_type === 'province'
                    ? 'Provincia'
                    : 'Comunidad Autónoma'}
                </p>
              </div>

              <button
                onClick={() => handleRemovePreference(pref.id)}
                className="sm:opacity-0 sm:group-hover:opacity-100 px-2 sm:px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-all duration-100 text-sm sm:text-base"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
