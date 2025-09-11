import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { NotesProvider } from './src/context/NotesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.container}>
      <NotesProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </NotesProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // THIS IS CRUCIAL
  },
});
