import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar senha</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Finalizar cadastro</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: digite seu nome aqui"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CNES</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: digite seu nome aqui"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Icon name="brightness-1" size={8} color="#1e3d59" />
              <Text style={styles.requirementText}> Reqisuitos pra Senha
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="close" size={16} color="red" />
              <Text style={[styles.requirementText, styles.requirementFailed]}>
                Deve ter 8 digitos
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check" size={16} color="green" />
              <Text style={[styles.requirementText, styles.requirementSuccess]}>
               deve conter letras e números
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton}>
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