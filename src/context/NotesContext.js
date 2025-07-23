import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/storage';
import { CATEGORIES } from '../utils/constants';

const NotesContext = createContext();

const initialState = {
  notes: [],
  categories: CATEGORIES,
  userProfile: { name: 'Guest', imageUri: null },
  loading: true,
  error: null,
};

const notesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOAD_DATA':
      return { 
        ...state, 
        notes: action.payload.notes, 
        userProfile: action.payload.userProfile,
        loading: false 
      };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
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
       return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    default:
      return state;
  }
};

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const notes = await storage.getNotes();
      const userProfile = await storage.getProfile();
      dispatch({ type: 'LOAD_DATA', payload: { notes, userProfile } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addNote = async (noteData) => {
    const newNote = await storage.addNote(noteData);
    if (newNote) dispatch({ type: 'ADD_NOTE', payload: newNote });
  };

  const updateNote = async (noteId, updates) => {
    const updatedNote = await storage.updateNote(noteId, updates);
    if (updatedNote) dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
  };

  const deleteNote = async (noteId) => {
    const success = await storage.deleteNote(noteId);
    if (success) dispatch({ type: 'DELETE_NOTE', payload: noteId });
  };

  const updateUserProfile = async (updates) => {
    const success = await storage.saveProfile(updates);
    if (success) {
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    }
  };
  
  const resetApp = async () => {
    await storage.clearAll();
    await loadInitialData(); // Reload to get default state
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

  const value = {
    ...state,
    addNote,
    updateNote,
    deleteNote,
    updateUserProfile,
    resetApp,
    searchNotes,
    getNotesByCategory,
    loadNotes: loadInitialData,
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