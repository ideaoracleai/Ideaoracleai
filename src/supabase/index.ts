// Supabase module — single import point
// Usage: import { useAuth, loginWithEmail, ... } from '@/supabase'
// This is a complete drop-in replacement for the old firebase/ module

export { supabase } from './config';
export { default as supabaseClient } from './config';

// Auth functions (same signatures as Firebase auth)
export {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    forgotPassword,
    verifyResetCode,
    confirmReset,
    changePassword,
    resendVerificationEmail,
    onAuthChange,
    getCurrentUser,
    getPlanCredits,
} from './auth';

// Database functions (same signatures as Firestore)
export {
    createUserDocument,
    getUserDocument,
    updateUserDocument,
    onUserDocumentChange,
    deductCredits,
    addCredits,
    checkAndResetCredits,
    getCreditHistory,
    saveIdeaRecord,
    getIdeaHistory,
    deleteIdeaRecord,
    getAllUsers,
    getUsersByPlan,
    adminUpdateUserPlan,
    getCoupon,
    useCoupon,
    uploadAvatar,
} from './database';

export type { UserDocument, IdeaRecord, CreditHistoryRecord, CouponDocument } from './types';

// Auth Context & Hook
export { AuthProvider, useAuth } from './AuthContext';
