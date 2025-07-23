import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useNotes } from '../context/NotesContext';
import { COLORS } from '../utils/constants';

// The SettingsItem component with its self-contained animation logic
const SettingsItem = ({ icon, label, color = COLORS.text, onPress, hasSwitch = false, switchValue, onSwitchChange }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const eventHandlers = {
    onPressIn: () => { if (onPress) scale.value = withSpring(0.97); },
    onPressOut: () => { if (onPress) scale.value = withSpring(1); },
  };

  const content = (
    <>
      <Ionicons name={icon} size={24} color={color} style={styles.itemIcon} />
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      {hasSwitch ? (
        <Switch
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={'#f4f3f4'}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.itemContainer}>{content}</View>;
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={1} {...eventHandlers} style={styles.itemContainer} onPress={onPress}>
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingsScreen = () => {
  const { userProfile, updateUserProfile, resetApp } = useNotes();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(userProfile.name);

  // Animation for the main profile card
  const profileScale = useSharedValue(1);
  const profileAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: profileScale.value }] }));
  const profileEventHandlers = {
    onPressIn: () => { profileScale.value = withSpring(0.97); },
    onPressOut: () => { profileScale.value = withSpring(1); },
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      updateUserProfile({ imageUri: result.assets[0].uri });
    }
  };

  const handleSaveName = () => {
    if (name.trim()) {
      updateUserProfile({ name: name.trim() });
      setModalVisible(false);
    } else {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
    }
  };

  const confirmResetApp = () => {
    Alert.alert(
      'Reset Application?',
      'This will permanently delete all your notes and profile settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetApp },
      ]
    );
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* --- 1. Redesigned Profile Card --- */}
        <Animated.View style={[profileAnimatedStyle, { marginHorizontal: 16, marginBottom: 24 }]}>
          <TouchableOpacity activeOpacity={1} {...profileEventHandlers} onPress={pickImage}>
            <LinearGradient
                colors={[COLORS.surface, '#2a2a2e']}
                style={styles.profileSection}
            >
              <Image
                source={userProfile.imageUri ? { uri: userProfile.imageUri } : require('../../assets/icon.png')}
                style={styles.avatar}
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileAction}>Change profile picture</Text>
              </View>
              <Ionicons name="camera-outline" size={24} color={COLORS.textSecondary} style={{ position: 'absolute', right: 20, top: 20 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            icon="person-circle-outline"
            label="Edit Profile Name"
            onPress={() => {
              setName(userProfile.name);
              setModalVisible(true);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingsItem icon="information-circle-outline" label="About this App" onPress={() => {}}/>
          <SettingsItem icon="star-outline" label="Rate the App" onPress={() => {}}/>
          <SettingsItem icon="share-social-outline" label="Share with Friends" onPress={() => {}}/>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <SettingsItem
            icon="trash-bin-outline"
            label="Reset App"
            color={COLORS.error}
            onPress={confirmResetApp}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Your Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter new name"
              placeholderTextColor={COLORS.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveName}>
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: COLORS.text },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20, // Increased border radius
  },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: COLORS.primary },
  profileTextContainer: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  profileAction: { fontSize: 14, color: COLORS.primary, marginTop: 4 },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: { // Updated style for consistency
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemIcon: { marginRight: 16, width: 24 },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  textInput: { backgroundColor: COLORS.background, padding: 14, borderRadius: 12, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 },
  modalButton: { padding: 12, borderRadius: 8 },
  saveButton: { backgroundColor: COLORS.primary, marginLeft: 12 },
  modalButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textSecondary },
});

export default SettingsScreen;