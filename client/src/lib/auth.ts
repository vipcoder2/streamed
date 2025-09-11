import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  username?: string;
}

// Convert Firebase User to our AuthUser type
export const convertFirebaseUser = (user: FirebaseUser | null): AuthUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email
  };
};

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username || username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  if (username.toLowerCase().includes('admin')) {
    return 'Username cannot contain "admin"';
  }
  return null;
};

// Check if username is taken
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking username:', error);
    return true; // Err on the side of caution
  }
};

// Register with email and password
export const registerUser = async (email: string, password: string, username: string): Promise<AuthUser> => {
  // Validate username
  const usernameError = validateUsername(username);
  if (usernameError) {
    throw new Error(usernameError);
  }

  // Check if username is taken
  const isTaken = await isUsernameTaken(username);
  if (isTaken) {
    throw new Error('Username is already taken');
  }

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', username), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: username,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create a document by UID for easy lookup
    await setDoc(doc(db, 'usersByUid', firebaseUser.uid), {
      username: username,
      email: firebaseUser.email,
      createdAt: serverTimestamp()
    });

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: username
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Sign in with email and password
export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userByUidDoc = await getDoc(doc(db, 'usersByUid', firebaseUser.uid));
    const userData = userByUidDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: userData?.username
    };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

// Sign in with Google
export const loginWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if user document exists
    const userByUidDoc = await getDoc(doc(db, 'usersByUid', firebaseUser.uid));
    
    let username = '';
    if (!userByUidDoc.exists()) {
      // First time Google login - need to create username
      // Generate a username from email
      const emailUsername = firebaseUser.email?.split('@')[0] || '';
      let baseUsername = emailUsername.replace(/[^a-zA-Z0-9]/g, '');
      
      // Ensure username is valid and not taken
      let counter = 0;
      username = baseUsername;
      while (await isUsernameTaken(username) || validateUsername(username)) {
        counter++;
        username = `${baseUsername}${counter}`;
        if (counter > 100) {
          username = `user${Date.now()}`;
          break;
        }
      }

      // Create user documents
      await setDoc(doc(db, 'users', username), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: username,
        provider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await setDoc(doc(db, 'usersByUid', firebaseUser.uid), {
        username: username,
        email: firebaseUser.email,
        provider: 'google',
        createdAt: serverTimestamp()
      });
    } else {
      username = userByUidDoc.data()?.username || '';
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: username
    };
  } catch (error: any) {
    throw new Error(error.message || 'Google sign-in failed');
  }
};

// Sign out
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Password reset failed');
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get user data from Firestore
      const userByUidDoc = await getDoc(doc(db, 'usersByUid', firebaseUser.uid));
      const userData = userByUidDoc.data();

      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: userData?.username
      });
    } else {
      callback(null);
    }
  });
};