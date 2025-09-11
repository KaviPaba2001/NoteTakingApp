import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/storage';
import { CATEGORIES } from '../utils/constants';
import { 
  signIn, 
  signUp, 
  signOutUser, 
  onAuthStateChange, 
  updateUserDocument,
  addNoteToFirestore,
  updateNoteInFirestore,
  deleteNoteFromFirestore,
  listenToUserNotes
} from '../services/firebaseService';

const NotesContext = createContext();

const initialState = {
  notes: [],
  categories: CATEGORIES,
  userProfile: { name: 'Guest', imageUri: null },
  loading: true,
  error: null,
  isAuthenticated: false,
  user: null,
};

const notesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_AUTHENTICATED':
      return { 
        ...state, 
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        userProfile: action.payload.user ? {
          name: action.payload.user.name || action.payload.user.email,
          imageUri: action.payload.user.photoURL || null,
          ...action.payload.user
        } : { name: 'Guest', imageUri: null }
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, loading: false };
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
      };
    case 'UPDATE_PROFILE':
       return { 
         ...state, 
         userProfile: { ...state.userProfile, ...action.payload },
         user: state.user ? { ...state.user, ...action.payload } : null
       };
    case 'LOGOUT':
      return { ...initialState, isAuthenticated: false, loading: false, user: null };
    default:
      return state;
  }
};

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  let notesUnsubscribe = null;

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: { 
            isAuthenticated: true, 
            user: {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email,
              photoURL: user.photoURL
            }
          } 
        });
        
        // Start listening to user's notes
        startListeningToNotes(user.uid);
      } else {
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: { isAuthenticated: false, user: null } 
        });
        
        // Stop listening to notes
        if (notesUnsubscribe) {
          notesUnsubscribe();
          notesUnsubscribe = null;
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });
    
    return unsubscribe;
  }, []);

  // Start real-time listening to user's notes
  const startListeningToNotes = (userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    notesUnsubscribe = listenToUserNotes(userId, (notes) => {
      dispatch({ type: 'SET_NOTES', payload: notes });
    });
  };

  // Firebase Authentication functions
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await signIn(email, password);
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const register = async (email, password, userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await signUp(email, password, userData);
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  };

  const logout = async () => {
    // Stop listening to notes
    if (notesUnsubscribe) {
      notesUnsubscribe();
      notesUnsubscribe = null;
    }
    
    const result = await signOutUser();
    if (result.success) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ===== NOTE OPERATIONS =====

  const addNote = async (noteData) => {
    if (!state.user?.uid) {
      throw new Error('User not authenticated');
    }

    const result = await addNoteToFirestore(state.user.uid, noteData);
    if (result.success) {
      // Note will be added automatically via real-time listener
      return result.note;
    } else {
      throw new Error(result.error);
    }
  };

  const updateNote = async (noteId, updates) => {
    if (!state.user?.uid) {
      throw new Error('User not authenticated');
    }

    const result = await updateNoteInFirestore(state.user.uid, noteId, updates);
    if (result.success) {
      // Note will be updated automatically via real-time listener
      return result.note;
    } else {
      throw new Error(result.error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!state.user?.uid) {
      return false;
    }

    const result = await deleteNoteFromFirestore(state.user.uid, noteId);
    return result.success;
  };

  const updateUserProfile = async (updates) => {
    const success = await storage.saveProfile(updates);
    if (success) {
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      
      if (state.user?.uid) {
        await updateUserDocument(state.user.uid, updates);
      }
    }
  };
  
  const resetApp = async () => {
    await storage.clearAll();
    // Notes will reload automatically via real-time listener
  };

  const searchNotes = (query) => {
    if (!query.trim()) return state.notes;
    const lowercaseQuery = query.toLowerCase();
    return state.notes.filter(
      note =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  };

  const getNotesByCategory = (categoryId) => {
    if (categoryId === 'all') return state.notes;
    return state.notes.filter(note => note.category === categoryId);
  };

  const loadNotes = () => {
    // Notes are loaded automatically via real-time listener
    return Promise.resolve();
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    addNote,
    updateNote,
    deleteNote,
    updateUserProfile,
    resetApp,
    searchNotes,
    getNotesByCategory,
    loadNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
