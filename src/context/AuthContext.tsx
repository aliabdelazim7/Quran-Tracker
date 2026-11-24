'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signInAsDemo: (name?: string) => void;
  updateDisplayName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'rehlaty_demo_user';
const DEMO_PROFILE_KEY = 'rehlaty_demo_profile';

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
            const parsedUser = JSON.parse(savedDemo);
            setUser(parsedUser);
            setIsDemo(true);
            if (savedProfile) {
              setProfile(JSON.parse(savedProfile));
            } else {
              setProfile({
                id: parsedUser.id,
                display_name: parsedUser.display_name,
                language: 'ar',
                timezone: 'Africa/Cairo',
                preferred_theme: 'light',
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
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              display_name: session.user.user_metadata?.display_name || 'قارئ القرآن'
            };
            setUser(authUser);
            setIsDemo(false);

            // Fetch profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

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

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      // Mock / Offline Auth
      const demoUser: AuthUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        display_name: email.split('@')[0] || 'المجتهد'
      };
      setUser(demoUser);
      setIsDemo(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      }
      setIsLoading(false);
      return { error: null };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          display_name: data.user.user_metadata?.display_name || 'قارئ القرآن'
        };
        setUser(authUser);
        setIsDemo(false);
      }
      setIsLoading(false);
      return { error: null };
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ error: string | null }> => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      const demoUser: AuthUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        display_name: displayName || 'صاحب القرآن'
      };
      const demoProf: Profile = {
        id: demoUser.id,
        display_name: displayName || 'صاحب القرآن',
        language: 'ar',
        timezone: 'Africa/Cairo',
        preferred_theme: 'light',
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
      setIsLoading(false);
      return { error: null };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
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
          display_name: displayName
        };
        setUser(authUser);
        setIsDemo(false);

        // Create profile in Supabase
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName
        });
      }
      setIsLoading(false);
      return { error: null };
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

  const signInAsDemo = (name: string = 'علي') => {
    const demoUser: AuthUser = {
      id: 'demo-user-1',
      email: 'ali@example.com',
      display_name: name
    };
    const demoProf: Profile = {
      id: demoUser.id,
      display_name: name,
      language: 'ar',
      timezone: 'Africa/Cairo',
      preferred_theme: 'light',
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
        updateDisplayName
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
