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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { injuryService } from './lesoes/injuryService';
import { 
  submitPatientData, 
  selectIsReadyForSubmission,
  selectValidationErrors,
  selectSubmissionStatus,
  clearSubmissionData
} from '../../store/formSubmissionSlice';
import { clearPatientFound } from '../../store/patientSlice';
import { resetarQuestionario } from '../../store/anamnesisSlice';
import { resetConsentForm } from '../../store/consentTermSlice';
import { resetForm } from '../../store/injurySlice';

import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const NovoPacienteScreen = ({ navigation, route }) => {
  const [injuries, setInjuries] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  const dispatch = useDispatch();

  // patient Data
  const patientData = useSelector(state => state.patient.patientData);
  
  // Get values from redux state
  const { signaturePhoto, isConsentAgreed, signatureDate } = useSelector(state => state.consentTerm);
  const reduxInjuries = useSelector(state => state.injury?.injuries || []);
  const anamnesisProgress = useSelector(state => state.anamnesis?.progressoQuestionario);
  const isReadyForSubmission = useSelector(selectIsReadyForSubmission);
  const validationErrors = useSelector(selectValidationErrors);
  const submissionStatus = useSelector(selectSubmissionStatus);
  const isSaving = submissionStatus === 'pending';
  const accessToken = useSelector(state => state.auth?.accessToken);

  const resetAllStates = () => {
    // Reset all Redux states
    dispatch(clearSubmissionData());
    dispatch(clearPatientFound());
    dispatch(resetarQuestionario());
    dispatch(resetConsentForm());
    dispatch(resetForm());
    
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
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [showDiscardModal])
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
        // The submission was successful
        Alert.alert('Sucesso', 'Atendimento registrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        // The submission failed
        Alert.alert('Erro', resultAction.error?.message || 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Error saving patient data:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
    }
  };

  // Get completion status
  const isAnamnesisCompleted = anamnesisProgress?.concluido || 
    (anamnesisProgress?.etapaAtual >= anamnesisProgress?.totalEtapas);
  
  const isConsentCompleted = isConsentAgreed && signaturePhoto;

  return (
    <SafeAreaView style={styles.container}>
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
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={resetAllStates}
              >
                <Text style={styles.modalConfirmButtonText}>Sim, descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowDiscardModal(true)}
          disabled={isSaving}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo atendimento</Text>
      </View>

      <View style={styles.content}>
        {patientData ? (
          <View style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <Icon name="person" size={24} color="#1e3d59" />
              <View style={styles.patientDetails}>
                <Text style={styles.patientName}>{patientData.nome_paciente}</Text>
                <Text style={styles.patientId}>
                  {formatDisplayCpf(patientData.cpf_paciente)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleEditPatient} disabled={isSaving}>
              <Icon name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.patientCard}>
            <Text style={styles.loadingText}>Carregando dados do paciente...</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ConsentTerm', { patientData })}
          disabled={isSaving}
        >
          <Text style={styles.menuItemText}>Termo de consentimento</Text>
          {isConsentCompleted ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color="#27ae60" />
            </View>
          ) : (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Obrigatório</Text>
            </View>
          )}
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('QuestoesGeraisSaude', { patientData })}
          disabled={isSaving}
        >
          <Text style={styles.menuItemText}>Anamnese</Text>
          {isAnamnesisCompleted ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color="#27ae60" />
            </View>
          ) : (
            <Icon name="chevron-right" size={24} color="#666" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('InjuryList', { patientData })}
          disabled={isSaving}
        >
          <Text style={styles.menuItemText}>Registro de lesões</Text>
          {injuries && injuries.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{injuries.length}</Text>
            </View>
          ) : null}
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.submissionStatusContainer}>
          {!isReadyForSubmission && (
            <Text style={styles.validationWarning}>
              {validationErrors.consentTerm && '• É necessário completar o termo de consentimento\n'}
              {validationErrors.anamnesis && '• É necessário completar a anamnese\n'}
              {validationErrors.auth && '• É necessário estar autenticado'}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            isSaving ? styles.savingButton : 
              !isReadyForSubmission ? styles.disabledButton : null
          ]}
          onPress={handleSaveChanges}
          disabled={isSaving || !isReadyForSubmission}
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />
              <Text style={styles.saveButtonText}>Salvando...</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: {
    marginRight: 16,
    padding: 4,
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
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  completedBadge: {
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#f39c12',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  requiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  savingButton: {
    backgroundColor: '#888',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activityIndicator: {
    marginRight: 8,
  },
  submissionStatusContainer: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  validationWarning: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
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
    fontWeight: '500',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NovoPacienteScreen;