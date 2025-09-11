import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNotes } from '../context/NotesContext';
import { COLORS } from '../utils/constants';
import SearchBar from '../components/SearchBar';
import NoteCard from '../components/NoteCard';

const SearchScreen = ({ navigation }) => {
  const { notes, searchNotes, deleteNote } = useNotes();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      // Show recent notes only if there are any notes
      if (notes.length > 0) {
        setResults(notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10));
      } else {
        setResults([]);
      }
    } else {
      const searchResults = searchNotes(query);
      setResults(searchResults);
    }
  }, [query, notes]);

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Note','Are you sure?', [{ text: 'Cancel'},{ text: 'Delete', onPress: () => deleteNote(noteId) }]);
  };

  const renderNoteItem = ({ item }) => (
    <NoteCard
      note={item}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
      onEdit={() => navigation.navigate('AddEditNote', { note: item })}
      onDelete={() => handleDeleteNote(item.id)}
    />
  );

  // 1. A brand new empty state for when the user first visits the screen
  const renderInitialEmptyState = () => (
    <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
        <LinearGradient
            colors={['rgba(58, 134, 255, 0.1)', 'rgba(58, 134, 255, 0)']}
            style={styles.emptyIconContainer}
        >
            <Ionicons name="sparkles-outline" size={70} color={COLORS.primary} />
        </LinearGradient>
      <Text style={styles.emptyTitle}>Search Your Notes</Text>
      <Text style={styles.emptySubtitle}>
        Find any note instantly by its title, content, or tags.
      </Text>
    </Animated.View>
  );

  // 2. An improved empty state for when a search yields no results
  const renderSearchEmptyState = () => (
    <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
        <LinearGradient
            colors={['rgba(58, 134, 255, 0.1)', 'rgba(58, 134, 255, 0)']}
            style={styles.emptyIconContainer}
        >
            <Ionicons name="sad-outline" size={70} color={COLORS.primary} />
        </LinearGradient>
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptySubtitle}>
        Try using different or more general keywords.
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder="Search by title, content, or tags..."
      />

      {/* Only show the header if there are notes to display */}
      {results.length > 0 && (
        <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
            {query.trim() ? `Search Results` : 'Recent Notes'}
            </Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        // 3. Conditionally choose which empty state to show
        ListEmptyComponent={
          query.trim() ? renderSearchEmptyState : renderInitialEmptyState
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60, // Nudge it up a bit
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});

export default SearchScreen;