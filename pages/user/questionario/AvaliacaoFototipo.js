import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProgressSteps from '../../../components/ProgressBar';
import {
  atualizarAvaliacaoFototipo,
  avancarEtapa,
  voltarEtapa,
} from '../../../store/anamnesisSlice';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const AvaliacaoFototipo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const avaliacaoFototipoState = useSelector(
    (state) => state.anamnesis.avaliacaoFototipo,
  );
  /*
  const progressoQuestionario = useSelector(
    (state) => state.anamnesis.progressoQuestionario,
  );
  */

  const [formData, setFormData] = useState(avaliacaoFototipoState);
  const [errors, setErrors] = useState({});

  const handleOptionSelection = (field, value, points) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      [field + 'Pontos']: points,
    }));
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
    }, [navigation]),
  );

  // Calcula o fototipo baseado na pontuação
  useEffect(() => {
    const calcularPontos = () => {
      const campos = [
        'corPelePontos',
        'corOlhosPontos',
        'corCabeloPontos',
        'quantidadeSardasPontos',
        'reacaoSolPontos',
        'bronzeamentoPontos',
        'sensibilidadeSolarPontos',
      ];

      let pontosTotal = 0;
      let temTodosCampos = true;

      campos.forEach((campo) => {
        if (formData[campo] !== undefined) {
          pontosTotal += formData[campo];
        } else {
          temTodosCampos = false;
        }
      });

      if (temTodosCampos) {
        let fototipo = '';

        if (pontosTotal >= 0 && pontosTotal <= 7) {
          fototipo = 'Fototipo I';
        } else if (pontosTotal >= 8 && pontosTotal <= 16) {
          fototipo = 'Fototipo II';
        } else if (pontosTotal >= 17 && pontosTotal <= 25) {
          fototipo = 'Fototipo III';
        } else if (pontosTotal >= 26 && pontosTotal <= 30) {
          fototipo = 'Fototipo IV';
        } else if (pontosTotal > 30) {
          fototipo = 'Fototipo V-VI';
        }

        setFormData((prev) => ({
          ...prev,
          pontosTotal,
          fototipo,
        }));
      }
    };

    calcularPontos();
  }, [
    formData.corPelePontos,
    formData.corOlhosPontos,
    formData.corCabeloPontos,
    formData.quantidadeSardasPontos,
    formData.reacaoSolPontos,
    formData.bronzeamentoPontos,
    formData.sensibilidadeSolarPontos,
  ]);

  const validateForm = () => {
    let formErrors = {};
    const requiredFields = [
      'corPele',
      'corOlhos',
      'corCabelo',
      'quantidadeSardas',
      'reacaoSol',
      'bronzeamento',
      'sensibilidadeSolar',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        formErrors[field] = `Por favor, selecione uma opção`;
      }
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleBack = () => {
    dispatch(voltarEtapa());
    navigation.navigate('QuestoesGeraisSaude');
  };

  const handleAdvance = () => {
    if (validateForm()) {
      dispatch(atualizarAvaliacaoFototipo(formData));
      dispatch(avancarEtapa());
      navigation.navigate('HistoricoCancer');
    } else {
      Alert.alert(
        'Campos incompletos',
        'Por favor, responda todas as perguntas para avaliar seu fototipo.',
        [{ text: 'OK' }],
      );
    }
  };

  const renderOptions = (field, options) => (
    <View style={styles.optionsContainer}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            formData[field] === option.label && styles.selectedOption,
          ]}
          onPress={() =>
            handleOptionSelection(field, option.label, option.points)
          }
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              formData[field] === option.label && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const getFototipoColor = (fototipo) => {
    switch (fototipo) {
      case 'Fototipo I':
        return '#ffdbdb';
      case 'Fototipo II':
        return '#ffe8db';
      case 'Fototipo III':
        return '#fff3db';
      case 'Fototipo IV':
        return '#e8f0dc';
      case 'Fototipo V-VI':
        return '#daeaf2';
      default:
        return '#f5f5f5';
    }
  };

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
          currentStep={2}
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
          Avaliação de Fototipo (Classificação de Fitzpatrick)
        </Text>
        <Text style={styles.sectionDescription}>
          Esta seção utiliza a Escala de Fitzpatrick para determinar o fototipo
          da sua pele. Cada resposta tem uma pontuação associada, e a soma total
          determinará seu fototipo.
        </Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Qual é a cor natural da sua pele (áreas não expostas ao sol)?
          </Text>
          {renderOptions('corPele', [
            { label: 'Branca leitosa', points: 0 },
            { label: 'Branca', points: 2 },
            { label: 'Branca a bege, com base dourada', points: 4 },
            { label: 'Bege', points: 8 },
            { label: 'Castanha clara', points: 12 },
            { label: 'Castanha escura', points: 16 },
            { label: 'Negra', points: 20 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Qual é a cor dos seus olhos?</Text>
          {renderOptions('corOlhos', [
            { label: 'Azul claro, cinza, verde', points: 0 },
            { label: 'Azul, cinza ou verde', points: 1 },
            { label: 'Azul', points: 2 },
            { label: 'Castanho claro', points: 3 },
            { label: 'Castanho escuro', points: 4 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Qual é a cor natural do seu cabelo?
          </Text>
          {renderOptions('corCabelo', [
            { label: 'Ruivo, loiro claro', points: 0 },
            { label: 'Loiro, castanho claro', points: 1 },
            { label: 'Castanho', points: 2 },
            { label: 'Castanho escuro', points: 3 },
            { label: 'Preto', points: 4 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Quantas sardas você tem em áreas não expostas?
          </Text>
          {renderOptions('quantidadeSardas', [
            { label: 'Muitas', points: 0 },
            { label: 'Algumas', points: 1 },
            { label: 'Poucas', points: 2 },
            { label: 'Nenhuma', points: 3 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>
            Como sua pele reage quando fica muito tempo exposta ao sol?
          </Text>
          {renderOptions('reacaoSol', [
            { label: 'Fica vermelha, dolorida, descasca', points: 0 },
            { label: 'Fica vermelha, descasca um pouco', points: 2 },
            { label: 'Fica vermelha, mas não descasca', points: 4 },
            { label: 'Fica levemente ou nada vermelha', points: 6 },
            { label: 'Nunca fica vermelha', points: 8 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Sua pele bronzeia?</Text>
          {renderOptions('bronzeamento', [
            { label: 'Nunca, sempre queima', points: 0 },
            { label: 'Às vezes', points: 2 },
            { label: 'Frequentemente', points: 4 },
            { label: 'Sempre', points: 6 },
          ])}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Quão sensível é sua face ao sol?</Text>
          {renderOptions('sensibilidadeSolar', [
            { label: 'Muito sensível', points: 0 },
            { label: 'Sensível', points: 1 },
            { label: 'Normal', points: 2 },
            { label: 'Resistente', points: 3 },
            { label: 'Muito resistente, nunca queima', points: 4 },
          ])}
        </View>

        {formData.fototipo && (
          <View
            style={[
              styles.resultContainer,
              { backgroundColor: getFototipoColor(formData.fototipo) },
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Resultado</Text>
              <Text style={styles.resultScore}>
                Pontuação total: {formData.pontosTotal} pontos
              </Text>
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultFototipo}>{formData.fototipo}</Text>
              <Text style={styles.resultDescription}>
                {formData.fototipo === 'Fototipo I' &&
                  'Pele extremamente clara, sempre queima, nunca bronzeia.'}
                {formData.fototipo === 'Fototipo II' &&
                  'Pele clara, queima com facilidade, bronzeia minimamente.'}
                {formData.fototipo === 'Fototipo III' &&
                  'Pele menos clara, queima moderadamente, bronzeia gradualmente.'}
                {formData.fototipo === 'Fototipo IV' &&
                  'Pele morena clara, queima minimamente, sempre bronzeia.'}
                {formData.fototipo === 'Fototipo V-VI' &&
                  'Pele morena escura a negra, raramente queima, bronzeia facilmente.'}
              </Text>
            </View>
          </View>
        )}

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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
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
  optionsContainer: {
    flexDirection: 'column',
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#1e3d59',
    borderColor: '#1e3d59',
  },
  optionText: {
    fontSize: 13,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  resultHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultScore: {
    fontSize: 15,
    color: '#555',
  },
  resultContent: {
    paddingTop: 4,
  },
  resultFototipo: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#555',
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

export default AvaliacaoFototipo;
