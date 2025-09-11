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

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useNotes();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('❌ Error', 'Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    
    if (!result.success) {
      // Show detailed error message
      Alert.alert(
        '🚫 Login Failed', 
        result.error,
        [
          {
            text: 'Try Again',
            style: 'default'
          },
          {
            text: 'Create Account',
            onPress: () => navigation.navigate('Signup'),
            style: 'default'
          }
        ]
      );
    }
    // If successful, authentication state change will handle navigation automatically
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={password}
                    onChangeText={setPassword}
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

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
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
  loginButton: {
    backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 15, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', marginTop: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4.65
  },
  disabledButton: { backgroundColor: 'rgba(255,255,255,0.5)' },
  loginButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '600', marginRight: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  signupLink: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
});

export default LoginScreen;
