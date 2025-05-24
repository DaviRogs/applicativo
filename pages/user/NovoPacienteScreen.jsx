import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { injuryService } from './lesoes/injuryService';
import {
  submitPatientData,
  selectIsReadyForSubmission,
  selectValidationErrors,
  selectSubmissionStatus,
  clearSubmissionData,
} from '../../store/formSubmissionSlice';
import { clearPatientFound } from '../../store/patientSlice';
import { resetarQuestionario } from '../../store/anamnesisSlice';
import { resetConsentForm } from '../../store/consentTermSlice';
import { resetFormAll } from '../../store/injurySlice';

import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NovoPacienteScreen = ({ route }) => {
  const [injuries, setInjuries] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [lesionsResults, setLesionsResults] = useState([]);

  const dispatch = useDispatch();

  // patient Data
  const patientData = useSelector((state) => state.patient.patientData);

  // Get values from redux state
  const { signaturePhoto, isConsentAgreed, signatureDate } = useSelector(
    (state) => state.consentTerm,
  );
  const reduxInjuries = useSelector((state) => state.injury?.injuries || []);
  const anamnesisProgress = useSelector(
    (state) => state.anamnesis?.progressoQuestionario,
  );
  const isReadyForSubmission = useSelector(selectIsReadyForSubmission);
  const validationErrors = useSelector(selectValidationErrors);
  const submissionStatus = useSelector(selectSubmissionStatus);
  const isSaving = submissionStatus === 'pending';
  const accessToken = useSelector((state) => state.auth?.accessToken);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const resetAllStates = () => {
    // Reset all Redux states
    dispatch(clearSubmissionData());
    dispatch(clearPatientFound());
    dispatch(resetarQuestionario());
    dispatch(resetConsentForm());
    dispatch(resetFormAll());

    // Navigate to Home
    navigation.navigate('Home');
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!showDiscardModal) {
          setShowDiscardModal(true);
          return true; // Prevent default behavior
        }
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [showDiscardModal]),
  );

  useEffect(() => {
    if (route.params && route.params.injuries) {
      setInjuries(route.params.injuries);
    }
  }, [route.params?.injuries]);

  useEffect(() => {
    if (route.params?.consentSigned) {
      navigation.setParams({ consentSigned: undefined });
    }
  }, [route.params?.consentSigned]);

  useEffect(() => {
    if (injuries.length === 0 && reduxInjuries.length > 0) {
      setInjuries(reduxInjuries);
    }
  }, [reduxInjuries]);

  const formatDisplayCpf = (cpf) => {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
    return cpf;
  };

  const handleEditPatient = () => {
    navigation.navigate('NovoAtendimento', { patientData });
  };

  const validateRequiredFields = () => {
    if (!isConsentAgreed || !signaturePhoto) {
      return false;
    }
    if (injuries.length === 0) {
      return false;
    }

    return isReadyForSubmission;
  };

  const handleSaveChanges = async () => {
    if (!validateRequiredFields()) {
      let errorMessage = 'Alguns dados obrigatórios estão faltando:';

      if (validationErrors.consentTerm) {
        errorMessage += '\n- É necessário assinar o termo de consentimento';
      }

      if (validationErrors.anamnesis) {
        errorMessage += '\n- É necessário completar a anamnese';
      }

      if (validationErrors.auth) {
        errorMessage += '\n- É necessário estar autenticado';
      }

      Alert.alert('Aviso', errorMessage);
      return;
    }

    try {
      // Dispatch the submission thunk
      const resultAction = await dispatch(submitPatientData());

      if (submitPatientData.fulfilled.match(resultAction)) {
        const results = [];
        for (let i = 1; i <= reduxInjuries.length; i++) {
          const storedResult = localStorage.getItem(`injuryResult-${i}`);
          if (storedResult) {
            results.push(JSON.parse(storedResult));
          }
        }

        setLesionsResults(results);
        setShowResultsModal(true);
      } else {
        Alert.alert(
          'Erro',
          resultAction.error?.message ||
            'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.',
        );
      }
    } catch (error) {
      console.error('Error saving patient data:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.',
      );
    }
  };

  // Get completion status
  const isAnamnesisCompleted =
    anamnesisProgress?.concluido ||
    anamnesisProgress?.etapaAtual >= anamnesisProgress?.totalEtapas;

  const isConsentCompleted = isConsentAgreed && signaturePhoto;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />

      {/* Discard Changes Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descartar alterações</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair? Todas as alterações serão perdidas.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDiscardModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={resetAllStates}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmButtonText}>
                  Sim, descartar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para exibir os resultados das lesões */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showResultsModal}
        onRequestClose={() => {
          setShowResultsModal(false);
          resetAllStates();
          navigation.navigate('Home');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resultados da Análise</Text>

            <ScrollView style={styles.resultsContainer}>
              {lesionsResults.map((lesao, index) => (
                <View key={index} style={styles.lesaoItem}>
                  <Text style={styles.tipo}>
                    Tipo:{' '}
                    {lesao.tipos ? lesao.tipos.join(', ') : 'Não disponível'}
                  </Text>
                  <Text style={styles.preDiagnostico}>
                    Pré-diagnóstico:{' '}
                    {lesao.prediagnosticos
                      ? lesao.prediagnosticos.join(', ')
                      : 'Não disponível'}
                  </Text>
                  <Text style={styles.lesaoDescription}>
                    Descrição da Lesão:{' '}
                    {lesao.description ? lesao.description : 'Não disponível'}
                  </Text>
                  <Text style={styles.detalhesLesao}>
                    Detalhes:{' '}
                    {lesao.descricoes_lesao
                      ? lesao.descricoes_lesao.join('\n')
                      : 'Não disponível'}
                  </Text>
                  <Text style={styles.detalhesLesao}>
                    Data do pré-diagnóstico:{' '}
                    {new Date().toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {lesao.imagens && lesao.imagens.length > 0 && (
                    <Text style={styles.imagens}>
                      Imagens registradas: {lesao.imagens.length}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowResultsModal(false);
                resetAllStates();
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowDiscardModal(true)}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo atendimento</Text>
      </View>

      <View style={styles.content}>
        {patientData ? (
          <View style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <View style={styles.patientIconContainer}>
                <Icon name="person" size={24} color="#fff" />
              </View>
              <View style={styles.patientDetails}>
                <Text style={styles.patientName}>
                  {patientData.nome_paciente}
                </Text>
                <Text style={styles.patientId}>
                  {formatDisplayCpf(patientData.cpf_paciente)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleEditPatient}
              disabled={isSaving}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Icon name="edit" size={20} color="#1e3d59" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.patientCard}>
            <ActivityIndicator
              size="small"
              color="#1e3d59"
              style={styles.loadingIndicator}
            />
            <Text style={styles.loadingText}>
              Carregando dados do paciente...
            </Text>
          </View>
        )}

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Etapas do atendimento</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.menuItem,
            isConsentCompleted && styles.completedMenuItem,
          ]}
          onPress={() => navigation.navigate('ConsentTerm', { patientData })}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View
              style={[
                styles.menuItemIcon,
                isConsentCompleted ? styles.completedIcon : styles.pendingIcon,
              ]}
            >
              <Icon
                name="assignment"
                size={20}
                color={isConsentCompleted ? '#fff' : '#1e3d59'}
              />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Termo de consentimento</Text>
              <Text style={styles.menuItemDescription}>
                {isConsentCompleted
                  ? 'Termo assinado'
                  : 'Assinatura do paciente requerida'}
              </Text>
            </View>
          </View>

          {isConsentCompleted ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color="#27ae60" />
            </View>
          ) : (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obrigatório</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            isAnamnesisCompleted && styles.completedMenuItem,
          ]}
          onPress={() =>
            navigation.navigate('QuestoesGeraisSaude', { patientData })
          }
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View
              style={[
                styles.menuItemIcon,
                isAnamnesisCompleted
                  ? styles.completedIcon
                  : styles.pendingIcon,
              ]}
            >
              <Icon
                name="event-note"
                size={20}
                color={isAnamnesisCompleted ? '#fff' : '#1e3d59'}
              />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Anamnese</Text>
              <Text style={styles.menuItemDescription}>
                {isAnamnesisCompleted
                  ? 'Questionário concluído'
                  : 'Preenchimento das perguntas'}
              </Text>
            </View>
          </View>

          {isAnamnesisCompleted ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color="#27ae60" />
            </View>
          ) : (
            <Icon name="chevron-right" size={24} color="#666" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            injuries.length > 0 && styles.completedMenuItem,
          ]}
          onPress={() => navigation.navigate('InjuryList', { patientData })}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View
              style={[
                styles.menuItemIcon,
                injuries.length > 0
                  ? styles.optionalCompletedIcon
                  : styles.optionalIcon,
              ]}
            >
              <Icon
                name="healing"
                size={20}
                color={injuries.length > 0 ? '#fff' : '#1e3d59'}
              />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Registro de lesões</Text>
              <Text style={styles.menuItemDescription}>
                {injuries.length > 0
                  ? `${injuries.length} ${injuries.length === 1 ? 'lesão registrada' : 'lesões registradas'}`
                  : 'Opcional: registro fotográfico'}
              </Text>
            </View>
          </View>

          {injuries && injuries.length > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{injuries.length}</Text>
            </View>
          ) : (
            <Icon name="chevron-right" size={24} color="#666" />
          )}
        </TouchableOpacity>

        <View style={styles.submissionStatusContainer}>
          {(!isReadyForSubmission || injuries.length === 0) && (
            <View style={styles.validationWarningContainer}>
              <Icon
                name="error-outline"
                size={18}
                color="#e74c3c"
                style={styles.warningIcon}
              />
              <Text style={styles.validationWarning}>
                {validationErrors.consentTerm &&
                  '• É necessário completar o termo de consentimento\n'}
                {validationErrors.anamnesis &&
                  '• É necessário completar a anamnese\n'}
                {validationErrors.auth && '• É necessário estar autenticado\n'}
                {injuries.length === 0 &&
                  '• É necessário registrar pelo menos uma lesão'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaving
              ? styles.savingButton
              : !isReadyForSubmission || injuries.length === 0
                ? styles.disabledButton
                : null,
          ]}
          onPress={handleSaveChanges}
          disabled={isSaving || !isReadyForSubmission || injuries.length === 0}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.activityIndicator}
              />
              <Text style={styles.saveButtonText}>Salvando...</Text>
            </View>
          ) : (
            <View style={styles.saveButtonContent}>
              <Icon
                name="save"
                size={20}
                color="#fff"
                style={styles.saveIcon}
              />
              <Text style={styles.saveButtonText}>Finalizar atendimento</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3d59',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 44 : 26,
    paddingBottom: 0,
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 90 : 90,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f7f9fc',
    borderBottomWidth: 1,
    borderBottomColor: '#e8edf3',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataIcon: {
    marginRight: 6,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f9fc',
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e3d59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  loadingIndicator: {
    marginRight: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  completedMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
    backgroundColor: '#f7fff9',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  pendingIcon: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  completedIcon: {
    backgroundColor: '#27ae60',
  },
  optionalIcon: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  optionalCompletedIcon: {
    backgroundColor: '#3498db',
  },
  countBadge: {
    backgroundColor: '#3498db',
    borderRadius: 18,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedBadge: {
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#f39c12',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  requiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  submissionStatusContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  validationWarningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fdf0ed',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  validationWarning: {
    color: '#e74c3c',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    marginRight: 8,
  },
  savingButton: {
    backgroundColor: '#767676',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityIndicator: {
    marginRight: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e3d59',
  },
  resultsContainer: {
    maxHeight: '70%',
    backgroundColor: '#f7f9fc',
  },
  lesaoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8edf3',
  },
  localLesao: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 10,
  },
  tipo: {
    fontSize: 16,
    color: '#1e3d59',
    fontWeight: '600',
    marginBottom: 8,
  },
  preDiagnostico: {
    fontSize: 16,
    color: '#1e3d59',
    fontWeight: '700',
    marginBottom: 8,
    backgroundColor: '#e8f4ff',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3d59',
  },
  lesaoDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  detalhesLesao: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  imagens: {
    fontSize: 15,
    color: '#1e3d59',
    fontWeight: '500',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#1e3d59',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    lineHeight: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalConfirmButton: {
    backgroundColor: '#e74c3c',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NovoPacienteScreen;
