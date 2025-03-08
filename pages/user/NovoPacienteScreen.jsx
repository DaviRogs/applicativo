import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NovoPacienteScreen = ({ navigation, route }) => {
  const [patientData, setPatientData] = useState(null);
  
  useEffect(() => {
    if (route.params && route.params.atendimentoData) {
      setPatientData(route.params.atendimentoData);
    }
  }, [route.params]);

  // Format CPF for display
  const formatDisplayCpf = (cpf) => {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
    return cpf;
  };

  const handleEditPatient = () => {
    // Navigate back to NovoAtendimentoScreen with the current patient data for editing
    navigation.navigate('NovoAtendimento', { patientData });
  };

  const handleSaveChanges = () => {
    Alert.alert('Sucesso', 'Alterações salvas com sucesso!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
            <TouchableOpacity onPress={handleEditPatient}>
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
        >
          <Text style={styles.menuItemText}>Termo de consentimento</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Anamnesis', { patientData })}
        >
          <Text style={styles.menuItemText}>Anamnese</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('InjuryList', { patientData })}
        >
          <Text style={styles.menuItemText}>Registro de lesões</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
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
  },
  saveButton: {
    backgroundColor: '#1e3d59',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NovoPacienteScreen;