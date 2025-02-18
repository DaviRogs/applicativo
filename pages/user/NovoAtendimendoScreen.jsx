import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NovoAtendimentoScreen = ({ navigation }) => {
  const [gender, setGender] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo atendimento</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Identificação do paciente</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do paciente</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: José dos Santos Reis"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: 03/09/1995"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Como que gênero você se identifica?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setGender('Feminino')}
              >
                <View style={[
                  styles.radioCircle,
                  gender === 'Feminino' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Feminino</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setGender('Masculino')}
              >
                <View style={[
                  styles.radioCircle,
                  gender === 'Masculino' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Masculino</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setGender('prefer-not')}
              >
                <View style={[
                  styles.radioCircle,
                  gender === 'prefer-not' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Prefiro não responder</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setGender('other')}
              >
                <View style={[
                  styles.radioCircle,
                  gender === 'other' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Outro</Text>
              </TouchableOpacity>
              
              {gender === 'other' && (
                <TextInput
                  style={[styles.input, styles.otherInput]}
                  placeholder="Digite aqui"
                  placeholderTextColor="#999"
                />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: 987.654.321-00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do Cartão SUS</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: 898758112990003"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço completo</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: Rua 25, Casa 12, Jardins"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone de contato</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: (11) 99982-8989"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail para retorno</Text>
            <TextInput
              style={styles.input}
              placeholder="ex.: joao@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Autoriza o uso dos seus dados anonimizados para fins de pesquisa?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radioCircle} />
                <Text style={styles.radioText}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radioCircle} />
                <Text style={styles.radioText}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={() => {navigation.navigate('NovoPaciente')}}>
            <Text style={styles.submitButtonText}>Enviar atendimento</Text>
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
    paddingHorizontal: 16,
  },
  closeButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    fontSize: 14,
    color: '#333',
    paddingLeft: 0,
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e3d59',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#1e3d59',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  otherInput: {
    marginTop: 8,
    marginLeft: 28,
  },
  submitButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NovoAtendimentoScreen;