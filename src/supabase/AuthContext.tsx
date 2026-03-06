// Supabase Auth Context — provides auth state to the entire app
// Drop-in replacement for Firebase AuthContext
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './config';
import { getUserDocument, onUserDocumentChange } from './database';
import type { UserDocument } from './types';
import i18n from '../i18n';

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AuthContextType {
    // Supabase user (auth info)
    firebaseUser: User | null; // kept as firebaseUser for API compatibility
    // Full user data from DB
    userDoc: UserDocument | null;
    // Convenience flags
    isLoggedIn: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    // Refresh manually if needed
    refreshUserDoc: () => Promise<void>;
}

// ─── Create Context ────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
    firebaseUser: null,
    userDoc: null,
    isLoggedIn: false,
    isEmailVerified: false,
    isLoading: true,
    refreshUserDoc: async () => { },
});

// ─── Helper: apply user's saved language preference ──────────────────────────
function applyUserLanguage(doc: UserDocument | null) {
    const SUPPORTED = ['en', 'de'];
    const lang = doc?.language;
    if (lang && SUPPORTED.includes(lang) && i18n.language !== lang) {
        i18n.changeLanguage(lang);
    }
}

// ─── Auth Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to Supabase auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user ?? null;
            setSupabaseUser(user);

            if (user) {
                getUserDocument(user.id).then(async (doc) => {
                    if (!doc) {
                        const { createUserDocument } = await import('./database');
                        const { getPlanCredits } = await import('./auth');
                        const defaultPlan = 'Starter';
                        await createUserDocument(user.id, {
                            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                            email: user.email || '',
                            plan: defaultPlan,
                            credits: getPlanCredits(defaultPlan),
                            maxCredits: getPlanCredits(defaultPlan),
                            createdAt: new Date().toISOString(),
                            isEmailVerified: user.email_confirmed_at != null,
                            couponUsed: null
                        });
                        doc = await getUserDocument(user.id);
                    }
                    setUserDoc(doc);
                    applyUserLanguage(doc); // ← apply saved language on login
                    setIsLoading(false);
                }).catch(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user ?? null;
            setSupabaseUser(user);

            if (user) {
                let doc = await getUserDocument(user.id);
                if (!doc) {
                    // Auto-create missing profile (e.g. from Google login or missing trigger)
                    const { createUserDocument } = await import('./database');
                    const { getPlanCredits } = await import('./auth');
                    const defaultPlan = 'Starter';
                    await createUserDocument(user.id, {
                        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        plan: defaultPlan,
                        credits: getPlanCredits(defaultPlan),
                        maxCredits: getPlanCredits(defaultPlan),
                        createdAt: new Date().toISOString(),
                        isEmailVerified: user.email_confirmed_at != null,
                        couponUsed: null
                    });
                    doc = await getUserDocument(user.id);
                }
                setUserDoc(doc);
                applyUserLanguage(doc); // ← apply saved language on session restore
            } else {
                setUserDoc(null);
            }

            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Real-time subscription to user document changes
    useEffect(() => {
        if (!supabaseUser) return;

        const unsubscribe = onUserDocumentChange(supabaseUser.id, (doc) => {
            setUserDoc(doc);
            applyUserLanguage(doc); // ← apply saved language on realtime update
        });

        return unsubscribe;
    }, [supabaseUser?.id]);

    const refreshUserDoc = async () => {
        if (!supabaseUser) return;
        const doc = await getUserDocument(supabaseUser.id);
        setUserDoc(doc);
        applyUserLanguage(doc);
    };

    const value: AuthContextType = {
        firebaseUser: supabaseUser, // API-compatible alias
        userDoc,
        isLoggedIn: !!supabaseUser,
        isEmailVerified: supabaseUser?.email_confirmed_at != null,
        isLoading,
        refreshUserDoc,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── useAuth Hook ──────────────────────────────────────────────────────────────
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}

export default AuthContext;
