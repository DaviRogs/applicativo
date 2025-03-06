import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';

export const EditHealthUnitScreen = ({ navigation, route }) => {
  const { unit } = route.params || {};
  const userData = useSelector(state => state.user.userData);
  
  const [unitName, setUnitName] = useState('');
  const [location, setLocation] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [city, setCity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
 

  // Get user role from Redux
  const isAdmin = useSelector(selectIsAdmin);
  const token = useSelector(state => state.auth.accessToken);

  // Load unit data when component mounts
  useEffect(() => {
    // If we don't have the full unit data, fetch it
    if (unit && unit.id) {
      if (unit.nome_unidade_saude && unit.nome_localizacao && unit.cidade_unidade_saude && unit.codigo_unidade_saude) {
        // We already have complete data
        setUnitName(unit.nome_unidade_saude || '');
        setLocation(unit.nome_localizacao || '');
        setUnitCode(unit.codigo_unidade_saude || '');
        setCity(unit.cidade_unidade_saude || '');
        setIsActive(unit.is_active || false);
      } else {
        // Fetch the complete data
        fetchUnitDetails(unit.id);
      }
    } else {
      // No unit provided, go back
      Alert.alert('Erro', 'Dados da unidade não fornecidos');
      navigation.goBack();
    }

    // Check if user is admin, if not, redirect back
    if (!isAdmin) {
      Alert.alert(
        'Acesso Negado',
        'Você não tem permissão para acessar esta página.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [unit, isAdmin, navigation]);

  const fetchUnitDetails = async (unitId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8004/listar-unidade-saude/${unitId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar detalhes da unidade.');
      }

      const data = await response.json();
      
      // Set form fields with fetched data
      setUnitName(data.nome_unidade_saude || '');
      setLocation(data.nome_localizacao || '');
      setUnitCode(data.codigo_unidade_saude || '');
      setCity(data.cidade_unidade_saude || '');
      setIsActive(data.is_active || false);
      
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao buscar detalhes da unidade.');
      Alert.alert('Erro', err.message || 'Ocorreu um erro ao buscar detalhes da unidade.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!unitName.trim()) {
      setError('Nome da unidade é obrigatório.');
      return false;
    }
    if (!location.trim()) {
      setError('Endereço é obrigatório.');
      return false;
    }
    if (!unitCode.trim()) {
      setError('Código da unidade é obrigatório.');
      return false;
    }
    if (!city.trim()) {
      setError('Cidade é obrigatória.');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8004/editar-unidade-saude/${unit.id}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_unidade_saude: unitName,
          nome_localizacao: location,
          codigo_unidade_saude: unitCode,
          cidade_unidade_saude: city,
          is_active: isActive
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao atualizar unidade de saúde');
      }

      // Show success modal
      setSuccessModalVisible(true);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao tentar atualizar a unidade de saúde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  // Header with date and user info
  const renderHeaderInfo = () => (
    <View style={styles.headerInfo}>
         <Text style={styles.userText}>Usuário: {userData?.nome_usuario}</Text>
          <Text style={styles.userText}>Email: {userData?.email}</Text>
    </View>
  );

  if (isLoading && !unitName) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Unidade de Saúde</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3d59" />
          <Text style={styles.loadingText}>Carregando dados da unidade...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Unidade de Saúde</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderHeaderInfo()}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.unitIdContainer}>
          <Icon name="business" size={20} color="#1e3d59" />
          <Text style={styles.unitIdText}>ID da Unidade: {unit.id}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome da Unidade</Text>
          <TextInput
            style={styles.input}
            value={unitName}
            onChangeText={setUnitName}
            placeholder="Ex: Unidade de Saúde Central"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            value={unitCode}
            onChangeText={setUnitCode}
            placeholder="Ex: USC001"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Ex: São Paulo"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Rua das Flores, 123 - Centro"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Status da Unidade</Text>
          <View style={styles.switchWrapper}>
            <Text style={isActive ? styles.inactiveText : styles.activeTextBold}>
              Inativo
            </Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#f5f5f5', true: '#a5d6a7' }}
              thumbColor={isActive ? '#4CAF50' : '#F44336'}
              style={styles.switch}
            />
            <Text style={isActive ? styles.activeTextBold : styles.inactiveText}>
              Ativo
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={72} color="#4CAF50" />
            </View>
            
            <Text style={styles.successModalTitle}>Unidade Atualizada!</Text>
            <Text style={styles.successModalText}>
              As alterações foram salvas com sucesso.
            </Text>
            
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
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
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  userText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  unitIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  unitIdText: {
    fontSize: 15,
    color: '#1e3d59',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#B71C1C',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switch: {
    marginHorizontal: 12,
  },
  activeTextBold: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#757575',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    width: '100%',
  }
});