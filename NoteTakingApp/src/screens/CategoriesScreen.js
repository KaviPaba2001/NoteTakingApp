import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNotes } from '../context/NotesContext';
import { COLORS, CATEGORIES } from '../utils/constants';
import NoteCard from '../components/NoteCard';

const CategoryButton = ({ item, isSelected, noteCount, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const eventHandlers = {
    onPressIn: () => { scale.value = withSpring(0.95); },
    onPressOut: () => { scale.value = withSpring(1); },
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={1} {...eventHandlers} onPress={onPress}>
        <LinearGradient
          colors={isSelected ? [item.color, item.color + 'BF'] : [COLORS.surface, COLORS.surface]}
          style={[styles.categoryItem, !isSelected && { borderWidth: 1, borderColor: COLORS.border }]}
        >
          <Ionicons name={item.icon} size={24} color={isSelected ? 'white' : item.color} />
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: isSelected ? 'white' : COLORS.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.categoryCount, { color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.textSecondary }]}>
              {noteCount} note{noteCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoriesScreen = ({ navigation }) => {
  const { notes, getNotesByCategory, deleteNote } = useNotes(); // Removed userProfile
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCategoryStats = () => {
    const stats = { all: notes.length };
    CATEGORIES.forEach(category => {
      stats[category.id] = notes.filter(note => note.category === category.id).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const filteredNotes = getNotesByCategory(selectedCategory);

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteNote(noteId) }]);
  };

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    const noteCount = categoryStats[item.id] || 0;
    return <CategoryButton item={item} isSelected={isSelected} noteCount={noteCount} onPress={() => setSelectedCategory(item.id)} />;
  };

  const renderNoteItem = ({ item }) => (
    <NoteCard note={item} onPress={() => navigation.navigate('NoteDetail', { note: item })} onEdit={() => navigation.navigate('AddEditNote', { note: item })} onDelete={() => handleDeleteNote(item.id)} />
  );

  const allCategoriesItem = { id: 'all', name: 'All Notes', color: COLORS.primary, icon: 'documents-outline' };
  const categoriesWithAll = [allCategoriesItem, ...CATEGORIES];
  const selectedCategoryName = categoriesWithAll.find(cat => cat.id === selectedCategory)?.name || 'Notes';

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      {/* --- Reverted to simple header --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <View>
        <FlatList
          data={categoriesWithAll}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.notesSection}>
        <View style={styles.notesHeader}>
            <Text style={styles.notesHeaderText}>{selectedCategoryName}</Text>
        </View>
        <FlatList
          data={filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 250 }}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
                <LinearGradient
                    colors={['rgba(58, 134, 255, 0.1)', 'rgba(58, 134, 255, 0)']}
                    style={styles.emptyIconContainer}
                >
                    <Ionicons name="folder-open-outline" size={70} color={COLORS.primary} />
                </LinearGradient>
              <Text style={styles.emptyTitle}>No Notes Here</Text>
              <Text style={styles.emptySubtitle}>
                This category is empty. Try selecting another one or adding a new note.
              </Text>
            </Animated.View>
          }
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: COLORS.text },
  notesSection: { flex: 1, marginTop: 10 },
  notesHeader: { paddingHorizontal: 22, paddingBottom: 10 },
  notesHeaderText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  categoriesList: { paddingHorizontal: 16, paddingVertical: 10 },
  categoryItem: { padding: 16, borderRadius: 16, marginRight: 12, minWidth: 150, alignItems: 'center', justifyContent: 'center' },
  categoryInfo: { marginTop: 8, alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '700' },
  categoryCount: { fontSize: 12, marginTop: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 50,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  emptySubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 24 },
});

export default CategoriesScreen;