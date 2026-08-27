import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getDataService } from '../services';
import { UserProfile, UserRole, RolePermissions } from '../types';
import { INITIAL_USERS } from '../data/mockUsers';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: RolePermissions;
  
  // Auth methods
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    assignedZone?: string;
    advertiserId?: string;
  }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithMicrosoft: () => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'apple' | 'microsoft') => Promise<boolean>;
  loginWithDemoRole: (role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; profileId: string }> = {
  ADMIN: { email: 'giniyomugabo@gmail.com', pass: 'Admin123!SG', profileId: 'usr-admin-01' },
  OPERATOR: { email: 'a.umutoni@kigalicity.gov.rw', pass: 'Operator123!SG', profileId: 'usr-op-01' },
  COLLECTOR: { email: 'jp.nshimiye@kigalieco.rw', pass: 'Collector123!SG', profileId: 'usr-col-01' },
  ADVERTISER: { email: 'c.habimana@mtn.co.rw', pass: 'Advertiser123!SG', profileId: 'usr-adv-01' },
  VIEWER: { email: 'm.mukamana@rema.gov.rw', pass: 'Viewer123!SG', profileId: 'usr-view-01' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sg_active_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const role: UserRole = userProfile?.role || 'VIEWER';
  const isAuthenticated = !!userProfile;

  // Persist current active profile locally
  useEffect(() => {
    if (userProfile) {
      try {
        localStorage.setItem('sg_active_user_profile', JSON.stringify(userProfile));
      } catch {}
    } else {
      localStorage.removeItem('sg_active_user_profile');
    }
  }, [userProfile]);

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const ds = getDataService();
          const profile = await ds.getUser(firebaseUser.uid);
          if (profile && isMounted) {
            setUserProfile(profile);
          } else if (firebaseUser.email) {
            // Find in mock dataset or create fallback profile
            const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
            if (matched && isMounted) {
              const enriched: UserProfile = { ...matched, id: firebaseUser.uid };
              setUserProfile(enriched);
              await ds.createUser(enriched).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Error loading user profile:', err);
        }
      } else {
        // Authenticate anonymously in background to grant Firestore access tokens
        signInAnonymously(auth).catch(() => {});
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Calculate Role Permissions
  const permissions: RolePermissions = useMemo(() => {
    switch (role) {
      case 'ADMIN':
        return {
          canViewDashboard: true,
          canViewAllBins: true,
          canEditBins: true,
          canPerformSelfTest: true,
          canViewAllCollections: true,
          canScheduleCollections: true,
          canCompleteCollections: true,
          canViewAllAds: true,
          canManageAds: true,
          canViewAnalytics: true,
          canAccessAI: true,
          canResolveAlerts: true,
          canManageUsers: true,
          canAccessSystemSettings: true,
        };
      case 'OPERATOR':
        return {
          canViewDashboard: true,
          canViewAllBins: true,
          canEditBins: true,
          canPerformSelfTest: true,
          canViewAllCollections: true,
          canScheduleCollections: true,
          canCompleteCollections: true,
          canViewAllAds: true,
          canManageAds: false,
          canViewAnalytics: true,
          canAccessAI: true,
          canResolveAlerts: true,
          canManageUsers: false,
          canAccessSystemSettings: false,
        };
      case 'COLLECTOR':
        return {
          canViewDashboard: true,
          canViewAllBins: false, // only assigned route
          canEditBins: false,
          canPerformSelfTest: false,
          canViewAllCollections: false, // only assigned collections
          canScheduleCollections: false,
          canCompleteCollections: true,
          canViewAllAds: false,
          canManageAds: false,
          canViewAnalytics: false,
          canAccessAI: true,
          canResolveAlerts: true,
          canManageUsers: false,
          canAccessSystemSettings: false,
        };
      case 'ADVERTISER':
        return {
          canViewDashboard: true,
          canViewAllBins: false, // only bins featuring advertiser ads
          canEditBins: false,
          canPerformSelfTest: false,
          canViewAllCollections: false,
          canScheduleCollections: false,
          canCompleteCollections: false,
          canViewAllAds: false, // only their own campaigns
          canManageAds: true,
          canViewAnalytics: true,
          canAccessAI: true,
          canResolveAlerts: false,
          canManageUsers: false,
          canAccessSystemSettings: false,
        };
      case 'VIEWER':
      default:
        return {
          canViewDashboard: true,
          canViewAllBins: true,
          canEditBins: false,
          canPerformSelfTest: false,
          canViewAllCollections: false,
          canScheduleCollections: false,
          canCompleteCollections: false,
          canViewAllAds: false,
          canManageAds: false,
          canViewAnalytics: true,
          canAccessAI: true,
          canResolveAlerts: false,
          canManageUsers: false,
          canAccessSystemSettings: false,
        };
    }
  }, [role]);

  // Sign In with email/password
  const signIn = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
      const ds = getDataService();
      const profile = await ds.getUser(cred.user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        const finalProfile = matched || {
          id: cred.user.uid,
          name: email.split('@')[0],
          email,
          role: 'ADMIN' as UserRole,
          phone: '+250 788 123 456',
          organization: 'SG AI Agency',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          status: 'ACTIVE' as const,
          lastActive: new Date().toISOString(),
          assignedZone: 'Kigali City Hub',
        };
        setUserProfile(finalProfile);
      }
      setLoading(false);
      return true;
    } catch (err: any) {
      console.warn('[AuthContext] Firebase signIn error, checking fallback demo matching:', err);
      // Fallback matching for demo accounts if user typed a demo email
      const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUserProfile(matched);
        setLoading(false);
        return true;
      }
      setError(err?.message || 'Invalid email or password credentials.');
      setLoading(false);
      return false;
    }
  }, []);

  // Sign Up new user with assigned role & profile in Firestore
  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      phone?: string;
      organization?: string;
      assignedZone?: string;
      advertiserId?: string;
    }): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        let uid = `usr-${Date.now()}`;
        try {
          const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
          uid = cred.user.uid;
          setUser(cred.user);
        } catch (authErr: any) {
          console.warn('[AuthContext] Firebase createUser warning:', authErr);
        }

        const newProfile: UserProfile = {
          id: uid,
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          phone: data.phone || '+250 788 123 456',
          organization: data.organization || 'City of Kigali Partner',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          status: 'ACTIVE',
          assignedZone: data.assignedZone || 'Gasabo & Nyarugenge',
          advertiserId: data.advertiserId,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const ds = getDataService();
        await ds.createUser(newProfile);
        setUserProfile(newProfile);
        setLoading(false);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Failed to create user account.');
        setLoading(false);
        return false;
      }
    },
    []
  );

  // Social Authentication: Google, Apple, Microsoft
  const loginWithSocial = useCallback(async (provider: 'google' | 'apple' | 'microsoft'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      let authProvider: GoogleAuthProvider | OAuthProvider;
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
        authProvider.addScope('email');
        authProvider.addScope('profile');
      } else if (provider === 'apple') {
        authProvider = new OAuthProvider('apple.com');
        authProvider.addScope('email');
        authProvider.addScope('name');
      } else {
        authProvider = new OAuthProvider('microsoft.com');
        authProvider.addScope('user.read');
        authProvider.addScope('email');
      }

      let authedUser: FirebaseUser | null = null;
      try {
        const result = await signInWithPopup(auth, authProvider);
        authedUser = result.user;
        setUser(result.user);
      } catch (popupErr: any) {
        console.warn(`[AuthContext] Popup flow warning for ${provider}:`, popupErr?.message);
        // If popup is closed or restricted in iframe, proceed with fallback connected profile
      }

      const ds = getDataService();
      let email = authedUser?.email;
      let displayName = authedUser?.displayName;
      let photoUrl = authedUser?.photoURL;
      const uid = authedUser?.uid || `usr-${provider}-${Date.now()}`;

      if (!email) {
        if (provider === 'google') {
          email = 'giniyomugabo@gmail.com';
          displayName = displayName || 'Gisa Niyomugabo';
        } else if (provider === 'apple') {
          email = 'gisa.niyo@privaterelay.appleid.com';
          displayName = displayName || 'Gisa Niyo (Apple ID)';
        } else {
          email = 'gisa@kigalicity.gov.rw';
          displayName = displayName || 'Gisa Niyomugabo (Microsoft)';
        }
      }

      // Check if existing profile in database
      let profile: UserProfile | null = null;
      try {
        profile = await ds.getUser(uid);
      } catch {}

      if (!profile) {
        // Find if matched by email or create new
        const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email?.toLowerCase());
        profile = matched
          ? { ...matched, id: uid }
          : {
              id: uid,
              name: displayName || email?.split('@')[0] || 'Enterprise User',
              email: email || `${provider}.user@sgsmartbin.rw`,
              role: 'ADMIN' as UserRole,
              phone: '+250 788 123 456',
              organization: provider === 'microsoft' ? 'City of Kigali Municipal Command' : 'SG Smart Cities East Africa',
              avatarUrl:
                photoUrl ||
                (provider === 'google'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
                  : provider === 'apple'
                  ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
                  : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80'),
              status: 'ACTIVE',
              lastActive: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              assignedZone: 'Kigali Central Sector',
            };
        await ds.createUser(profile).catch(() => {});
      }

      setUserProfile(profile);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error(`[AuthContext] ${provider} login error:`, err);
      setError(err?.message || `Failed to sign in with ${provider.toUpperCase()}`);
      setLoading(false);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(() => loginWithSocial('google'), [loginWithSocial]);
  const loginWithApple = useCallback(() => loginWithSocial('apple'), [loginWithSocial]);
  const loginWithMicrosoft = useCallback(() => loginWithSocial('microsoft'), [loginWithSocial]);

  // 1-Click Instant Demo Login for all 5 roles
  const loginWithDemoRole = useCallback(async (targetRole: UserRole): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const demo = DEMO_CREDENTIALS[targetRole];
      const matched = INITIAL_USERS.find((u) => u.id === demo.profileId) || INITIAL_USERS.find((u) => u.role === targetRole);
      
      try {
        // Try signing in anonymously or with demo credentials
        await signInAnonymously(auth);
      } catch {}

      if (matched) {
        setUserProfile(matched);
        const ds = getDataService();
        await ds.createUser(matched).catch(() => {});
      }
      setLoading(false);
      return true;
    } catch (err: any) {
      console.warn('[AuthContext] Demo login error:', err);
      const fallback = INITIAL_USERS.find((u) => u.role === targetRole) || INITIAL_USERS[0];
      setUserProfile(fallback);
      setLoading(false);
      return true;
    }
  }, []);

  // Log Out
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  }, []);

  // Update profile data in Firestore
  const updateProfileData = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!userProfile) return;
      const updated = { ...userProfile, ...data };
      setUserProfile(updated);
      const ds = getDataService();
      await ds.updateUser(userProfile.id, data).catch(() => {});
    },
    [userProfile]
  );

  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback(
    (allowedRoles: UserRole[]): boolean => {
      return allowedRoles.includes(role);
    },
    [role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isAuthenticated,
        loading,
        error,
        permissions,
        signIn,
        signUp,
        loginWithGoogle,
        loginWithApple,
        loginWithMicrosoft,
        loginWithSocial,
        loginWithDemoRole,
        logout,
        updateProfileData,
        clearError,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
