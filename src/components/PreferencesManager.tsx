'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { Preference } from '@/lib/supabase';
import { sanitizePreferenceValue, validatePreferenceType } from '@/lib/security';

export default function PreferencesManager() {
  const { dbUser, preferences, setPreferences } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPrefType, setNewPrefType] = useState<'hospital' | 'province' | 'community'>('hospital');
  const [newPrefValue, setNewPrefValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/search?type=${encodeURIComponent(newPrefType)}&search=${encodeURIComponent(newPrefValue)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const { data } = await response.json();
      setSuggestions(data?.map((item: any) => item.value) || []);
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setSuggestions([]);
    }
  }, [newPrefValue, newPrefType]);

  useEffect(() => {
    if (newPrefValue.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [newPrefValue, newPrefType, loadSuggestions]);

  const handleAddPreference = async () => {
    if (!dbUser || !newPrefValue.trim()) {
      setError('Por favor, introduce una preferencia');
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
      setIsAdding(false);
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

    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: priorityUpdates }),
    });

    newPrefs.forEach((pref, i) => {
      pref.priority = i + 1;
    });

    setPreferences(newPrefs);
  };

  if (!dbUser) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-nursing-700 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Gestionar Preferencias
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors text-sm"
          >
            + Añadir
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-pastel-mint bg-opacity-30 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de preferencia
            </label>
            <select
              value={newPrefType}
              onChange={(e) => setNewPrefType(e.target.value as any)}
              className="w-full px-3 py-2 border-2 border-nursing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-500"
            >
              <option value="hospital">Hospital concreto</option>
              <option value="province">Provincia</option>
              <option value="community">Comunidad Autónoma</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={newPrefValue}
              onChange={(e) => setNewPrefValue(e.target.value)}
              placeholder={
                newPrefType === 'hospital'
                  ? 'Ej: H. UNIVERSITARIO LA PAZ'
                  : newPrefType === 'province'
                  ? 'Ej: MADRID'
                  : 'Ej: COMUNIDAD DE MADRID'
              }
              className="w-full px-3 py-2 border-2 border-nursing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-500"
            />
            
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-nursing-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewPrefValue(suggestion);
                      setSuggestions([]);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-pastel-pink hover:bg-opacity-30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleAddPreference}
              disabled={loading || !newPrefValue.trim()}
              className="flex-1 px-3 py-2 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Añadiendo...' : 'Añadir'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewPrefValue('');
                setError('');
              }}
              className="px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {preferences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📋</p>
            <p>No has añadido preferencias todavía</p>
            <p className="text-sm mt-1">Haz clic en &quot;Añadir&quot; para comenzar</p>
          </div>
        ) : (
          preferences.map((pref, idx) => (
            <div
              key={pref.id}
              className="flex items-center gap-3 p-3 bg-pastel-blue bg-opacity-20 rounded-lg group hover:bg-opacity-40 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => idx > 0 && handleReorder(idx, idx - 1)}
                  disabled={idx === 0}
                  className="text-nursing-600 hover:text-nursing-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▲
                </button>
                <button
                  onClick={() => idx < preferences.length - 1 && handleReorder(idx, idx + 1)}
                  disabled={idx === preferences.length - 1}
                  className="text-nursing-600 hover:text-nursing-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▼
                </button>
              </div>

              <div className="flex items-center justify-center w-8 h-8 bg-nursing-500 text-white rounded-full font-bold text-sm">
                {pref.priority}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-800">{pref.preference_value}</p>
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
                className="opacity-0 group-hover:opacity-100 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-all"
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
