import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db, doc, onSnapshot, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocFromServer } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserProfile {
  xp: number;
  lvl: number;
  anaisXP: number;
  soulResonance: number;
  stoicEquilibrium: number;
  poeticResonance: number;
  subconsciousDepth: number;
}

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthorized: boolean;
  rewardXP: (amount: number, anaisAmount?: number) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const rewardXP = async (amount: number, anaisAmount: number = 0) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const newXP = (profile.xp || 0) + amount;
      const newAnaisXP = (profile.anaisXP || 0) + anaisAmount;
      const newLvl = Math.floor(newXP / 1000);
      
      await setDoc(userRef, {
        xp: newXP,
        anaisXP: newAnaisXP,
        lvl: newLvl,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("XP rewards failed:", error);
      // We don't throw here to avoid blocking UI transitions, 
      // but we log it for debugging.
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const authorizedEmail = 'mumblejinx@gmail.com';
        if (currentUser.email === authorizedEmail && currentUser.emailVerified) {
          setIsAuthorized(true);
          
          const userRef = doc(db, 'users', currentUser.uid);
          const unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data() as UserProfile);
            } else {
              const initialProfile: UserProfile = {
                xp: 0,
                lvl: 0,
                anaisXP: 0,
                soulResonance: 50,
                stoicEquilibrium: 50,
                poeticResonance: 50,
                subconsciousDepth: 50
              };
              setDoc(userRef, {
                ...initialProfile,
                lastUpdated: serverTimestamp()
              });
              setProfile(initialProfile);
            }
          });
          
          setLoading(false);
          return () => unsubscribeProfile();
        } else {
          setIsAuthorized(false);
          setLoading(false);
        }
      } else {
        setIsAuthorized(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, isAuthorized, rewardXP }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
