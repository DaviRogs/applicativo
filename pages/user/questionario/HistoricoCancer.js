import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  StatusBar,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressSteps from '../../../components/ProgressBar';
import { atualizarHistoricoCancer, avancarEtapa, voltarEtapa } from '../../../store/anamnesisSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const HistoricoCancer = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const historicoCancerState = useSelector(state => state.anamnesis.historicoCancer);
  const progressoQuestionario = useSelector(state => state.anamnesis.progressoQuestionario);
  
  const [formData, setFormData] = useState(historicoCancerState);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.historicoFamiliar) {
      formErrors.historicoFamiliar = "Por favor, responda se há histórico familiar";
    }
    
    if (formData.historicoFamiliar === 'sim') {
      if (!formData.grauParentesco) {
        formErrors.grauParentesco = "Por favor, informe o grau de parentesco";
      }
      if (!formData.tipoCancerFamiliar) {
        formErrors.tipoCancerFamiliar = "Por favor, selecione o tipo de câncer familiar";
      }
    }
    
    if (!formData.diagnosticadoCancer) {
      formErrors.diagnosticadoCancer = "Por favor, responda se já foi diagnosticado com câncer de pele";
    }
    
    if (formData.diagnosticadoCancer === 'sim' && !formData.tipoCancerPessoal) {
      formErrors.tipoCancerPessoal = "Por favor, informe o tipo de câncer";
    }
    
    if (!formData.lesoesPreCancerigenas) {
      formErrors.lesoesPreCancerigenas = "Por favor, responda sobre lesões pré-cancerígenas";
    }
    
    if (!formData.tratamentoLesoes) {
      formErrors.tratamentoLesoes = "Por favor, responda se já passou por tratamento";
    }
    
    if (formData.tratamentoLesoes === 'sim' && !formData.tipoTratamento) {
      formErrors.tipoTratamento = "Por favor, informe o tipo de tratamento";
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleBack = () => {
    dispatch(voltarEtapa());
    navigation.navigate('AvaliacaoFototipo');
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleAdvance = () => {
    if (validateForm()) {
      dispatch(atualizarHistoricoCancer(formData));
      dispatch(avancarEtapa());
      navigation.navigate('FatoresRisco');
    } else {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os campos obrigatórios antes de avançar.",
        [{ text: "OK" }]
      );
    }
  };

  const handleRadioChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTipoCancerFamiliar = (tipo) => {
    setFormData(prev => ({ ...prev, tipoCancerFamiliar: tipo }));
  };

  const handleTipoTratamento = (tipo) => {
    setFormData(prev => ({ ...prev, tipoTratamento: tipo }));
  };

  const renderRadioGroup = (field, options, label, errorKey) => (
    <View style={styles.radioGroupContainer}>
      <View style={styles.radioGroup}>
        {options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.radioOption}
            onPress={() => handleRadioChange(field, option.value)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioCircle,
              formData[field] === option.value && styles.radioSelected
            ]}>
              {formData[field] === option.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
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
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese</Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressSteps 
          currentStep={3} 
          totalSteps={5}
          stepLabels={["Questões Gerais", "Avaliação Fototipo", "Histórico Câncer", "Fatores de Risco", "Revisão"]}
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Histórico Familiar e Pessoal de Câncer de Pele</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você tem histórico familiar de câncer de pele?</Text>
          {renderRadioGroup('historicoFamiliar', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'Histórico familiar',
            'historicoFamiliar'
          )}

          {formData.historicoFamiliar === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, qual grau de parentesco?</Text>
              {renderRadioGroup('grauParentesco', 
                [
                  { label: 'Pai', value: 'pai' }, 
                  { label: 'Mãe', value: 'mãe' },
                  { label: 'Avô/Avó', value: 'avoavo' },
                  { label: 'Irmão/Irmã', value: 'irmaoirma' },
                  { label: 'Outro', value: 'outro' }
                ],
                'Grau de parentesco',
                'grauParentesco'
              )}

              <Text style={styles.subQuestion}>Qual tipo de câncer de pele?</Text>
              <View style={styles.radioGroupContainer}>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoCancerFamiliar('melanoma')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerFamiliar === 'melanoma' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerFamiliar === 'melanoma' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Melanoma</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoCancerFamiliar('carcinoma_basocelular')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerFamiliar === 'carcinoma_basocelular' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerFamiliar === 'carcinoma_basocelular' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Carcinoma Basocelular</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoCancerFamiliar('carcinoma_espinocelular')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerFamiliar === 'carcinoma_espinocelular' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerFamiliar === 'carcinoma_espinocelular' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Carcinoma Espinocelular</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoCancerFamiliar('outro')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerFamiliar === 'outro' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerFamiliar === 'outro' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Outro</Text>
                </TouchableOpacity>
                {formData.tipoCancerFamiliar === 'outro' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.conditionalInput}
                      placeholder="Especifique o tipo de câncer"
                      placeholderTextColor="#999"
                      value={formData.tipoCancerFamiliarOutro}
                      onChangeText={(text) => setFormData(prev => ({
                        ...prev,
                        tipoCancerFamiliarOutro: text
                      }))}
                    />
                  </View>
                )}
              </View>
              {errors.tipoCancerFamiliar && (
                <Text style={styles.errorText}>{errors.tipoCancerFamiliar}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já foi diagnosticado com câncer de pele?</Text>
          {renderRadioGroup('diagnosticadoCancer', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'Diagnóstico de câncer',
            'diagnosticadoCancer'
          )}

          {formData.diagnosticadoCancer === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, qual tipo de câncer?</Text>
              <View style={styles.radioGroupContainer}>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => setFormData(prev => ({ ...prev, tipoCancerPessoal: 'melanoma' }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerPessoal === 'melanoma' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerPessoal === 'melanoma' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Melanoma</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => setFormData(prev => ({ ...prev, tipoCancerPessoal: 'carcinoma_basocelular' }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerPessoal === 'carcinoma_basocelular' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerPessoal === 'carcinoma_basocelular' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Carcinoma Basocelular</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => setFormData(prev => ({ ...prev, tipoCancerPessoal: 'carcinoma_espinocelular' }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerPessoal === 'carcinoma_espinocelular' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerPessoal === 'carcinoma_espinocelular' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Carcinoma Espinocelular</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => setFormData(prev => ({ ...prev, tipoCancerPessoal: 'outro' }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoCancerPessoal === 'outro' && styles.radioSelected
                  ]}>
                    {formData.tipoCancerPessoal === 'outro' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Outro</Text>
                </TouchableOpacity>
                {formData.tipoCancerPessoal === 'outro' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.conditionalInput}
                      placeholder="Especifique o tipo de câncer"
                      placeholderTextColor="#999"
                      value={formData.tipoCancerPessoalOutro}
                      onChangeText={(text) => setFormData(prev => ({
                        ...prev,
                        tipoCancerPessoalOutro: text
                      }))}
                    />
                  </View>
                )}
              </View>
              {errors.tipoCancerPessoal && (
                <Text style={styles.errorText}>{errors.tipoCancerPessoal}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já teve lesões removidas que foram identificadas como pré-cancerígenas?</Text>
          {renderRadioGroup('lesoesPreCancerigenas', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'Lesões pré-cancerígenas',
            'lesoesPreCancerigenas'
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já passou por tratamento para lesões na pele?</Text>
          {renderRadioGroup('tratamentoLesoes', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'Tratamento de lesões',
            'tratamentoLesoes'
          )}

          {formData.tratamentoLesoes === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, qual foi o tratamento?</Text>
              <View style={styles.radioGroupContainer}>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoTratamento('cirurgia')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoTratamento === 'cirurgia' && styles.radioSelected
                  ]}>
                    {formData.tipoTratamento === 'cirurgia' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Cirurgia</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoTratamento('crioterapia')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoTratamento === 'crioterapia' && styles.radioSelected
                  ]}>
                    {formData.tipoTratamento === 'crioterapia' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Crioterapia</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoTratamento('radioterapia')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoTratamento === 'radioterapia' && styles.radioSelected
                  ]}>
                    {formData.tipoTratamento === 'radioterapia' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Radioterapia</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fullWidthOption}
                  onPress={() => handleTipoTratamento('outro')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.tipoTratamento === 'outro' && styles.radioSelected
                  ]}>
                    {formData.tipoTratamento === 'outro' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Outro</Text>
                </TouchableOpacity>
                {formData.tipoTratamento === 'outro' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.conditionalInput}
                      placeholder="Especifique o tratamento"
                      placeholderTextColor="#999"
                      value={formData.tipoTratamentoOutro}
                      onChangeText={(text) => setFormData(prev => ({
                        ...prev,
                        tipoTratamentoOutro: text
                      }))}
                    />
                  </View>
                )}
              </View>
              {errors.tipoTratamento && (
                <Text style={styles.errorText}>{errors.tipoTratamento}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navigationButton, styles.backBtn]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={18} color="#1e3d59" style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navigationButton, styles.advanceButton]}
            onPress={handleAdvance}
            activeOpacity={0.7}
          >
            <Text style={styles.advanceButtonText}>Avançar</Text>
            <Icon name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  subQuestion: {
    fontSize: 15,
    color: '#555',
    marginTop: 16,
    marginBottom: 10,
  },
  radioGroupContainer: {
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 12,
    width: '45%',
    paddingVertical: 6,
  },
  fullWidthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    paddingVertical: 6,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1e3d59',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#1e3d59',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  conditionalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  navigationButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginHorizontal: 6,
  },
  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1e3d59',
    marginRight: 8,
  },
  backButtonText: {
    color: '#1e3d59',
    fontSize: 14,
    fontWeight: '500',
  },
  advanceButton: {
    backgroundColor: '#1e3d59',
    marginLeft: 8,
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
    marginBottom: 4,
  },
});

export default HistoricoCancer;