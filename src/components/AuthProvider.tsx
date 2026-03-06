'use client';

import { useEffect, useState } from 'react';
import { onAuthChange, getUserFromDB, getUserPreferences } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';
import DNIModal from './DNIModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [showDNIModal, setShowDNIModal] = useState(false);
  const { firebaseUser, setFirebaseUser, setDbUser, setPreferences, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Check if user exists in database
        const dbUser = await getUserFromDB(user.uid);
        
        if (dbUser) {
          setDbUser(dbUser);
          
          // Load preferences
          const prefs = await getUserPreferences(dbUser.id);
          setPreferences(prefs);
          
          setLoading(false);
        } else {
          // New user - show DNI modal
          setShowDNIModal(true);
          setLoading(false);
        }
      } else {
        setDbUser(null);
        setPreferences([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setDbUser, setPreferences, setLoading]);

  const handleDNISuccess = async () => {
    setShowDNIModal(false);
    
    if (firebaseUser) {
      const dbUser = await getUserFromDB(firebaseUser.uid);
      if (dbUser) {
        setDbUser(dbUser);
      }
    }
  };

  const handleDNICancel = async () => {
    setShowDNIModal(false);
    const { signOut } = await import('@/lib/auth');
    await signOut();
  };

  return (
    <>
      {children}
      {showDNIModal && firebaseUser && (
        <DNIModal
          firebaseUser={firebaseUser}
          onSuccess={handleDNISuccess}
          onCancel={handleDNICancel}
        />
      )}
    </>
  );
}
