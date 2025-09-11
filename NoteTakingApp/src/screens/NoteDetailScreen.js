import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNotes } from '../context/NotesContext';
import { COLORS, CATEGORIES } from '../utils/constants';

const NoteDetailScreen = ({ route, navigation }) => {
  const { note } = route.params;
  const { deleteNote } = useNotes();
  const category = CATEGORIES.find(cat => cat.id === note.category) || CATEGORIES[0];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back-outline" size={28} color={COLORS.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, note]);

  const handleEdit = () => navigation.navigate('AddEditNote', { note });
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteNote(note.id);
              if (success) {
                Alert.alert('Success', 'Note deleted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete note');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        },
      ]
    );
  };
  
  const handleShare = async () => {
    try {
      const shareContent = `${note.title}\n\n${note.content}`;
      await Share.share({
        message: shareContent,
        title: note.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.delay(200)}>
          <View style={styles.metaContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '30' }]}>
              <Ionicons name={category.icon} size={14} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
            </View>
          </View>
          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.dateText}>Last updated on {formatDate(note.updatedAt || note.createdAt)}</Text>
          
          {note.tags && note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.noteContent}>{note.content || 'This note has no content.'}</Text>
          
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{note.content?.length || 0}</Text>
                <Text style={styles.statLabel}>Characters</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {note.content?.trim() ? note.content.trim().split(/\s+/).length : 0}
                </Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{note.tags ? note.tags.length : 0}</Text>
                <Text style={styles.statLabel}>Tags</Text>
              </View>
            </View>
          </View>

          <View style={styles.timestampSection}>
            <Text style={styles.sectionTitle}>Timestamps</Text>
            <View style={styles.timestampContainer}>
              <View style={styles.timestampItem}>
                <Ionicons name="create-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.timestampText}>Created: {formatDate(note.createdAt)}</Text>
              </View>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <View style={styles.timestampItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.timestampText}>Updated: {formatDate(note.updatedAt)}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 120, paddingHorizontal: 20, paddingBottom: 50 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 10, marginHorizontal: 6 },
  metaContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  categoryText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 24 },
  title: { fontSize: 38, fontWeight: 'bold', color: COLORS.text, marginBottom: 8, lineHeight: 46 },
  tagsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 24, 
    borderBottomWidth: 1, 
    borderTopWidth: 1, 
    borderColor: COLORS.border, 
    paddingVertical: 16 
  },
  tag: { 
    backgroundColor: COLORS.primary + '30', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 16, 
    marginRight: 10, 
    marginBottom: 10 
  },
  tagText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  noteContent: { fontSize: 18, lineHeight: 32, color: COLORS.text, opacity: 0.9, paddingVertical: 20 },
  statsSection: { marginTop: 30 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.textSecondary, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 12 
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    padding: 20 
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  timestampSection: { marginTop: 30 },
  timestampContainer: { 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    padding: 20 
  },
  timestampItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  timestampText: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    marginLeft: 8 
  },
});

export default NoteDetailScreen;
