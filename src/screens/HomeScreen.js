import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// --- 1. Import animation hooks ---
import Animated, { FadeIn, FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNotes } from '../context/NotesContext';
import { COLORS } from '../utils/constants';
import NoteCard from '../components/NoteCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeScreen = ({ navigation }) => {
  const { notes, loading, deleteNote, loadNotes, userProfile } = useNotes();
  const [refreshing, setRefreshing] = useState(false);

  // --- 2. Animation Logic for the FAB button ---
  const fabScale = useSharedValue(1);

  const animatedFabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
    };
  });

  const onPressInFab = () => {
    fabScale.value = withSpring(0.9);
  };

  const onPressOutFab = () => {
    fabScale.value = withSpring(1);
  };
  // --- End of Animation Logic ---

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(noteId) },
      ]
    );
  };

  const renderNoteItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <NoteCard
        note={item}
        onPress={() => navigation.navigate('NoteDetail', { note: item })}
        onEdit={() => navigation.navigate('AddEditNote', { note: item })}
        onDelete={() => handleDeleteNote(item.id)}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="file-tray-stacked-outline" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your Canvas is Empty</Text>
      <Text style={styles.emptySubtitle}>Let's create something amazing. Tap the '+' button to begin.</Text>
    </Animated.View>
  );

  if (loading && !notes.length) {
    return <LoadingSpinner />;
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Text style={styles.greetingText}>{getGreeting}</Text>
            <Text style={styles.headerTitle}>{userProfile.name}</Text>
          </Animated.View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Image
              source={userProfile.imageUri ? { uri: userProfile.imageUri } : require('../../assets/icon.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.noteCount}>{notes.length} {notes.length === 1 ? 'Note' : 'Notes'}</Text>
      </View>

      <FlatList
        data={notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notes.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />

      {/* --- 3. Apply the animation to the button --- */}
      <Animated.View style={[styles.fab, animatedFabStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={onPressInFab}
          onPressOut={onPressOutFab}
          onPress={() => navigation.navigate('AddEditNote')}
        >
          <LinearGradient
            colors={[COLORS.primary, '#5A9BFF']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  noteCount: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;