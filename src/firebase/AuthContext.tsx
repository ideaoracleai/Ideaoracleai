// Firebase Auth Context — provides auth state to the entire app
import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { onAuthChange } from './auth';
import { getUserDocument, onUserDocumentChange, type UserDocument } from './firestore';

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AuthContextType {
    // Firebase user (authentication info)
    firebaseUser: User | null;
    // Full user data from Firestore
    userDoc: UserDocument | null;
    // Combined easy-access fields
    isLoggedIn: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    // Refresh userDoc manually if needed
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

// ─── Auth Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribeAuth = onAuthChange(async (user) => {
            setFirebaseUser(user);

            if (user) {
                // Fetch Firestore user doc on login
                const doc = await getUserDocument(user.uid);
                setUserDoc(doc);
            } else {
                setUserDoc(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    // Listen to Firestore user document changes in real-time
    useEffect(() => {
        if (!firebaseUser) return;

        const unsubscribeDoc = onUserDocumentChange(firebaseUser.uid, (doc) => {
            setUserDoc(doc);
        });

        return () => unsubscribeDoc();
    }, [firebaseUser?.uid]);

    const refreshUserDoc = async () => {
        if (!firebaseUser) return;
        const doc = await getUserDocument(firebaseUser.uid);
        setUserDoc(doc);
    };

    const value: AuthContextType = {
        firebaseUser,
        userDoc,
        isLoggedIn: !!firebaseUser,
        isEmailVerified: firebaseUser?.emailVerified ?? false,
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
