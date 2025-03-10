import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressBar from '../../../components/ProgressBar';
import { atualizarFatoresRisco, avancarEtapa, voltarEtapa }  from '../../../store/anamnesisSlice';

const FatoresRisco = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fatoresRiscoState = useSelector(state => state.anamnesis.fatoresRisco);
  const progressoQuestionario = useSelector(state => state.anamnesis.progressoQuestionario);
  
  const [formData, setFormData] = useState(fatoresRiscoState);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    
    // Validações para todos os campos obrigatórios
    if (!formData.exposicaoSol) {
      formErrors.exposicaoSol = "Por favor, responda sobre exposição ao sol";
    }
    
    if (formData.exposicaoSol === 'sim' && !formData.frequenciaExposicao) {
      formErrors.frequenciaExposicao = "Por favor, selecione a frequência de exposição";
    }
    
    if (!formData.queimadurasGraves) {
      formErrors.queimadurasGraves = "Por favor, responda sobre queimaduras solares graves";
    }
    
    if (formData.queimadurasGraves === 'sim' && !formData.frequenciaQueimaduras) {
      formErrors.frequenciaQueimaduras = "Por favor, selecione a frequência de queimaduras";
    }
    
    if (!formData.usoProtetorSolar) {
      formErrors.usoProtetorSolar = "Por favor, responda sobre o uso de protetor solar";
    }
    
    if (formData.usoProtetorSolar === 'sim' && !formData.fpsUtilizado) {
      formErrors.fpsUtilizado = "Por favor, selecione o FPS utilizado";
    }
    
    if (!formData.roupasProtecao) {
      formErrors.roupasProtecao = "Por favor, responda sobre o uso de roupas de proteção";
    }
    
    if (!formData.bronzeamentoArtificial) {
      formErrors.bronzeamentoArtificial = "Por favor, responda sobre bronzeamento artificial";
    }
    
    if (!formData.visitasDermatologista) {
      formErrors.visitasDermatologista = "Por favor, responda sobre visitas ao dermatologista";
    }
    
    if (formData.visitasDermatologista === 'sim' && !formData.frequenciaVisitas) {
      formErrors.frequenciaVisitas = "Por favor, selecione a frequência de visitas";
    }
    
    if (!formData.participacaoCampanhas) {
      formErrors.participacaoCampanhas = "Por favor, responda sobre participação em campanhas";
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleBack = () => {
    dispatch(voltarEtapa());
    navigation.navigate('HistoricoCancer');
  };

  const handleAdvance = () => {
    if (validateForm()) {
      dispatch(atualizarFatoresRisco(formData));
      dispatch(avancarEtapa());
      navigation.navigate('InvestigacaoLesoes');
    } else {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os campos obrigatórios antes de avançar.",
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
          >
            <View style={[
              styles.radioCircle,
              formData[field] === option.value && styles.radioSelected
            ]} />
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese</Text>
      </View>

      <ProgressBar 
        currentStep={progressoQuestionario.etapaAtual} 
        totalSteps={progressoQuestionario.totalEtapas}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Fatores de Risco e Proteção para Câncer de Pele</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você se expõe ao sol por longos períodos?</Text>
          {renderRadioGroup('exposicaoSol', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'exposicaoSol'
          )}

          {formData.exposicaoSol === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, com que frequência?</Text>
              {renderRadioGroup('frequenciaExposicao', [
                { label: 'Diariamente', value: 'diariamente' },
                { label: 'Algumas vezes por semana', value: 'algumas_semana' },
                { label: 'Ocasionalmente', value: 'ocasionalmente' }
              ], 'frequenciaExposicao')}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já teve queimaduras solares graves (com formação de bolhas)?</Text>
          {renderRadioGroup('queimadurasGraves', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'queimadurasGraves'
          )}

          {formData.queimadurasGraves === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, quantas vezes ao longo da vida?</Text>
              {renderRadioGroup('frequenciaQueimaduras', [
                { label: '1-2', value: '1-2' },
                { label: '3-5', value: '3-5' },
                { label: 'Mais de 5', value: 'mais_5' }
              ], 'frequenciaQueimaduras')}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você usa protetor solar regularmente?</Text>
          {renderRadioGroup('usoProtetorSolar', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'usoProtetorSolar'
          )}

          {formData.usoProtetorSolar === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, qual FPS?</Text>
              {renderRadioGroup('fpsUtilizado', [
                { label: 'FPS 15', value: '15' },
                { label: 'FPS 30', value: '30' },
                { label: 'FPS 50', value: '50' },
                { label: 'FPS 70', value: '70' },
                { label: 'FPS 100 ou mais', value: '100' }
              ], 'fpsUtilizado')}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você usa chapéus ou roupas de proteção ao se expor ao sol?</Text>
          {renderRadioGroup('roupasProtecao', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'roupasProtecao'
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já utilizou serviços de bronzeamento artificial?</Text>
          {renderRadioGroup('bronzeamentoArtificial', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'bronzeamentoArtificial'
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você visita regularmente o dermatologista para check-ups?</Text>
          {renderRadioGroup('visitasDermatologista', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'visitasDermatologista'
          )}

          {formData.visitasDermatologista === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, com que frequência?</Text>
              {renderRadioGroup('frequenciaVisitas', [
                { label: 'Anualmente', value: 'anualmente' },
                { label: 'A cada 6 meses', value: 'seis_meses' },
                { label: 'Outro', value: 'outro' }
              ], 'frequenciaVisitas')}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já participou de campanhas de prevenção contra o câncer de pele?</Text>
          {renderRadioGroup('participacaoCampanhas', 
            [{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'não' }],
            'participacaoCampanhas'
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navigationButton, styles.backBtn]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navigationButton, styles.advanceButton]}
            onPress={handleAdvance}
          >
            <Text style={styles.advanceButtonText}>Avançar</Text>
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
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
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
  subQuestion: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  navigationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1e3d59',
    marginRight: 8,
  },
  backButtonText: {
    color: '#1e3d59',
    fontSize: 16,
    fontWeight: '500',
  },
  advanceButton: {
    backgroundColor: '#1e3d59',
    marginLeft: 8,
  },
  advanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FatoresRisco;