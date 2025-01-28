import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import logo from '../assets/icon.png';

const FirstAccessScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!cpf || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    navigation.navigate('Verification')
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
        <Text style={styles.headerText}>Login</Text>
      </View>
      
      <Image source={logo} style={{ width:'100%', height:'30%', alignSelf: 'center' }} />
      <View style={styles.form}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="José dos Santos Reis"
          placeholderTextColor="#666"
          value={cpf}
          onChangeText={setCpf}
        />
        
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="seuemail@gmail.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <Text style={styles.infoText}>
          Será enviado um código de verificação para o seu email
        </Text>
        
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: '100%',
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
    fontSize: 34,
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
  infoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 24,
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

export default FirstAccessScreen;