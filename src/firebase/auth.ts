// Firebase Authentication Service for IdeaOracle.ai
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    type User,
    GoogleAuthProvider,
    signInWithPopup,
    confirmPasswordReset,
    verifyPasswordResetCode,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from './config';
import { createUserDocument, getUserDocument } from './firestore';

// ─── Google Provider ───────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Register with Email & Password ───────────────────────────────────────────
export async function registerWithEmail(
    email: string,
    password: string,
    name: string,
    plan: string = 'Starter'
): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await createUserDocument(user.uid, {
        name,
        email,
        plan,
        credits: getPlanCredits(plan),
        maxCredits: getPlanCredits(plan),
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        couponUsed: null,
    });

    return user;
}

// ─── Login with Email & Password ──────────────────────────────────────────────
export async function loginWithEmail(
    email: string,
    password: string
): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
export async function loginWithGoogle(): Promise<User> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Check if first time login
    const existingUser = await getUserDocument(user.uid);
    if (!existingUser) {
        await createUserDocument(user.uid, {
            name: user.displayName || '',
            email: user.email || '',
            plan: 'Starter',
            credits: getPlanCredits('Starter'),
            maxCredits: getPlanCredits('Starter'),
            createdAt: new Date().toISOString(),
            isEmailVerified: true,
            couponUsed: null,
        });
    }

    return user;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    await signOut(auth);
    // Clear localStorage on logout
    localStorage.removeItem('nichecheck_user');
    localStorage.removeItem('credit_history');
    localStorage.removeItem('credit_renewal_log');
    localStorage.removeItem('last_credit_renewal');
}

// ─── Send Password Reset Email ────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

// ─── Verify Password Reset Code ───────────────────────────────────────────────
export async function verifyResetCode(code: string): Promise<string> {
    return await verifyPasswordResetCode(auth, code);
}

// ─── Confirm Password Reset ───────────────────────────────────────────────────
export async function confirmReset(code: string, newPassword: string): Promise<void> {
    await confirmPasswordReset(auth, code, newPassword);
}

// ─── Change Password (logged in user) ────────────────────────────────────────
export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
}

// ─── Resend Verification Email ────────────────────────────────────────────────
export async function resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await sendEmailVerification(user);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

// ─── Get Current User ─────────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// ─── Helper: Plan Credits ─────────────────────────────────────────────────────
export function getPlanCredits(plan: string): number {
    const credits: Record<string, number> = {
        Starter: 2500,
        Pro: 5000,
        Builder: -1, // -1 = unlimited
    };
    return credits[plan] ?? 2500;
}
