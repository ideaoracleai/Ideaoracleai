// Firebase module — single import point
// Usage: import { auth, db, useAuth, loginWithEmail, ... } from '@/firebase'

export { auth, db, analytics } from './config';
export { default as firebaseApp } from './config';

// Auth functions
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

// Firestore functions
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
} from './firestore';

export type { UserDocument, IdeaRecord, CreditHistoryRecord, CouponDocument } from './firestore';

// Auth Context & Hook
export { AuthProvider, useAuth } from './AuthContext';
