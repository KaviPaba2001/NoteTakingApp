import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS, CATEGORIES } from '../utils/constants';
import { BlurView } from 'expo-blur';

const CategoryPicker = ({ selectedCategory, onCategorySelect, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedCat = CATEGORIES.find(cat => cat.id === selectedCategory) || CATEGORIES[CATEGORIES.length - 1];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && { backgroundColor: item.color + '20' },
      ]}
      onPress={() => {
        onCategorySelect(item.id);
        setModalVisible(false);
      }}
    >
      <Ionicons name={item.icon} size={24} color={item.color} />
      <Text style={[styles.categoryName, { color: item.color }]}>{item.name}</Text>
      {selectedCategory === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={item.color} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.selector, { borderColor: selectedCat.color }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name={selectedCat.icon} size={20} color={selectedCat.color} />
        <Text style={[styles.selectedText, { color: selectedCat.color }]}>
          {selectedCat.name}
        </Text>
        <Ionicons name="chevron-down" size={22} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  selectedText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategoryPicker;