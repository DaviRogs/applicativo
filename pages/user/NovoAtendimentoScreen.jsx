import React, { useState, useEffect } from 'react';
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
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_URL} from '@env';


const NovoAtendimentoScreen = ({ navigation, route }) => {
  const user = useSelector(state => state.user.userData);
  const authenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.accessToken);
  
  const [loading, setLoading] = useState(false);
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [existingPatientData, setExistingPatientData] = useState(null);

  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Pre-fill form if editing existing patient
  useEffect(() => {
    if (route.params?.patientData) {
      const data = route.params.patientData;
      
      setFormData({
        nome_paciente: data.nome_paciente || '',
        data_nascimento: data.data_nascimento || '',
        sexo: data.sexo === 'M' ? 'Masculino' : 
              data.sexo === 'F' ? 'Feminino' : 
              data.sexo === 'O' || data.sexo === 'NR' ? 'other' : '',
        sexo_outro: data.sexo_outro || '',
        cpf_paciente: formatCPF(data.cpf_paciente) || '',
        num_cartao_sus: data.num_cartao_sus || '',
        endereco_paciente: data.endereco_paciente || '',
        telefone_paciente: data.telefone_paciente || '',
        email_paciente: data.email_paciente || '',
        autoriza_pesquisa: data.autoriza_pesquisa !== undefined ? data.autoriza_pesquisa : null
      });
      
      // Mark as existing patient
      setPatientFound(true);
      setExistingPatientData(data);
    }
  }, [route.params]);

  // CPF formatting and validation
  useEffect(() => {
    const unformattedCpf = formData.cpf_paciente.replace(/\D/g, '');
    
    // Auto-format CPF as user types
    if (unformattedCpf.length > 0) {
      const formattedCpf = formatCPF(unformattedCpf);
      if (formattedCpf !== formData.cpf_paciente) {
        setFormData(prev => ({
          ...prev,
          cpf_paciente: formattedCpf
        }));
      }
    }

    // Check if we need to validate CPF against API
    if (unformattedCpf.length === 11 && !checkingCpf && !patientFound) {
      checkPatientByCPF(unformattedCpf);
    }
  }, [formData.cpf_paciente]);

  // Format CPF with dots and dash (e.g., 123.456.789-00)
  const formatCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, ''); // Remove non-digits
    if (cpf.length > 11) cpf = cpf.slice(0, 11);
    
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  };

  // Format phone number (e.g., (11) 98765-4321)
  const formatPhone = (phone) => {
    phone = phone.replace(/\D/g, '');
    if (phone.length > 11) phone = phone.slice(0, 11);
    
    if (phone.length <= 2) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    if (phone.length <= 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  };

  // Format SUS card number
  const formatSUS = (number) => {
    number = number.replace(/\D/g, '');
    if (number.length > 15) number = number.slice(0, 15);
    return number;
  };

  // Format and validate date
  const formatDate = (text) => {
    // Remove non-digits and non-hyphens
    let cleaned = text.replace(/[^\d-]/g, '');
    
    // Handle when user manually types hyphens
    if (text.length < formData.data_nascimento.length && text.includes('-')) {
      return cleaned;
    }
    
    // Auto-add hyphens as user types
    if (cleaned.length > 4 && cleaned.charAt(4) !== '-') {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 7 && cleaned.charAt(7) !== '-') {
      cleaned = cleaned.slice(0, 7) + '-' + cleaned.slice(7);
    }
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    return cleaned;
  };

  // Check if the patient already exists by CPF
  const checkPatientByCPF = async (cpf) => {
    try {
      setCheckingCpf(true);
      
      const response = await fetch(`${API_URL}/cadastrar-atendimento?cpf_paciente=${cpf}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Patient found, auto-fill the form
        setFormData({
          nome_paciente: data.nome_paciente || '',
          data_nascimento: data.data_nascimento || '',
          sexo: data.sexo === 'M' ? 'Masculino' : 
                data.sexo === 'F' ? 'Feminino' : 
                data.sexo === 'O' || data.sexo === 'NR' ? 'other' : '',
          sexo_outro: data.sexo_outro || '',
          cpf_paciente: formatCPF(data.cpf_paciente) || '',
          num_cartao_sus: data.num_cartao_sus || '',
          endereco_paciente: data.endereco_paciente || '',
          telefone_paciente: data.telefone_paciente || '',
          email_paciente: data.email_paciente || '',
          autoriza_pesquisa: data.autoriza_pesquisa !== undefined ? data.autoriza_pesquisa : null
        });
        
        setPatientFound(true);
        setExistingPatientData(data);
        Alert.alert(
          'Paciente Encontrado', 
          'Este paciente já está cadastrado no sistema. Os dados foram preenchidos automaticamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking CPF:', error);
    } finally {
      setCheckingCpf(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Nome validation
    if (!formData.nome_paciente.trim()) {
      newErrors.nome_paciente = 'Nome é obrigatório';
    }
    
    // Data de nascimento validation
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else {
      // Check if date is valid
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.data_nascimento)) {
        newErrors.data_nascimento = 'Data deve estar no formato YYYY-MM-DD';
      } else {
        const date = new Date(formData.data_nascimento);
        if (isNaN(date.getTime())) {
          newErrors.data_nascimento = 'Data inválida';
        } else if (date > new Date()) {
          newErrors.data_nascimento = 'A data não pode ser no futuro';
        }
      }
    }
    
    // Sexo validation
    if (!formData.sexo) {
      newErrors.sexo = 'Gênero é obrigatório';
    }
    
    if (formData.sexo === 'other' && !formData.sexo_outro) {
      newErrors.sexo_outro = 'Especifique o gênero';
    }
    
    // CPF validation
    const cpfDigits = formData.cpf_paciente.replace(/\D/g, '');
    if (!cpfDigits) {
      newErrors.cpf_paciente = 'CPF é obrigatório';
    } else if (cpfDigits.length !== 11) {
      newErrors.cpf_paciente = 'CPF deve ter 11 dígitos';
    }
    
    // SUS validation
    const susDigits = formData.num_cartao_sus.replace(/\D/g, '');
    if (!susDigits) {
      newErrors.num_cartao_sus = 'Número do cartão SUS é obrigatório';
    } else if (susDigits.length !== 15) {
      newErrors.num_cartao_sus = 'O número do SUS deve ter 15 dígitos';
    }
    
    // Address validation
    if (!formData.endereco_paciente.trim()) {
      newErrors.endereco_paciente = 'Endereço é obrigatório';
    }
    
    // Phone validation
    const phoneDigits = formData.telefone_paciente.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.telefone_paciente = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.telefone_paciente = 'Telefone deve ter entre 10 e 11 dígitos';
    }
    
    // Email validation
    if (!formData.email_paciente.trim()) {
      newErrors.email_paciente = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_paciente)) {
        newErrors.email_paciente = 'Email inválido';
      }
    }
    
    // Autoriza pesquisa validation
    if (formData.autoriza_pesquisa === null) {
      newErrors.autoriza_pesquisa = 'Selecione uma opção';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Apply special formatting based on field type
    if (field === 'cpf_paciente') {
      // CPF formatting handled in useEffect
      
      // If changing CPF and we had found a patient before, reset the found state
      // but only if the new CPF is substantially different
      const newCpfDigits = value.replace(/\D/g, '');
      const oldCpfDigits = formData.cpf_paciente.replace(/\D/g, '');
      
      if (patientFound && newCpfDigits.length >= 6 && !newCpfDigits.startsWith(oldCpfDigits.substring(0, 6))) {
        setPatientFound(false);
        setExistingPatientData(null);
      }
    } else if (field === 'telefone_paciente') {
      processedValue = formatPhone(value);
    } else if (field === 'num_cartao_sus') {
      processedValue = formatSUS(value);
    } else if (field === 'data_nascimento') {
      processedValue = formatDate(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    // On Android, when the user cancels, selectedDate will be undefined
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      handleInputChange('data_nascimento', formattedDate);
      
      // For Android, we need to hide the picker after selection
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    // If patient already exists, just navigate to the NovoPaciente screen with the existing data
    if (patientFound && existingPatientData) {
      navigation.navigate('NovoPaciente', { atendimentoData: existingPatientData });
      return;
    }

    setLoading(true);

    try {
      const cpfDigits = formData.cpf_paciente.replace(/\D/g, '');
      const phoneDigits = formData.telefone_paciente.replace(/\D/g, '');
      const susDigits = formData.num_cartao_sus.replace(/\D/g, '');

      const response = await fetch(`${API_URL}/cadastrar-atendimento`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          cpf_paciente: cpfDigits,
          telefone_paciente: phoneDigits,
          num_cartao_sus: susDigits,
          sexo: formData.sexo === 'Feminino' ? 'F' : formData.sexo === 'Masculino' ? 'M' : 'O'
        })
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

  // Function to parse date string to Date object safely
  const parseDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      // Month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      return new Date();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
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

          {patientFound && (
            <View style={styles.patientFoundBanner}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.patientFoundText}>Paciente já cadastrado no sistema</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF <Text style={styles.required}>*</Text></Text>
            <View style={styles.cpfContainer}>
            <TextInput
              style={[styles.input, styles.cpfInput, errors.cpf_paciente && styles.inputError]}
              placeholder="ex.: 987.654.321-00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.cpf_paciente}
              onChangeText={(text) => handleInputChange('cpf_paciente', text)}
              maxLength={14} 
            />
            {checkingCpf && (
              <ActivityIndicator size="small" color="#1e3d59" style={styles.cpfIndicator} />
            )}
          </View>
            {errors.cpf_paciente && (
              <Text style={styles.errorText}>{errors.cpf_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do paciente <Text style={styles.required}>*</Text></Text>
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
            <Text style={styles.label}>Data de nascimento <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.dateInputContainer, 
              errors.data_nascimento && styles.inputErrorContainer
            ]}>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={formData.data_nascimento}
                onChangeText={(text) => handleInputChange('data_nascimento', text)}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.calendarIcon}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowDatePicker(true);
                }}
              >
                <Icon name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={parseDate(formData.data_nascimento)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            {errors.data_nascimento && (
              <Text style={styles.errorText}>{errors.data_nascimento}</Text>
            )}
            <Text style={styles.helperText}>Formato: YYYY-MM-DD (ex: 1990-01-31)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Como que gênero você se identifica? <Text style={styles.required}>*</Text></Text>
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
              </TouchableOpacity>cpfC

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
            {errors.sexo_outro && (
              <Text style={styles.errorText}>{errors.sexo_outro}</Text>
            )}
          </View>



          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do Cartão SUS <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.num_cartao_sus && styles.inputError]}
              placeholder="ex.: 898758112990003"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.num_cartao_sus}
              onChangeText={(text) => handleInputChange('num_cartao_sus', text)}
              maxLength={15}
            />
            {errors.num_cartao_sus && (
              <Text style={styles.errorText}>{errors.num_cartao_sus}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço completo <Text style={styles.required}>*</Text></Text>
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
            <Text style={styles.label}>Telefone de contato <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.telefone_paciente && styles.inputError]}
              placeholder="ex.: (11) 99982-8989"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.telefone_paciente}
              onChangeText={(text) => handleInputChange('telefone_paciente', text)}
              maxLength={15} // (11) 98765-4321 (15 characters with formatting)
            />
            {errors.telefone_paciente && (
              <Text style={styles.errorText}>{errors.telefone_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail para retorno <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.email_paciente && styles.inputError]}
              placeholder="ex.: joao@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={formData.email_paciente}
              onChangeText={(text) => handleInputChange('email_paciente', text)}
              autoCapitalize="none"
            />
            {errors.email_paciente && (
              <Text style={styles.errorText}>{errors.email_paciente}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Autoriza o uso dos seus dados anonimizados para fins de pesquisa? <Text style={styles.required}>*</Text></Text>
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
              <Text style={styles.submitButtonText}>
                {patientFound ? 'Continuar com paciente existente' : 'Enviar atendimento'}
              </Text>
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
    paddingTop: Platform.OS === 'ios' ? 44 : 26,
    height: Platform.OS === 'ios' ? 90 : 90,
    paddingHorizontal: 16,
  },
  closeButton: {
    marginRight: 16,
    padding: 4,
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
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
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
  inputErrorContainer: {
    borderBottomColor: '#ff0000',
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
  cpfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cpfInput: {
    flex: 1, 
  },
  cpfIndicator: {
    marginLeft: 8, 
  },
  submitButton: {
    backgroundColor: '#1e3d59',
    padding: 12,
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
  patientFoundBanner: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientFoundText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500'
  },
});

export default NovoAtendimentoScreen;