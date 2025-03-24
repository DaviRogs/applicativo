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
  Platform,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressSteps from '../../../components/ProgressBar';
import { atualizarInvestigacaoLesoes, voltarEtapa } from '../../../store/anamnesisSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const InvestigacaoLesoes = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const investigacaoLesoesState = useSelector(state => state.anamnesis.investigacaoLesoes);
  const progressoQuestionario = useSelector(state => state.anamnesis.progressoQuestionario);
  
  const [formData, setFormData] = useState(investigacaoLesoesState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.lesoesRecentes) {
      formErrors.lesoesRecentes = "Por favor, responda sobre mudanças em pintas ou manchas";
    }
    
    if (!formData.sintomasLesoes) {
      formErrors.sintomasLesoes = "Por favor, responda se há coceira, sangramento ou dor";
    }
    
    if (formData.lesoesRecentes === 'sim' && !formData.tempoAlteracoes) {
      formErrors.tempoAlteracoes = "Por favor, indique há quanto tempo notou as alterações";
    }
    
    if (formData.lesoesRecentes === 'sim' && !formData.caracteristicasLesoes) {
      formErrors.caracteristicasLesoes = "Por favor, responda sobre as características das lesões";
    }
    
    if (!formData.consultaMedica) {
      formErrors.consultaMedica = "Por favor, responda se já procurou um médico";
    }
    
    if (formData.consultaMedica === 'sim' && !formData.diagnosticoMedico) {
      formErrors.diagnosticoMedico = "Por favor, informe o diagnóstico recebido";
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleBack = () => {
    dispatch(voltarEtapa());
    navigation.navigate('FatoresRisco');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setSubmitting(true);
      
      // Salvar os dados no Redux
      dispatch(atualizarInvestigacaoLesoes(formData));
      
      // Simulando envio para o backend
      setTimeout(() => {
        setSubmitting(false);
        Alert.alert(
          "Questionário Concluído",
          "Suas respostas foram salvas com sucesso. Obrigado por completar o questionário de anamnese.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('ResultadoAnamnese') 
            }
          ]
        );
      }, 1000);
    } else {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os campos obrigatórios antes de finalizar.",
        [{ text: "OK" }]
      );
    }
  };

  const handleOptionSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderRadioGroup = (field, options, errorKey) => (
    <View style={styles.radioGroupContainer}>
      <View style={styles.radioGroup}>
        {options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.radioOption}
            onPress={() => handleOptionSelect(field, option.value)}
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
          currentStep={5} 
          totalSteps={5}
          stepLabels={["Questões Gerais", "Avaliação Fototipo", "Histórico Câncer", "Fatores de Risco", "Revisão"]}
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        <Text style={styles.sectionTitle}>Investigação de Câncer de Pele e Lesões Suspeitas</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você tem pintas ou manchas que mudaram de cor, tamanho ou formato recentemente?</Text>
          {renderRadioGroup('lesoesRecentes', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'lesoesRecentes'
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Essas manchas ou lesões causam coceira, sangramento ou dor?</Text>
          {renderRadioGroup('sintomasLesoes', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'sintomasLesoes'
          )}
        </View>

        {formData.lesoesRecentes === 'sim' && (
          <View style={styles.questionContainer}>
            <Text style={styles.question}>Há quanto tempo você notou essas alterações?</Text>
            {renderRadioGroup('tempoAlteracoes', [
              { label: 'Menos de 1 mês', value: 'menos_1_mes' },
              { label: '1-3 meses', value: '1-3_meses' },
              { label: '3-6 meses', value: '3-6_meses' },
              { label: 'Mais de 6 meses', value: 'mais_6_meses' }
            ], 'tempoAlteracoes')}
          </View>
        )}

        {formData.lesoesRecentes === 'sim' && (
          <View style={styles.questionContainer}>
            <Text style={styles.question}>Essas lesões têm bordas irregulares, múltiplas cores ou assimetria?</Text>
            {renderRadioGroup('caracteristicasLesoes', 
              [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
              'caracteristicasLesoes'
            )}
          </View>
        )}

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já procurou um médico para avaliar essas lesões?</Text>
          {renderRadioGroup('consultaMedica', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'consultaMedica'
          )}

          {formData.consultaMedica === 'sim' && (
            <View>
              <Text style={styles.subQuestion}>Se sim, qual foi o diagnóstico?</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Descreva o diagnóstico médico"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                  value={formData.diagnosticoMedico}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    diagnosticoMedico: text
                  }))}
                />
              </View>
              {errors.diagnosticoMedico && (
                <Text style={styles.errorText}>{errors.diagnosticoMedico}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Icon name="info-outline" size={24} color="#1e3d59" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Atenção: Oriente os pacientes a procurarem um dermatologista regularmente para exames de pele, 
            especialmente se houver qualquer alteração em pintas ou manchas existentes.
          </Text>
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
            style={[
              styles.navigationButton, 
              styles.submitButton, 
              submitting && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <View style={styles.submitContent}>
                <ActivityIndicator size="small" color="#fff" style={styles.submitLoader} />
                <Text style={styles.submitButtonText}>Enviando...</Text>
              </View>
            ) : (
              <View style={styles.submitContent}>
                <Text style={styles.submitButtonText}>Concluir</Text>
                <Icon name="check-circle" size={18} color="#fff" style={styles.buttonIcon} />
              </View>
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
  headerInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  userText: {
    fontSize: 14,
    color: '#555',
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
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginTop: 4,
  },
  textInput: {
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3d59',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
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
  submitButton: {
    backgroundColor: '#1e8e3e',
    marginLeft: 8,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLoader: {
    marginRight: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b7b7b7',
  },
  submitButtonText: {
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

export default InvestigacaoLesoes;