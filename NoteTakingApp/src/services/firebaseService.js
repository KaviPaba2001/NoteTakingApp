import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Sign up new user (CREATE ACCOUNT ONLY - NO AUTO-LOGIN)
export const signUp = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = {
      uid: user.uid,
      email: user.email,
      name: userData.name || 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    await signOut(auth); // Sign out immediately after creating account

    return {
      success: true,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in existing user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userData = { uid: user.uid, email: user.email, name: 'User' };
    if (userDocSnap.exists()) {
      userData = { ...userData, ...userDocSnap.data() };
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to logout' };
  }
};

// Update user document in Firestore
export const updateUserDocument = async (uid, updates) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Failed to update user' };
  }
};

// ===== NOTE OPERATIONS =====

// Add new note to user's notes collection
export const addNoteToFirestore = async (userId, noteData) => {
  try {
    const notesCollectionRef = collection(db, 'users', userId, 'notes');
    const docRef = await addDoc(notesCollectionRef, {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      noteId: docRef.id,
      note: { id: docRef.id, ...noteData }
    };
  } catch (error) {
    console.error('Add note error:', error);
    return {
      success: false,
      error: 'Failed to save note'
    };
  }
};

// Update existing note in user's notes collection
export const updateNoteInFirestore = async (userId, noteId, updates) => {
  try {
    const noteDocRef = doc(db, 'users', userId, 'notes', noteId);
    await updateDoc(noteDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      note: { id: noteId, ...updates }
    };
  } catch (error) {
    console.error('Update note error:', error);
    return {
      success: false,
      error: 'Failed to update note'
    };
  }
};

// Delete note from user's notes collection
export const deleteNoteFromFirestore = async (userId, noteId) => {
  try {
    const noteDocRef = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(noteDocRef);

    return { success: true };
  } catch (error) {
    console.error('Delete note error:', error);
    return {
      success: false,
      error: 'Failed to delete note'
    };
  }
};

// Listen to user's notes in real-time
export const listenToUserNotes = (userId, callback) => {
  try {
    const notesCollectionRef = collection(db, 'users', userId, 'notes');
    const q = query(notesCollectionRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to JavaScript dates
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });
      callback(notes);
    }, (error) => {
      console.error('Listen to notes error:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Listen to notes setup error:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Enhanced error message helper
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '❌ Account not found\n\nNo account exists with this email address. Please check your email or create a new account.';
    case 'auth/wrong-password':
      return '❌ Incorrect password\n\nThe password you entered is incorrect. Please try again.';
    case 'auth/invalid-credential':
      return '❌ Invalid credentials\n\nThe email or password is incorrect. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return '❌ Email already registered\n\nAn account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return '❌ Weak password\n\nPassword should be at least 6 characters long with a mix of letters and numbers.';
    case 'auth/invalid-email':
      return '❌ Invalid email format\n\nPlease enter a valid email address (example@domain.com).';
    case 'auth/user-disabled':
      return '❌ Account disabled\n\nThis account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return '⏰ Too many attempts\n\nToo many failed login attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return '📡 Network error\n\nPlease check your internet connection and try again.';
    case 'auth/internal-error':
      return '⚠️ Server error\n\nSomething went wrong on our end. Please try again later.';
    default:
      return `❌ Authentication error\n\n${errorCode || 'An unexpected error occurred. Please try again.'}`;
  }
};
