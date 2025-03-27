import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressSteps from '../../../components/ProgressBar';
import { atualizarQuestoesGerais, avancarEtapa } from '../../../store/anamnesisSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const QuestoesGeraisSaude = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const questoesGeraisState = useSelector(state => state.anamnesis.questoesGerais);
  const progressoQuestionario = useSelector(state => state.anamnesis.progressoQuestionario);
  
  const [formData, setFormData] = useState(questoesGeraisState);
  const [errors, setErrors] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('NovoPaciente');
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleDoencaCronicaChange = (doenca) => {
    setFormData(prev => ({
      ...prev,
      listaDoencasCronicas: {
        ...prev.listaDoencasCronicas,
        [doenca]: !prev.listaDoencasCronicas[doenca]
      }
    }));
  };

  const handleFrequenciaAtividade = (frequencia) => {
    setFormData(prev => ({
      ...prev,
      frequenciaAtividadeFisica: frequencia
    }));
  };

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.doencasCronicas) {
      formErrors.doencasCronicas = "Por favor, responda se possui doenças crônicas";
    }
    
    if (formData.doencasCronicas === 'sim') {
      const temDoencaSelecionada = Object.values(formData.listaDoencasCronicas).some(value => 
        value === true && typeof value === 'boolean');
      
      if (!temDoencaSelecionada) {
        formErrors.listaDoencasCronicas = "Selecione pelo menos uma doença crônica";
      }
      
      if (formData.listaDoencasCronicas.outras && !formData.listaDoencasCronicas.outrasTexto) {
        formErrors.outrasDoencas = "Por favor, especifique outras doenças crônicas";
      }
    }
    
    if (!formData.cancer) {
      formErrors.cancer = "Por favor, responda se já foi diagnosticado com câncer";
    }
    
    if (formData.cancer === 'sim' && !formData.tipoCancer) {
      formErrors.tipoCancer = "Por favor, especifique o tipo de câncer";
    }
    
    if (!formData.medicamentos) {
      formErrors.medicamentos = "Por favor, responda se faz uso de medicamentos";
    }
    
    if (formData.medicamentos === 'sim' && !formData.listaMedicamentos) {
      formErrors.listaMedicamentos = "Por favor, liste os medicamentos utilizados";
    }
    
    if (!formData.alergias) {
      formErrors.alergias = "Por favor, responda se possui alergias";
    }
    
    if (formData.alergias === 'sim' && !formData.listaAlergias) {
      formErrors.listaAlergias = "Por favor, liste as alergias";
    }
    
    if (!formData.cirurgias) {
      formErrors.cirurgias = "Por favor, responda se já passou por cirurgias dermatológicas";
    }
    
    if (formData.cirurgias === 'sim' && !formData.listaCirurgias) {
      formErrors.listaCirurgias = "Por favor, liste os procedimentos cirúrgicos";
    }
    
    if (!formData.atividadeFisica) {
      formErrors.atividadeFisica = "Por favor, responda se pratica atividade física";
    }
    
    if (formData.atividadeFisica === 'sim' && !formData.frequenciaAtividadeFisica) {
      formErrors.frequenciaAtividadeFisica = "Por favor, selecione a frequência de atividades físicas";
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAdvance = () => {
    if (validateForm()) {
      dispatch(atualizarQuestoesGerais(formData));
      dispatch(avancarEtapa());
      
      navigation.navigate('AvaliacaoFototipo');
    } else {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os campos obrigatórios antes de avançar.",
        [{ text: "OK" }]
      );
    }
  };

  const renderRadioGroup = (field, label, errorKey) => (
    <View style={styles.radioGroupContainer}>
      <View style={styles.radioGroup}>
        <TouchableOpacity 
          style={styles.radioOption}
          onPress={() => setFormData(prev => ({ ...prev, [field]: 'sim' }))}
        >
          <View style={[
            styles.radioCircle,
            formData[field] === 'sim' && styles.radioSelected
          ]} />
          <Text style={styles.radioText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.radioOption}
          onPress={() => setFormData(prev => ({ ...prev, [field]: 'não' }))}
        >
          <View style={[
            styles.radioCircle,
            formData[field] === 'não' && styles.radioSelected
          ]} />
          <Text style={styles.radioText}>Não</Text>
        </TouchableOpacity>
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese</Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressSteps 
          currentStep={1} 
          totalSteps={5}
          stepLabels={["Questões Gerais", "Avaliação Fototipo", "Histórico Câncer", "Fatores de Risco", "Revisão"]}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Questões gerais de saúde</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você tem histórico de doenças crônicas?</Text>
          {renderRadioGroup('doencasCronicas', 'Doenças crônicas', 'doencasCronicas')}

          {formData.doencasCronicas === 'sim' && (
            <View style={styles.checkboxGroup}>
              <Text style={styles.subQuestion}>Se sim, quais?</Text>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('hipertensao')}
              >
                <View style={[
                  styles.checkbox,
                  formData.listaDoencasCronicas.hipertensao && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Hipertensão</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('diabetes')}
              >
                <View style={[
                  styles.checkbox,
                  formData.listaDoencasCronicas.diabetes && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Diabetes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('cardiopatia')}
              >
                <View style={[
                  styles.checkbox,
                  formData.listaDoencasCronicas.cardiopatia && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Cardiopatias</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('outras')}
              >
                <View style={[
                  styles.checkbox,
                  formData.listaDoencasCronicas.outras && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Outras</Text>
              </TouchableOpacity>
              {formData.listaDoencasCronicas.outras && (
                <TextInput
                  style={styles.conditionalInput}
                  placeholder="ex.: Colesterol"
                  placeholderTextColor="#999"
                  value={formData.listaDoencasCronicas.outrasTexto}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    listaDoencasCronicas: {
                      ...prev.listaDoencasCronicas,
                      outrasTexto: text
                    }
                  }))}
                />
              )}
              {errors.listaDoencasCronicas && (
                <Text style={styles.errorText}>{errors.listaDoencasCronicas}</Text>
              )}
              {errors.outrasDoencas && (
                <Text style={styles.errorText}>{errors.outrasDoencas}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já foi diagnosticado com câncer anteriormente?</Text>
          {renderRadioGroup('cancer', 'Diagnóstico prévio de câncer', 'cancer')}
          
          {formData.cancer === 'sim' && (
            <View>
              <Text style={styles.subQuestion}>Se sim, qual tipo de câncer?</Text>
              <TextInput
                style={styles.conditionalInput}
                placeholder="ex.: Câncer de mama"
                placeholderTextColor="#999"
                value={formData.tipoCancer}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  tipoCancer: text
                }))}
              />
              {errors.tipoCancer && <Text style={styles.errorText}>{errors.tipoCancer}</Text>}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você faz uso regular de medicamentos?</Text>
          {renderRadioGroup('medicamentos', 'Uso de medicamentos', 'medicamentos')}
          
          {formData.medicamentos === 'sim' && (
            <View>
              <Text style={styles.subQuestion}>Se sim, quais medicamentos?</Text>
              <TextInput
                style={styles.conditionalInput}
                placeholder="ex.: Losartana, Enalapril"
                placeholderTextColor="#999"
                value={formData.listaMedicamentos}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  listaMedicamentos: text
                }))}
              />
              {errors.listaMedicamentos && <Text style={styles.errorText}>{errors.listaMedicamentos}</Text>}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você possui alergias?</Text>
          {renderRadioGroup('alergias', 'Alergias', 'alergias')}
          
          {formData.alergias === 'sim' && (
            <View>
              <Text style={styles.subQuestion}>Se sim, a que substâncias?</Text>
              <TextInput
                style={styles.conditionalInput}
                placeholder="ex.: Ibuprofeno, Polen, Leite"
                placeholderTextColor="#999"
                value={formData.listaAlergias}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  listaAlergias: text
                }))}
              />
              {errors.listaAlergias && <Text style={styles.errorText}>{errors.listaAlergias}</Text>}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já passou por cirurgias dermatológicas?</Text>
          {renderRadioGroup('cirurgias', 'Cirurgias dermatológicas', 'cirurgias')}
          
          {formData.cirurgias === 'sim' && (
            <View>
              <Text style={styles.subQuestion}>Se sim, qual foi o procedimento?</Text>
              <TextInput
                style={styles.conditionalInput}
                placeholder="ex.: Remoção de nevos, Criocirurgia"
                placeholderTextColor="#999"
                value={formData.listaCirurgias}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  listaCirurgias: text
                }))}
              />
              {errors.listaCirurgias && <Text style={styles.errorText}>{errors.listaCirurgias}</Text>}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você pratica atividade física regularmente?</Text>
          {renderRadioGroup('atividadeFisica', 'Atividade física', 'atividadeFisica')}
          
          {formData.atividadeFisica === 'sim' && (
            <View style={styles.checkboxGroup}>
              <Text style={styles.subQuestion}>Se sim, com que frequência?</Text>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleFrequenciaAtividade('Diária')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.frequenciaAtividadeFisica === 'Diária' && styles.radioSelected
                ]} />
                <Text style={styles.checkboxText}>Diária</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleFrequenciaAtividade('Frequente')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.frequenciaAtividadeFisica === 'Frequente' && styles.radioSelected
                ]} />
                <Text style={styles.checkboxText}>Frequente</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleFrequenciaAtividade('Moderada')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.frequenciaAtividadeFisica === 'Moderada' && styles.radioSelected
                ]} />
                <Text style={styles.checkboxText}>Moderada</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleFrequenciaAtividade('Ocasional')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.frequenciaAtividadeFisica === 'Ocasional' && styles.radioSelected
                ]} />
                <Text style={styles.checkboxText}>Ocasional</Text>
              </TouchableOpacity>
              {errors.frequenciaAtividadeFisica && <Text style={styles.errorText}>{errors.frequenciaAtividadeFisica}</Text>}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.advanceButton}
          onPress={handleAdvance}
        >
          <Text style={styles.advanceButtonText}>Avançar</Text>
        </TouchableOpacity>
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
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  radioGroupContainer: {
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e3d59',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#1e3d59',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxGroup: {
    marginTop: 8,
  },
  subQuestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1e3d59',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#1e3d59',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  conditionalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  advanceButton: {
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  advanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default QuestoesGeraisSaude;