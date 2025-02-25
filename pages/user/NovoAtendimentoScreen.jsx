import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const NovoAtendimentoScreen = ({ navigation }) => {
  const user = useSelector(state => state.user.userData);
  const authenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.accessToken);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_paciente: '',
    data_nascimento: '',
    sexo: '',
    sexo_outro: '',
    cpf_paciente: '',
    num_cartao_sus: '',
    endereco_paciente: '',
    telefone_paciente: '',
    email_paciente: '',
    autoriza_pesquisa: null
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome_paciente.trim()) {
      newErrors.nome_paciente = 'Nome é obrigatório';
    }
    
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    }
    
    if (!formData.sexo) {
      newErrors.sexo = 'Gênero é obrigatório';
    }
    
    if (formData.sexo === 'other' && !formData.sexo_outro) {
      newErrors.sexo_outro = 'Especifique o gênero';
    }
    
    if (!formData.cpf_paciente) {
      newErrors.cpf_paciente = 'CPF é obrigatório';
    }
    
    if (!formData.num_cartao_sus) {
      newErrors.num_cartao_sus = 'Número do cartão SUS é obrigatório';
    }
    
    if (!formData.endereco_paciente) {
      newErrors.endereco_paciente = 'Endereço é obrigatório';
    }
    
    if (!formData.telefone_paciente) {
      newErrors.telefone_paciente = 'Telefone é obrigatório';
    }
    
    if (!formData.email_paciente) {
      newErrors.email_paciente = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_paciente)) {
        newErrors.email_paciente = 'Email inválido';
      }
    }
    
    if (formData.autoriza_pesquisa === null) {
      newErrors.autoriza_pesquisa = 'Selecione uma opção';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDateInputChange = (value) => {
    handleInputChange('data_nascimento', value);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8004/cadastrar-atendimento', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          data_nascimento: formData.data_nascimento,
          sexo: formData.sexo === 'Feminino' ? 'F' : formData.sexo === 'Masculino' ? 'M' : 'O'
        })
      });
      console.log("eajwewjak weleklawejaklwe",{
        ...formData,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo === 'Feminino' ? 'F' : formData.sexo === 'Masculino' ? 'M' : 'O'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cadastrar atendimento');
      }

      navigation.navigate('NovoPaciente', { atendimentoData: data });

    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao enviar formulário');
    } finally {
      setLoading(false);
    }
  };

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
              style={[styles.input, errors.nome_paciente && styles.inputError]}
              placeholder="ex.: José dos Santos Reis"
              placeholderTextColor="#999"
              value={formData.nome_paciente}
              onChangeText={(text) => handleInputChange('nome_paciente', text)}
            />
            {errors.nome_paciente && (
              <Text style={styles.errorText}>{errors.nome_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de nascimento</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.dateInput, errors.data_nascimento && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={formData.data_nascimento}
                onChangeText={handleDateInputChange}
                inputMode="numeric"
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.calendarIcon}
                onPress={() => {
                  // Create an input element of type date and trigger it
                  if (Platform.OS === 'web') {
                    const input = document.createElement('input');
                    input.type = 'date';
                    input.onchange = (e) => {
                      handleDateInputChange(e.target.value);
                    };
                    input.click();
                  }
                }}
              >
                <Icon name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {errors.data_nascimento && (
              <Text style={styles.errorText}>{errors.data_nascimento}</Text>
            )}
            <Text style={styles.helperText}>Formato: YYYY-MM-DD (ex: 1990-01-31)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Como que gênero você se identifica?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('sexo', 'Feminino')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.sexo === 'Feminino' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Feminino</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('sexo', 'Masculino')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.sexo === 'Masculino' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Masculino</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('sexo', 'other')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.sexo === 'other' && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Outro</Text>
              </TouchableOpacity>
              
              {formData.sexo === 'other' && (
                <TextInput
                  style={[styles.input, styles.otherInput, errors.sexo_outro && styles.inputError]}
                  placeholder="Digite aqui"
                  placeholderTextColor="#999"
                  value={formData.sexo_outro}
                  onChangeText={(text) => handleInputChange('sexo_outro', text)}
                />
              )}
            </View>
            {errors.sexo && (
              <Text style={styles.errorText}>{errors.sexo}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, errors.cpf_paciente && styles.inputError]}
              placeholder="ex.: 987.654.321-00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.cpf_paciente}
              onChangeText={(text) => handleInputChange('cpf_paciente', text)}
            />
            {errors.cpf_paciente && (
              <Text style={styles.errorText}>{errors.cpf_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do Cartão SUS</Text>
            <TextInput
              style={[styles.input, errors.num_cartao_sus && styles.inputError]}
              placeholder="ex.: 898758112990003"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.num_cartao_sus}
              onChangeText={(text) => handleInputChange('num_cartao_sus', text)}
            />
            {errors.num_cartao_sus && (
              <Text style={styles.errorText}>{errors.num_cartao_sus}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço completo</Text>
            <TextInput
              style={[styles.input, errors.endereco_paciente && styles.inputError]}
              placeholder="ex.: Rua 25, Casa 12, Jardins"
              placeholderTextColor="#999"
              value={formData.endereco_paciente}
              onChangeText={(text) => handleInputChange('endereco_paciente', text)}
            />
            {errors.endereco_paciente && (
              <Text style={styles.errorText}>{errors.endereco_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone de contato</Text>
            <TextInput
              style={[styles.input, errors.telefone_paciente && styles.inputError]}
              placeholder="ex.: (11) 99982-8989"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.telefone_paciente}
              onChangeText={(text) => handleInputChange('telefone_paciente', text)}
            />
            {errors.telefone_paciente && (
              <Text style={styles.errorText}>{errors.telefone_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail para retorno</Text>
            <TextInput
              style={[styles.input, errors.email_paciente && styles.inputError]}
              placeholder="ex.: joao@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={formData.email_paciente}
              onChangeText={(text) => handleInputChange('email_paciente', text)}
            />
            {errors.email_paciente && (
              <Text style={styles.errorText}>{errors.email_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Autoriza o uso dos seus dados anonimizados para fins de pesquisa?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('autoriza_pesquisa', true)}
              >
                <View style={[
                  styles.radioCircle,
                  formData.autoriza_pesquisa === true && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleInputChange('autoriza_pesquisa', false)}
              >
                <View style={[
                  styles.radioCircle,
                  formData.autoriza_pesquisa === false && styles.radioSelected
                ]} />
                <Text style={styles.radioText}>Não</Text>
              </TouchableOpacity>
            </View>
            {errors.autoriza_pesquisa && (
              <Text style={styles.errorText}>{errors.autoriza_pesquisa}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar atendimento</Text>
            )}
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
    paddingLeft: 0,
  },
  calendarIcon: {
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputError: {
    borderBottomColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NovoAtendimentoScreen;