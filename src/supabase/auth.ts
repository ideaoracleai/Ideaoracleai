// Supabase Authentication Service for IdeaOracle.ai
// Drop-in replacement for Firebase auth module
import { supabase } from './config';
import { createUserDocument, getUserDocument } from './database';

// ─── Plan Credits Helper ──────────────────────────────────────────────────────
export function getPlanCredits(plan: string): number {
    const credits: Record<string, number> = {
        Starter: 2500,
        Pro: 5000,
        Builder: -1, // -1 = unlimited
    };
    return credits[plan] ?? 2500;
}

// ─── Register with Email & Password ──────────────────────────────────────────
export async function registerWithEmail(
    email: string,
    password: string,
    name: string,
    plan: string = 'Starter'
): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name, plan },
            // Supabase sends verification email automatically
        },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed: no user returned');

    // Profile row is auto-created by the DB trigger (handle_new_user)
    // But we also try manually in case the trigger hasn't fired yet
    try {
        const existing = await getUserDocument(data.user.id);
        if (!existing) {
            await createUserDocument(data.user.id, {
                name,
                email,
                plan,
                credits: getPlanCredits(plan),
                maxCredits: getPlanCredits(plan),
                createdAt: new Date().toISOString(),
                isEmailVerified: false,
                couponUsed: null,
            });
        }
    } catch {
        // Trigger handled it — ignore
    }
}

// ─── Login with Email & Password ─────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
export async function loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            queryParams: { prompt: 'select_account' },
        },
    });
    if (error) throw error;
    // After OAuth redirect, the session is restored automatically
    // Profile row is created by the DB trigger on first login
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    await supabase.auth.signOut();
    // Clear localStorage entries if any
    localStorage.removeItem('nichecheck_user');
    localStorage.removeItem('credit_history');
    localStorage.removeItem('credit_renewal_log');
    localStorage.removeItem('last_credit_renewal');
}

// ─── Send Password Reset Email ────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) throw error;
}

// ─── Update Password (when user has reset token in URL) ──────────────────────
export async function confirmReset(_code: string, newPassword: string): Promise<void> {
    // Supabase handles token exchange via the URL hash automatically
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
}

// ─── Change Password (logged-in user) ────────────────────────────────────────
export async function changePassword(
    _currentPassword: string,
    newPassword: string
): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
}

// ─── Resend Verification Email ────────────────────────────────────────────────
export async function resendVerificationEmail(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No user logged in');

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
    });
    if (error) throw error;
}

// ─── Auth State Observer ──────────────────────────────────────────────────────
export function onAuthChange(callback: (user: import('@supabase/supabase-js').User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
}

// ─── Get Current User ─────────────────────────────────────────────────────────
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ─── Verify Reset Code (Not needed with Supabase — handled via URL) ──────────
export async function verifyResetCode(_code: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ?? '';
}
