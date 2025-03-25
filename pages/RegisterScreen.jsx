import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_URL } from '@env';
import { BackHandler } from 'react-native';

const RegisterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [token, setToken] = useState('');
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Login');
        return true; 
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
      console.log("token gg", route.params.token);
    }
  }, [route.params]);

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
      })
    ]).start();
  }, []);

  const [formData, setFormData] = useState({
    nome_usuario: '',
    email: '',
    cpf: '',
    nome_unidade_saude: '',
    senha: '',
    confirmarSenha: '',
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    hasEightChars: false,
    hasLettersAndNumbers: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if(token){
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      console.log("tokdadasdaen", token);

      const response = await fetch(
        `${API_URL}/dados-completar-cadastro?token=${token}`,
        {
          headers: {
            accept: 'application/json',
          },
        }
      );
      console.log("fasfas", response);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          nome_usuario: data.nome_usuario,
          email: data.email,
          cpf: data.cpf,
          nome_unidade_saude: data.nome_unidade_saude,
        }));
      } else {
        setError('Token inválido ou expirado');
        Alert.alert('Erro', 'Token inválido ou expirado');
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
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

  const handleSubmit = async () => {
    animateButton();
    
    if (!validatePassword(formData.senha)) {
      Alert.alert('Erro', 'A senha não atende aos requisitos mínimos');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/completar-cadastro`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          nome_usuario: formData.nome_usuario,
          senha: formData.senha,
        }),
      });
      console.log("response", response);  
      if (response.ok) {
        Alert.alert('Sucesso', 'Cadastro completado com sucesso');
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao completar cadastro');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao enviar dados');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3d59" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              animateButton();
              navigation.goBack('InitialScreen');
            }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar senha</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.formTitle}>Finalizar cadastro</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.cpf}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da unidade de saude</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.nome_unidade_saude}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={formData.nome_usuario}
              editable={true}
              onChangeText={(text) => 
                setFormData(prev => ({ ...prev, nome_usuario: text }))
              } 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                value={formData.senha}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, senha: text }));
                  validatePassword(text);
                }}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Icon 
                  name={passwordVisible ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Digite sua senha novamente"
                placeholderTextColor="#999"
                secureTextEntry={!confirmPasswordVisible}
                value={formData.confirmarSenha}
                onChangeText={(text) => 
                  setFormData(prev => ({ ...prev, confirmarSenha: text }))
                }
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                <Icon 
                  name={confirmPasswordVisible ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View 
            style={styles.requirementsList}
            entering={Animated.spring({ velocity: 0.3 })}
          >
            <View style={styles.requirementItem}>
              <Icon name="brightness-1" size={8} color="#1e3d59" />
              <Text style={styles.requirementText}>Requisitos para Senha</Text>
            </View>
            <View style={styles.requirementItem}>
              <Animated.View style={{
                transform: [{ 
                  scale: passwordRequirements.hasEightChars ? 1.1 : 1 
                }]
              }}>
                <Icon 
                  name={passwordRequirements.hasEightChars ? "check" : "close"} 
                  size={16} 
                  color={passwordRequirements.hasEightChars ? "green" : "red"} 
                />
              </Animated.View>
              <Text style={[
                styles.requirementText, 
                passwordRequirements.hasEightChars ? styles.requirementSuccess : styles.requirementFailed
              ]}>
                Deve ter 8 dígitos
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Animated.View style={{
                transform: [{ 
                  scale: passwordRequirements.hasLettersAndNumbers ? 1.1 : 1 
                }]
              }}>
                <Icon 
                  name={passwordRequirements.hasLettersAndNumbers ? "check" : "close"} 
                  size={16} 
                  color={passwordRequirements.hasLettersAndNumbers ? "green" : "red"} 
                />
              </Animated.View>
              <Text style={[
                styles.requirementText, 
                passwordRequirements.hasLettersAndNumbers ? styles.requirementSuccess : styles.requirementFailed
              ]}>
                Deve conter letras e números
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Continuar</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Login')}
            disabled={submitting}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1e3d59',
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
    borderRadius: 4,
    paddingLeft: 8,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40, // Space for the toggle button
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    padding: 10,
    zIndex: 1,
  },
  requirementsList: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
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
  continueButton: {
    backgroundColor: '#1A4568',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
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

export default RegisterScreen;