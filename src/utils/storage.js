import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@notes';
const PROFILE_KEY = '@userProfile';

export const storage = {
  // --- Profile Functions ---
  async getProfile() {
    try {
      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      return profileJson ? JSON.parse(profileJson) : { name: 'Guest', imageUri: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { name: 'Guest', imageUri: null };
    }
  },
  async saveProfile(profile) {
    try {
      const currentProfile = await this.getProfile();
      const newProfile = { ...currentProfile, ...profile };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  // --- Note Functions (existing) ---
  async getNotes() {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },
  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  },
  async addNote(note) {
    try {
      const notes = await this.getNotes();
      const newNote = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notes.push(newNote);
      await this.saveNotes(notes);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },
  async updateNote(noteId, updates) {
    try {
      const notes = await this.getNotes();
      const noteIndex = notes.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await this.saveNotes(notes);
        return notes[noteIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },
  async deleteNote(noteId) {
    try {
      const notes = await this.getNotes();
      const filteredNotes = notes.filter(note => note.id !== noteId);
      await this.saveNotes(filteredNotes);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([NOTES_KEY, PROFILE_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};