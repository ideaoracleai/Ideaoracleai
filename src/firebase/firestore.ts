// Firestore Database Service for IdeaOracle.ai
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    type DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserDocument {
    name: string;
    email: string;
    plan: string;
    credits: number;
    maxCredits: number;
    createdAt: string;
    isEmailVerified: boolean;
    couponUsed: string | null;
    stripeCustomerId?: string;
    selectedCurrency?: string;
    language?: string;
    lastCreditReset?: string;
}

export interface IdeaRecord {
    id?: string;
    userId: string;
    title: string;
    content: string;
    rating: 'good' | 'medium' | 'bad';
    creditsUsed: number;
    createdAt: Timestamp | string;
    tags?: string[];
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface CreditHistoryRecord {
    userId: string;
    action: string;
    change: number;
    balance: number;
    date: string;
    createdAt: Timestamp;
}

// ─── User Document ────────────────────────────────────────────────────────────

/** Create a new user document in Firestore */
export async function createUserDocument(
    uid: string,
    data: Omit<UserDocument, 'lastCreditReset'>
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        ...data,
        lastCreditReset: getCurrentMonth(),
        createdAt: serverTimestamp(),
    });
}

/** Get user document from Firestore */
export async function getUserDocument(uid: string): Promise<UserDocument | null> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserDocument;
}

/** Update user document fields */
export async function updateUserDocument(
    uid: string,
    data: Partial<UserDocument>
): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...data });
}

/** Listen to user document changes in real-time */
export function onUserDocumentChange(
    uid: string,
    callback: (data: UserDocument | null) => void
) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
            callback(null);
        } else {
            callback(snap.data() as UserDocument);
        }
    });
}

// ─── Credits ──────────────────────────────────────────────────────────────────

/** Deduct credits from user (returns false if not enough) */
export async function deductCredits(
    uid: string,
    amount: number,
    currentCredits: number,
    isUnlimited: boolean
): Promise<boolean> {
    if (isUnlimited) return true;
    if (currentCredits < amount) return false;

    const newCredits = currentCredits - amount;
    await updateUserDocument(uid, { credits: newCredits });

    // Log credit usage
    await addCreditHistory(uid, {
        action: 'Analyse durchgeführt',
        change: -amount,
        balance: newCredits,
    });

    return true;
}

/** Add credits to user */
export async function addCredits(
    uid: string,
    amount: number,
    currentCredits: number,
    reason: string = 'Credit-Aufladung'
): Promise<void> {
    const newCredits = currentCredits + amount;
    await updateUserDocument(uid, { credits: newCredits });
    await addCreditHistory(uid, {
        action: reason,
        change: amount,
        balance: newCredits,
    });
}

/** Monthly credit reset check and execution */
export async function checkAndResetCredits(
    uid: string,
    plan: string,
    lastCreditReset: string
): Promise<boolean> {
    const currentMonth = getCurrentMonth();
    if (lastCreditReset === currentMonth) return false;

    const planCredits: Record<string, number> = {
        Starter: 2500,
        Pro: 5000,
        Builder: -1,
    };

    const credits = planCredits[plan] ?? 2500;
    await updateUserDocument(uid, {
        credits,
        lastCreditReset: currentMonth,
    });

    await addCreditHistory(uid, {
        action: 'Monatliche Erneuerung',
        change: credits,
        balance: credits,
    });

    return true;
}

// ─── Credit History ───────────────────────────────────────────────────────────

async function addCreditHistory(
    uid: string,
    data: Omit<CreditHistoryRecord, 'userId' | 'date' | 'createdAt'>
): Promise<void> {
    const historyRef = collection(db, 'users', uid, 'creditHistory');
    await addDoc(historyRef, {
        ...data,
        userId: uid,
        date: new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        createdAt: serverTimestamp(),
    });
}

/** Get credit history for user */
export async function getCreditHistory(
    uid: string,
    limitCount: number = 50
): Promise<CreditHistoryRecord[]> {
    const historyRef = collection(db, 'users', uid, 'creditHistory');
    const q = query(historyRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as CreditHistoryRecord));
}

// ─── Idea History ─────────────────────────────────────────────────────────────

/** Save a new idea analysis */
export async function saveIdeaRecord(
    uid: string,
    data: Omit<IdeaRecord, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
    const ideasRef = collection(db, 'users', uid, 'ideas');
    const docRef = await addDoc(ideasRef, {
        ...data,
        userId: uid,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/** Get all saved ideas for user */
export async function getIdeaHistory(
    uid: string,
    limitCount: number = 100
): Promise<IdeaRecord[]> {
    const ideasRef = collection(db, 'users', uid, 'ideas');
    const q = query(ideasRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IdeaRecord));
}

/** Delete an idea record */
export async function deleteIdeaRecord(uid: string, ideaId: string): Promise<void> {
    const ideaRef = doc(db, 'users', uid, 'ideas', ideaId);
    await deleteDoc(ideaRef);
}

// ─── Admin: All Users ─────────────────────────────────────────────────────────

/** Get all users (Admin only) */
export async function getAllUsers(): Promise<(UserDocument & { uid: string })[]> {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDocument & { uid: string }));
}

/** Get users by plan (Admin only) */
export async function getUsersByPlan(
    plan: string
): Promise<(UserDocument & { uid: string })[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('plan', '==', plan));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDocument & { uid: string }));
}

/** Update user plan (Admin only) */
export async function adminUpdateUserPlan(
    uid: string,
    plan: string,
    credits: number
): Promise<void> {
    await updateUserDocument(uid, { plan, credits, maxCredits: credits });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export interface CouponDocument {
    id?: string;
    code: string;
    plan: string;
    duration: number;
    durationUnit: 'days' | 'months';
    credits: number;
    isActive: boolean;
    usedCount: number;
    maxUses: number;
    createdAt: Timestamp;
}

/** Get coupon by code */
export async function getCoupon(code: string): Promise<CouponDocument | null> {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()), where('isActive', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as CouponDocument;
}

/** Mark coupon as used */
export async function useCoupon(couponId: string, usedCount: number): Promise<void> {
    const couponRef = doc(db, 'coupons', couponId);
    const newUsedCount = usedCount + 1;
    await updateDoc(couponRef, {
        usedCount: newUsedCount,
        ...(newUsedCount >= (await getDoc(couponRef)).data()?.maxUses
            ? { isActive: false }
            : {}),
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export type { DocumentData };
