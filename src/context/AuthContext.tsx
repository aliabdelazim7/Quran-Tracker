'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile, UserRole, VerificationStatus } from '@/types/database';
import { isValidRegistrationRole, isValidRole } from '@/lib/authorization/roles';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  verification_status: VerificationStatus;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role?: 'student' | 'sheikh'
  ) => Promise<{ error: string | null; role?: UserRole }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signInAsDemo: (name?: string, role?: UserRole) => void;
  updateDisplayName: (newName: string) => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'rehlaty_demo_user';
const DEMO_PROFILE_KEY = 'rehlaty_demo_profile';
const USERS_REGISTRY_KEY = 'rehlaty_users_registry';

function getStoredUsers(): Record<string, { user: AuthUser; profile: Profile }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storeUserInRegistry(email: string, user: AuthUser, profile: Profile) {
  if (typeof window === 'undefined') return;
  try {
    const registry = getStoredUsers();
    registry[email.toLowerCase().trim()] = { user, profile };
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const configured = isSupabaseConfigured();

      // Check if there is saved demo user session in localStorage
      if (typeof window !== 'undefined') {
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        const savedProfile = localStorage.getItem(DEMO_PROFILE_KEY);
        if (savedDemo) {
          try {
            const parsedUserRaw = JSON.parse(savedDemo);
            const parsedUser: AuthUser = {
              id: parsedUserRaw.id,
              email: parsedUserRaw.email,
              display_name: parsedUserRaw.display_name,
              role: isValidRole(parsedUserRaw.role) ? parsedUserRaw.role : 'student',
              verification_status: parsedUserRaw.verification_status || 'unverified'
            };
            setUser(parsedUser);
            setIsDemo(true);
            if (savedProfile) {
              const parsedProf = JSON.parse(savedProfile);
              setProfile({
                ...parsedProf,
                role: isValidRole(parsedProf.role) ? parsedProf.role : parsedUser.role,
                verification_status: parsedProf.verification_status || 'unverified'
              });
            } else {
              setProfile({
                id: parsedUser.id,
                display_name: parsedUser.display_name,
                language: 'ar',
                timezone: 'Africa/Cairo',
                preferred_theme: 'light',
                role: parsedUser.role,
                verification_status: parsedUser.verification_status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem(DEMO_USER_KEY);
          }
        }
      }

      if (configured) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch trusted profile from database to determine authoritative role
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role: UserRole = isValidRole(prof?.role) ? prof.role : 'student';
            const verification: VerificationStatus = prof?.verification_status || 'unverified';

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              display_name: prof?.display_name || session.user.user_metadata?.display_name || 'قارئ القرآن',
              role,
              verification_status: verification
            };
            setUser(authUser);
            setIsDemo(false);

            if (prof) {
              setProfile(prof as Profile);
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check notice:', err);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null; role?: UserRole }> => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      // Mock / Offline Auth with persistent registry lookup
      const emailKey = email.toLowerCase().trim();
      const registry = getStoredUsers();
      let demoUser: AuthUser;
      let demoProf: Profile;

      if (registry[emailKey]) {
        demoUser = registry[emailKey].user;
        demoProf = registry[emailKey].profile;
      } else {
        const idSuffix = emailKey.replace(/[^a-z0-9]/g, '_');
        const role: UserRole = emailKey.includes('sheikh') ? 'sheikh' : 'student';
        demoUser = {
          id: `usr-${idSuffix}`,
          email,
          display_name: email.split('@')[0] || 'المجتهد',
          role,
          verification_status: role === 'sheikh' ? 'verified' : 'unverified'
        };
        demoProf = {
          id: demoUser.id,
          display_name: demoUser.display_name,
          language: 'ar',
          timezone: 'Africa/Cairo',
          preferred_theme: 'light',
          role,
          verification_status: demoUser.verification_status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        storeUserInRegistry(emailKey, demoUser, demoProf);
      }

      setUser(demoUser);
      setProfile(demoProf);
      setIsDemo(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProf));
      }
      setIsLoading(false);
      return { error: null, role: demoUser.role };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        // Fetch trusted role from profiles table (authoritative source)
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const role: UserRole = isValidRole(prof?.role) ? prof.role : 'student';
        const verification: VerificationStatus = prof?.verification_status || 'unverified';

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          display_name: prof?.display_name || data.user.user_metadata?.display_name || 'قارئ القرآن',
          role,
          verification_status: verification
        };
        setUser(authUser);
        if (prof) {
          setProfile(prof as Profile);
        }
        setIsDemo(false);
        setIsLoading(false);
        return { error: null, role };
      }
      setIsLoading(false);
      return { error: null, role: 'student' };
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    roleOption?: 'student' | 'sheikh'
  ): Promise<{ error: string | null; role?: UserRole }> => {
    setIsLoading(true);
    const validRole: UserRole = isValidRegistrationRole(roleOption) ? roleOption : 'student';

    if (!isSupabaseConfigured()) {
      const emailKey = email.toLowerCase().trim();
      const idSuffix = emailKey.replace(/[^a-z0-9]/g, '_');
      const demoUser: AuthUser = {
        id: `usr-${idSuffix}`,
        email,
        display_name: displayName || 'صاحب القرآن',
        role: validRole,
        verification_status: validRole === 'sheikh' ? 'pending' : 'unverified'
      };
      const demoProf: Profile = {
        id: demoUser.id,
        display_name: displayName || 'صاحب القرآن',
        language: 'ar',
        timezone: 'Africa/Cairo',
        preferred_theme: 'light',
        role: validRole,
        verification_status: demoUser.verification_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      storeUserInRegistry(emailKey, demoUser, demoProf);
      setUser(demoUser);
      setProfile(demoProf);
      setIsDemo(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProf));
      }
      setIsLoading(false);
      return { error: null, role: validRole };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: validRole
          }
        }
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          display_name: displayName,
          role: validRole,
          verification_status: validRole === 'sheikh' ? 'pending' : 'unverified'
        };
        setUser(authUser);
        setIsDemo(false);

        // Create profile in Supabase with explicit protected role
        const { error: profErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          role: validRole,
          verification_status: authUser.verification_status
        });

        if (profErr) {
          console.warn('Profile insertion note:', profErr.message);
        }
      }
      setIsLoading(false);
      return { error: null, role: validRole };
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_USER_KEY);
      localStorage.removeItem(DEMO_PROFILE_KEY);
    }
    setUser(null);
    setProfile(null);
    setIsDemo(false);
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? error.message : null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'فشل إرسال رابط استعادة كلمة المرور' };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'فشل تحديث كلمة المرور' };
    }
  };

  const signInAsDemo = (name: string = 'علي', role: UserRole = 'student') => {
    const demoUser: AuthUser = {
      id: role === 'sheikh' ? 'demo-sheikh-1' : 'demo-student-1',
      email: role === 'sheikh' ? 'sheikh@example.com' : 'ali@example.com',
      display_name: name,
      role,
      verification_status: role === 'sheikh' ? 'verified' : 'unverified'
    };
    const demoProf: Profile = {
      id: demoUser.id,
      display_name: name,
      language: 'ar',
      timezone: 'Africa/Cairo',
      preferred_theme: 'light',
      role,
      verification_status: demoUser.verification_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(demoUser);
    setProfile(demoProf);
    setIsDemo(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProf));
    }
  };

  const switchDemoRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser: AuthUser = {
      ...user,
      role: newRole,
      verification_status: newRole === 'sheikh' ? 'verified' : 'unverified'
    };
    setUser(updatedUser);
    if (profile) {
      const updatedProf: Profile = {
        ...profile,
        role: newRole,
        verification_status: updatedUser.verification_status
      };
      setProfile(updatedProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updatedProf));
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!user) return;
    const updatedUser = { ...user, display_name: newName };
    setUser(updatedUser);
    if (profile) {
      const updatedProf = { ...profile, display_name: newName };
      setProfile(updatedProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updatedProf));
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedUser));
    }
    if (isSupabaseConfigured() && !isDemo) {
      const supabase = createClient();
      await supabase.from('profiles').update({ display_name: newName }).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemo,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        signInAsDemo,
        updateDisplayName,
        switchDemoRole
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
