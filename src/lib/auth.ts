import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { supabase, User } from './supabase';
import { validateDNI, sanitizeDNI, checkRateLimit } from './security';

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Auth state observer
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user exists in database
 */
export async function getUserFromDB(firebaseUid: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user from DB:', error);
    return null;
  }
}

/**
 * Check if DNI already exists
 */
export async function checkDNIExists(dni: string): Promise<boolean> {
  try {
    const sanitized = sanitizeDNI(dni);
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('dni', sanitized)
      .single();

    if (error && error.code === 'PGRST116') {
      return false; // DNI doesn't exist
    }

    return !!data;
  } catch (error) {
    console.error('Error checking DNI:', error);
    return true; // Err on the side of caution
  }
}

/**
 * Create user in database with DNI
 */
export async function createUserInDB(
  firebaseUser: FirebaseUser,
  dni: string
): Promise<User> {
  // Rate limiting
  if (!checkRateLimit(`create_user_${firebaseUser.uid}`, 3, 300000)) {
    throw new Error('Too many attempts. Please try again later.');
  }

  // Validate DNI
  const sanitized = sanitizeDNI(dni);
  if (!validateDNI(sanitized)) {
    throw new Error('Invalid DNI format');
  }

  // Check if DNI already exists
  const dniExists = await checkDNIExists(sanitized);
  if (dniExists) {
    throw new Error('This DNI is already registered');
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        dni: sanitized,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error creating user in DB:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      if (error.message.includes('dni')) {
        throw new Error('This DNI is already registered');
      }
      if (error.message.includes('firebase_uid')) {
        throw new Error('User already exists');
      }
    }
    
    throw new Error('Failed to create user account');
  }
}

/**
 * Update user EIR position
 */
export async function updateEIRPosition(
  userId: string,
  position: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ eir_position: position })
      .eq('id', userId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating EIR position:', error);
    throw new Error('Failed to update EIR position');
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return [];
  }
}
