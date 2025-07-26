import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'applicant' | 'hr' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const register = async (email: string, password: string, displayName: string, role: string = 'applicant') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });
    
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role: role as 'applicant' | 'hr' | 'admin',
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), profile);
    setUserProfile(profile);
  };

  const login = async (email: string, password: string) => {
    // For demo purposes, handle demo accounts without Firebase
    if (email === 'hr@dha.go.ke' && password === 'hr123456') {
      const mockUser = {
        uid: 'demo-admin-user',
        email: 'hr@dha.go.ke',
        displayName: 'Admin User'
      } as User;
      
      const mockProfile: UserProfile = {
        uid: 'demo-admin-user',
        email: 'hr@dha.go.ke',
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date()
      };
      
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      return;
    }
    
    if (email === 'applicant@email.com' && password === 'applicant123') {
      const mockUser = {
        uid: 'demo-applicant-user',
        email: 'applicant@email.com',
        displayName: 'Demo Applicant'
      } as User;
      
      const mockProfile: UserProfile = {
        uid: 'demo-applicant-user',
        email: 'applicant@email.com',
        displayName: 'Demo Applicant',
        role: 'applicant',
        createdAt: new Date()
      };
      
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      return;
    }
    
    // For real Firebase authentication
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create a default profile if document doesn't exist
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || 'User',
              role: 'applicant',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};