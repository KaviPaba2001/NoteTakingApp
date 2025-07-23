import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NotesProvider } from './src/context/NotesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NotesProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </NotesProvider>
  );
}