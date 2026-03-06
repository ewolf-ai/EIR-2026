'use client';

import { useState } from 'react';
import { createUserInDB } from '@/lib/auth';
import { validateDNI, sanitizeDNI } from '@/lib/security';
import { User as FirebaseUser } from 'firebase/auth';

interface DNIModalProps {
  firebaseUser: FirebaseUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DNIModal({ firebaseUser, onSuccess, onCancel }: DNIModalProps) {
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitized = sanitizeDNI(dni);

    if (!validateDNI(sanitized)) {
      setError('DNI inválido. Debe tener 8 dígitos seguidos de una letra.');
      return;
    }

    try {
      setLoading(true);
      await createUserInDB(firebaseUser, sanitized);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el DNI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Nursing themed decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-nursing-400">
            <path d="M50 10 L55 35 L80 35 L60 50 L70 75 L50 60 L30 75 L40 50 L20 35 L45 35 Z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-nursing-700 mb-4">
          Bienvenido/a 🩺
        </h2>
        
        <p className="text-gray-600 mb-6">
          Para continuar, necesitamos verificar tu DNI. Este será único y quedará asociado a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
              DNI (8 dígitos + letra)
            </label>
            <input
              type="text"
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value.toUpperCase())}
              placeholder="12345678A"
              maxLength={9}
              className="w-full px-4 py-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-nursing-400 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: 12345678Z
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-nursing-500 text-white rounded-lg hover:bg-nursing-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar DNI'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-pastel-mint bg-opacity-30 rounded-lg">
          <p className="text-xs text-gray-600">
            🔒 Tu DNI se almacena de forma segura y solo se usa para verificar que cada plaza corresponde a una persona única.
          </p>
        </div>
      </div>
    </div>
  );
}
