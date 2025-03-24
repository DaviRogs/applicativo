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
  Switch,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { API_URL } from '@env';

export const EditHealthUnitScreen = ({ route }) => {
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
  const navigation = useNavigation();

  // Get user role from Redux
  const isAdmin = useSelector(selectIsAdmin);
  const token = useSelector(state => state.auth.accessToken);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HealthUnitList');
        return true; // Prevent default behavior
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => 
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

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
        setIsActive(unit.fl_ativo || false);
      } else {
        // Fetch the complete data
        fetchUnitDetails(unit.id);
      }
    } else {
      // No unit provided, go back
      Alert.alert('Erro', 'Dados da unidade não fornecidos');
      // navigation.navigate('HealthUnitList');
    }

    // Check if user is admin, if not, redirect back
    if (!isAdmin) {
      Alert.alert(
        'Acesso Negado',
        'Você não tem permissão para acessar esta página.',
        [{ text: 'OK', onPress: () => navigation.navigate('HealthUnitList') }]
      );
    }
  }, [unit, isAdmin, navigation]);

  const fetchUnitDetails = async (unitId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/listar-unidade-saude/${unitId}`, {
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
      setIsActive(data.fl_ativo || false);
      
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
      const response = await fetch(`${API_URL}/editar-unidade-saude/${unit.id}`, {
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
          fl_ativo: isActive
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
    navigation.navigate('HealthUnitList');
  };

  // Header with user info
  const renderHeaderInfo = () => (
    <View style={styles.headerInfo}>
      <View style={styles.infoRow}>
        <Icon name="person" size={16} color="#1e3d59" style={styles.infoIcon} />
        <Text style={styles.userText}>Usuário: {userData?.nome_usuario}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="email" size={16} color="#1e3d59" style={styles.infoIcon} />
        <Text style={styles.userText}>Email: {userData?.email}</Text>
      </View>
    </View>
  );

  if (isLoading && !unitName) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('HealthUnitList')}
          >
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
      <StatusBar barStyle="light-content" backgroundColor="#1e3d59" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('HealthUnitList')}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Unidade de Saúde</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeaderInfo()}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={20} color="#B71C1C" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="business" size={24} color="#1e3d59" />
            <Text style={styles.cardTitle}>Informações da Unidade</Text>
          </View>

          <View style={styles.unitIdContainer}>
            <Icon name="tag" size={20} color="#1e3d59" style={styles.idIcon} />
            <Text style={styles.unitIdText}>ID: {unit.id}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome da Unidade</Text>
            <View style={styles.inputContainer}>
              <Icon name="domain" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={unitName}
                onChangeText={setUnitName}
                placeholder="Ex: Unidade de Saúde Central"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Código</Text>
            <View style={styles.inputContainer}>
              <Icon name="local-offer" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={unitCode}
                onChangeText={setUnitCode}
                placeholder="Ex: USC001"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cidade</Text>
            <View style={styles.inputContainer}>
              <Icon name="location-city" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Ex: São Paulo"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Endereço Completo</Text>
            <View style={[styles.inputContainer, styles.multilineContainer]}>
              <Icon name="place" size={20} color="#666" style={[styles.inputIcon, styles.multilineIcon]} />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Status da Unidade</Text>
            <View style={styles.switchWrapper}>
              <Text style={isActive ? styles.inactiveText : styles.activeTextBold}>
                Inativo
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#ffcdd2', true: '#c8e6c9' }}
                thumbColor={isActive ? '#4CAF50' : '#F44336'}
                style={styles.switch}
              />
              <Text style={isActive ? styles.activeTextBold : styles.inactiveText}>
                Ativo
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('HealthUnitList')}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Icon name="close" size={20} color="#666" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </View>
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
              <Icon name="check-circle" size={80} color="#4CAF50" />
            </View>
            
            <Text style={styles.successModalTitle}>Unidade Atualizada!</Text>
            <Text style={styles.successModalText}>
              As alterações foram salvas com sucesso.
            </Text>
            
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={handleCloseSuccessModal}
              activeOpacity={0.8}
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
    backgroundColor: '#f5f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: Platform.OS === 'ios' ? 44 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
  },
  userText: {
    fontSize: 14,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3d59',
    marginLeft: 8,
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
  idIcon: {
    marginRight: 8,
  },
  unitIdText: {
    fontSize: 15,
    color: '#1e3d59',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontsize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: '#B71C1C',
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  multilineContainer: {
    alignItems: 'flex-start',
  },
  multilineIcon: {
    marginTop: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontsize: 14,
    color: '#333',
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  switchContainer: {
    marginBottom: 8,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  switch: {
    marginHorizontal: 16,
  },
  activeTextBold: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 15,
  },
  inactiveText: {
    color: '#757575',
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#9aa5b1',
  },
  primaryButtonText: {
    color: '#fff',
    fontsize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontsize: 14,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3d59',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  successModalButtonText: {
    color: '#fff',
    fontsize: 14,
    fontWeight: '600',
  }
});

export default EditHealthUnitScreen;