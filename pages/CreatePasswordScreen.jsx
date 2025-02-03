import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CreatePasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const validatePassword = (pass) => {
    const newErrors = [];
    if (pass.length < 8) newErrors.push('deveria ter tamanho mínimo de 8 caracteres');
    if (!/[A-Z]/.test(pass)) newErrors.push(' pelo menos uma letra maiúscula');
    if (!/[0-9]/.test(pass)) newErrors.push(' pelo menos um número');
    return newErrors;
  };

  const handleContinue = () => {
    const passwordErrors = validatePassword(password);
    if (password !== confirmPassword) {
      passwordErrors.push('Senhas não conferem');
    }
    setErrors(passwordErrors);
    
    if (passwordErrors.length === 0) {
      navigation.navigate('SuccessScreen');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Primeiro acesso</Text>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        
        <View style={styles.requirementsList}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              ✗ {error}
            </Text>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.linkText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#003366',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  requirementsList: {
    marginBottom: 24,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#003366',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    color: '#003366',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CreatePasswordScreen;