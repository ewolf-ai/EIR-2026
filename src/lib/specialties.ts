// EIR 2026 - Especialidades de Enfermería

export type Specialty = 
  | 'ENFERMERÍA FAMILIAR Y COMUNITARIA'
  | 'ENFERMERÍA DE SALUD MENTAL'
  | 'ENFERMERÍA OBSTETRICO-GINECOLÓGICA'
  | 'ENFERMERÍA PEDIÁTRICA'
  | 'ENFERMERÍA GERIÁTRICA'
  | 'ENFERMERÍA DEL TRABAJO';

export interface SpecialtyInfo {
  name: Specialty;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Mapeo de especialidades con sus nombres cortos y colores
export const SPECIALTIES: SpecialtyInfo[] = [
  {
    name: 'ENFERMERÍA FAMILIAR Y COMUNITARIA',
    shortName: 'Comunitaria',
    color: 'text-sky-700',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-300'
  },
  {
    name: 'ENFERMERÍA DE SALUD MENTAL',
    shortName: 'Salud Mental',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300'
  },
  {
    name: 'ENFERMERÍA OBSTETRICO-GINECOLÓGICA',
    shortName: 'Matrona',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300'
  },
  {
    name: 'ENFERMERÍA PEDIÁTRICA',
    shortName: 'Pediatría',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  {
    name: 'ENFERMERÍA GERIÁTRICA',
    shortName: 'Geriátrica',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  {
    name: 'ENFERMERÍA DEL TRABAJO',
    shortName: 'Trabajo',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300'
  }
];

// Función helper para obtener la información de una especialidad
export function getSpecialtyInfo(specialty: Specialty): SpecialtyInfo {
  const info = SPECIALTIES.find(s => s.name === specialty);
  if (!info) {
    // Fallback si no se encuentra la especialidad
    return {
      name: specialty,
      shortName: specialty,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300'
    };
  }
  return info;
}

// Función para validar si una especialidad es válida
export function isValidSpecialty(specialty: string): specialty is Specialty {
  return SPECIALTIES.some(s => s.name === specialty);
}
