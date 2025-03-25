import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { API_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
const RedefinirSenhaScreen = ({  }) => {
  const route = useRoute();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasEightChars: false,
    hasLettersAndNumbers: false,
  });
  const navigation = useNavigation();


    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          navigation.navigate('Login');
          return true; // Prevent default behavior
        };
    
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
        return () => 
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [navigation])
    );
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
      fetchUserData(route.params.token);
    } else {
      setLoading(false);
      setError('Token não encontrado. Solicite novamente a recuperação de senha.');
    }
  }, [route.params]);

  const fetchUserData = async (currentToken) => {
    try {
      const response = await fetch(
        `${API_URL}/dados-resetar-senha?token=${currentToken}`,
        {
          headers: {
            'accept': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
      } else {
        setError('Token inválido ou expirado');
        showMessage('Erro', 'Token inválido ou expirado');
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      showMessage('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const validatePassword = (password) => {
    const hasEightChars = password.length >= 8;
    const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)/.test(password);

    setPasswordRequirements({
      hasEightChars,
      hasLettersAndNumbers,
    });

    return hasEightChars && hasLettersAndNumbers;
  };

  const handleSubmit = async () => {
    if (!validatePassword(senha)) {
      showMessage('Erro', 'A senha não atende aos requisitos mínimos');
      return;
    }

    if (senha !== confirmarSenha) {
      showMessage('Erro', 'As senhas não coincidem');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(
        `${API_URL}/resetar-senha?token=${token}&nova_senha=${senha}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        showMessage('Sucesso', 'Senha redefinida com sucesso!');
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        showMessage('Erro', errorData.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      showMessage('Erro', 'Ocorreu um erro. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A4568" />
        <Text style={styles.loadingText}>Verificando token...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('EsqueciSenha')}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redefinir Senha</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="error" size={50} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => navigation.navigate('EsqueciSenha')}
          >
            <Text style={styles.continueButtonText}>Solicitar novo token</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('EsqueciSenha')}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redefinir Senha</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Criar nova senha</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nova Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua nova senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                validatePassword(text);
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha novamente"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>

          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Icon name="brightness-1" size={8} color="#1e3d59" />
              <Text style={styles.requirementText}>Requisitos para Senha</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon 
                name={passwordRequirements.hasEightChars ? "check" : "close"} 
                size={16} 
                color={passwordRequirements.hasEightChars ? "green" : "red"} 
              />
              <Text style={[
                styles.requirementText, 
                passwordRequirements.hasEightChars ? styles.requirementSuccess : styles.requirementFailed
              ]}>
                Deve ter 8 dígitos
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon 
                name={passwordRequirements.hasLettersAndNumbers ? "check" : "close"} 
                size={16} 
                color={passwordRequirements.hasLettersAndNumbers ? "green" : "red"} 
              />
              <Text style={[
                styles.requirementText, 
                passwordRequirements.hasLettersAndNumbers ? styles.requirementSuccess : styles.requirementFailed
              ]}>
                Deve conter letras e números
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                submitting && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Redefinir Senha</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.navigate('Login')}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Voltar para Login</Text>
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
    backgroundColor: '#FCFCFC',
  },
  scrollContainer: {
    flexGrow: 1,
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
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  requirementsList: {
    marginTop: 16,
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  requirementFailed: {
    color: 'red',
  },
  requirementSuccess: {
    color: 'green',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#1A4568',
    padding: 10,
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
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1e3d59',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});

export default RedefinirSenhaScreen;