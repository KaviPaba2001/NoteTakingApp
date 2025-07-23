import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES } from '../utils/constants';

const NoteCard = ({ note, onPress, onDelete, onEdit }) => {
  const category = CATEGORIES.find(cat => cat.id === note.category) || CATEGORIES[CATEGORIES.length - 1];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={[COLORS.surface, '#2a2a2e']} // Subtle gradient for the card
        style={[styles.container, { borderLeftColor: category.color }]}
      >
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Ionicons name={category.icon} size={16} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{note.title}</Text>
        <Text style={styles.content} numberOfLines={3}>
          {truncateText(note.content)}
        </Text>
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.date}>
          {formatDate(note.updatedAt)}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 5,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  content: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: COLORS.primary + '30', // More subtle
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default NoteCard;