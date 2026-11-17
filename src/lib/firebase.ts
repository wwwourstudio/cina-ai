import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

// Keep latest ID token strictly in memory (never in localStorage)
let inMemoryIdToken: string | null = null;
let currentAuthUser: User | null = null;

type AuthSubscriber = (user: User | null) => void;
const subscribers = new Set<AuthSubscriber>();

onAuthStateChanged(auth, async (user: User | null) => {
  currentAuthUser = user;
  if (user) {
    try {
      inMemoryIdToken = await user.getIdToken();
    } catch {
      inMemoryIdToken = null;
    }
    const w = window as unknown as {
      cinaSync?: (patch: Record<string, unknown>) => void;
      CinaUser?: { get?: () => Record<string, unknown> };
    };
    const existing = w.CinaUser?.get?.() || {};
    if (w.cinaSync && !existing.signedIn) {
      const handle =
        user.displayName?.trim() ||
        user.email?.split('@')[0] ||
        'Director';
      w.cinaSync({
        signedIn: true,
        handle,
        email: user.email || '',
      });
    }
  } else {
    inMemoryIdToken = null;
  }
  for (const cb of subscribers) {
    cb(user);
  }
  window.dispatchEvent(new CustomEvent('cina:cloud-auth', { detail: user }));
});

export function subscribeAuthUser(cb: AuthSubscriber): () => void {
  subscribers.add(cb);
  cb(currentAuthUser);
  return () => {
    subscribers.delete(cb);
  };
}

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  inMemoryIdToken = await credential.user.getIdToken();
  return credential.user;
}

export async function signOutFirebaseUser(): Promise<void> {
  inMemoryIdToken = null;
  await signOut(auth);
}

export async function getFreshIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return inMemoryIdToken;
  try {
    inMemoryIdToken = await user.getIdToken();
    return inMemoryIdToken;
  } catch {
    return inMemoryIdToken;
  }
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getFreshIdToken();
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers });
}

declare global {
  interface Window {
    CinaCloudAuth?: {
      signInWithGoogle: () => Promise<User>;
      signOut: () => Promise<void>;
      authFetch: (input: string, init?: RequestInit) => Promise<Response>;
      subscribeAuthUser: (cb: AuthSubscriber) => () => void;
      getCurrentUser: () => User | null;
    };
  }
}

if (typeof window !== 'undefined') {
  window.CinaCloudAuth = {
    signInWithGoogle: signInWithGooglePopup,
    signOut: signOutFirebaseUser,
    authFetch,
    subscribeAuthUser,
    getCurrentUser: () => auth.currentUser || currentAuthUser,
  };
}
