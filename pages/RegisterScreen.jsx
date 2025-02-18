import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // const { token } = route.params || {};
  // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYW5uYW5ob25leTUwMDBAZ21haWwuY29tIiwiZXhwIjoxNzM5MjM0NDYzfQ.l5ADAf4ejJ2_uM3Rtz9fV70KQ0k7jH5LOkpFBGvDL3"

  const [token, setToken] = useState('');

  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
      console.log("token gg",route.params.token)
    }
  }, [route.params]);


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
  const [error, setError] = useState('');

  useEffect(() => {
    if(token){
    fetchUserData();}
  }, [token]);

  const fetchUserData = async () => {
    try {
      console.log("tokdadasdaen",token)

      const response = await fetch(
        `http://localhost:8004/dados-completar-cadastro?token=${token}`,
        {
          headers: {
            accept: 'application/json',
          },
        }
      );
      console.log("tokdadasdaen",token)
      console.log("fasfas",response)
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

  const handleSubmit = async () => {
    if (!validatePassword(formData.senha)) {
      Alert.alert('Erro', 'A senha não atende aos requisitos mínimos');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch('http://localhost:8004/completar-cadastro', {
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
        console.log("response",response)  
      if (response.ok) {
        Alert.alert('Sucesso', 'Cadastro completado com sucesso');
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao completar cadastro');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao enviar dados');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack('InitialScreen')}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar senha</Text>
        </View>

        <View style={styles.formContainer}>
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
              style={[styles.input, styles.readOnlyInput]}
              value={formData.nome_usuario}
              editable={true}
              onChangeText={(text) => 
                setFormData(prev => ({ ...prev, nome_usuario: text }))
              } 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.senha}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, senha: text }));
                validatePassword(text);
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha novamente"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.confirmarSenha}
              onChangeText={(text) => 
                setFormData(prev => ({ ...prev, confirmarSenha: text }))
              }
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

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleSubmit}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
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
  // readOnlyInput: {
  //   backgroundColor: '#f5f5f5',
  //   color: '#666',
  // },
  // loadingContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
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

export default RegisterScreen;