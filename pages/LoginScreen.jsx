import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { login } from '../store/authSlice';
import { fetchCurrentUser } from '../store/userSlice';

const LoginScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { loading: userLoading, error: userError } = useSelector((state) => state.user);
  
  const logo1 = require('../assets/logo1.png');
  const logo2 = require('../assets/logo2.png');
  const dermaAlert = require('../assets/dermaalert.png');

  const showError = (message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Erro', message);
    }
  };

  const handleLogin = async () => {
    if (!cpf || !password) {
      showError('Preencha todos os campos');
      return;
    }

    try {
      // First attempt login
      const loginResult = await dispatch(login({ username: cpf, password }));
      
      if (login.fulfilled.match(loginResult)) {
        // If login successful, fetch user data
        const userResult = await dispatch(fetchCurrentUser());
        
        if (fetchCurrentUser.fulfilled.match(userResult)) {
          // Only navigate if both login and user fetch are successful
          navigation.navigate('Home');
        } else {
          // If user fetch fails, show the error
          showError(userResult.payload || 'Erro ao carregar dados do usuário');
        }
      } else {
        // Show login error
        showError(loginResult.payload || 'Credenciais inválidas');
      }
    } catch (err) {
      showError('Erro ao fazer login. Tente novamente.');
    }
  };

  // Determine if loading state is active
  const isLoading = authLoading || userLoading;

  // Combine errors for display
  const errorMessage = authError || userError;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('InitialScreen')}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        <View style={styles.logoContainer}>
          <Image source={dermaAlert} style={styles.logo} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Acesse sua conta</Text>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CPF"
              placeholderTextColor="#999"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              maxLength={11}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                isLoading && styles.disabledButton
              ]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.navigate('FirstAccess')}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Não possuo cadastro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#FCFCFC'

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
    // gap: 20,
    // marginTop: 20,
    // marginBottom: 40,
  },
  logo: {
    width: "100%",
    height: 280,
    resizeMode: 'contain',
    backgroundColor:'FCFCFC',
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
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#1e3d59',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1e3d59',
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LoginScreen;