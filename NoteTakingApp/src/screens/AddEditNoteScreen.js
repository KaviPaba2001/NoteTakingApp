import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotes } from '../context/NotesContext';
import { COLORS } from '../utils/constants';
import CategoryPicker from '../components/CategoryPicker';

const AddEditNoteScreen = ({ route, navigation }) => {
  const { addNote, updateNote } = useNotes();
  const isEditing = !!route.params?.note;
  const existingNote = route.params?.note;

  const [title, setTitle] = React.useState(existingNote?.title || '');
  const [content, setContent] = React.useState(existingNote?.content || '');
  const [category, setCategory] = React.useState(existingNote?.category || 'personal');
  const [tags, setTags] = React.useState(existingNote?.tags?.join(', ') || '');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !title.trim()}
          style={styles.saveButton}
        >
          <Text style={[styles.saveButtonText, (!title.trim() || saving) && { opacity: 0.5 }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [title, content, category, tags, saving, navigation]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title is required', 'Please enter a title for your note.');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Content is required', 'Please enter some content for your note.');
      return;
    }

    setSaving(true);
    
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    if (!isEditing) {
      noteData.createdAt = new Date().toISOString();
    }

    try {
      if (isEditing) {
        await updateNote(existingNote.id, noteData);
        Alert.alert('Success', 'Note updated successfully!');
      } else {
        await addNote(noteData);
        Alert.alert('Success', 'Note saved successfully!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Save note error:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.textSecondary}
                autoFocus={!isEditing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <CategoryPicker
                selectedCategory={category}
                onCategorySelect={setCategory}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="e.g. work, important, ideas"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.contentInput]}
                value={content}
                onChangeText={setContent}
                placeholder="Start writing here..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  form: { padding: 20 },
  inputContainer: { marginVertical: 12 },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  contentInput: {
    minHeight: 250,
    lineHeight: 24,
  },
  saveButton: { marginRight: 16 },
  saveButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 18 },
});

export default AddEditNoteScreen;
