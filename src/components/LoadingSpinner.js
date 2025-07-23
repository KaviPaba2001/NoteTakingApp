import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

const LoadingSpinner = ({ size = 'large', color = COLORS.primary }) => {
  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.background]}
      style={styles.container}
    >
      <ActivityIndicator size={size} color={color} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});

export default LoadingSpinner;