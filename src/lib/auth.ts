import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from './supabase';
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
    const response = await fetch(`/api/user?firebase_uid=${encodeURIComponent(firebaseUid)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const { data } = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching user from DB:', error);
    return null;
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

  try {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        dni: sanitized,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create user');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error creating user in DB:', error);
    throw new Error(error.message || 'Failed to create user account');
  }
}

/**
 * Update user EIR position
 */
export async function updateEIRPosition(
  firebaseUid: string,
  position: number
): Promise<void> {
  try {
    const response = await fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: firebaseUid,
        eir_position: position,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update position');
    }
  } catch (error: any) {
    console.error('Error updating EIR position:', error);
    throw new Error(error.message || 'Failed to update EIR position');
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    const response = await fetch(`/api/preferences?user_id=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }

    const { data } = await response.json();
    return data || [];
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return [];
  }
}
