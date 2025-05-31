import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressSteps from '../../../components/ProgressBar';
import {
  atualizarFatoresRisco,
  avancarEtapa,
  voltarEtapa,
} from '../../../store/anamnesisSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const FatoresRisco = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fatoresRiscoState = useSelector(
    (state) => state.anamnesis.fatoresRisco,
  );
  /*
  const progressoQuestionario = useSelector(
    (state) => state.anamnesis.progressoQuestionario,
  );
  */

  const [formData, setFormData] = useState(fatoresRiscoState);
  const [errors, setErrors] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const validateForm = () => {
    let formErrors = {};

    // Validações para todos os campos obrigatórios
    if (!formData.exposicaoSolarProlongada) {
      formErrors.exposicaoSolarProlongada =
        'Por favor, responda sobre exposição ao sol';
    }

    if (
      formData.exposicaoSolarProlongada === 'sim' &&
      !formData.frequenciaExposicaoSolar
    ) {
      formErrors.frequenciaExposicaoSolar =
        'Por favor, selecione a frequência de exposição';
    }

    if (!formData.queimadurasGraves) {
      formErrors.queimadurasGraves =
        'Por favor, responda sobre queimaduras solares graves';
    }

    if (
      formData.queimadurasGraves === 'sim' &&
      !formData.quantidadeQueimaduras
    ) {
      formErrors.quantidadeQueimaduras =
        'Por favor, selecione a quantidade de queimaduras';
    }

    if (!formData.usoProtetorSolar) {
      formErrors.usoProtetorSolar =
        'Por favor, responda sobre o uso de protetor solar';
    }

    if (formData.usoProtetorSolar === 'sim' && !formData.fatorProtecaoSolar) {
      formErrors.fatorProtecaoSolar = 'Por favor, selecione o FPS utilizado';
    }

    if (!formData.usoChapeuRoupaProtecao) {
      formErrors.usoChapeuRoupaProtecao =
        'Por favor, responda sobre o uso de roupas de proteção';
    }

    if (!formData.bronzeamentoArtificial) {
      formErrors.bronzeamentoArtificial =
        'Por favor, responda sobre bronzeamento artificial';
    }

    if (!formData.checkupsDermatologicos) {
      formErrors.checkupsDermatologicos =
        'Por favor, responda sobre visitas ao dermatologista';
    }

    if (
      formData.checkupsDermatologicos === 'sim' &&
      !formData.frequenciaCheckups
    ) {
      formErrors.frequenciaCheckups =
        'Por favor, selecione a frequência de visitas';
    }

    if (!formData.participacaoCampanhasPrevencao) {
      formErrors.participacaoCampanhasPrevencao =
        'Por favor, responda sobre participação em campanhas';
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
        'Campos incompletos',
        'Por favor, preencha todos os campos obrigatórios antes de avançar.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleOptionSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <View
              style={[
                styles.radioCircle,
                formData[field] === option.value && styles.radioSelected,
              ]}
            >
              {formData[field] === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[errorKey] && (
        <Text style={styles.errorText}>{errors[errorKey]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese</Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressSteps
          currentStep={4}
          totalSteps={5}
          stepLabels={[
            'Questões Gerais',
            'Avaliação Fototipo',
            'Histórico Câncer',
            'Fatores de Risco',
            'Revisão',
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Fatores de Risco e Proteção para Câncer de Pele
        </Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você se expõe ao sol por longos períodos?
          </Text>
          {renderRadioGroup(
            'exposicaoSolarProlongada',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'exposicaoSolarProlongada',
          )}

          {formData.exposicaoSolarProlongada === 'sim' && (
            <>
              <Text style={styles.subQuestion}>
                Se sim, com que frequência?
              </Text>
              {renderRadioGroup(
                'frequenciaExposicaoSolar',
                [
                  { label: 'Diariamente', value: 'Diariamente' },
                  {
                    label: 'Algumas vezes por semana',
                    value: 'Algumas vezes por semana',
                  },
                  { label: 'Ocasionalmente', value: 'Ocasionalmente' },
                ],
                'frequenciaExposicaoSolar',
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você já teve queimaduras solares graves (com formação de bolhas)?
          </Text>
          {renderRadioGroup(
            'queimadurasGraves',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'queimadurasGraves',
          )}

          {formData.queimadurasGraves === 'sim' && (
            <>
              <Text style={styles.subQuestion}>
                Se sim, quantas vezes ao longo da vida?
              </Text>
              {renderRadioGroup(
                'quantidadeQueimaduras',
                [
                  { label: '1-2', value: '1-2' },
                  { label: '3-5', value: '3-5' },
                  { label: 'Mais de 5', value: 'Mais de 5' },
                ],
                'quantidadeQueimaduras',
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você usa protetor solar regularmente?
          </Text>
          {renderRadioGroup(
            'usoProtetorSolar',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'usoProtetorSolar',
          )}

          {formData.usoProtetorSolar === 'sim' && (
            <>
              <Text style={styles.subQuestion}>Se sim, qual FPS?</Text>
              {renderRadioGroup(
                'fatorProtecaoSolar',
                [
                  { label: 'FPS 15', value: '15' },
                  { label: 'FPS 30', value: '30' },
                  { label: 'FPS 50', value: '50' },
                  { label: 'FPS 70', value: '70' },
                  { label: 'FPS 100 ou mais', value: '100 ou mais' },
                ],
                'fatorProtecaoSolar',
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você usa chapéus ou roupas de proteção ao se expor ao sol?
          </Text>
          {renderRadioGroup(
            'usoChapeuRoupaProtecao',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'usoChapeuRoupaProtecao',
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você já utilizou serviços de bronzeamento artificial?
          </Text>
          {renderRadioGroup(
            'bronzeamentoArtificial',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'bronzeamentoArtificial',
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você visita regularmente o dermatologista para check-ups?
          </Text>
          {renderRadioGroup(
            'checkupsDermatologicos',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'checkupsDermatologicos',
          )}

          {formData.checkupsDermatologicos === 'sim' && (
            <>
              <Text style={styles.subQuestion}>
                Se sim, com que frequência?
              </Text>
              {renderRadioGroup(
                'frequenciaCheckups',
                [
                  { label: 'Anualmente', value: 'Anualmente' },
                  { label: 'A cada 6 meses', value: 'A cada 6 meses' },
                  { label: 'Outro', value: 'Outro' },
                ],
                'frequenciaCheckups',
              )}

              {formData.frequenciaCheckups === 'Outro' && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.conditionalInput}
                    placeholder="Especifique a frequência"
                    placeholderTextColor="#999"
                    value={formData.frequenciaCheckupsOutro}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        frequenciaCheckupsOutro: text,
                      }))
                    }
                  />
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Você já participou de campanhas de prevenção contra o câncer de
            pele?
          </Text>
          {renderRadioGroup(
            'participacaoCampanhasPrevencao',
            [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' },
            ],
            'participacaoCampanhasPrevencao',
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navigationButton, styles.backBtn]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-back"
              size={18}
              color="#1e3d59"
              style={styles.buttonIcon}
            />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navigationButton, styles.advanceButton]}
            onPress={handleAdvance}
            activeOpacity={0.7}
          >
            <Text style={styles.advanceButtonText}>Avançar</Text>
            <Icon
              name="arrow-forward"
              size={18}
              color="#fff"
              style={styles.buttonIcon}
            />
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
    marginTop: 8,
    marginBottom: 12,
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

export default FatoresRisco;
