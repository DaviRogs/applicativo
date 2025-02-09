import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AnamnesisScreen = ({ navigation }) => {
  const [dadosFormulario, setDadosFormulario] = useState({
    doencasCronicas: '',
    listaDoencasCronicas: {
      hipertensao: false,
      diabetes: false,
      cardiopatia: false,
      outras: false,
      outrasTexto: '',
    },
    cancer: '',
    tipoCancer: '',
    medicamentos: '',
    listaMedicamentos: '',
    alergias: '',
    listaAlergias: '',
    cirurgias: '',
    listaCirurgias: '',
    atividadeFisica: '',
    frequenciaAtividade: '',
  });

  const handleDoencaCronicaChange = (doenca) => {
    setDadosFormulario(prev => ({
      ...prev,
      listaDoencasCronicas: {
        ...prev.listaDoencasCronicas,
        [doenca]: !prev.listaDoencasCronicas[doenca]
      }
    }));
  };

  const renderConditionalInput = (field, value, placeholder) => {
    if (dadosFormulario[field] === 'sim') {
      return (
        <TextInput
          style={styles.conditionalInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={(text) => setDadosFormulario(prev => ({
            ...prev,
            [field + 'List']: text
          }))}
        />
      );
    }
    return null;
  };

  const renderRadioGroup = (field, label) => (
    <View style={styles.radioGroup}>
      <TouchableOpacity 
        style={styles.radioOption}
        onPress={() => setDadosFormulario(prev => ({ ...prev, [field]: 'sim' }))}
      >
        <View style={[
          styles.radioCircle,
          dadosFormulario[field] === 'sim' && styles.radioSelected
        ]} />
        <Text style={styles.radioText}>Sim</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.radioOption}
        onPress={() => setDadosFormulario(prev => ({ ...prev, [field]: 'não' }))}
      >
        <View style={[
          styles.radioCircle,
          dadosFormulario[field] === 'não' && styles.radioSelected
        ]} />
        <Text style={styles.radioText}>Não</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anamnese</Text>
      </View>

      <View style={styles.progressBar}>
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            <View style={[styles.progressStep, step === 1 && styles.activeStep]}>
              <Text style={[styles.stepText, step === 1 && styles.activeStepText]}>
                {step}
              </Text>
            </View>
            {step < 5 && <View style={styles.progressLine} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Questões gerais de saúde</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você tem histórico de doenças crônicas?</Text>
          {renderRadioGroup('doencasCronicas')}

          {dadosFormulario.doencasCronicas === 'sim' && (
            <View style={styles.checkboxGroup}>
              <Text style={styles.subQuestion}>Se sim, quais?</Text>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('hipertensao')}
              >
                <View style={[
                  styles.checkbox,
                  dadosFormulario.listaDoencasCronicas.hipertensao && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Hipertensão</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('diabetes')}
              >
                <View style={[
                  styles.checkbox,
                  dadosFormulario.listaDoencasCronicas.diabetes && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Diabetes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('cardiopatia')}
              >
                <View style={[
                  styles.checkbox,
                  dadosFormulario.listaDoencasCronicas.cardiopatia && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Cardiopatias</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checkboxOption}
                onPress={() => handleDoencaCronicaChange('outras')}
              >
                <View style={[
                  styles.checkbox,
                  dadosFormulario.listaDoencasCronicas.outras && styles.checkboxSelected
                ]} />
                <Text style={styles.checkboxText}>Outras</Text>
              </TouchableOpacity>
              {dadosFormulario.listaDoencasCronicas.outras && (
                <TextInput
                  style={styles.conditionalInput}
                  placeholder="ex.: Colesterol"
                  placeholderTextColor="#999"
                  value={dadosFormulario.listaDoencasCronicas.outrasTexto}
                  onChangeText={(text) => setDadosFormulario(prev => ({
                    ...prev,
                    listaDoencasCronicas: {
                      ...prev.listaDoencasCronicas,
                      outrasTexto: text
                    }
                  }))}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já foi diagnosticado com câncer anteriormente?</Text>
          {renderRadioGroup('cancer')}
          {renderConditionalInput('cancer', dadosFormulario.tipoCancer, 'ex.: Câncer de colo de útero')}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você faz uso regular de medicamentos?</Text>
          {renderRadioGroup('medicamentos')}
          {renderConditionalInput('medicamentos', dadosFormulario.listaMedicamentos, 'ex.: Losartana, Enalapril')}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você possui alergias?</Text>
          {renderRadioGroup('alergias')}
          {renderConditionalInput('alergias', dadosFormulario.listaAlergias, 'ex.: Ibuprofeno, Polen, Leite, Ovos')}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você já passou por cirurgias dermatológicas?</Text>
          {renderRadioGroup('cirurgias')}
          {renderConditionalInput('cirurgias', dadosFormulario.listaCirurgias, 'ex.: Remoção de nevos, Criocirurgia')}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>Você pratica atividade física regularmente?</Text>
          {renderRadioGroup('atividadeFisica')}
          {dadosFormulario.atividadeFisica === 'sim' && (
            <View style={styles.checkboxGroup}>
              <Text style={styles.subQuestion}>Se sim, com que frequência?</Text>
              <TouchableOpacity style={styles.checkboxOption}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>Diariamente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkboxOption}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>3-5 vezes por semana</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkboxOption}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>1-2 vezes por semana</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkboxOption}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>Ocasionalmente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.advanceButton}>
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
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3d59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#1e3d59',
  },
  stepText: {
    fontSize: 12,
    color: '#1e3d59',
    fontWeight: '500',
  },
  activeStepText: {
    color: '#fff',
  },
  progressLine: {
    height: 2,
    width: 40,
    backgroundColor: '#1e3d59',
    opacity: 0.3,
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
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  radioGroup: {
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  advanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AnamnesisScreen;