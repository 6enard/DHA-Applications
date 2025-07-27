import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Set up persistent authentication
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Auth persistence set to LOCAL');
      } catch (error) {
        console.error('Error setting up auth persistence:', error);
      }
    };
    setupPersistence();
  }, []);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('🔄 Restoring user session:', currentUser.email);
          setCurrentUser(currentUser);
          
          // Load user profile
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile({
              ...profileData,
              createdAt: profileData.createdAt?.toDate?.() || new Date(profileData.createdAt)
            });
          }
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);
  const register = async (email: string, password: string, displayName: string, role: string = 'applicant') => {
    try {
      setLoading(true);
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
      console.log('✅ User registered successfully:', email);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Handle demo users
      if (currentUser?.uid === 'demo-admin-user' || currentUser?.uid === 'demo-applicant-user') {
        setCurrentUser(null);
        setUserProfile(null);
        
        // Store demo user in localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify({ user: mockUser, profile: mockProfile }));
        console.log('✅ Demo admin logged in');
        
        // Store demo user in localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify({ user: mockUser, profile: mockProfile }));
        console.log('✅ Demo applicant logged in');
        return;
      }
      
      await signOut(auth);
      setUserProfile(null);
      console.log('✅ User logged in successfully:', email);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      setCurrentUser(user);
      
      if (user) {
        try {
          // Set up real-time listener for user profile
          const userDocRef = doc(db, 'users', user.uid);
          const unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              const profileData = userDoc.data() as UserProfile;
              setUserProfile({
                ...profileData,
                createdAt: profileData.createdAt?.toDate?.() || new Date(profileData.createdAt)
              });
            } else {
              // Create a default profile if document doesn't exist
              const defaultProfile: UserProfile = {
                uid: user.uid,
                email: user.email!,
                displayName: user.displayName || 'User',
                role: 'applicant',
                createdAt: new Date()
    if (!authInitialized) return;
    
              };
      console.log('🔄 Auth state changed:', user?.email || 'No user');
              await setDoc(userDocRef, defaultProfile);
              setUserProfile(defaultProfile);
            }
          });

          // Store the unsubscribe function to clean up later
          return () => unsubscribeProfile();
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('demoUser');
              console.log('✅ User profile loaded:', profileData.displayName);
        console.log('✅ Demo user logged out');
      }
      
      setLoading(false);
    });
      console.log('✅ User logged out successfully');

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
              console.log('✅ Default profile created for:', user.email);
    currentUser,
    userProfile,
    login,
    register,
    logout,
    } finally {
      setLoading(false);
    loading
  };

  // Check for demo user in localStorage on app load
  useEffect(() => {
    if (authInitialized && !currentUser) {
      const storedDemoUser = localStorage.getItem('demoUser');
      if (storedDemoUser) {
        try {
  }, [authInitialized]);
          setCurrentUser(user);
          setUserProfile(profile);
          console.log('🔄 Restored demo user session:', user.email);
        } catch (error) {
          console.error('Error restoring demo user:', error);
          localStorage.removeItem('demoUser');
        }
      }
    }
  }, [authInitialized, currentUser]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};