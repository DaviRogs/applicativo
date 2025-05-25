import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchCurrentUser } from '../store/userSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from '@env';
const LoginScreen = () => {
  const [cpf, setCpf] = useState('');
  const [formattedCpf, setFormattedCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { loading: userLoading, error: userError } = useSelector(
    (state) => state.user,
  );
  const navigation = useNavigation();

  // const logo1 = require('../assets/logo1.png');
  // const logo2 = require('../assets/logo2.png');
  const dermaAlert = require('../assets/dermaalert.png');

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('InitialScreen');
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Format CPF as user types (XXX.XXX.XXX-XX)
  const formatCPF = (text) => {
    // Remove all non-digit characters
    const cleanedText = text.replace(/\D/g, '');
    setCpf(cleanedText);

    // Format with dots and dash
    let formatted = cleanedText;
    if (cleanedText.length > 3) {
      formatted = cleanedText.substring(0, 3) + '.' + formatted.substring(3);
    }
    if (cleanedText.length > 6) {
      formatted = formatted.substring(0, 7) + '.' + formatted.substring(7);
    }
    if (cleanedText.length > 9) {
      formatted = formatted.substring(0, 11) + '-' + formatted.substring(11);
    }

    setFormattedCpf(formatted);
  };

  const showError = (message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Erro', message);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Direct API login function
  /*
  const performLogin = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');

      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('accessToken', data.access_token);
      await AsyncStorage.setItem('refreshToken', data.refresh_token);

      // Update the Redux store with authentication state
      dispatch({
        type: 'auth/loginSuccess',
        payload: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
      });

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  */
  const handleLogin = async () => {
    animateButton();
    Keyboard.dismiss();

    if (!cpf || !password) {
      showError('Preencha todos os campos');
      return;
    }

    if (cpf.length < 11) {
      showError('CPF inválido. Deve conter 11 dígitos.');
      return;
    }

    try {
      // const loginData = await performLogin(cpf, password);

      const userResult = await dispatch(fetchCurrentUser());

      if (fetchCurrentUser.fulfilled.match(userResult)) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          navigation.navigate('Home');
        });
      } else {
        setError(userResult.payload || 'Erro ao carregar dados do usuário');
        showError(userResult.payload || 'Erro ao carregar dados do usuário');
      }
    } catch (err) {
      setError(err.message || 'Credenciais inválidas');
      showError(err.message || 'Credenciais inválidas');
    }
  };

  const isLoading = loading || userLoading;

  const errorMessage = error || userError;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('InitialScreen')}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image source={dermaAlert} style={styles.logo} />
        </Animated.View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.formTitle}>Acesse sua conta</Text>

          {errorMessage && (
            <Animated.View entering={Animated.spring({ velocity: 0.3 })}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CPF (000.000.000-00)"
              placeholderTextColor="#999"
              value={formattedCpf}
              onChangeText={formatCPF}
              keyboardType="numeric"
              maxLength={14} // Account for formatting characters
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
                style={styles.visibilityToggle}
              >
                <Icon
                  name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('EsqueciSenha')}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.continueButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: 26,
    height: 90,
    paddingLeft: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    backgroundColor: 'FCFCFC',
    borderWidth: 0,
  },
  formContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 0,
    padding: 10,
    bottom: 8,
  },
  forgotPasswordText: {
    color: '#1e3d59',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#1A4568',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,0,0,0.05)',
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LoginScreen;
