import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { User as AppUser } from './types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  toggleSubscribe: (targetUserId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (firebaseUser && db) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Create new user profile if it doesn't exist
            const newUser: any = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              followers: [],
              following: [],
              createdAt: Date.now(),
            };
            if (firebaseUser.photoURL) {
              newUser.photoURL = firebaseUser.photoURL;
            }
            await setDoc(userRef, newUser);
          }

          // Listen for real-time updates
          unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setAppUser(snapshot.data() as AppUser);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          });

        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const signIn = async () => {
    if (!auth) {
      toast.error("Firebase is not configured", {
        description: "Please check your Firebase configuration in the settings."
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("Sign in popup blocked", {
          description: "Please allow popups for this site to sign in."
        });
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign in cancelled");
      } else {
        toast.error("Failed to sign in", {
          description: error.message || "An unexpected error occurred."
        });
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      toast.error("Firebase is not configured");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in", {
        description: error.message || "Invalid email or password."
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !db) {
      toast.error("Firebase is not configured");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Explicitly create the user document here to ensure we have the correct name
      // This overwrites the 'Anonymous' document that might have been created by onAuthStateChanged
      const newUser: any = {
        id: userCredential.user.uid,
        name: name,
        email: email,
        followers: [],
        following: [],
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setAppUser(newUser as AppUser);
      
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account", {
        description: error.message || "An unexpected error occurred."
      });
      throw error;
    }
  };

  const toggleSubscribe = async (targetUserId: string) => {
    if (!auth || !db || !appUser) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      const isSubscribed = appUser.following.includes(targetUserId);
      const currentUserRef = doc(db, 'users', appUser.id);
      const targetUserRef = doc(db, 'users', targetUserId);

      // We need to update both the current user's following list and the target user's followers list
      // In a real app, this should be a batch operation or handled by a cloud function for security
      // Due to our simple rules, we can only update our own document easily.
      // Wait, our rules say:
      // allow update: if isOwner(userId)
      // This means we CANNOT update the target user's followers list from the client!
      // So we will just update our own 'following' list for this prototype.

      const newFollowing = isSubscribed
        ? appUser.following.filter(id => id !== targetUserId)
        : [...appUser.following, targetUserId];

      await setDoc(currentUserRef, { following: newFollowing }, { merge: true });
      
      // Update local state immediately for better UX
      setAppUser({ ...appUser, following: newFollowing });
      
      toast.success(isSubscribed ? "Unsubscribed" : "Subscribed successfully");
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Failed to update subscription");
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signIn, signInWithEmail, signUpWithEmail, toggleSubscribe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
