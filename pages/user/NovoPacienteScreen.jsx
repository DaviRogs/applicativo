import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { injuryService } from './lesoes/injuryService';

const NovoPacienteScreen = ({ navigation, route }) => {
  const [patientData, setPatientData] = useState(null);
  const [injuries, setInjuries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { signaturePhoto, hasConsented, signatureDate } = useSelector(state => state.consentTerm);
  
  const reduxInjuries = useSelector(state => state.injury.injuries);

  useEffect(() => {
    if (route.params && route.params.atendimentoData) {
      setPatientData(route.params.atendimentoData);
    }
  }, [route.params?.atendimentoData]);
  
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
  }, [injuries, reduxInjuries]);

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
    if (!hasConsented || !signaturePhoto) {
      Alert.alert('Aviso', 'É necessário assinar o termo de consentimento antes de continuar.');
      return false;
    }
    
    
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateRequiredFields()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const finalData = {
        patient: patientData,
        consent: {
          signatureDate,
          hasConsented,
          signaturePhotoUri: signaturePhoto?.uri
        },
        injuries: injuries,
      };
      
      console.log('Saving complete patient data:', finalData);
      
      // Call API services to save data
      if (injuries && injuries.length > 0) {
        await injuryService.saveInjuries(injuries, patientData);
      }
      

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSaving(false);
      Alert.alert('Sucesso', 'Atendimento registrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving patient data:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
          {hasConsented && signaturePhoto ? (
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
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('InjuryList', { patientData })}
          disabled={isSaving}
        >
          <Text style={styles.menuItemText}>Registro de lesões</Text>
          {injuries && injuries.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{injuries.length}</Text>
            </View>
          )}
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            isSaving ? styles.savingButton : 
              (!hasConsented || !signaturePhoto) ? styles.disabledButton : null
          ]}
          onPress={handleSaveChanges}
          disabled={isSaving || !hasConsented || !signaturePhoto}
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
});

export default NovoPacienteScreen;