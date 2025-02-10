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

const LoginScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const logo1 = require('../assets/logo1.png');
  const logo2 = require('../assets/logo2.png');
  const logo3 = require('../assets/logo3.png');

  const handleLogin = async () => {
    if (!cpf || !password) {
      const message = 'Preencha todos os campos';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Erro', message);
      }
      return;
    }

    try {
      const resultAction = await dispatch(login({ username: cpf, password }));
      if (login.fulfilled.match(resultAction)) {
        navigation.navigate('Home');
      }
    } catch (err) {
      const message = 'Erro ao fazer login. Tente novamente.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        <View style={styles.logoContainer}>
          <Image source={logo3} style={styles.logo} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Acesse sua conta</Text>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
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
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                loading && styles.disabledButton
              ]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.navigate('FirstAccess')}
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
    backgroundColor: '#fff',
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
    gap: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: "100%",
    height: 280,
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0', 
    borderWidth: 1, 
    borderColor: '#ccc', 
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
});

export default LoginScreen;