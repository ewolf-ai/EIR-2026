import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for database
export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  dni: string;
  eir_position?: number;
  created_at: string;
  updated_at: string;
}

export interface Preference {
  id: string;
  user_id: string;
  specialty: 'ENFERMERÍA FAMILIAR Y COMUNITARIA' | 'ENFERMERÍA DE SALUD MENTAL' | 'ENFERMERÍA OBSTETRICO-GINECOLÓGICA' | 'ENFERMERÍA PEDIÁTRICA' | 'ENFERMERÍA GERIÁTRICA' | 'ENFERMERÍA DEL TRABAJO';
  preference_type: 'hospital' | 'province' | 'community';
  preference_value: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface OfferedPosition {
  id: string;
  locality: string;
  province: string;
  center: string;
  specialty: string;
  num_positions: number;
  created_at: string;
}

export interface AutonomousCommunity {
  id: string;
  province: string;
  community: string;
  created_at: string;
}
