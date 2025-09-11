import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../context/NotesContext';
import { COLORS } from '../utils/constants';

const SignupScreen = ({ navigation }) => {
  const { register, loading } = useNotes();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const { name, email, password } = formData;
    
    const result = await register(email, password, { name });
    
    if (result.success) {
      Alert.alert(
        '🎉 Account Created Successfully!',
        'Your account has been created. Please sign in to continue.',
        [
          {
            text: 'Sign In Now',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert('Signup Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Welcome')}
                >
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join us and start taking notes</Text>
              </View>

              {/* Signup Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.signupButton, loading && styles.disabledButton]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signupButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20 },
  header: { alignItems: 'center', marginBottom: 40, position: 'relative' },
  backButton: { position: 'absolute', left: 0, top: 0, padding: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  form: { marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15, paddingHorizontal: 15, paddingVertical: 5, marginBottom: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  input: { flex: 1, paddingVertical: 15, paddingHorizontal: 10, fontSize: 16, color: '#ffffff' },
  eyeIcon: { padding: 5 },
  signupButton: {
    backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 15, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', marginTop: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4.65
  },
  disabledButton: { backgroundColor: 'rgba(255,255,255,0.5)' },
  signupButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '600', marginRight: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  loginLink: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
});

export default SignupScreen;
