import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const VerificationScreen = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(false);

  const handleVerification = () => {
    if (verificationCode.length < 6) {
      setError(true);
      return;
    }
    navigation.navigate('CreatePassword');
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
        <Text style={styles.label}>Código de verificação</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="********"
          value={verificationCode}
          onChangeText={(text) => {
            setVerificationCode(text);
            setError(false);
          }}
          keyboardType="number-pad"
          maxLength={8}
        />
        
        {error && (
          <Text style={styles.errorText}>Código incorreto</Text>
        )}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleVerification}
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
  inputError: {
    borderBottomColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
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

export default VerificationScreen;