import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'applicant' | 'hr' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: 'applicant' | 'hr' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // Handle demo accounts
    if (email === 'hr@dha.go.ke' && password === 'hr123456') {
      // Create a mock user for demo
      const mockUser = {
        uid: 'demo-hr-user',
        email: 'hr@dha.go.ke',
        displayName: 'HR Manager'
      } as User;
      
      const mockProfile: UserProfile = {
        uid: 'demo-hr-user',
        email: 'hr@dha.go.ke',
        displayName: 'HR Manager',
        role: 'admin',
        createdAt: new Date()
      };
      
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      return;
    }
    
    if (email === 'applicant@email.com' && password === 'applicant123') {
      // Create a mock user for demo
      const mockUser = {
        uid: 'demo-applicant-user',
        email: 'applicant@email.com',
        displayName: 'John Doe'
      } as User;
      
      const mockProfile: UserProfile = {
        uid: 'demo-applicant-user',
        email: 'applicant@email.com',
        displayName: 'John Doe',
        role: 'applicant',
        createdAt: new Date()
      };
      
      setCurrentUser(mockUser);
      setUserProfile(mockProfile);
      return;
    }
    
    // For real accounts, use Firebase
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string, role: 'applicant' | 'hr' | 'admin') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
  };

  const logout = async () => {
    // Handle demo accounts
    if (currentUser?.uid === 'demo-hr-user' || currentUser?.uid === 'demo-applicant-user') {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    
    // For real accounts, use Firebase
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile({
              ...profileData,
              createdAt: profileData.createdAt instanceof Date 
                ? profileData.createdAt 
                : new Date(profileData.createdAt)
            });
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
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};